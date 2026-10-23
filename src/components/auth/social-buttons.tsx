import { Platform, View } from "react-native";

import { AppleMark } from "@/components/ui/apple-mark";
import { Button } from "@/components/ui/button";
import { GoogleMark } from "@/components/ui/google-mark";

export type SocialProvider = "google" | "apple";

export type SocialButtonsProps = {
  onPress: (provider: SocialProvider) => void;
  loadingProvider?: SocialProvider | null;
  disabled?: boolean;
};

export function SocialButtons({ onPress, loadingProvider, disabled }: SocialButtonsProps) {
  return (
    <View className="gap-3">
      <Button
        variant="secondary"
        title="Continue with Google"
        leading={<GoogleMark />}
        loading={loadingProvider === "google"}
        disabled={disabled}
        onPress={() => onPress("google")}
      />
      {Platform.OS === "ios" ? (
        <Button
          variant="secondary"
          title="Continue with Apple"
          leading={<AppleMark />}
          loading={loadingProvider === "apple"}
          disabled={disabled}
          onPress={() => onPress("apple")}
        />
      ) : null}
    </View>
  );
}
