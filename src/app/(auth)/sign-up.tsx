import { useSignUp } from "@clerk/expo";
import { useRouter } from "expo-router";
import { ArrowRight, Mail, User } from "lucide-react-native";
import { useRef, useState } from "react";
import { View, type TextInputInstance } from "react-native";

import { fieldError, globalError } from "@/auth/clerk-errors";
import { splitName } from "@/auth/split-name";
import { useSocialSignIn } from "@/auth/use-social-sign-in";
import { normalizeEmail, validateEmail, validateName, validatePassword } from "@/auth/validation";
import { AuthScreen } from "@/components/auth/auth-screen";
import { FooterLink } from "@/components/auth/footer-link";
import { OrDivider } from "@/components/auth/or-divider";
import { SocialButtons } from "@/components/auth/social-buttons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { TextField } from "@/components/ui/text-field";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const social = useSocialSignIn();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [requestFailed, setRequestFailed] = useState<string | null>(null);
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);

  const loading = fetchStatus === "fetching";
  const busy = loading || social.loadingProvider !== null;
  // Client checks first; Clerk's own field errors after a request.
  const errorFor = {
    name: validateName(name) ?? fieldError(errors, "firstName") ?? fieldError(errors, "lastName"),
    email: validateEmail(email) ?? fieldError(errors, "emailAddress"),
    password: validatePassword(password) ?? fieldError(errors, "password"),
  };
  const formError = requestFailed ?? globalError(errors) ?? social.error;

  async function submit() {
    setSubmitted(true);
    setRequestFailed(null);
    if (validateName(name) || validateEmail(email) || validatePassword(password)) return;

    const { error } = await signUp.password({
      emailAddress: normalizeEmail(email),
      password,
      ...splitName(name),
    });
    if (error) return; // Shown through `errors`.

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      setRequestFailed("We couldn't send your code. Please try again.");
      return;
    }
    router.push({ pathname: "/verify-email", params: { flow: "sign-up" } });
  }

  return (
    <AuthScreen
      title={"Create\nyour account"}
      body="Join roamly to save your stays, get personalized recommendations and access them across all your devices."
      footer={
        <FooterLink
          prompt="Already have an account?"
          action="Sign in"
          disabled={busy}
          onPress={() => router.replace("/sign-in")}
        />
      }
    >
      <View className="gap-3">
        <TextField
          icon={User}
          label="Full name"
          placeholder="e.g. Royston Dsouza"
          value={name}
          onChangeText={setName}
          error={submitted ? errorFor.name : undefined}
          editable={!busy}
          autoComplete="name"
          textContentType="name"
          autoCapitalize="words"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextField
          ref={emailRef}
          icon={Mail}
          label="Email address"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          error={submitted ? errorFor.email : undefined}
          editable={!busy}
          autoComplete="email"
          textContentType="emailAddress"
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
          placeholder="At least 8 characters"
          value={password}
          onChangeText={setPassword}
          error={submitted ? errorFor.password : undefined}
          editable={!busy}
          autoComplete="new-password"
          textContentType="newPassword"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={submit}
        />
      </View>
      {formError ? <Alert tone="error" message={formError} className="mt-6" /> : null}
      <Button
        title="Create account"
        trailing={<Icon icon={ArrowRight} />}
        loading={loading}
        disabled={social.loadingProvider !== null}
        onPress={submit}
        className="mt-6"
      />
      <OrDivider />
      <SocialButtons onPress={social.start} loadingProvider={social.loadingProvider} disabled={loading} />
      {/* Mount point for Clerk's bot protection (required on sign-up screens). */}
      <View nativeID="clerk-captcha" />
    </AuthScreen>
  );
}
