import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";

import { updateMe } from "@/api/generated/endpoints/me/me";
import { authClient } from "@/lib/auth";

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/** Google needs client IDs from Google Cloud (see SETUP.md); without them the button stays hidden. */
export const googleEnabled =
  !!googleWebClientId && (Platform.OS !== "ios" || !!googleIosClientId);

if (googleEnabled) {
  GoogleSignin.configure({
    webClientId: googleWebClientId,
    iosClientId: googleIosClientId,
  });
}

export type SocialResult = "signed-in" | "cancelled";

export async function appleAvailable(): Promise<boolean> {
  return (
    Platform.OS === "ios" && (await AppleAuthentication.isAvailableAsync())
  );
}

export async function signInWithApple(): Promise<SocialResult> {
  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (err) {
    if ((err as { code?: string }).code === "ERR_REQUEST_CANCELED")
      return "cancelled";
    throw err;
  }
  if (!credential.identityToken)
    throw new Error("Apple did not return a sign-in token");
  const { error } = await authClient.signIn.social({
    provider: "apple",
    idToken: { token: credential.identityToken },
  });
  if (error) throw new Error(error.message ?? "Apple sign-in failed");

  // Apple shares the name only on the very first sign-in, and not inside the token.
  const name = [credential.fullName?.givenName, credential.fullName?.familyName]
    .filter(Boolean)
    .join(" ");
  if (name) await updateMe({ displayName: name }).catch(() => undefined);
  return "signed-in";
}

export async function signInWithGoogle(): Promise<SocialResult> {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) return "cancelled";
  const token = response.data.idToken;
  if (!token) throw new Error("Google did not return a sign-in token");
  const { error } = await authClient.signIn.social({
    provider: "google",
    idToken: { token },
  });
  if (error) throw new Error(error.message ?? "Google sign-in failed");
  return "signed-in";
}
