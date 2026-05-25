'use client';

import { useState, useCallback } from 'react';
import type { Transaction } from '@/lib/types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      timestamp: new Date(),
    };
    setTransactions(prev => [newTx, ...prev]);
  }, []);

  const loadTransactions = useCallback((txs: Transaction[]) => {
    setTransactions(txs);
  }, []);

  return { transactions, addTransaction, loadTransactions };
}
