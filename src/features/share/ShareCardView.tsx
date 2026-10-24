import type { ComponentRef, Ref } from 'react';
import { Text, View } from 'react-native';

import type { ShareCard } from '@/api/generated/model';
import { fonts } from '@/theme/tokens';
import { Ticket } from '@/ui/Ticket';

import { cardTicket } from './copy';
import { cardLook, ticketColors, type Look } from './look';

// The image people post: a 9:16 Story frame with the late ticket, in the card's look (a pink
// ticket on lavender unless the sharer picked another), the same in light and dark mode. Laid
// out on a 360-point grid and scaled to `width`; captured at 1080 × 1920.

export const CARD_ASPECT = 16 / 9;

export function ShareCardView({
  card,
  width,
  look = card,
  ref,
}: {
  card: ShareCard;
  width: number;
  /** Preview another look before the card is made with it; the card's own by default. */
  look?: Look;
  ref?: Ref<ComponentRef<typeof View>>;
}) {
  const { background, text, muted, line, card: accent } = cardLook(look);
  const u = width / 360;
  const ticket = cardTicket(card);
  const rows = card.kind === 'GROUP' && card.rows.length > 1 ? card.rows : [];

  return (
    <View
      ref={ref}
      collapsable={false}
      accessible
      accessibilityLabel={card.headline}
      style={{
        width,
        height: width * CARD_ASPECT,
        backgroundColor: background,
        padding: 28 * u,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 * u }}>
        <View
          style={{
            width: 22 * u,
            height: 15 * u,
            borderRadius: 3 * u,
            backgroundColor: accent,
            transform: [{ rotate: '-8deg' }],
          }}
        />
        <Text style={{ fontFamily: fonts.display, fontSize: 20 * u, color: text }}>Ur Late</Text>
      </View>

      <View style={{ gap: 26 * u }}>
        <Text
          style={{ fontFamily: fonts.display, fontSize: 34 * u, lineHeight: 38 * u, color: text }}
        >
          {card.headline}
        </Text>

        <Ticket
          tone={ticket ? 'owed' : 'clear'}
          minutes={ticket?.minutes ?? 0}
          offender={(ticket?.offender ?? 'Nobody').toUpperCase()}
          waiter={(ticket?.waiter ?? 'Nobody').toUpperCase()}
          scale={u}
          tilt={ticket ? -3 : 0}
          colors={ticketColors(look)}
        />

        {rows.length > 0 ? (
          <View style={{ borderTopWidth: 1, borderColor: line }}>
            {rows.map((row, index) => (
              <View
                key={`${row.name}-${index}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  paddingVertical: 7 * u,
                  borderBottomWidth: 1,
                  borderColor: line,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    gap: 10 * u,
                    flexShrink: 1,
                  }}
                >
                  <Text style={{ fontFamily: fonts.monoBold, fontSize: 14 * u, color: muted }}>
                    {index + 1}
                  </Text>
                  <Text style={{ fontSize: 16 * u, color: text, flexShrink: 1 }} numberOfLines={1}>
                    {row.name}
                  </Text>
                </View>
                <Text style={{ fontFamily: fonts.display, fontSize: 18 * u, color: text }}>
                  {`${row.minutes} min`}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={{ gap: 2 * u }}>
        <Text style={{ fontSize: 14 * u, color: muted }}>Who&apos;s been waiting on who?</Text>
        <Text style={{ fontFamily: fonts.display, fontSize: 20 * u, color: text }}>urlate.app</Text>
      </View>
    </View>
  );
}
