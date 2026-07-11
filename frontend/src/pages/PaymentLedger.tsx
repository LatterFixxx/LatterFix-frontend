import { useState } from 'react';
import {
  History,
  Search,
  Filter,
  ExternalLink
} from 'lucide-react';
import { useTaskStore } from '../services/taskStore';

export default function PaymentHistory() {
  const { payments } = useTaskStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Funding' | 'Payout' | 'Fee'>('All');

  // Filter payments
  const filteredPayments = payments.filter((pay) => {
    const matchesSearch = pay.taskTitle.toLowerCase().includes(search.toLowerCase()) || 
                          pay.txHash.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || pay.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 page-fade">
      {/* Header */}
      <div className="border-b border-white/5 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Payment Ledger</h1>
          <p className="text-xs text-muted">Immutable transaction history recorded on the Stellar ledger.</p>
        </div>
        <span className="text-xs font-mono bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-muted flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-accent" />
          Transactions logged: {payments.length}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by task title or tx hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/25 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-muted mr-1 hidden sm:block" />
          {(['All', 'Funding', 'Payout', 'Fee'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                typeFilter === type
                  ? 'bg-accent text-bg font-black'
                  : 'bg-white/5 text-muted hover:text-white hover:bg-white/10'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card glass noise p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2 text-[10px] uppercase tracking-wider font-mono text-muted">
                <th className="p-4 sm:p-5">Task Agreement / Details</th>
                <th className="p-4 sm:p-5">Type</th>
                <th className="p-4 sm:p-5">Amount</th>
                <th className="p-4 sm:p-5">Timestamp</th>
                <th className="p-4 sm:p-5">Stellar Addresses</th>
                <th className="p-4 sm:p-5 text-right">Transaction Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-white/95">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-white/2 transition">
                  <td className="p-4 sm:p-5 max-w-xs sm:max-w-sm">
                    <p className="font-bold truncate">{pay.taskTitle}</p>
                    <p className="text-[10px] text-muted font-mono mt-0.5">Ref: {pay.taskId}</p>
                  </td>
                  <td className="p-4 sm:p-5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        pay.type === 'Payout'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : pay.type === 'Funding'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {pay.type}
                    </span>
                  </td>
                  <td className="p-4 sm:p-5 font-black text-sm">
                    {pay.type === 'Fee' ? '+' : ''}
                    {pay.amount.toLocaleString()} <span className="text-[10px] font-normal text-muted">{pay.token}</span>
                  </td>
                  <td className="p-4 sm:p-5 text-muted font-mono whitespace-nowrap">
                    {pay.timestamp}
                  </td>
                  <td className="p-4 sm:p-5 font-mono text-[10px] text-muted max-w-[150px]">
                    <div className="truncate">From: {pay.sender}</div>
                    <div className="truncate mt-0.5">To: {pay.recipient}</div>
                  </td>
                  <td className="p-4 sm:p-5 text-right">
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${pay.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-accent hover:underline bg-accent/5 px-2 py-1 rounded border border-accent/15"
                    >
                      {pay.txHash.slice(0, 6)}...{pay.txHash.slice(-4)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted">
                    No transactions recorded on this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
