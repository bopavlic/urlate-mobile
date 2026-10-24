import type { ComponentRef, Ref } from 'react';
import { Text, View } from 'react-native';

import type { ShareCard } from '@/api/generated/model';
import { fonts } from '@/theme/tokens';

import { cardScore } from './copy';
import { cardLook, type Look } from './look';

// The image people post: a 9:16 Story frame in the card's look (the night pitch unless the
// sharer picked another), the same in light and dark mode. Laid out on a 360-point grid and
// scaled to `width`; captured at 1080 × 1920.

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
  const {
    background: pitch,
    text: chalk,
    muted,
    line,
    card: accent,
    onCard: onAccent,
  } = cardLook(look);
  const u = width / 360;
  const score = cardScore(card);
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
        backgroundColor: pitch,
        padding: 28 * u,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 * u }}>
        <View
          style={{
            width: 14 * u,
            height: 19 * u,
            borderRadius: 3 * u,
            backgroundColor: accent,
            transform: [{ rotate: '6deg' }],
          }}
        />
        <Text style={{ fontFamily: fonts.display, fontSize: 22 * u, color: chalk }}>UR LATE</Text>
      </View>

      <View style={{ gap: 24 * u }}>
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 46 * u,
            lineHeight: 44 * u,
            color: chalk,
            textTransform: 'uppercase',
          }}
        >
          {card.headline}
        </Text>

        {score ? (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: accent,
              borderRadius: 22 * u,
              paddingHorizontal: 26 * u,
              paddingTop: 16 * u,
              paddingBottom: 12 * u,
              transform: [{ rotate: '-4deg' }],
            }}
          >
            <Text style={{ fontSize: 16 * u, fontWeight: '600', color: onAccent }}>
              {score.label}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 * u }}>
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: 120 * u,
                  lineHeight: 118 * u,
                  color: onAccent,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {score.minutes}
              </Text>
              <Text style={{ fontFamily: fonts.displayBold, fontSize: 34 * u, color: onAccent }}>
                MIN
              </Text>
            </View>
          </View>
        ) : null}

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
                  <Text style={{ fontFamily: fonts.display, fontSize: 16 * u, color: muted }}>
                    {index + 1}
                  </Text>
                  <Text style={{ fontSize: 16 * u, color: chalk, flexShrink: 1 }} numberOfLines={1}>
                    {row.name}
                  </Text>
                </View>
                <Text style={{ fontFamily: fonts.display, fontSize: 22 * u, color: chalk }}>
                  {`${row.minutes} min`}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={{ gap: 2 * u }}>
        <Text style={{ fontSize: 14 * u, color: muted }}>Who&apos;s been waiting on who?</Text>
        <Text style={{ fontFamily: fonts.displayBold, fontSize: 24 * u, color: chalk }}>
          urlate.app
        </Text>
      </View>
    </View>
  );
}
