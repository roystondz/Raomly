import type { TokenCache } from "@clerk/expo";
import * as SecureStore from "expo-secure-store";
import { AppState } from "react-native";

const options: SecureStore.SecureStoreOptions = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK };

function waitUntilActive() {
  if (AppState.currentState === "active") return Promise.resolve();
  return new Promise<void>((resolve) => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      subscription.remove();
      resolve();
    });
  });
}

// Clerk's default cache (@clerk/expo/token-cache) deletes the client token on
// Android after any secure store read error. Losing it mid sign-up gives the
// app a new Clerk client, and the email code then fails with "You are signed
// out". Here a failed read retries once the app is active, and the token is
// only deleted when that retry fails too (the stored item is unreadable).
export const tokenCache: TokenCache = {
  async getToken(key) {
    try {
      return await SecureStore.getItemAsync(key, options);
    } catch {
      await waitUntilActive();
    }
    try {
      return await SecureStore.getItemAsync(key, options);
    } catch {
      await SecureStore.deleteItemAsync(key, options);
      return null;
    }
  },
  saveToken: (key, token) => SecureStore.setItemAsync(key, token, options),
  clearToken: (key) => SecureStore.deleteItemAsync(key, options),
};
