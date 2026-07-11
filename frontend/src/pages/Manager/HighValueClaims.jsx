import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDb } from '../../services/mockDb';

const HighValueClaims = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const fetchClaims = async () => {
      const allClaims = await mockDb.getClaims();
      const settings = mockDb.getSettings();
      setClaims(allClaims.filter(c => c.claimAmount >= settings.highValueThreshold));
    };
    fetchClaims();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">High-Value Claims Registry</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review all claims exceeding the high-value ceiling threshold (5,000+).
        </p>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#111827]/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Claim ID</th>
                <th className="px-6 py-4">Claimant</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Loss Category</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {claims.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No high-value claims currently registered.
                  </td>
                </tr>
              ) : (
                claims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-all border-l-2 border-indigo-500">
                    <td className="px-6 py-4 font-semibold text-teal-400">{c.id}</td>
                    <td className="px-6 py-4">{c.customerName}</td>
                    <td className="px-6 py-4 font-bold text-slate-200">{(c.claimAmount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">{c.lossType}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        c.fraudRiskScore >= 50 ? 'bg-rose-950 text-rose-400' : 'bg-teal-950 text-teal-400'
                      }`}>
                        Score: {c.fraudRiskScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs uppercase tracking-wider font-semibold text-slate-355">{c.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={async () => {
                          const tasksList = await mockDb.getTasks();
                          const task = tasksList.find(t => t.claimId === c.id);
                          if (task) {
                            navigate(`/processor/tasks/${task.id}`);
                          } else {
                            // If no task exists, navigate to overview
                            navigate(`/claims/${c.id}`);
                          }
                        }}
                        className="bg-teal-600 hover:bg-teal-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition-all shadow-md"
                      >
                        Inspect Task
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

export default HighValueClaims;
