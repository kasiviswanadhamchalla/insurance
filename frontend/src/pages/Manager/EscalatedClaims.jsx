import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDb } from '../../services/mockDb';

const EscalatedClaims = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const fetchClaims = async () => {
      const allClaims = await mockDb.getClaims();
      setClaims(allClaims.filter(c => c.status === 'FLAGGED_FOR_REVIEW'));
    };
    fetchClaims();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">Escalated Claims Queue</h1>
        <p className="text-slate-400 text-sm mt-1">
          Resolve tasks suspended by the automated fraud rules engine.
        </p>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#111827]/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Claim ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Claim Amount</th>
                <th className="px-6 py-4">Fraud Risk Score</th>
                <th className="px-6 py-4">Suspended Flags</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {claims.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No flagged claims awaiting review.
                  </td>
                </tr>
              ) : (
                claims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-all border-l-2 border-orange-500">
                    <td className="px-6 py-4 font-semibold text-teal-400">{c.id}</td>
                    <td className="px-6 py-4">{c.customerName}</td>
                    <td className="px-6 py-4 font-semibold text-slate-200">{(c.claimAmount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-orange-400">{c.fraudRiskScore}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {c.fraudFlags.map((f, idx) => (
                          <span key={idx} className="bg-rose-950 text-rose-400 border border-rose-900 text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={async () => {
                          const tasksList = await mockDb.getTasks();
                          const task = tasksList.find(t => t.claimId === c.id);
                          if (task) navigate(`/processor/tasks/${task.id}`);
                        }}
                        className="bg-orange-600 hover:bg-orange-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition-all shadow-md"
                      >
                        Inspect Flag
                      </button>
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

export default EscalatedClaims;
