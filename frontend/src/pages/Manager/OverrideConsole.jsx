import React, { useState, useEffect } from 'react';
import { mockDb } from '../../services/mockDb';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { PublishedWithChanges as OverrideIcon, CheckCircle as SuccessIcon } from '@mui/icons-material';

const OverrideConsole = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [selectedClaimId, setSelectedClaimId] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [overrideComment, setOverrideComment] = useState('');

  const fetchFlaggedClaims = () => {
    const allClaims = mockDb.getClaims();
    const flagged = allClaims.filter(c => c.status === 'FLAGGED_FOR_REVIEW');
    setClaims(flagged);
    if (flagged.length > 0 && !selectedClaimId) {
      setSelectedClaimId(flagged[0].id);
      setSelectedClaim(flagged[0]);
    } else if (flagged.length === 0) {
      setSelectedClaimId('');
      setSelectedClaim(null);
    }
  };

  useEffect(() => {
    fetchFlaggedClaims();
  }, []);

  const handleSelectClaimChange = (e) => {
    const id = e.target.value;
    setSelectedClaimId(id);
    setSelectedClaim(claims.find(c => c.id === id));
  };

  const handleOverrideSubmit = (e) => {
    e.preventDefault();
    if (!selectedClaim) return;
    if (!overrideComment.trim()) {
      toast.warning('Please enter a rationale justifying this override.');
      return;
    }

    try {
      // Perform override in local database
      const allClaims = mockDb.getClaims();
      const claimIndex = allClaims.findIndex(c => c.id === selectedClaim.id);
      
      if (claimIndex > -1) {
        // Change status to PENDING_REVIEW (Standard review queue)
        allClaims[claimIndex].status = 'PENDING_REVIEW';
        allClaims[claimIndex].fraudRiskScore = 15; // reset risk
        allClaims[claimIndex].fraudFlags = []; // clear flags
        allClaims[claimIndex].history.push({
          status: 'PENDING_REVIEW',
          updatedAt: new Date().toISOString(),
          updatedBy: user.name,
          comment: `MANAGER OVERRIDE TRIGGERED. Rationale: ${overrideComment}`
        });

        mockDb.saveClaims(allClaims);

        // Update corresponding task if exists to standard role
        const tasks = mockDb.getTasks();
        const taskIndex = tasks.findIndex(t => t.claimId === selectedClaim.id);
        if (taskIndex > -1) {
          tasks[taskIndex].assignedRole = 'CLAIM_OFFICER';
          tasks[taskIndex].title = `Auto Collision Claim Review (${selectedClaim.id})`;
          tasks[taskIndex].description = `Post-override standard review. Requested Payout: ${selectedClaim.claimAmount}`;
          mockDb.saveTasks(tasks);
        }

        // Auditing
        mockDb.addAuditLog(user.id, user.username, selectedClaim.id, 'OVERRIDE_RULES', `Manager override applied. Flags cleared. Comment: ${overrideComment}`);
        
        toast.success(`Override successful! Claim ${selectedClaim.id} cleared and routed to general processor queue.`);
        
        // Reset state
        setOverrideComment('');
        setSelectedClaimId('');
        fetchFlaggedClaims();
      }
    } catch (error) {
      toast.error('Failed to perform rule override.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">Rules Override Console</h1>
        <p className="text-slate-400 text-sm mt-1">
          Authorized console to bypass automated risk evaluations.
        </p>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl">
        {claims.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No claims are currently flagged for review. Rules override console idle.
          </div>
        ) : (
          <form onSubmit={handleOverrideSubmit} className="space-y-6">
            <div className="flex items-center gap-3 text-teal-400 border-b border-slate-850 pb-3">
              <OverrideIcon />
              <h2 className="text-lg font-semibold text-slate-200 font-sans">Authorized Policy Bypasser</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Flagged Claim</label>
              <select
                value={selectedClaimId}
                onChange={handleSelectClaimChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl py-3.5 px-4 text-slate-200 focus:outline-none transition-all text-sm font-medium"
              >
                {claims.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.customerName} ({c.claimAmount.toFixed(2)}) - Risk: {c.fraudRiskScore}
                  </option>
                ))}
              </select>
            </div>

            {selectedClaim && (
              <div className="p-5 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Claim Risk Diagnostics</span>
                  <span className="bg-rose-950 text-rose-400 border border-rose-900 text-[10px] px-2 py-0.5 rounded font-mono font-semibold uppercase">FLAGGED</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Reported Fraud Score</span>
                    <span className="font-bold text-rose-400 text-lg">{selectedClaim.fraudRiskScore}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Triggered Risk Tags</span>
                    <span className="font-semibold text-slate-200">{selectedClaim.fraudFlags.join(', ') || 'NONE'}</span>
                  </div>
                </div>

                <div className="text-xs leading-relaxed text-slate-400">
                  <span className="font-semibold text-slate-350 block mb-1">Loss Description Summary</span>
                  {selectedClaim.description}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Override Rationale (Required)</label>
              <textarea
                value={overrideComment}
                onChange={(e) => setOverrideComment(e.target.value)}
                rows="4"
                className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl py-3 px-4 text-slate-200 text-xs focus:outline-none transition-all"
                placeholder="Explain the compliance justification authorizing the rules override..."
              ></textarea>
            </div>

            <div className="pt-4 border-t border-slate-850 flex justify-end">
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all duration-250 flex items-center gap-2"
              >
                <SuccessIcon fontSize="small" /> Apply Override & Re-route Claim
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OverrideConsole;
