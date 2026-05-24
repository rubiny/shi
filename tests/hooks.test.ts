import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBalance } from '@/hooks/useBalance';
import { useTransactions } from '@/hooks/useTransactions';
import { useNotifications } from '@/hooks/useNotifications';

describe('useBalance', () => {
  it('initializes with zero values', () => {
    const { result } = renderHook(() => useBalance());
    expect(result.current.shitBalance).toBe(0);
    expect(result.current.points).toBe(0);
    expect(result.current.totalEarned).toBe(0);
    expect(result.current.dailyStreak).toBe(0);
    expect(result.current.vipTier).toBe(0);
  });

  it('loads balance data', () => {
    const { result } = renderHook(() => useBalance());
    act(() => {
      result.current.loadBalanceData({
        shit_balance: 1000,
        points: 500,
        total_earned: 2000,
        daily_streak: 5,
      });
    });
    expect(result.current.shitBalance).toBe(1000);
    expect(result.current.points).toBe(500);
    expect(result.current.totalEarned).toBe(2000);
    expect(result.current.dailyStreak).toBe(5);
  });

  it('calculates streak multiplier', () => {
    const { result } = renderHook(() => useBalance());
    act(() => {
      result.current.loadBalanceData({ daily_streak: 10 });
    });
    expect(result.current.streakMultiplier).toBe(25);
  });

  it('caps streak multiplier at 35', () => {
    const { result } = renderHook(() => useBalance());
    act(() => {
      result.current.loadBalanceData({ daily_streak: 100 });
    });
    expect(result.current.streakMultiplier).toBe(35);
  });

  it('updates individual balances', () => {
    const { result } = renderHook(() => useBalance());
    act(() => { result.current.setShitBalance(500); });
    expect(result.current.shitBalance).toBe(500);

    act(() => { result.current.setPoints(200); });
    expect(result.current.points).toBe(200);
  });
});

describe('useTransactions', () => {
  it('initializes with empty array', () => {
    const { result } = renderHook(() => useTransactions());
    expect(result.current.transactions).toEqual([]);
  });

  it('adds transaction', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => {
      result.current.addTransaction({
        type: 'offer',
        amount: 100,
        description: 'Test offer',
        status: 'completed',
      });
    });
    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0].type).toBe('offer');
    expect(result.current.transactions[0].amount).toBe(100);
    expect(result.current.transactions[0].id).toMatch(/^tx-/);
  });

  it('prepends new transactions', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => {
      result.current.addTransaction({ type: 'offer', amount: 100, description: 'First', status: 'completed' });
    });
    act(() => {
      result.current.addTransaction({ type: 'stake', amount: -200, description: 'Second', status: 'completed' });
    });
    expect(result.current.transactions[0].description).toBe('Second');
    expect(result.current.transactions[1].description).toBe('First');
  });

  it('loads transactions', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => {
      result.current.loadTransactions([
        { id: 'tx-1', type: 'offer', amount: 100, description: 'Test', timestamp: new Date(), status: 'completed' },
      ]);
    });
    expect(result.current.transactions).toHaveLength(1);
  });
});

describe('useNotifications', () => {
  it('initializes empty', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.notifications).toEqual([]);
    expect(result.current.showSuccess).toBe(false);
  });

  it('adds notification', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.addNotification('Test', 'Test message', 'success');
    });
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].title).toBe('Test');
    expect(result.current.notifications[0].read).toBe(false);
  });

  it('marks notification as read', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.addNotification('Test', 'msg', 'info');
    });
    const id = result.current.notifications[0].id;
    act(() => {
      result.current.markNotificationRead(id);
    });
    expect(result.current.notifications[0].read).toBe(true);
  });

  it('clears all notifications', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.addNotification('One', 'msg1', 'info');
      result.current.addNotification('Two', 'msg2', 'success');
    });
    expect(result.current.notifications.length).toBeGreaterThan(0);
    act(() => {
      result.current.clearAllNotifications();
    });
    expect(result.current.notifications).toHaveLength(0);
  });

  it('triggers success toast', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.triggerSuccess('Offer completed!');
    });
    expect(result.current.showSuccess).toBe(true);
    expect(result.current.successMessage).toBe('Offer completed!');
    // Auto-hide after 2600ms
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.showSuccess).toBe(false);
    vi.useRealTimers();
  });

  it('caps notifications at 50', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.addNotification(`Notif ${i}`, `msg ${i}`, 'info');
      }
    });
    expect(result.current.notifications.length).toBeLessThanOrEqual(50);
  });
});
