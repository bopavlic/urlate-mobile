import { router, useLocalSearchParams } from 'expo-router';

import { apiErrorCode } from '@/api/client';
import { reportContent } from '@/api/generated/endpoints/safety/safety';
import { ReportScreen } from '@/features/safety/ReportScreen';

/** /report?memberId=…&name=Ana for a person, /report?entryId=… for a ticket. */
export default function ReportRoute() {
  const { memberId, entryId, name } = useLocalSearchParams<{
    memberId?: string;
    entryId?: string;
    name?: string;
  }>();
  return (
    <ReportScreen
      subject={entryId ? 'this ticket' : (name ?? 'them')}
      onSend={async (reason, details) => {
        try {
          await reportContent(
            entryId ? { entryId, reason, details } : { memberId: memberId!, reason, details },
          );
        } catch (err) {
          throw { code: apiErrorCode(err) };
        }
      }}
      onDone={() => router.back()}
    />
  );
}
