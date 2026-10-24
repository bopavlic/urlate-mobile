import {
  getGetEntitlementsQueryKey,
  useGetEntitlements,
} from '@/api/generated/endpoints/premium/premium';
import type { Entitlements } from '@/api/generated/model';
import { queryClient } from '@/providers/query';

/** What this account may use. The API is the only judge; nothing is decided on the phone. */
export function useEntitlements() {
  return useGetEntitlements({ query: { staleTime: 60_000 } });
}

export function setEntitlements(entitlements: Entitlements): void {
  queryClient.setQueryData(getGetEntitlementsQueryKey(), entitlements);
}

export function refreshEntitlements(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: getGetEntitlementsQueryKey() });
}
