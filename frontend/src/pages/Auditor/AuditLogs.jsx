import React, { useState, useEffect } from 'react';
import { mockDb } from '../../services/mockDb';
import { Search as SearchIcon, RotateLeft as ResetIcon, FileDownload as ExportIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchClaimId, setSearchClaimId] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const loadLogs = async () => {
    const allLogs = await mockDb.getAuditLogs();
    setLogs(allLogs);
    setFilteredLogs(allLogs);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    let temp = [...logs];
    
    if (searchClaimId.trim()) {
      temp = temp.filter(l => l.claimId && l.claimId.toLowerCase().includes(searchClaimId.toLowerCase().trim()));
    }
    
    if (searchUsername.trim()) {
      temp = temp.filter(l => l.username.toLowerCase().includes(searchUsername.toLowerCase().trim()));
    }

    if (filterAction !== 'ALL') {
      temp = temp.filter(l => l.action === filterAction);
    }

    setFilteredLogs(temp);
  };

  const handleReset = () => {
    setSearchClaimId('');
    setSearchUsername('');
    setFilterAction('ALL');
    setFilteredLogs(logs);
  };

  const handleExport = () => {
    toast.success('[Audit Export] XML/CSV compliance report compiled and downloading...');
  };

  const uniqueActions = ['ALL', ...new Set(logs.map(l => l.action))];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">System Audit logs</h1>
          <p className="text-slate-400 text-sm mt-1">
            Search, filter, and inspect immutable system compliance records.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750 font-semibold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2"
        >
          <ExportIcon fontSize="small" /> Export Logs CSV
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0f172a]/70 border border-slate-800 rounded-3xl p-5 shadow-2xl">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Claim ID</label>
            <input
              type="text"
              value={searchClaimId}
              onChange={(e) => setSearchClaimId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl py-2 px-4 text-slate-200 text-xs focus:outline-none transition-all"
              placeholder="CLM-1001"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">User Email</label>
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl py-2 px-4 text-slate-200 text-xs focus:outline-none transition-all"
              placeholder="customer@insurance.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Action Type</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl py-2 px-4 text-slate-200 text-xs focus:outline-none transition-all uppercase"
            >
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="w-1/2 bg-teal-650 hover:bg-teal-650/90 text-white font-semibold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-teal-500/30"
            >
              <SearchIcon fontSize="small" /> Search
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-750"
            >
              <ResetIcon fontSize="small" /> Reset
            </button>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0f172a]/70 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-350">
            <thead className="bg-[#111827]/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-855">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Operator Email (ID)</th>
                <th className="px-6 py-4">Associated Claim</th>
                <th className="px-6 py-4">Description Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No logs found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-850/30 transition-all">
                    <td className="px-6 py-4 font-medium text-slate-450">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono font-bold text-teal-400">{l.action}</td>
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      {l.username} <span className="text-[10px] text-slate-500 font-normal">(ID: {l.userId})</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-300">
                      {l.claimId || 'SYSTEM'}
                    </td>
                    <td className="px-6 py-4 text-slate-400 leading-relaxed">{l.details}</td>
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

export default AuditLogs;
