import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockDb } from '../../services/mockDb';

const MyClaims = () => {
  const { user } = useAuth();
  const [myClaims, setMyClaims] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const fetchClaims = async () => {
      if (user) {
        const claims = await mockDb.getClaims();
        setMyClaims(claims.filter(c => c.customerId === user.email || c.customerId === user.username));
      }
    };
    fetchClaims();
  }, [user]);

  const filteredClaims = filterStatus === 'ALL'
    ? myClaims
    : myClaims.filter(c => c.status === filterStatus);

  const getStatusBadge = (status) => {
    const styles = {
      DRAFT: 'bg-blue-950 text-blue-400 border border-blue-900',
      SUBMITTED: 'bg-indigo-950 text-indigo-400 border border-indigo-900',
      PENDING_REVIEW: 'bg-yellow-950 text-yellow-400 border border-yellow-900',
      FLAGGED_FOR_REVIEW: 'bg-orange-950 text-orange-400 border border-orange-900',
      PENDING_DOCUMENTATION: 'bg-pink-950 text-pink-400 border border-pink-900',
      APPROVED: 'bg-emerald-950 text-emerald-400 border border-emerald-900',
      REJECTED: 'bg-rose-950 text-rose-400 border border-rose-900',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${styles[status] || 'bg-slate-800'}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">My Claims History</h1>
          <p className="text-slate-400 text-sm mt-1">Review active, resolved, or pending claims.</p>
        </div>
        <Link
          to="/claims/new"
          className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium px-4 py-2.5 rounded-xl text-xs transition-all shadow-md"
        >
          Submit New Claim
        </Link>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Status Filters */}
        <div className="flex gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
          {['ALL', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'FLAGGED_FOR_REVIEW', 'PENDING_DOCUMENTATION'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 uppercase tracking-wider border ${
                filterStatus === status
                  ? 'bg-teal-600/90 text-white border-teal-500'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Claims List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#111827]/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Claim ID</th>
                <th className="px-6 py-4">Loss Type</th>
                <th className="px-6 py-4">Claim Amount</th>
                <th className="px-6 py-4">Date Submitted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No claims match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-all">
                    <td className="px-6 py-4 font-semibold text-teal-400">{c.id}</td>
                    <td className="px-6 py-4">{c.lossType}</td>
                    <td className="px-6 py-4 font-semibold text-slate-200">{(c.claimAmount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">{new Date(c.submittedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/claims/${c.id}`}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs transition-all border border-slate-750"
                      >
                        Inspect Details
                      </Link>
                    </td>
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

export default MyClaims;
