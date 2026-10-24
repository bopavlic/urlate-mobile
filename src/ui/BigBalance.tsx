import { Text, View } from 'react-native';

import type { BalanceView } from '@/api/generated/model';
import { balanceSentence, groupBalanceSentence } from '@/features/balance/copy';

import { Ticket, ticketTone } from './Ticket';

const SUBLINE = {
  owed: 'Not that you’re counting.',
  owing: 'Maybe set an alarm.',
  clear: 'Enjoy it while it lasts.',
} as const;

/**
 * The balance as a late ticket: issued to them in the accent when they owe you, to you in ink
 * when you owe them, and a plain "all clear" stub when you're square.
 */
export function BigBalance({
  view,
  otherName,
  kind,
}: {
  view: BalanceView;
  otherName: string;
  kind: 'PAIR' | 'GROUP';
}) {
  const sentence = kind === 'PAIR' ? balanceSentence(view, otherName) : groupBalanceSentence(view);
  const tone = ticketTone(view.direction);
  const them = (kind === 'PAIR' ? otherName : 'The group').toUpperCase();
  const [offender, waiter] =
    tone === 'owed' ? [them, 'YOU'] : tone === 'owing' ? ['YOU', them] : ['NOBODY', 'NOBODY'];

  return (
    <View className="gap-6" accessible accessibilityLabel={sentence}>
      <View importantForAccessibility="no-hide-descendants" className="px-1">
        <Ticket tone={tone} minutes={view.minutes} offender={offender} waiter={waiter} />
      </View>
      <View className="items-center gap-1">
        <Text className="text-center font-display text-2xl text-ink">{sentence}</Text>
        <Text className="text-base text-muted">{SUBLINE[tone]}</Text>
      </View>
    </View>
  );
}
