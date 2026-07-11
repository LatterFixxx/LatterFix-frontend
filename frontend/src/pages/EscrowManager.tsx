import { useState } from 'react';
import {
  ShieldAlert
} from 'lucide-react';
import { useTaskStore, Task } from '../services/taskStore';

export default function EscrowManager() {
  const { tasks, currentUser, completeTaskAndPayout, triggerDispute, resolveDispute } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [resolutionType, setResolutionType] = useState<'Creator' | 'Contributor' | 'Split'>('Split');
  const [customDisputeText, setCustomDisputeText] = useState('');

  // Active escrows are InEscrow, Assigned, or Disputed tasks
  const escrowTasks = tasks.filter((t) => ['InEscrow', 'Assigned', 'Disputed'].includes(t.status));

  const handleRelease = (taskId: string) => {
    completeTaskAndPayout(taskId);
    alert('Smart Contract Call: Payout released successfully (5s settlement on Stellar network)');
  };

  const handleDispute = (taskId: string) => {
    if (!customDisputeText.trim()) return;
    triggerDispute(taskId, customDisputeText);
    setCustomDisputeText('');
    alert('Dispute raised. Escrow locked under arbitration.');
  };

  const handleResolve = (taskId: string) => {
    resolveDispute(taskId, resolutionType);
    alert(`Arbitration resolved: Funds distributed via ${resolutionType} policy.`);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-8 page-fade">
      {/* Header */}
      <div className="border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Escrow & Dispute Manager</h1>
          <p className="text-xs text-muted">Manage locked rewards and resolve contract disputes securely.</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-mono bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-muted">
            Total TVL: {escrowTasks.reduce((sum, t) => sum + t.reward, 0).toLocaleString()} USDC/XLM
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Escrow List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card glass noise p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">Active Smart Contract Escrows</h3>

            <div className="divide-y divide-white/5">
              {escrowTasks.length > 0 ? (
                escrowTasks.map((task) => (
                  <div key={task.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            task.status === 'Disputed'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : task.status === 'Assigned'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}
                        >
                          {task.status === 'InEscrow' ? 'Funded' : task.status}
                        </span>
                        <span className="text-xs font-mono text-muted">#{task.id}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white hover:underline cursor-pointer" onClick={() => setSelectedTask(task)}>
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-muted font-mono truncate max-w-sm mt-1">
                        Creator: {task.creator.slice(0, 10)}... | Assignee: {task.assignee ? task.assignee.slice(0, 10) : 'None'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                      <div className="text-right">
                        <p className="text-sm font-black text-white">{task.reward} {task.token}</p>
                        <p className="text-[10px] text-muted">Locked in Escrow</p>
                      </div>
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted text-sm">
                  No active escrows currently locked in the smart contract.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Inspect / Actions Panel */}
        <div className="space-y-6">
          <div className="card glass noise p-6 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">Arbitration Inspector</h3>

            {selectedTask ? (
              <div className="space-y-5">
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted">Escrow ID:</span>
                    <span className="font-mono text-white">#{selectedTask.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Locked Reward:</span>
                    <span className="font-bold text-accent">{selectedTask.reward} {selectedTask.token}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Status:</span>
                    <span className="font-bold text-white">{selectedTask.status}</span>
                  </div>
                  {selectedTask.disputeReason && (
                    <div className="border-t border-white/5 pt-2 mt-2">
                      <span className="text-red-400 font-bold block mb-1">Dispute Reason:</span>
                      <p className="text-white/80 italic">"{selectedTask.disputeReason}"</p>
                    </div>
                  )}
                </div>

                {/* Contributor Action */}
                {currentUser.role === 'Contributor' && selectedTask.assignee === currentUser.address && selectedTask.status === 'Assigned' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted">As the assigned contributor, you can raise a dispute if the project requirements or creator terms change unfairly.</p>
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Reason for dispute..."
                        value={customDisputeText}
                        onChange={(e) => setCustomDisputeText(e.target.value)}
                        className="bg-black/20 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => handleDispute(selectedTask.id)}
                        className="w-full py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 rounded-xl font-bold transition text-xs"
                      >
                        Raise Dispute
                      </button>
                    </div>
                  </div>
                )}

                {/* Creator Action */}
                {currentUser.role === 'Creator' && selectedTask.creator === currentUser.address && selectedTask.status === 'Assigned' && (
                  <div className="space-y-4">
                    <p className="text-xs text-muted">You are the creator of this escrow. You can release the locked funds or file a dispute if deliverables do not match acceptance criteria.</p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleRelease(selectedTask.id)}
                        className="w-full py-2.5 bg-accent text-bg font-extrabold rounded-xl hover:scale-102 transition-transform text-xs"
                      >
                        Release Payout
                      </button>
                      <input
                        type="text"
                        placeholder="Reason for dispute..."
                        value={customDisputeText}
                        onChange={(e) => setCustomDisputeText(e.target.value)}
                        className="bg-black/20 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => handleDispute(selectedTask.id)}
                        className="w-full py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 rounded-xl font-bold transition text-xs"
                      >
                        File Dispute
                      </button>
                    </div>
                  </div>
                )}

                {/* Admin Action (Dispute Arbitration) */}
                {currentUser.role === 'Admin' && selectedTask.status === 'Disputed' && (
                  <div className="space-y-4 bg-purple-500/5 border border-purple-500/10 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> Resolve Arbitration
                    </h4>
                    <p className="text-[11px] text-muted">
                      Select how to distribute the locked escrow funds for #{selectedTask.id}.
                    </p>
                    <div className="flex flex-col gap-2">
                      <select
                        value={resolutionType}
                        onChange={(e) => setResolutionType(e.target.value as any)}
                        className="bg-black/25 border border-white/10 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="Contributor">Award 100% to Contributor (Payout)</option>
                        <option value="Creator">Award 100% to Creator (Refund)</option>
                        <option value="Split">Split 50% / 50% (Creator & Contributor)</option>
                      </select>
                      <button
                        onClick={() => handleResolve(selectedTask.id)}
                        className="w-full py-2.5 bg-purple-500 text-white font-extrabold rounded-xl hover:scale-102 transition-transform text-xs"
                      >
                        Execute Resolution
                      </button>
                    </div>
                  </div>
                )}

                {/* Fallback info */}
                {selectedTask.status === 'Completed' && (
                  <div className="text-center text-xs text-green-400 font-bold bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                    This escrow has been completed and fully settled.
                  </div>
                )}

                {selectedTask.status === 'InEscrow' && currentUser.role !== 'Creator' && (
                  <div className="text-center text-xs text-muted bg-white/5 p-4 rounded-xl">
                    Waiting for Creator to assign an applicant to start the contract.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-muted text-xs">
                Select an active escrow to inspect release options and arbitration controls.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
