
export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: string;
  memberId: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
}

export interface Member {
  id: string;
  name: string;
  phone?: string;
  note?: string;
  createdAt: string;
}

export interface MemberWithBalance extends Member {
  balance: number;
}
