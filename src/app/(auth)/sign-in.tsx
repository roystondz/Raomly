import { useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import { ArrowRight, Mail } from "lucide-react-native";
import { useRef, useState } from "react";
import { View, type TextInputInstance } from "react-native";

import { fieldError, globalError } from "@/auth/clerk-errors";
import { navigateAfterAuth } from "@/auth/finalize";
import { useSocialSignIn } from "@/auth/use-social-sign-in";
import { normalizeEmail, validateEmail } from "@/auth/validation";
import { AuthScreen } from "@/components/auth/auth-screen";
import { FooterLink } from "@/components/auth/footer-link";
import { OrDivider } from "@/components/auth/or-divider";
import { SocialButtons } from "@/components/auth/social-buttons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { TextField } from "@/components/ui/text-field";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const social = useSocialSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [requestFailed, setRequestFailed] = useState<string | null>(null);
  const passwordRef = useRef<TextInputInstance>(null);

  const loading = fetchStatus === "fetching";
  const busy = loading || social.loadingProvider !== null;
  // Sign in only checks the password is present; length rules apply at sign up.
  const errorFor = {
    email: validateEmail(email) ?? fieldError(errors, "identifier"),
    password: (password ? undefined : "Enter your password.") ?? fieldError(errors, "password"),
  };
  const formError = requestFailed ?? globalError(errors) ?? social.error;

  async function submit() {
    setSubmitted(true);
    setRequestFailed(null);
    if (validateEmail(email) || !password) return;

    const { error } = await signIn.password({ identifier: normalizeEmail(email), password });
    if (error) return; // Shown through `errors`.

    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: navigateAfterAuth });
      return;
    }

    // New device (client trust) or email second factor: verify with a code.
    const needsEmailCode =
      signIn.status === "needs_client_trust" ||
      (signIn.status === "needs_second_factor" &&
        signIn.supportedSecondFactors.some((factor) => factor.strategy === "email_code"));
    if (needsEmailCode) {
      const { error: sendError } = await signIn.mfa.sendEmailCode();
      if (sendError) {
        setRequestFailed("We couldn't send your code. Please try again.");
        return;
      }
      router.push({ pathname: "/verify-email", params: { flow: "sign-in" } });
      return;
    }

    setRequestFailed("This account needs a verification method this app doesn't support yet.");
  }

  return (
    <AuthScreen
      title={"Welcome\nback"}
      body="Sign in to see your saved stays and plan your next trip."
      footer={
        <FooterLink prompt="New to roamly?" action="Sign up" disabled={busy} onPress={() => router.replace("/sign-up")} />
      }
    >
      <View className="gap-3">
        <TextField
          icon={Mail}
          label="Email address"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          error={submitted ? errorFor.email : undefined}
          editable={!busy}
          autoComplete="email"
          textContentType="username"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <TextField
          ref={passwordRef}
          variant="password"
          label="Password"
          placeholder="Your password"
          value={password}
          onChangeText={setPassword}
          error={submitted ? errorFor.password : undefined}
          editable={!busy}
          autoComplete="current-password"
          textContentType="password"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={submit}
        />
      </View>
      {formError ? <Alert tone="error" message={formError} className="mt-6" /> : null}
      <Button
        title="Sign in"
        trailing={<Icon icon={ArrowRight} />}
        loading={loading}
        disabled={social.loadingProvider !== null}
        onPress={submit}
        className="mt-6"
      />
      <OrDivider />
      <SocialButtons onPress={social.start} loadingProvider={social.loadingProvider} disabled={loading} />
    </AuthScreen>
  );
}
