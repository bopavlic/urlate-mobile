import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PORT = 4000;

/**
 * Where the API lives. An explicit EXPO_PUBLIC_API_URL wins (preview/production builds);
 * in development the API runs on the same machine as Metro, so reuse Metro's host.
 */
export function resolveApiUrl(input: {
  envUrl?: string;
  hostUri?: string | null;
  platform: "ios" | "android";
}): string {
  if (input.envUrl) return input.envUrl.replace(/\/+$/, "");
  const host = input.hostUri?.split(":")[0];
  if (host) return `http://${host}:${API_PORT}`;
  // Android emulators reach the host machine through 10.0.2.2.
  return input.platform === "android"
    ? `http://10.0.2.2:${API_PORT}`
    : `http://localhost:${API_PORT}`;
}

export const apiUrl = resolveApiUrl({
  envUrl: process.env.EXPO_PUBLIC_API_URL,
  hostUri: Constants.expoConfig?.hostUri,
  platform: Platform.OS === "android" ? "android" : "ios",
});
