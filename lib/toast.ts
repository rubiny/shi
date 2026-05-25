type ToastType = 'success' | 'error' | 'info' | 'achievement';

interface ToastPayload {
  type: ToastType;
  title: string;
  message: string;
  icon: string;
}

type ToastListener = (toast: ToastPayload) => void;

const listeners = new Set<ToastListener>();

export function onToast(listener: ToastListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(payload: ToastPayload) {
  listeners.forEach(fn => fn(payload));
}

export const toast = {
  success: (title: string, message: string, icon = '✅') =>
    emit({ type: 'success', title, message, icon }),
  error: (title: string, message: string, icon = '❌') =>
    emit({ type: 'error', title, message, icon }),
  info: (title: string, message: string, icon = 'ℹ️') =>
    emit({ type: 'info', title, message, icon }),
  achievement: (title: string, message: string, icon = '🏆') =>
    emit({ type: 'achievement', title, message, icon }),
  earn: (amount: number, source: string) =>
    emit({ type: 'success', title: `+${amount.toLocaleString()} $SHIT`, message: source, icon: '💰' }),
  levelUp: (soldierName: string, newLevel: number) =>
    emit({ type: 'achievement', title: 'LEVEL UP!', message: `${soldierName} reached level ${newLevel}`, icon: '⬆️' }),
  dailyClaimed: (amount: number, streak: number) =>
    emit({ type: 'success', title: 'Daily Claimed!', message: `+${amount} $SHIT · ${streak} day streak`, icon: '📅' }),
  withdrawSubmitted: (amount: number) =>
    emit({ type: 'info', title: 'Withdrawal Submitted', message: `${amount.toLocaleString()} $SHIT processing...`, icon: '💸' }),
  copied: (what = 'Link') =>
    emit({ type: 'info', title: 'Copied!', message: `${what} copied to clipboard`, icon: '📋' }),
};
