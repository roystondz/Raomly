// Writes each stay's summary, description and highlights with Agent Actions,
// using only the stay's typed fields, and publishes it only when it passes
// both the code checks and an Agent Actions fact-check. Copy that still fails
// after 3 tries is saved as a Studio draft for review.
//
//   cd studio && npm run write-copy                         # every stay
//   npm run write-copy -- --slug creekside-hideaway --dry-run
//   npm run write-copy -- --self-test                       # checks catch a made-up pool

import {randomUUID} from 'node:crypto'
import {PostHog} from 'posthog-node'
import {getCliClient} from 'sanity/cli'

import {codeCheck, type Copy} from './copy/checks'
import {FACTS_QUERY, toFacts, type StayRow} from './copy/facts'
import {CHECK_INSTRUCTION, GENERATE_INSTRUCTION} from './copy/instructions'

const SCHEMA_ID = '_.schemas.default'
const ATTEMPTS = 3
const posthogProjectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN
const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST

if (!posthogProjectToken && process.env.NODE_ENV !== 'production') {
  throw new Error(
    'EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN is configured',
  )
}

if (!posthogHost && process.env.NODE_ENV !== 'production') {
  throw new Error(
    'EXPO_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once EXPO_PUBLIC_POSTHOG_HOST is configured',
  )
}

const posthog =
  posthogProjectToken && posthogHost
    ? new PostHog(posthogProjectToken, {host: posthogHost, privacyMode: false})
    : undefined
const copyRunId = `sanity-copy-${randomUUID()}`

// Agent Actions need the vX API.
const client = getCliClient({apiVersion: 'vX'})

const args = process.argv.slice(2)
const flag = (name: string) => args.includes(`--${name}`)
const option = (name: string) => {
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? args[index + 1] : undefined
}

const constant = (value: unknown) => ({
  type: 'constant' as const,
  value: JSON.stringify(value, null, 2),
})

async function observeGeneration<T>(
  traceId: string,
  spanName: string,
  input: unknown,
  call: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now()
  try {
    const result = await call()
    posthog?.capture({
      distinctId: copyRunId,
      event: '$ai_generation',
      properties: {
        $ai_trace_id: traceId,
        $ai_session_id: copyRunId,
        $ai_span_name: spanName,
        $ai_model: 'sanity-agent-actions',
        $ai_provider: 'sanity',
        $ai_input: [{role: 'user', content: JSON.stringify(input)}],
        $ai_output_choices: [{role: 'assistant', content: JSON.stringify(result)}],
        $ai_latency: (Date.now() - startedAt) / 1000,
      },
    })
    return result
  } catch (error) {
    posthog?.capture({
      distinctId: copyRunId,
      event: '$ai_generation',
      properties: {
        $ai_trace_id: traceId,
        $ai_session_id: copyRunId,
        $ai_span_name: spanName,
        $ai_model: 'sanity-agent-actions',
        $ai_provider: 'sanity',
        $ai_input: [{role: 'user', content: JSON.stringify(input)}],
        $ai_latency: (Date.now() - startedAt) / 1000,
        $ai_is_error: true,
        $ai_error: error instanceof Error ? error.message : String(error),
      },
    })
    throw error
  }
}

async function generate(stay: StayRow, feedback: string[], traceId: string): Promise<Copy> {
  const instructionParams = {
    facts: constant(toFacts(stay)),
    feedback: {
      type: 'constant',
      value: feedback.length
        ? `A previous draft was rejected for these reasons. Fix every one:\n- ${feedback.join('\n- ')}`
        : ' ',
    },
  }
  const result = await observeGeneration(traceId, 'generate_copy', {
    instruction: GENERATE_INSTRUCTION,
    instructionParams,
  }, () =>
    client.agent.action.generate({
      schemaId: SCHEMA_ID,
      documentId: stay._id,
      noWrite: true,
      instruction: GENERATE_INSTRUCTION,
      instructionParams,
      // 'set' replaces the old copy; the default merges and appends to highlights.
      target: {include: ['summary', 'description', 'highlights'], operation: 'set'},
    }),
  )
  const doc = result as unknown as Partial<Copy>
  return {
    summary: doc.summary ?? '',
    description: doc.description ?? '',
    highlights: doc.highlights ?? [],
  }
}

type Claim = {claim: string; support: string | null}

async function factCheck(stay: StayRow, copy: Copy, traceId: string): Promise<string[]> {
  const instructionParams = {facts: constant(toFacts(stay)), copy: constant(copy)}
  // The client types JSON responses as string unless `format` is a literal type; cast to the shape the instruction asks for.
  const result = (await observeGeneration(traceId, 'fact_check_copy', {
    instruction: CHECK_INSTRUCTION,
    instructionParams,
  }, () =>
    client.agent.action.prompt({
      instruction: CHECK_INSTRUCTION,
      instructionParams,
      format: 'json',
      temperature: 0,
    }),
  )) as unknown as {claims?: Claim[]}
  if (!Array.isArray(result?.claims)) return ['fact-check returned no claims list']
  return result.claims
    .filter((claim) => !claim.support || claim.support === 'null')
    .map((claim) => `unsupported claim: "${claim.claim}"`)
}

async function check(stay: StayRow, copy: Copy, traceId: string) {
  const problems = codeCheck(stay, copy)
  // The model check is the slower, paid layer; only run it on copy that passed the code checks.
  return problems.length ? problems : factCheck(stay, copy, traceId)
}

async function writeStay(stay: StayRow, dryRun: boolean) {
  let feedback: string[] = []
  let copy: Copy | undefined
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    const traceId = randomUUID()
    copy = await generate(stay, feedback, traceId)
    feedback = await check(stay, copy, traceId)
    if (feedback.length === 0) {
      if (!dryRun) {
        await client.patch(stay._id).set(copy).commit()
        // A draft left by an earlier failed run would hide this copy in Studio.
        await client.delete(`drafts.${stay._id}`).catch(() => undefined)
      }
      return {
        outcome:
          attempt === 1 ? 'pass' : `pass after ${attempt - 1} retr${attempt === 2 ? 'y' : 'ies'}`,
        copy,
      }
    }
  }

  if (!dryRun && copy) {
    const published = await client.getDocument(stay._id)
    await client.createOrReplace({...published!, ...copy, _id: `drafts.${stay._id}`})
  }
  return {outcome: 'draft', copy, problems: feedback}
}

async function selfTest() {
  const [stay] = await client.fetch<StayRow[]>(FACTS_QUERY, {slug: 'creekside-hideaway'})
  const bad: Copy = {
    summary: 'A cozy cabin with a heated pool, five minutes from Idyllwild village.',
    description:
      'This cabin sleeps four in a queen bedroom and a reading nook with a double bed. Swim in the heated pool, soak in the hot tub, then warm up by the fireplace. The kitchen is fully equipped and parking is on site. Dogs are welcome. Check in from 16:00 with a lockbox and check out by 11:00. Quiet hours run from 21:00 to 08:00.',
    highlights: ['Heated pool', 'Hot tub', 'Dogs welcome'],
  }
  const code = codeCheck(stay, bad)
  const model = await factCheck(stay, bad, randomUUID())
  console.log(
    'code check:',
    code.length ? `fails ✔\n  - ${code.join('\n  - ')}` : 'PASSES ✘ (should fail)',
  )
  console.log(
    'fact-check:',
    model.length ? `fails ✔\n  - ${model.join('\n  - ')}` : 'PASSES ✘ (should fail)',
  )
  if (!code.length || !model.length) process.exitCode = 1
}

async function main() {
  if (flag('self-test')) return selfTest()

  const dryRun = flag('dry-run')
  const stays = await client.fetch<StayRow[]>(FACTS_QUERY, {slug: option('slug') ?? null})
  if (stays.length === 0) throw new Error('No stays matched')

  const totals: Record<string, number> = {}
  // Sequential on purpose: each stay can take several model calls.
  for (const stay of stays) {
    const result = await writeStay(stay, dryRun)
    const bucket = result.outcome.startsWith('pass') ? result.outcome : 'draft'
    totals[bucket] = (totals[bucket] ?? 0) + 1
    console.log(
      `${stay.slug}: ${result.outcome}${result.problems ? `\n  - ${result.problems.join('\n  - ')}` : ''}`,
    )
    if (dryRun) console.log(JSON.stringify(result.copy, null, 2))
  }
  console.log(
    Object.entries(totals)
      .map(([key, n]) => `${key}: ${n}`)
      .join(', '),
    dryRun ? '(dry run, nothing written)' : '',
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await posthog?.shutdown()
  })
