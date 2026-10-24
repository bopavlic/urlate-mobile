import { useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { BalanceView } from '@/api/generated/model';
import { useColors } from '@/theme/appearance';
import { fonts } from '@/theme/tokens';

// Being late gets you a ticket, like a parking fine: a printed stub with the offender, who
// was kept waiting and the minutes, with a tear-off line and a barcode at the foot.
// Colours go through `style`, not classes, so a theme or share-card look can recolour it and
// NativeWind never remounts it when they change.

export type TicketColors = {
  /** The ticket's paper. */
  paper: string;
  ink: string;
  muted: string;
  line: string;
  /** The header band when someone owes you. */
  accent: string;
  onAccent: string;
};

export type TicketTone = 'owed' | 'owing' | 'clear';

export function ticketTone(direction: BalanceView['direction']): TicketTone {
  return direction === 'THEY_OWE_YOU' ? 'owed' : direction === 'YOU_OWE_THEM' ? 'owing' : 'clear';
}

/** The ticket number: the minutes, zero-padded like a printed serial. */
export function ticketNumber(minutes: number): string {
  return `No. ${String(Math.min(minutes, 999999)).padStart(6, '0')}`;
}

// A fixed pattern, so the barcode never shifts between renders.
// Bars and gaps alternate, starting with a bar; each digit is a width. A fixed pattern, so the
// barcode never shifts between renders, stretched to the ticket's full width.
export const BARS = Array.from(
  '2112131121312211311212131123112113122131112131212311211312131121231121',
  Number,
);

const BAR_UNITS = BARS.reduce((sum, weight) => sum + weight, 0);

/** The bars, sized from the measured width so they spread evenly edge to edge. */
function Barcode({
  color,
  height,
  marginTop,
}: {
  color: string;
  height: number;
  marginTop: number;
}) {
  const [width, setWidth] = useState(0);
  const unit = width / BAR_UNITS;
  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ flexDirection: 'row', height, marginTop }}
    >
      {width > 0
        ? BARS.map((weight, i) => (
            <View
              key={i}
              style={{ width: weight * unit, backgroundColor: i % 2 === 0 ? color : 'transparent' }}
            />
          ))
        : null}
    </View>
  );
}

export function Ticket({
  tone,
  minutes,
  offender,
  waiter,
  label = tone === 'clear' ? 'ALL CLEAR' : 'LATE NOTICE',
  prefix = '',
  tilt = tone === 'clear' ? 0 : -2.5,
  scale = 1,
  colors: override,
  style,
}: {
  tone: TicketTone;
  minutes: number;
  /** Who was late, e.g. "ANA". */
  offender: string;
  /** Who was kept waiting, e.g. "YOU". */
  waiter: string;
  label?: string;
  /** Before the minutes, e.g. "+" on a fresh ticket. */
  prefix?: string;
  tilt?: number;
  scale?: number;
  colors?: TicketColors;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useColors();
  const c: TicketColors = override ?? {
    paper: theme.surface,
    ink: theme.ink,
    muted: theme.muted,
    line: theme.line,
    accent: theme.accent,
    onAccent: theme.onAccent,
  };
  const s = (n: number) => n * scale;
  const band = tone === 'owed' ? c.accent : tone === 'owing' ? c.ink : c.line;
  const onBand = tone === 'owed' ? c.onAccent : tone === 'owing' ? c.paper : c.muted;
  const field = (name: string, value: string) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: s(2) }}>
      <Text style={{ fontFamily: fonts.mono, fontSize: s(12), color: c.muted }}>{name}</Text>
      <Text
        style={{
          fontFamily: fonts.monoBold,
          fontSize: s(12),
          color: c.ink,
          flexShrink: 1,
          marginLeft: s(12),
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <View
      style={[
        {
          backgroundColor: c.paper,
          borderRadius: s(14),
          transform: [{ rotate: `${tilt}deg` }],
          shadowColor: '#1C1736',
          shadowOpacity: tone === 'clear' ? 0.08 : 0.22,
          shadowRadius: s(16),
          shadowOffset: { width: 0, height: s(12) },
          elevation: tone === 'clear' ? 2 : 8,
        },
        style,
      ]}
    >
      <View
        style={{
          backgroundColor: band,
          borderTopLeftRadius: s(14),
          borderTopRightRadius: s(14),
          paddingHorizontal: s(18),
          paddingVertical: s(12),
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: s(15),
            letterSpacing: s(0.5),
            color: onBand,
          }}
        >
          {label}
        </Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: s(11), color: onBand }}>
          {ticketNumber(minutes)}
        </Text>
      </View>

      <View style={{ paddingHorizontal: s(18), paddingTop: s(14), paddingBottom: s(16) }}>
        {field('OFFENDER', offender)}
        {field('KEPT WAITING', waiter)}

        {/* The perforation: where the stub would tear off. */}
        <View
          style={{
            marginTop: s(12),
            borderTopWidth: s(2),
            borderStyle: 'dashed',
            borderColor: c.line,
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: s(8), marginTop: s(10) }}>
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: s(76),
              lineHeight: s(82),
              letterSpacing: s(-2),
              color: c.ink,
              fontVariant: ['tabular-nums'],
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {prefix}
            {minutes}
          </Text>
          <Text style={{ fontFamily: fonts.display, fontSize: s(20), color: c.ink }}>MIN</Text>
        </View>

        <Barcode color={c.ink} height={s(30)} marginTop={s(12)} />
      </View>
    </View>
  );
}
