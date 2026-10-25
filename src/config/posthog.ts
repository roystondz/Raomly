import PostHog from 'posthog-react-native'

// EXPO_PUBLIC_ values are inlined at bundle time, like the Clerk key in the root layout.
const projectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST
const configured = Boolean(projectToken && host)

// PostHog failures never block the app: without its variables, analytics is off.
if (__DEV__ && !configured) {
  console.warn(
    'PostHog is off: set EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN and EXPO_PUBLIC_POSTHOG_HOST in .env, then restart the dev server.',
  )
}

// Always a client, so PostHogProvider always renders and screens can call usePostHog().
// When unconfigured it's disabled; the SDK requires a non-empty key, hence the placeholder.
export const posthog = new PostHog(projectToken || 'disabled', {
  host,
  disabled: !configured,
  captureAppLifecycleEvents: true,
  logs: {
    serviceName: 'roamly-mobile',
  },
  errorTracking: {
    autocapture: {
      uncaughtExceptions: true,
      unhandledRejections: true,
    },
  },
  preloadFeatureFlags: true,
})
