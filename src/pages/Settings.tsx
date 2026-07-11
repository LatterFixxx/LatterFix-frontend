import React, { useState } from 'react';
import {
  Coins,
  Award,
  CheckCircle,
  Save
} from 'lucide-react';
import { useTaskStore } from '../services/taskStore';

export default function Settings() {
  const { currentUser, updateProfile } = useTaskStore();
  
  const [username, setUsername] = useState(currentUser.username);
  const [address, setAddress] = useState(currentUser.address);
  const [role, setRole] = useState(currentUser.role);
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(username, address, role);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 page-fade">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">On-Chain Reputation & Profile</h1>
        <p className="text-xs text-muted">Manage your identity and monitor your contributor credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Reputation */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card 1: Reputation Card */}
          <div className="card glass noise p-6 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-linear-to-tr from-accent to-accent2 mx-auto flex items-center justify-center font-black text-2xl text-bg">
              {currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{currentUser.username}</h3>
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded border border-white/5">
                {currentUser.role}
              </span>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-accent" /> Reputation
                </span>
                <span className="font-bold text-white">{currentUser.reputation} / 100</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-black/35 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-linear-to-r from-accent2 to-accent transition-all duration-500"
                  style={{ width: `${currentUser.reputation}%` }}
                />
              </div>
              <p className="text-[9px] text-muted leading-relaxed text-left">
                Reputation is earned by successfully completing projects (+2 pts). Raising unjustified disputes or failing deadlines will reduce your rating (-5 pts).
              </p>
            </div>
          </div>

          {/* Card 2: Earnings */}
          <div className="card glass noise p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted mb-1">Total Earnings</p>
              <h4 className="text-2xl font-black text-accent">{currentUser.earnings.toLocaleString()} <span className="text-xs font-normal text-muted">USDC</span></h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Coins className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card glass noise p-8 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">Identity Settings</h3>

            {saveSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-2 text-xs text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Profile settings saved successfully!</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted">
                  Public Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-accent/40"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted">
                  Stellar Wallet Address (G-Key)
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="G..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white font-mono focus:outline-none focus:border-accent/40"
                />
                <p className="text-[10px] text-muted">
                  The primary public address used for receiving escrow payouts and signing authorizations.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted">
                  Platform Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-accent/40"
                >
                  <option value="Contributor" className="bg-slate-900 text-white">Contributor (Work & Earn)</option>
                  <option value="Creator" className="bg-slate-900 text-white">Creator (Hire & Fund)</option>
                  <option value="Admin" className="bg-slate-900 text-white">Admin (Governance & Arbitration)</option>
                </select>
                <p className="text-[10px] text-muted">
                  Roles switch dashboard workflows instantly. You can also toggle roles from the navbar.
                </p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-accent text-bg font-extrabold rounded-xl hover:scale-102 transition-transform shadow-lg shadow-accent/20"
              >
                <Save className="w-4 h-4" /> Save Profile Details
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
