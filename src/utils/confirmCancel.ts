import { confirmAction } from './confirmAction';

export function confirmCancel(
  noun: string,
  service: string,
  cancel: () => Promise<unknown>,
  onDone: () => void,
  force = false,
) {
  confirmAction(
    {
      title: force ? `Force cancel this ${noun}?` : `Cancel this ${noun}?`,
      message: force
        ? `${service} stops the ${noun} immediately and skips cleanup steps such as always(). Use this only when a normal cancel does not work.`
        : `${service} stops the ${noun} and it can't be resumed.`,
      confirmLabel: force ? 'Force cancel' : `Cancel ${noun}`,
      dismissLabel: 'Keep running',
      destructive: true,
    },
    cancel,
    onDone,
  );
}
