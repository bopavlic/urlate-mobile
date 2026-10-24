import type { ReactNode } from 'react';
import { Text } from 'react-native';

/** Screen title (Archivo Black), tightly set. */
export function Title({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <Text
      accessibilityRole="header"
      className={`font-display text-[30px] leading-[36px] text-ink ${className}`}
      style={{ letterSpacing: -0.5 }}
    >
      {children}
    </Text>
  );
}
