import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useTaskStore } from '../services/taskStore';

export default function CreateTask() {
  const navigate = useNavigate();
  const { createTask, currentUser } = useTaskStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState<number>(100);
  const [token, setToken] = useState<'USDC' | 'XLM' | 'EURC'>('USDC');
  const [deadline, setDeadline] = useState('2026-08-01');
  const [tagsInput, setTagsInput] = useState('');
  const [reputationRequired, setReputationRequired] = useState(50);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Acceptance Criteria validations
    if (title.length < 5 || title.length > 100) {
      setError('Title must be between 5 and 100 characters.');
      return;
    }
    if (description.length > 5000) {
      setError('Description cannot exceed 5000 characters.');
      return;
    }
    if (description.length === 0) {
      setError('Description is required.');
      return;
    }
    if (reward <= 0) {
      setError('Reward must be a positive amount.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    createTask(title, description, reward, token, deadline, tags, reputationRequired);
    setSuccess(true);

    // Reset Form
    setTitle('');
    setDescription('');
    setReward(100);
    setToken('USDC');
    setDeadline('2026-08-01');
    setTagsInput('');
    setReputationRequired(50);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 page-fade">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Create & Fund Task</h1>
        <p className="text-xs text-muted">Initialize a smart contract escrow. Lock reward tokens on-chain for verification.</p>
      </div>

      {currentUser.role !== 'Creator' && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 text-xs text-yellow-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">Creator Role Required</p>
            <p className="mt-1">
              You are currently viewing this page as a <strong>{currentUser.role}</strong>. Only <strong>Creators</strong> can publish and fund new tasks. Use the role switcher in the navbar to change your role to Creator to test this form.
            </p>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center justify-between gap-3 text-xs text-green-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>
              <strong>Success!</strong> Task created. Find it in the <strong>Task Explorer</strong> to fund it and review applicants.
            </span>
          </div>
          <button
            onClick={() => navigate('/tasks')}
            className="px-3.5 py-1.5 bg-green-500 text-bg font-extrabold rounded-lg hover:scale-105 transition-transform"
          >
            Go to Explorer
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card glass noise p-8 space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-muted">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={currentUser.role !== 'Creator'}
            placeholder="e.g. Audit Soroban Escrow Contract"
            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-accent/40 disabled:opacity-55"
          />
          <p className="text-[10px] text-muted">Keep it descriptive, between 5 and 100 characters.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-muted">
            Task Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={currentUser.role !== 'Creator'}
            placeholder="Outline requirements, expected deliverables, and verification procedures..."
            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-accent/40 disabled:opacity-55"
          />
          <p className="text-[10px] text-muted">Describe acceptance criteria clearly. Maximum 5000 characters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-muted">
              Reward Amount <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                required
                min={1}
                value={reward}
                onChange={(e) => setReward(Number(e.target.value))}
                disabled={currentUser.role !== 'Creator'}
                className="flex-1 bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-accent/40 disabled:opacity-55"
              />
              <select
                value={token}
                onChange={(e) => setToken(e.target.value as any)}
                disabled={currentUser.role !== 'Creator'}
                className="bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-accent/40 disabled:opacity-55"
              >
                <option value="USDC">USDC</option>
                <option value="XLM">XLM</option>
                <option value="EURC">EURC</option>
              </select>
            </div>
            <p className="text-[10px] text-muted">Tokens will be locked in the contract escrow account.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-muted">
              Minimum Reputation Required <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={reputationRequired}
                onChange={(e) => setReputationRequired(Number(e.target.value))}
                disabled={currentUser.role !== 'Creator'}
                className="flex-1 accent-accent disabled:opacity-55"
              />
              <span className="text-sm font-mono font-bold bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white">
                {reputationRequired}+
              </span>
            </div>
            <p className="text-[10px] text-muted">Filter applicants based on their on-chain task history.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-muted">
              Completion Deadline
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={currentUser.role !== 'Creator'}
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-accent/40 disabled:opacity-55"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-muted">
              Skill Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              disabled={currentUser.role !== 'Creator'}
              placeholder="e.g. Rust, Smart Contract, Audit"
              className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-accent/40 disabled:opacity-55"
            />
            <p className="text-[10px] text-muted">Helps contributors filter work that matches their skillset.</p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex justify-between items-center">
          <span className="text-[10px] font-mono text-muted">
            ⚡ Powered by Stellar Soroban
          </span>
          <button
            type="submit"
            disabled={currentUser.role !== 'Creator'}
            className="flex items-center gap-2 px-8 py-4 bg-accent text-bg font-extrabold rounded-2xl hover:scale-102 transition-transform shadow-lg shadow-accent/20 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" /> Create Open Task
          </button>
        </div>
      </form>
    </div>
  );
}
