import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

/**
 * Both platforms pad content above the keyboard. Android 15+ draws edge to edge, so the
 * window no longer resizes for the keyboard (adjustResize is ignored) and inputs would hide.
 */
export function keyboardBehavior(_os: string): 'padding' {
  return 'padding';
}

/** A page: safe-area aware, paper background, keyboard-friendly when it holds a form. */
export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'bottom'],
  className = '',
}: {
  children: ReactNode;
  scroll?: boolean;
  /** Side padding. Off for edge-to-edge lists that pad their own rows. */
  padded?: boolean;
  edges?: Edge[];
  className?: string;
}) {
  const body = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={`grow pb-8 ${padded ? 'px-6' : ''} ${className}`}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${padded ? 'px-6' : ''} ${className}`}>{children}</View>
  );
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-paper">
      <KeyboardAvoidingView className="flex-1" behavior={keyboardBehavior(Platform.OS)}>
        {body}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
