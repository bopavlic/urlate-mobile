import { Text, View } from 'react-native';

import type { BalanceView } from '@/api/generated/model';
import { balanceSentence, groupBalanceSentence } from '@/features/balance/copy';
import { type } from '@/theme/tokens';

/**
 * The balance as a referee's card: a tilted yellow card when they owe you,
 * an outlined card when you owe them, an empty card when you're square.
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
  const owedToMe = view.direction === 'THEY_OWE_YOU';
  const square = view.direction === 'ALL_SQUARE';

  const card = owedToMe
    ? 'bg-accent -rotate-[4deg] shadow-lg shadow-black/25'
    : square
      ? 'border-[3px] border-dashed border-line'
      : 'border-[3px] border-ink';
  const digits = owedToMe ? 'text-on-accent' : square ? 'text-muted' : 'text-ink';

  return (
    <View className="items-center gap-6" accessible accessibilityLabel={sentence}>
      <View
        className={`h-[232px] w-[176px] items-center justify-center rounded-[20px] ${card}`}
        importantForAccessibility="no-hide-descendants"
      >
        <Text
          className={digits}
          style={type.balance}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.4}
        >
          {view.minutes}
        </Text>
        <Text className={`font-display-semi text-2xl ${digits}`}>min</Text>
      </View>
      <View className="items-center gap-1">
        <Text className="text-center font-display-bold text-3xl text-ink">{sentence}</Text>
        {square ? <Text className="text-base text-muted">Enjoy it while it lasts.</Text> : null}
      </View>
    </View>
  );
}
