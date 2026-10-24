// Seeds policies, hosts and 30 stays. Safe to run repeatedly: documents are
// found by slug and images by their Unsplash ID (`source.id`), so a second run
// updates in place and uploads nothing new. Sanity generates every _id.
//
//   cd studio && npm run seed

import {getCliClient} from 'sanity/cli'

import {hosts} from './seed-data/hosts'
import {photos, photoUrl, type PhotoId} from './seed-data/photos'
import {policies} from './seed-data/policies'
import {properties} from './seed-data/properties'

const client = getCliClient({apiVersion: '2026-10-01'})

type Counts = {created: number; updated: number; unchanged: number}
const counts: Record<string, Counts> = {}
const tally = (type: string, outcome: keyof Counts) => {
  counts[type] ??= {created: 0, updated: 0, unchanged: 0}
  counts[type][outcome]++
}

const slug = (current: string) => ({_type: 'slug', current})
const ref = (_ref: string) => ({_type: 'reference', _ref})
const keyOf = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-')

// Runs `task` over `items`, at most `limit` at a time.
async function pool<T>(items: T[], limit: number, task: (item: T) => Promise<void>) {
  const queue = [...items]
  await Promise.all(
    Array.from({length: limit}, async () => {
      for (let item = queue.shift(); item !== undefined; item = queue.shift()) await task(item)
    }),
  )
}

// Unsplash occasionally answers 5xx under load; retry those with backoff.
async function download(id: string, attempts = 4): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(photoUrl(id))
    if (response.ok) return Buffer.from(await response.arrayBuffer())
    if (response.status < 500 || attempt === attempts) {
      throw new Error(`Photo ${id} returned ${response.status}`)
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt))
  }
}

// Uploads every photo the seed uses that isn't in the dataset yet.
async function ensurePhotos(ids: PhotoId[]) {
  const existing = await client.fetch<{_id: string; id: string}[]>(
    `*[_type == "sanity.imageAsset" && source.name == "unsplash" && source.id in $ids]{_id, "id": source.id}`,
    {ids},
  )
  const assetIds = new Map(existing.map((asset) => [asset.id, asset._id]))
  const missing = ids.filter((id) => !assetIds.has(id))

  await pool(missing, 4, async (id) => {
    const asset = await client.assets.upload('image', await download(id), {
      filename: `${id}.jpg`,
      source: {name: 'unsplash', id, url: photoUrl(id)},
    })
    assetIds.set(id, asset._id)
  })

  console.log(`images: ${missing.length} uploaded, ${ids.length - missing.length} already there`)
  return assetIds
}

const image = (assetIds: Map<string, string>, id: PhotoId) => ({
  _type: 'image',
  asset: ref(assetIds.get(id)!),
  alt: photos[id],
})

// Stable JSON for comparing a seed document with what is stored.
const stable = (value: unknown): string =>
  JSON.stringify(value, (_key, inner) =>
    inner && typeof inner === 'object' && !Array.isArray(inner)
      ? Object.fromEntries(Object.entries(inner).sort(([a], [b]) => a.localeCompare(b)))
      : inner,
  )

// Fields the seed only fills when missing, so copy written in Studio or by
// `npm run write-copy` survives re-seeding.
const KEEP_IF_SET = ['summary', 'description', 'highlights']

// Creates the document, or replaces the one with the same type and slug.
// Returns its _id.
async function upsert(doc: {_type: string; slug: {current: string}} & Record<string, unknown>) {
  const current = await client.fetch<Record<string, unknown> | null>(
    `*[_type == $type && slug.current == $slug && !(_id in path("drafts.**"))][0]`,
    {type: doc._type, slug: doc.slug.current},
  )

  if (!current) {
    const created = await client.create(doc)
    tally(doc._type, 'created')
    return created._id
  }

  const {_id, _rev, _createdAt, _updatedAt, ...stored} = current
  for (const field of KEEP_IF_SET) {
    if (stored[field] !== undefined && field in doc) doc[field] = stored[field]
  }
  if (stable(stored) === stable(doc)) {
    tally(doc._type, 'unchanged')
  } else {
    await client.createOrReplace({...doc, _id: _id as string})
    tally(doc._type, 'updated')
  }
  return _id as string
}

async function main() {
  const usedPhotos = [
    ...new Set([...hosts.map((host) => host.photo), ...properties.flatMap((stay) => stay.photos)]),
  ]
  const assetIds = await ensurePhotos(usedPhotos)

  const policyIds = new Map<string, string>()
  for (const policy of policies) {
    const {slug: policySlug, ...fields} = policy
    policyIds.set(policySlug, await upsert({_type: 'policy', slug: slug(policySlug), ...fields}))
  }

  const hostIds = new Map<string, string>()
  for (const host of hosts) {
    const {slug: hostSlug, photo, ...fields} = host
    hostIds.set(
      hostSlug,
      await upsert({_type: 'host', slug: slug(hostSlug), photo: image(assetIds, photo), ...fields}),
    )
  }

  for (const stay of properties) {
    const {slug: staySlug, host, cancellation, photos: stayPhotos, rooms, ...fields} = stay
    const hostId = hostIds.get(host)
    const policyId = policyIds.get(cancellation)
    if (!hostId || !policyId)
      throw new Error(`${staySlug}: unknown host "${host}" or policy "${cancellation}"`)

    await upsert({
      _type: 'property',
      slug: slug(staySlug),
      ...fields,
      host: ref(hostId),
      cancellationPolicy: ref(policyId),
      photos: stayPhotos.map((id) => ({_key: id, ...image(assetIds, id)})),
      rooms: rooms.map((stayRoom) => ({
        _key: keyOf(stayRoom.name),
        _type: 'room',
        name: stayRoom.name,
        beds: stayRoom.beds.map((bed) => ({_key: bed.type, _type: 'bed', ...bed})),
      })),
    })
  }

  for (const [type, {created, updated, unchanged}] of Object.entries(counts)) {
    console.log(`${type}: ${created} created, ${updated} updated, ${unchanged} unchanged`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
