'use client';

import { useState, useCallback } from 'react';
import type { Notification } from '@/lib/types';
import { sfx } from '@/lib/sounds';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [toasts] = useState<Array<{ id: string; message: string }>>([]);

  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if (typeof window === 'undefined') return;
    if (document.visibilityState === 'visible') return;
    if (!('Notification' in window)) return;
    if (window.Notification.permission === 'granted') {
      new window.Notification(title, { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png' });
    } else if (window.Notification.permission !== 'denied') {
      window.Notification.requestPermission();
    }
  }, []);

  const addNotification = useCallback((title: string, message: string, type: Notification['type'] = 'success') => {
    setNotifications(prev => [{
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title, message, type,
      timestamp: new Date(),
      read: false,
    }, ...prev].slice(0, 50));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const triggerSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    sfx.notification();
    addNotification(
      message.length > 40 ? message.slice(0, 40) + '\u2026' : message,
      message,
      message.toLowerCase().includes('fail') || message.toLowerCase().includes('not enough') ? 'error' : 'success'
    );
    sendBrowserNotification('SHIT.ARMY', message);
    setTimeout(() => setShowSuccess(false), 2600);
  }, [addNotification, sendBrowserNotification]);

  return {
    notifications, toasts, showSuccess, successMessage,
    triggerSuccess, addNotification, markNotificationRead, clearAllNotifications,
  };
}
