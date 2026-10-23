import type { ReactNode } from 'react';
import { Text } from 'react-native';

/** Scoreboard-style screen title (Big Shoulders). */
export function Title({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <Text
      accessibilityRole="header"
      className={`font-display text-5xl leading-[52px] text-ink ${className}`}
    >
      {children}
    </Text>
  );
}
