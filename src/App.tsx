/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Search, 
  ChevronRight, 
  X, 
  Trash2, 
  Phone, 
  Calendar,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { useLedgerStore } from './store';
import { Member, Transaction, TransactionType } from './types';

// --- Components ---

const GlassCard = ({ children, className = "", glossy = true }: { children: React.ReactNode, className?: string, glossy?: boolean }) => (
  <div className={`${glossy ? 'glass-card-glossy' : 'glass-card'} ${className}`}>
    {children}
  </div>
);

const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'members', icon: Users, label: 'People' },
    { id: 'transactions', icon: ArrowUpRight, label: 'History' },
  ];

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50">
      <div className="glass-card-glossy px-4 py-3 flex justify-around items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === tab.id ? 'text-emerald-400 scale-110' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg glass-card-glossy p-6 sm:p-8 overflow-hidden"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- Screens ---

const Dashboard = ({ 
  store, 
  onAddTransaction, 
  onViewMember 
}: { 
  store: ReturnType<typeof useLedgerStore>, 
  onAddTransaction: () => void,
  onViewMember: (id: string) => void
}) => {
  const recentTransactions = store.transactions.slice(0, 5);

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Smart Ledger</h1>
          <p className="text-white/50 text-sm">Welcome back</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
          <Users size={20} className="text-emerald-400" />
        </div>
      </div>

      {/* Total Balance Card */}
      <GlassCard className="p-8 text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <LayoutDashboard size={120} />
        </div>
        <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-2">Total Balance</p>
        <h2 className={`text-5xl font-black tracking-tighter ${store.totalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {store.totalBalance >= 0 ? '+' : ''}{store.totalBalance.toLocaleString()}
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Receivable</p>
            <p className="text-emerald-400 font-bold text-lg">+{store.totals.receivable.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Payable</p>
            <p className="text-rose-400 font-bold text-lg">-{store.totals.payable.toLocaleString()}</p>
          </div>
        </div>
      </GlassCard>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-lg">Recent Activity</h3>
          <button className="text-emerald-400 text-sm font-medium">View All</button>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-12 opacity-30">
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((t) => {
              const member = store.members.find(m => m.id === t.memberId);
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-4 flex items-center justify-between group cursor-pointer"
                  onClick={() => onViewMember(t.memberId)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      t.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {t.type === 'credit' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">{member?.name || 'Unknown'}</p>
                      <p className="text-white/40 text-xs truncate max-w-[150px]">{t.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${t.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'credit' ? '+' : '-'}{t.amount.toLocaleString()}
                    </p>
                    <p className="text-white/30 text-[10px]">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={onAddTransaction}
        className="fixed bottom-28 right-8 w-16 h-16 rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 flex items-center justify-center z-40 btn-glossy active:scale-90 transition-transform"
      >
        <Plus size={32} strokeWidth={3} />
      </button>
    </div>
  );
};

const MembersScreen = ({ 
  store, 
  onAddMember, 
  onViewMember,
  onQuickTransaction
}: { 
  store: ReturnType<typeof useLedgerStore>, 
  onAddMember: () => void,
  onViewMember: (id: string) => void,
  onQuickTransaction: (memberId: string, type: TransactionType) => void
}) => {
  const [search, setSearch] = useState('');
  
  const filteredMembers = useMemo(() => {
    return store.members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  }, [store.members, search]);

  return (
    <div className="space-y-6 pb-32">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">People</h1>
        <button onClick={onAddMember} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Plus size={18} /> New Person
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
        <input 
          type="text" 
          placeholder="Search people..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-glass w-full pl-12"
        />
      </div>

      {filteredMembers.length === 0 ? (
        <div className="text-center py-20 opacity-30">
          <Users size={64} className="mx-auto mb-4 opacity-20" />
          <p>{search ? 'No matches found' : 'Add your first member to get started'}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMembers.map((m) => (
            <motion.div
              layout
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card-glossy p-5 space-y-4"
            >
              <div className="flex justify-between items-start cursor-pointer" onClick={() => onViewMember(m.id)}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-bold text-white/80 border border-white/10">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{m.name}</h3>
                    {m.phone && <p className="text-white/40 text-xs flex items-center gap-1"><Phone size={10} /> {m.phone}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-lg ${m.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {m.balance >= 0 ? '+' : ''}{m.balance.toLocaleString()}
                  </p>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Balance</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onQuickTransaction(m.id, 'credit')}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-emerald-500/20"
                >
                  <ArrowUpRight size={14} /> Add Credit
                </button>
                <button 
                  onClick={() => onQuickTransaction(m.id, 'debit')}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-rose-500/20"
                >
                  <ArrowDownLeft size={14} /> Add Debit
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const TransactionsScreen = ({ store, onDelete }: { store: ReturnType<typeof useLedgerStore>, onDelete: (id: string) => void }) => {
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
  
  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return store.transactions;
    return store.transactions.filter(t => t.type === filter);
  }, [store.transactions, filter]);

  return (
    <div className="space-y-6 pb-32">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">History</h1>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
          {(['all', 'credit', 'debit'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                filter === f ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-20 opacity-30">
          <Calendar size={64} className="mx-auto mb-4 opacity-20" />
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((t) => {
            const member = store.members.find(m => m.id === t.memberId);
            return (
              <motion.div
                layout
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    t.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {t.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{member?.name || 'Unknown'}</p>
                    <p className="text-white/40 text-[10px]">{t.description}</p>
                    <p className="text-white/20 text-[8px] uppercase font-bold mt-0.5">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-bold text-sm ${t.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'credit' ? '+' : '-'}{t.amount.toLocaleString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => onDelete(t.id)}
                    className="p-2 text-white/10 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MemberDetail = ({ 
  memberId, 
  store, 
  onBack,
  onAddTransaction,
  onDeleteTransaction
}: { 
  memberId: string, 
  store: ReturnType<typeof useLedgerStore>, 
  onBack: () => void,
  onAddTransaction: (type: TransactionType) => void,
  onDeleteTransaction: (id: string) => void
}) => {
  const member = store.members.find(m => m.id === memberId);
  const memberTransactions = store.transactions.filter(t => t.memberId === memberId);

  if (!member) return null;

  return (
    <div className="space-y-8 pb-32">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
        <ArrowLeft size={20} /> Back
      </button>

      <GlassCard className="p-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-white/5 mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white/80 border border-white/10">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold mb-1">{member.name}</h1>
        {member.phone && <p className="text-white/40 text-sm mb-4">{member.phone}</p>}
        
        <div className="mt-6">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Current Balance</p>
          <h2 className={`text-4xl font-black ${member.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {member.balance >= 0 ? '+' : ''}{member.balance.toLocaleString()}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <button onClick={() => onAddTransaction('credit')} className="btn-primary py-3 text-sm">Add Credit</button>
          <button onClick={() => onAddTransaction('debit')} className="btn-danger py-3 text-sm">Add Debit</button>
        </div>
      </GlassCard>

      <div className="space-y-4">
        <h3 className="font-bold text-lg px-1">Transaction History</h3>
        {memberTransactions.length === 0 ? (
          <p className="text-center py-12 opacity-20">No history with this person</p>
        ) : (
          <div className="space-y-3">
            {memberTransactions.map((t) => (
              <div key={t.id} className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    t.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {t.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{t.description}</p>
                    <p className="text-white/30 text-[10px]">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className={`font-bold ${t.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'credit' ? '+' : '-'}{t.amount.toLocaleString()}
                  </p>
                  <button onClick={() => onDeleteTransaction(t.id)} className="p-2 text-white/10 hover:text-rose-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const store = useLedgerStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // Modals
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  
  // Form States
  const [newMember, setNewMember] = useState({ name: '', phone: '', note: '' });
  const [newTx, setNewTx] = useState({ memberId: '', amount: '', type: 'credit' as TransactionType, description: '', date: new Date().toISOString().split('T')[0] });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name) return;
    store.addMember(newMember);
    setNewMember({ name: '', phone: '', note: '' });
    setIsAddMemberOpen(false);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.memberId || !newTx.amount) return;
    store.addTransaction({
      ...newTx,
      amount: parseFloat(newTx.amount),
    });
    setNewTx({ memberId: '', amount: '', type: 'credit', description: '', date: new Date().toISOString().split('T')[0] });
    setIsAddTransactionOpen(false);
  };

  const openQuickTx = (memberId: string, type: TransactionType) => {
    setNewTx(prev => ({ ...prev, memberId, type }));
    setIsAddTransactionOpen(true);
  };

  const viewMember = (id: string) => {
    setSelectedMemberId(id);
    setActiveTab('memberDetail');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen relative px-6 pt-10">
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Dashboard 
              store={store} 
              onAddTransaction={() => setIsAddTransactionOpen(true)} 
              onViewMember={viewMember}
            />
          </motion.div>
        )}
        {activeTab === 'members' && (
          <motion.div key="members" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <MembersScreen 
              store={store} 
              onAddMember={() => setIsAddMemberOpen(true)} 
              onViewMember={viewMember}
              onQuickTransaction={openQuickTx}
            />
          </motion.div>
        )}
        {activeTab === 'transactions' && (
          <motion.div key="transactions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <TransactionsScreen store={store} onDelete={store.deleteTransaction} />
          </motion.div>
        )}
        {activeTab === 'memberDetail' && selectedMemberId && (
          <motion.div key="memberDetail" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <MemberDetail 
              memberId={selectedMemberId} 
              store={store} 
              onBack={() => setActiveTab('members')}
              onAddTransaction={(type) => openQuickTx(selectedMemberId, type)}
              onDeleteTransaction={store.deleteTransaction}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab !== 'memberDetail' && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Modals */}
      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title="Add New Person">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. John Doe"
              value={newMember.name}
              onChange={e => setNewMember(prev => ({ ...prev, name: e.target.value }))}
              className="input-glass w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Phone (Optional)</label>
            <input 
              type="tel" 
              placeholder="+1 234 567 890"
              value={newMember.phone}
              onChange={e => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
              className="input-glass w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Note</label>
            <textarea 
              placeholder="Add a small note..."
              value={newMember.note}
              onChange={e => setNewMember(prev => ({ ...prev, note: e.target.value }))}
              className="input-glass w-full min-h-[100px]"
            />
          </div>
          <button type="submit" className="btn-primary w-full py-4 mt-4">Save Person</button>
        </form>
      </Modal>

      <Modal isOpen={isAddTransactionOpen} onClose={() => setIsAddTransactionOpen(false)} title="New Transaction">
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Select Person</label>
            <select 
              required
              value={newTx.memberId}
              onChange={e => setNewTx(prev => ({ ...prev, memberId: e.target.value }))}
              className="input-glass w-full appearance-none"
            >
              <option value="" disabled className="bg-[#1a1a1c]">Choose someone...</option>
              {store.members.map(m => (
                <option key={m.id} value={m.id} className="bg-[#1a1a1c]">{m.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Amount</label>
              <input 
                type="number" 
                required
                placeholder="0.00"
                value={newTx.amount}
                onChange={e => setNewTx(prev => ({ ...prev, amount: e.target.value }))}
                className="input-glass w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Type</label>
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 h-[50px]">
                <button 
                  type="button"
                  onClick={() => setNewTx(prev => ({ ...prev, type: 'credit' }))}
                  className={`flex-1 rounded-xl text-[10px] font-bold uppercase transition-all ${newTx.type === 'credit' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/30'}`}
                >
                  Credit (+)
                </button>
                <button 
                  type="button"
                  onClick={() => setNewTx(prev => ({ ...prev, type: 'debit' }))}
                  className={`flex-1 rounded-xl text-[10px] font-bold uppercase transition-all ${newTx.type === 'debit' ? 'bg-rose-500 text-white shadow-lg' : 'text-white/30'}`}
                >
                  Debit (-)
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Description</label>
            <input 
              type="text" 
              placeholder="e.g. Lunch, Borrowed, etc."
              value={newTx.description}
              onChange={e => setNewTx(prev => ({ ...prev, description: e.target.value }))}
              className="input-glass w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">Date</label>
            <input 
              type="date" 
              value={newTx.date}
              onChange={e => setNewTx(prev => ({ ...prev, date: e.target.value }))}
              className="input-glass w-full"
            />
          </div>

          <button type="submit" className={`w-full py-4 mt-4 ${newTx.type === 'credit' ? 'btn-primary' : 'btn-danger'}`}>
            Confirm {newTx.type === 'credit' ? 'Credit' : 'Debit'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
