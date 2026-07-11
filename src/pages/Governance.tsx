import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Play,
  Pause,
  Save,
  Database
} from 'lucide-react';
import { useTaskStore } from '../services/taskStore';

export default function Governance() {
  const { governance, setPlatformFee, togglePause, currentUser, resetAll } = useTaskStore();
  const [feeBps, setFeeBps] = useState(governance.platformFeeBps);
  const [adminAddress, setAdminAddress] = useState(governance.adminAddress);
  const [tokens, setTokens] = useState<('USDC' | 'XLM' | 'EURC')[]>(governance.whitelistedTokens);
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== 'Admin') {
      alert('Access Denied: Only platform administrators can save changes.');
      return;
    }
    setPlatformFee(feeBps);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTogglePause = () => {
    if (currentUser.role !== 'Admin') {
      alert('Access Denied: Only platform administrators can toggle paused state.');
      return;
    }
    togglePause();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all mock tasks and payment history? This will reload the default showcase tasks.')) {
      resetAll();
      setFeeBps(250);
      setAdminAddress('G-CREATOR-Admin-111');
      alert('Demo database reset to default state.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 page-fade">
      {/* Header */}
      <div className="border-b border-white/5 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Platform Governance</h1>
          <p className="text-xs text-muted">Configure Stellar smart contract parameters and fee basis points.</p>
        </div>
        <span className="text-xs font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Admin View
        </span>
      </div>

      {currentUser.role !== 'Admin' && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 text-xs text-yellow-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">Administrator Privileges Required</p>
            <p className="mt-1">
              You are currently viewing this page as a <strong>{currentUser.role}</strong>. Saving settings and toggling paused states requires the <strong>Admin</strong> role. Please use the role switcher in the navbar to change your role to Admin to interact with this page fully.
            </p>
          </div>
        </div>
      )}

      {/* Contract initialization state card */}
      <div className="card glass noise p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-l-4 border-l-accent">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
            <Database className="w-4 h-4 text-accent" />
            Contract Address: <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded text-muted">G-CONTRACT-ESCROW-000</span>
          </h3>
          <p className="text-xs text-muted">
            The platform is initialized and running. Platform Fee: {governance.platformFeeBps / 100}% | Emergency Paused: {governance.paused ? 'YES' : 'NO'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTogglePause}
            disabled={currentUser.role !== 'Admin'}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
              governance.paused
                ? 'bg-green-500 text-bg hover:bg-green-600'
                : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
            } disabled:opacity-50`}
          >
            {governance.paused ? (
              <>
                <Play className="w-4 h-4" /> Unpause Contract
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" /> Emergency Pause
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="card glass noise p-8 space-y-6">
        <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">Smart Contract Parameters</h3>

        {saveSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-2 text-xs text-green-400">
            <Shield className="w-4 h-4" />
            <span>Settings saved successfully! Platform fee updated.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-muted">
              Platform Fee (Basis Points)
            </label>
            <input
              type="number"
              value={feeBps}
              onChange={(e) => setFeeBps(Number(e.target.value))}
              disabled={currentUser.role !== 'Admin'}
              className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-accent/40 disabled:opacity-50"
            />
            <p className="text-[10px] text-muted">
              100 basis points = 1.00%. Current: {(feeBps / 100).toFixed(2)}%. Max fee: 1000 bps (10.00%).
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-muted">
              Contract Admin Address
            </label>
            <input
              type="text"
              value={adminAddress}
              onChange={(e) => setAdminAddress(e.target.value)}
              disabled={currentUser.role !== 'Admin'}
              className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white font-mono focus:outline-none focus:border-accent/40 disabled:opacity-50"
            />
            <p className="text-[10px] text-muted">
              The public key holding authorization for emergency halts and parameter changes.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-muted">
            Whitelisted Stellar Tokens
          </label>
          <div className="flex gap-4">
            {['USDC', 'XLM', 'EURC'].map((token) => {
              const isChecked = tokens.includes(token as any);
              return (
                <label key={token} className="flex items-center gap-2 text-sm text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={currentUser.role !== 'Admin'}
                    onChange={() => {
                      if (isChecked) {
                        setTokens(tokens.filter((t) => t !== token));
                      } else {
                        setTokens([...tokens, token as any]);
                      }
                    }}
                    className="rounded border-white/10 bg-black/20 accent-accent"
                  />
                  {token}
                </label>
              );
            })}
          </div>
          <p className="text-[10px] text-muted">
            Whitelisted tokens will be available for escrow rewards and task creation.
          </p>
        </div>

        <div className="border-t border-white/5 pt-6 flex justify-between items-center">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 rounded-xl text-xs font-bold transition"
          >
            Reset Demo Database
          </button>
          <button
            type="submit"
            disabled={currentUser.role !== 'Admin'}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-bg font-extrabold rounded-xl hover:scale-102 transition-transform shadow-lg shadow-accent/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save Governance Parameters
          </button>
        </div>
      </form>
    </div>
  );
}
