import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import type { EntryActions } from '@/api/generated/model';
import { entryFixture } from '@/features/ledgers/fixtures';

import { EntryActionsBar } from './EntryActionsBar';

const none: EntryActions = {
  edit: false,
  delete: false,
  confirm: false,
  reject: false,
  dispute: false,
};

function setup(entry = entryFixture()) {
  const handlers = {
    onConfirm: jest.fn(),
    onReject: jest.fn(),
    onDispute: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };
  return { handlers, view: render(<EntryActionsBar entry={entry} busy={false} {...handlers} />) };
}

// Presses the destructive button of the confirmation Alert.
function confirmAlert() {
  const alert = jest.mocked(Alert.alert);
  const buttons = alert.mock.calls.at(-1)?.[2] ?? [];
  buttons.find((button) => button.style === 'destructive')?.onPress?.();
}

beforeEach(() => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});

describe('EntryActionsBar', () => {
  it('lets the author edit, and delete after confirming', async () => {
    const { handlers, view } = setup();
    await view;
    await fireEvent.press(screen.getByRole('button', { name: 'Edit' }));
    expect(handlers.onEdit).toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    expect(handlers.onDelete).not.toHaveBeenCalled();
    confirmAlert();
    expect(handlers.onDelete).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Dispute' })).toBeNull();
  });

  it('offers the late person a dispute while the window is open', async () => {
    const { handlers, view } = setup(
      entryFixture({
        actions: { ...none, dispute: true },
        disputableUntil: new Date(Date.now() + 4.5 * 60 * 60_000).toISOString(),
      }),
    );
    await view;
    expect(screen.getByText(/You can dispute this for 4 h/)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Dispute' }));
    confirmAlert();
    expect(handlers.onDispute).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  });

  it('asks the late person to accept or reject a pending entry', async () => {
    const { handlers, view } = setup(
      entryFixture({ status: 'PENDING', actions: { ...none, confirm: true, reject: true } }),
    );
    await view;
    await fireEvent.press(screen.getByRole('button', { name: 'Accept' }));
    expect(handlers.onConfirm).toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Reject' }));
    confirmAlert();
    expect(handlers.onReject).toHaveBeenCalled();
  });

  it('lets a disputer take it back', async () => {
    const { view } = setup(
      entryFixture({ status: 'DISPUTED', actions: { ...none, confirm: true } }),
    );
    await view;
    expect(screen.getByRole('button', { name: 'Accept after all' })).toBeTruthy();
  });

  it('explains when there is nothing to do', async () => {
    const { view } = setup(entryFixture({ actions: none }));
    await view;
    expect(screen.getByText('Only whoever logged this can change it.')).toBeTruthy();
  });
});
