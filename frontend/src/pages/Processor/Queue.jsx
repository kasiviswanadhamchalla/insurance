import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockDb } from '../../services/mockDb';
import { toast } from 'react-toastify';

const Queue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  const fetchQueueTasks = () => {
    const allTasks = mockDb.getTasks();
    // Filter tasks intended for processors that are currently unclaimed
    setTasks(allTasks.filter(t => t.assignedRole === 'CLAIM_OFFICER' && !t.assignedUser));
  };

  useEffect(() => {
    fetchQueueTasks();
  }, []);

  const handleClaimTask = (taskId) => {
    try {
      mockDb.claimTask(taskId, user);
      toast.success('Task successfully claimed! Loading workstation...');
      navigate(`/processor/tasks/${taskId}`);
    } catch (error) {
      toast.error(error.message || 'Failed to claim task. It may have been locked by another processor.');
      fetchQueueTasks(); // refresh
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">Pending Tasks Queue</h1>
        <p className="text-slate-400 text-sm mt-1">
          Lock and inspect claims in the standard queue.
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
                <th className="px-6 py-4">Created Time</th>
                <th className="px-6 py-4">Required Role</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No pending tasks in standard queue. Excellent work!
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
                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="bg-yellow-950 text-yellow-400 border border-yellow-900 text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                        CLAIM OFFICER
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleClaimTask(t.id)}
                        className="bg-teal-600 hover:bg-teal-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition-all shadow-md active:scale-95"
                      >
                        Claim Task
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

export default Queue;
