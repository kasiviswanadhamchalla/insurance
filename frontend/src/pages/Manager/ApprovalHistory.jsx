import React, { useState, useEffect } from 'react';
import { mockDb } from '../../services/mockDb';
import { History as HistoryIcon, TrendingUp as PerformanceIcon, CheckCircle as ApprovedIcon, Cancel as RejectedIcon } from '@mui/icons-material';

const ApprovalHistory = () => {
  const [resolvedClaims, setResolvedClaims] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPayout: 0,
    approvalRate: 0,
    approvedCount: 0,
    rejectedCount: 0
  });

  useEffect(() => {
    const fetchHistory = async () => {
      const allClaims = await mockDb.getClaims();
      const resolved = allClaims.filter(c => ['APPROVED', 'REJECTED'].includes(c.status));
      
      setResolvedClaims(resolved);

      // Calculate metrics
      const approved = resolved.filter(c => c.status === 'APPROVED');
      const totalPayout = approved.reduce((sum, c) => sum + (c.claimAmount || 0), 0);
      const approvedCount = approved.length;
      const rejectedCount = resolved.filter(c => c.status === 'REJECTED').length;
      const approvalRate = resolved.length > 0 ? Math.round((approvedCount / resolved.length) * 100) : 0;

      setMetrics({
        totalPayout,
        approvalRate,
        approvedCount,
        rejectedCount
      });
    };
    fetchHistory();
  }, []);

  const getResolverName = (claim) => {
    // Find the latest resolver in claim history
    if (claim.history && claim.history.length > 0) {
      const decisionLog = [...claim.history].reverse().find(h => ['APPROVED', 'REJECTED'].includes(h.status));
      return decisionLog ? decisionLog.updatedBy : 'System Engine';
    }
    return 'System Engine';
  };

  const getDecisionComment = (claim) => {
    if (claim.history && claim.history.length > 0) {
      const decisionLog = [...claim.history].reverse().find(h => ['APPROVED', 'REJECTED'].includes(h.status));
      return decisionLog ? decisionLog.comment : 'No details recorded.';
    }
    return 'No details recorded.';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-lg font-bold text-slate-100 uppercase tracking-tight">Approval History & Telemetry</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor historic resolutions, payout distributions, and compliance audit rationales.
        </p>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-[#111827]/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Approved Payouts</span>
            <span className="text-lg font-bold text-emerald-450 mt-1 block">{metrics.totalPayout.toFixed(2)}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><PerformanceIcon /></div>
        </div>

        <div className="bg-[#111827]/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Approval Ratio</span>
            <span className="text-lg font-bold text-teal-400 mt-1 block">{metrics.approvalRate}%</span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl"><ApprovedIcon /></div>
        </div>

        <div className="bg-[#111827]/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Approved Claims</span>
            <span className="text-lg font-bold text-slate-200 mt-1 block">{metrics.approvedCount}</span>
          </div>
          <div className="p-3 bg-slate-500/10 text-slate-450 rounded-xl"><ApprovedIcon /></div>
        </div>

        <div className="bg-[#111827]/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Rejected Claims</span>
            <span className="text-lg font-bold text-rose-400 mt-1 block">{metrics.rejectedCount}</span>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl"><RejectedIcon /></div>
        </div>
      </div>

      {/* History table */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <h3 className="font-semibold text-slate-200 text-sm mb-4 border-b border-slate-850 pb-3 flex items-center gap-2">
          <HistoryIcon className="text-teal-400" /> Resolution Log & Audit trail
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#111827]/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Claim ID</th>
                <th className="px-6 py-4">Claimant</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Resolved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {resolvedClaims.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No historically resolved claims found.
                  </td>
                </tr>
              ) : (
                resolvedClaims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-all">
                    <td className="px-6 py-4 font-semibold text-teal-400">{c.id}</td>
                    <td className="px-6 py-4">{c.customerName}</td>
                    <td className="px-6 py-4 font-semibold text-slate-200">{(c.claimAmount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        c.status === 'APPROVED'
                          ? 'bg-emerald-950 text-emerald-450 border-emerald-900'
                          : 'bg-rose-950 text-rose-455 border-rose-900'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-350">{getResolverName(c)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApprovalHistory;
