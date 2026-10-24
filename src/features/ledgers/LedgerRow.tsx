import { Pressable, Text, View } from 'react-native';

import type { LedgerSummary, Member } from '@/api/generated/model';
import { balanceSentence, groupBalanceSentence } from '@/features/balance/copy';
import { Avatar } from '@/ui/Avatar';

export function otherMember(ledger: Pick<LedgerSummary, 'members'>): Member | undefined {
  return ledger.members.find((member) => !member.isMe);
}

/** A pair is called after the other person unless it was given a name; a group by its name. */
export function ledgerTitle(ledger: LedgerSummary): string {
  if (ledger.name) return ledger.name;
  return otherMember(ledger)?.displayName ?? 'Someone';
}

export function ledgerSentence(ledger: LedgerSummary): string {
  return ledger.kind === 'PAIR'
    ? balanceSentence(ledger.myBalance, otherMember(ledger)?.displayName ?? 'They')
    : groupBalanceSentence(ledger.myBalance);
}

/** The balance in miniature: a ticket stub, in the accent when they owe you, ink when you owe. */
function MiniBalance({ ledger }: { ledger: LedgerSummary }) {
  const { direction, minutes } = ledger.myBalance;
  if (direction === 'ALL_SQUARE') return null;
  const owedToMe = direction === 'THEY_OWE_YOU';
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      className={`min-w-14 items-center rounded-lg px-2.5 py-1.5 ${owedToMe ? 'bg-accent' : 'bg-ink'}`}
    >
      <Text
        className={`font-display text-xl leading-6 ${owedToMe ? 'text-on-accent' : 'text-paper'}`}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {minutes}
      </Text>
      <Text className={`font-mono-bold text-[10px] ${owedToMe ? 'text-on-accent' : 'text-paper'}`}>
        MIN
      </Text>
    </View>
  );
}

export function LedgerRow({ ledger, onPress }: { ledger: LedgerSummary; onPress: () => void }) {
  const title = ledgerTitle(ledger);
  const sentence = ledgerSentence(ledger);
  const other = ledger.kind === 'PAIR' ? otherMember(ledger) : undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={sentence}
      onPress={onPress}
      className="flex-row items-center gap-4 py-4 active:opacity-70"
    >
      <Avatar name={title} url={other?.avatarUrl} size={48} />
      <View className="flex-1 gap-0.5">
        <Text className="font-display text-lg text-ink" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-base text-muted" numberOfLines={1}>
          {sentence}
        </Text>
      </View>
      <MiniBalance ledger={ledger} />
    </Pressable>
  );
}
