import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

/** A page: safe-area aware, paper background, keyboard-friendly when it holds a form. */
export function Screen({
  children,
  scroll = false,
  edges = ["top", "bottom"],
  className = "",
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  className?: string;
}) {
  const body = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={`grow px-6 pb-8 ${className}`}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 px-6 ${className}`}>{children}</View>
  );
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-paper">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {body}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
