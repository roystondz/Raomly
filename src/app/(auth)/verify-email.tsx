import { useSignIn, useSignUp } from "@clerk/expo";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { usePostHog } from "posthog-react-native";

import { fieldError, globalError, hasErrorCode } from "@/auth/clerk-errors";
import { navigateAfterAuth } from "@/auth/finalize";
import { validateCode } from "@/auth/validation";
import { AuthScreen } from "@/components/auth/auth-screen";
import { CodeInput } from "@/components/auth/code-input";
import { FooterLink } from "@/components/auth/footer-link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

const RESEND_COOLDOWN_S = 30;

// One screen for both code steps:
//   flow=sign-up  -> verify the new account's email address
//   flow=sign-in  -> new-device / second-factor email code
export default function VerifyEmailScreen() {
  const { flow } = useLocalSearchParams<{ flow?: "sign-up" | "sign-in" }>();
  const posthog = usePostHog();
  const router = useRouter();
  const isSignUp = flow !== "sign-in";
  const signUpState = useSignUp();
  const signInState = useSignIn();
  const { signUp } = signUpState;
  const { signIn } = signInState;
  const errors = isSignUp ? signUpState.errors : signInState.errors;
  const loading = (isSignUp ? signUpState.fetchStatus : signInState.fetchStatus) === "fetching";

  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Only show this screen while Clerk is waiting for a code (or finishing, until
  // the route guard takes over after finalize()).
  const waiting = isSignUp
    ? signUp.status === "complete" ||
      (signUp.status === "missing_requirements" && signUp.unverifiedFields.includes("email_address"))
    : signIn.status === "complete" || signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor";
  if (!waiting && !loading) return <Redirect href={isSignUp ? "/sign-up" : "/sign-in"} />;

  const email = isSignUp ? signUp.emailAddress : signIn.identifier;
  // Clerk answers "signed_out" when the device's Clerk client changed after the
  // code was sent, so this attempt can't be finished. Only a restart helps.
  const expired = hasErrorCode(errors, "signed_out");
  const codeError = expired
    ? `This ${isSignUp ? "sign-up" : "sign-in"} timed out on this device. Start again to get a new code.`
    : (localError ?? fieldError(errors, "code") ?? globalError(errors));

  // Back to the form underneath (its fields are kept), then drop the old attempt.
  async function startAgain() {
    if (router.canGoBack()) router.back();
    await (isSignUp ? signUp.reset() : signIn.reset());
  }

  async function submit(value = code) {
    const invalid = validateCode(value);
    if (invalid) return setLocalError(invalid);
    setLocalError(null);

    if (isSignUp) {
      const { error } = await signUp.verifications.verifyEmailCode({ code: value });
      if (error) return;
      if (signUp.status === "complete") {
        await signUp.finalize({ navigate: navigateAfterAuth });
        posthog?.capture("account_created", { sign_up_method: "email_password" });
      } else setLocalError("Your account needs more details to finish signing up.");
    } else {
      const { error } = await signIn.mfa.verifyEmailCode({ code: value });
      if (error) return;
      if (signIn.status === "complete") {
        await signIn.finalize({ navigate: navigateAfterAuth });
        posthog?.capture("user_signed_in", { sign_in_method: "email_code" });
      } else setLocalError("This account needs another verification step this app doesn't support yet.");
    }
  }

  async function resend() {
    setResent(false);
    setLocalError(null);
    const { error } = isSignUp ? await signUp.verifications.sendEmailCode() : await signIn.mfa.sendEmailCode();
    if (error) {
      setLocalError("We couldn't send a new code. Please try again.");
      return;
    }
    setCode("");
    setResent(true);
    setCooldown(RESEND_COOLDOWN_S);
  }

  return (
    <AuthScreen
      title={"Check\nyour email"}
      body={
        <>
          We sent a 6-digit code to <Text variant="body">{email}</Text>. Enter it below to{" "}
          {isSignUp ? "verify your account." : "finish signing in."}
        </>
      }
      footer={
        expired ? null : cooldown > 0 ? (
          <Text variant="caption-regular" tone="muted">
            Resend in 0:{String(cooldown).padStart(2, "0")}
          </Text>
        ) : (
          <FooterLink prompt="Didn't get a code?" action="Resend" disabled={loading} onPress={resend} />
        )
      }
    >
      <CodeInput
        value={code}
        onChangeText={(value) => {
          setCode(value);
          setLocalError(null);
          if (value.length === 6 && !loading) submit(value);
        }}
        error={codeError}
        editable={!loading}
        autoFocus
      />
      {resent ? <Alert tone="success" message="We sent a new code." onDismiss={() => setResent(false)} className="mt-6" /> : null}
      {expired ? (
        <Button title="Start again" onPress={startAgain} className="mt-6" />
      ) : (
        <Button title="Verify" loading={loading} disabled={code.length < 6} onPress={() => submit()} className="mt-6" />
      )}
    </AuthScreen>
  );
}
