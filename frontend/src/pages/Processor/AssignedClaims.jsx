import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockDb } from '../../services/mockDb';

const AssignedClaims = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (user) {
      const allTasks = mockDb.getTasks();
      // Filter tasks assigned/claimed by the current logged-in processor user
      setTasks(allTasks.filter(t => t.assignedUser === user.name && ['PENDING', 'IN_PROGRESS', 'PENDING_DOCS'].includes(t.status)));
    }
  }, [user]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">My Active Claims Workspace</h1>
        <p className="text-slate-400 text-sm mt-1">
          Select a locked claim to resume review operations.
        </p>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#111827]/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Task ID</th>
                <th className="px-6 py-4">Claim ID</th>
                <th className="px-6 py-4">Task Subject</th>
                <th className="px-6 py-4">Locked Time</th>
                <th className="px-6 py-4">Work Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No active tasks currently claimed. Visit the standard queue to lock a claim.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-all">
                    <td className="px-6 py-4 font-semibold text-teal-400">{t.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-350">{t.claimId}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-200 block">{t.title}</span>
                      <span className="text-xs text-slate-400 mt-0.5 block truncate max-w-xs">{t.description}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        t.status === 'PENDING_DOCS'
                          ? 'bg-pink-950 text-pink-400 border border-pink-900'
                          : 'bg-teal-950 text-teal-400 border border-teal-900'
                      }`}>
                        {t.status === 'PENDING_DOCS' ? 'Awaiting Docs' : 'In Review'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/processor/tasks/${t.id}`)}
                        className="bg-teal-600 hover:bg-teal-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition-all shadow-md"
                      >
                        Open Workstation
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

export default AssignedClaims;
