import type { ShareCard } from '@/api/generated/model';

export const pairCard: ShareCard = {
  id: '0199f0f0-1234-7000-8000-00000000abcd',
  url: 'https://urlate.app/s/0199f0f0-1234-7000-8000-00000000abcd',
  kind: 'PAIR',
  headline: 'Brother owes me 18 minutes.',
  sharedByName: 'Borna',
  otherName: 'Brother',
  groupName: null,
  balance: { direction: 'THEY_OWE_YOU', minutes: 18 },
  rows: [],
  style: 'PITCH',
  cardColor: 'YELLOW',
  createdAt: '2026-10-24T09:30:00.000Z',
};

export const groupCard: ShareCard = {
  ...pairCard,
  kind: 'GROUP',
  headline: 'Ana owes Football 20 minutes.',
  otherName: null,
  groupName: 'Football',
  balance: null,
  rows: [
    { name: 'Ana', minutes: 20 },
    { name: 'Ivo', minutes: 5 },
  ],
};
