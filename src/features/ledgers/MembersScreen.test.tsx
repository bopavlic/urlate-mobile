import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import type { LedgerDetail } from '@/api/generated/model';

import { brother, me } from './fixtures';
import { MembersScreen } from './MembersScreen';

jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

const ana = { ...brother, id: 'm-ana', displayName: 'Ana', isPlaceholder: false, username: 'ana' };

const group: LedgerDetail = {
  id: 'l-group',
  kind: 'GROUP',
  name: 'Football',
  members: [me, ana, brother],
  myBalance: { direction: 'ALL_SQUARE', minutes: 0 },
  lastActivityAt: '2026-10-23T08:00:00.000Z',
  confirmMode: false,
  createdAt: '2026-10-23T08:00:00.000Z',
  balances: [],
  leaderboard: [],
};

function setup(overrides: Partial<Parameters<typeof MembersScreen>[0]> = {}) {
  const props = {
    detail: group,
    onAdd: jest.fn().mockResolvedValue(undefined),
    onRemove: jest.fn().mockResolvedValue(undefined),
    onInvite: jest.fn(),
    ...overrides,
  };
  return { props, view: render(<MembersScreen {...props} />) };
}

beforeEach(() => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});

describe('MembersScreen', () => {
  it('shows who is on the app and who is not yet', async () => {
    const { view } = setup();
    await view;
    expect(screen.getByText('You')).toBeTruthy();
    expect(screen.getByText('@ana')).toBeTruthy();
    expect(screen.getByText('Not on Ur Late yet')).toBeTruthy();
  });

  it('invites a placeholder person', async () => {
    const { props, view } = setup();
    await view;
    await fireEvent.press(screen.getByRole('button', { name: 'Invite Brother' }));
    expect(props.onInvite).toHaveBeenCalledWith(brother.id);
  });

  it('adds someone by name and clears the field', async () => {
    const { props, view } = setup();
    await view;
    await fireEvent.changeText(screen.getByLabelText('Add someone'), ' Marko ');
    await fireEvent.press(screen.getByRole('button', { name: 'Add' }));
    expect(props.onAdd).toHaveBeenCalledWith('Marko');
    expect(screen.getByLabelText('Add someone').props.value).toBe('');
  });

  it('explains a refused name', async () => {
    const { view } = setup({ onAdd: jest.fn().mockRejectedValue({ code: 'NAME_TAKEN' }) });
    await view;
    await fireEvent.changeText(screen.getByLabelText('Add someone'), 'Ana');
    await fireEvent.press(screen.getByRole('button', { name: 'Add' }));
    expect(await screen.findByText('Someone here already has that name.')).toBeTruthy();
  });

  it('removes a placeholder after asking, and only placeholders', async () => {
    const { props, view } = setup();
    await view;
    expect(screen.queryByRole('button', { name: 'Remove Ana' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Remove Brother' }));
    const buttons = jest.mocked(Alert.alert).mock.calls.at(-1)?.[2] ?? [];
    buttons.find((button) => button.style === 'destructive')?.onPress?.();
    expect(props.onRemove).toHaveBeenCalledWith(brother.id);
  });
});
