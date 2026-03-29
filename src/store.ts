import { useState, useEffect } from 'react';
import { Member, Transaction, MemberWithBalance } from './types';

export const useLedgerStore = () => {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('ledger_members');
    if (saved) return JSON.parse(saved);
    
    // Demo Data
    return [
      { id: 'demo-1', name: 'Alex Johnson', phone: '+1 555 0123', note: 'Work colleague', createdAt: new Date().toISOString() },
      { id: 'demo-2', name: 'Sarah Miller', phone: '+1 555 0456', note: 'Roommate', createdAt: new Date().toISOString() },
    ];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ledger_transactions');
    if (saved) return JSON.parse(saved);

    // Demo Data
    return [
      { id: 't-1', memberId: 'demo-1', amount: 50, type: 'credit', description: 'Lunch payment', date: new Date().toISOString() },
      { id: 't-2', memberId: 'demo-2', amount: 120, type: 'debit', description: 'Electricity bill', date: new Date().toISOString() },
    ];
  });

  useEffect(() => {
    localStorage.setItem('ledger_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('ledger_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addMember = (member: Omit<Member, 'id' | 'createdAt'>) => {
    const newMember: Member = {
      ...member,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setMembers((prev) => [...prev, newMember]);
    return newMember;
  };

  const updateMember = (id: string, updates: Partial<Omit<Member, 'id' | 'createdAt'>>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setTransactions((prev) => prev.filter((t) => t.memberId !== id));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    return newTransaction;
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTransaction = (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const getMemberBalance = (memberId: string) => {
    return transactions
      .filter((t) => t.memberId === memberId)
      .reduce((acc, t) => (t.type === 'credit' ? acc + t.amount : acc - t.amount), 0);
  };

  const membersWithBalances: MemberWithBalance[] = members.map((m) => ({
    ...m,
    balance: getMemberBalance(m.id),
  }));

  const totals = transactions.reduce(
    (acc, t) => {
      if (t.type === 'credit') acc.receivable += t.amount;
      else acc.payable += t.amount;
      return acc;
    },
    { receivable: 0, payable: 0 }
  );

  const totalBalance = totals.receivable - totals.payable;

  return {
    members: membersWithBalances,
    transactions,
    addMember,
    updateMember,
    deleteMember,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    totals,
    totalBalance,
  };
};
