import type { SetActiveNavigate } from "@clerk/expo/types";

// Passed to signIn/signUp.finalize(). The root layout's Stack.Protected guard
// redirects as soon as the session is active, so there's nothing to navigate to.
// Session tasks (e.g. forced org selection) aren't configured for this app.
export const navigateAfterAuth: SetActiveNavigate = async ({ session }) => {
  if (session?.currentTask) {
    console.warn(`Clerk session task "${session.currentTask.key}" is not handled in the app.`);
  }
};
