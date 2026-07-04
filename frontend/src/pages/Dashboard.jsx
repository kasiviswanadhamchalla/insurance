import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockDb } from '../services/mockDb';
import {
  AssignmentTurnedIn as DoneIcon,
  HourglassEmpty as PendingIcon,
  Warning as WarningIcon,
  AttachMoney as MoneyIcon,
  AddCircleOutlined as AddIcon,
  Assessment as ReportIcon,
  Dns as DnsIcon,
  FlashOn as SpeedIcon,
  Timeline as TrendIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Load fresh data
    const allClaims = mockDb.getClaims();
    const allTasks = mockDb.getTasks();
    const allLogs = mockDb.getAuditLogs();
    
    setClaims(allClaims);
    setTasks(allTasks);
    setLogs(allLogs);

    // Calculate generic stats
    if (user?.role === 'CUSTOMER') {
      const myClaims = allClaims.filter(c => c.customerId === user.id);
      setStats({
        total: myClaims.length,
        pending: myClaims.filter(c => ['SUBMITTED', 'PENDING_REVIEW', 'FLAGGED_FOR_REVIEW', 'PENDING_DOCUMENTATION'].includes(c.status)).length,
        approved: myClaims.filter(c => c.status === 'APPROVED').length,
        rejected: myClaims.filter(c => c.status === 'REJECTED').length,
      });
    } else if (user?.role === 'CLAIM_OFFICER') {
      setStats({
        queue: allTasks.filter(t => t.assignedRole === 'CLAIM_OFFICER' && !t.assignedUser).length,
        myClaims: allClaims.filter(c => c.history.some(h => h.updatedBy === user.name) && c.status === 'PENDING_REVIEW').length,
        resolved: allClaims.filter(c => c.history.some(h => h.updatedBy === user.name) && ['APPROVED', 'REJECTED'].includes(c.status)).length,
      });
    } else if (user?.role === 'CLAIM_MANAGER' || user?.role === 'FRAUD_DETECTION_MANAGER') {
      setStats({
        escalated: allClaims.filter(c => c.status === 'FLAGGED_FOR_REVIEW').length,
        highValue: allClaims.filter(c => c.claimAmount >= 5000).length,
        pendingAction: allTasks.filter(t => t.assignedRole === 'CLAIM_MANAGER' || t.assignedRole === 'FRAUD_DETECTION_MANAGER').length,
      });
    } else if (user?.role === 'AUDITOR') {
      setStats({
        totalLogs: allLogs.length,
        criticalActions: allLogs.filter(l => ['APPROVE_CLAIM', 'REJECT_CLAIM', 'MFA_FAILED'].includes(l.action)).length,
        userLogins: allLogs.filter(l => l.action === 'USER_LOGIN').length,
      });
    } else if (user?.role === 'SYSTEM_ADMIN') {
      const users = mockDb.getUsers();
      const settings = mockDb.getSettings();
      setStats({
        totalUsers: users.length,
        fraudThreshold: settings.fraudThreshold,
        highValueThreshold: settings.highValueThreshold,
        activeSessions: Math.floor(Math.random() * 5) + 3,
        systemHealth: '100% Operational'
      });
    }
  }, [user]);

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

  // Render Customer Dashboard
  const renderCustomerDashboard = () => {
    const myClaims = claims.filter(c => c.customerId === user.id);
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Header Widget */}
        <div className="p-6 bg-gradient-to-r from-teal-900/60 to-slate-900 border border-teal-800/40 rounded-3xl flex justify-between items-center shadow-xl">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Welcome to your Claims Portal</h2>
            <p className="text-slate-400 text-sm mt-1">Submit claims, upload receipts, and check processing in real time.</p>
          </div>
          <Link
            to="/claims/new"
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium px-5 py-3 rounded-2xl shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
          >
            <AddIcon /> Submit Claim
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-[#111827]/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Submitted Claims</span>
              <span className="text-lg font-bold text-slate-200 mt-1 block">{stats.total || 0}</span>
            </div>
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl"><DoneIcon /></div>
          </div>
          <div className="bg-[#111827]/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">In Review</span>
              <span className="text-lg font-bold text-slate-200 mt-1 block">{stats.pending || 0}</span>
            </div>
            <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl"><PendingIcon /></div>
          </div>
          <div className="bg-[#111827]/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Approved Claims</span>
              <span className="text-lg font-bold text-emerald-400 mt-1 block">{stats.approved || 0}</span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><DoneIcon /></div>
          </div>
          <div className="bg-[#111827]/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Rejected Claims</span>
              <span className="text-lg font-bold text-rose-400 mt-1 block">{stats.rejected || 0}</span>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl"><WarningIcon /></div>
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-semibold text-slate-200 text-lg">My Recent Claims</h3>
            <Link to="/claims/my" className="text-xs text-teal-400 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#111827]/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Claim ID</th>
                  <th className="px-6 py-4">Loss Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Loss Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {myClaims.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      No claims found. Click "Submit Claim" to create one.
                    </td>
                  </tr>
                ) : (
                  myClaims.slice(0, 5).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-all">
                      <td className="px-6 py-4 font-semibold text-teal-400">{c.id}</td>
                      <td className="px-6 py-4">{c.lossType}</td>
                      <td className="px-6 py-4 font-semibold text-slate-200">{c.claimAmount.toFixed(2)}</td>
                      <td className="px-6 py-4">{c.lossDate}</td>
                      <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/claims/${c.id}`}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-1.5 rounded-lg text-xs transition-all"
                        >
                          View & Upload
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

  // Render Processor Dashboard
  const renderProcessorDashboard = () => {
    const claimedClaims = claims.filter(c => c.history.some(h => h.updatedBy === user.name) && c.status === 'PENDING_REVIEW');
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#111827]/60 border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pending Queue Tasks</span>
              <span className="text-lg font-bold text-yellow-400 mt-1 block">{stats.queue || 0}</span>
            </div>
            <Link to="/processor/queue" className="bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-yellow-500/25 transition-all">
              Go to Queue
            </Link>
          </div>
          <div className="bg-[#111827]/60 border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">My Claimed Tasks</span>
              <span className="text-lg font-bold text-teal-400 mt-1 block">{stats.myClaims || 0}</span>
            </div>
            <Link to="/processor/assigned" className="bg-teal-500/10 text-teal-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-teal-500/25 transition-all">
              My Claims
            </Link>
          </div>
          <div className="bg-[#111827]/60 border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">My Resolved Claims</span>
              <span className="text-lg font-bold text-emerald-400 mt-1 block">{stats.resolved || 0}</span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><DoneIcon /></div>
          </div>
        </div>

        {/* Assigned Table */}
        <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800">
            <h3 className="font-semibold text-slate-200 text-lg">My Locked Working Claims</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#111827]/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Claim ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Loss Type</th>
                  <th className="px-6 py-4">Fraud Risk</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {claimedClaims.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      No active locked claims. Head to the "Pending Queue" to lock and review a task.
                    </td>
                  </tr>
                ) : (
                  claimedClaims.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-all">
                      <td className="px-6 py-4 font-semibold text-teal-400">{c.id}</td>
                      <td className="px-6 py-4">{c.customerName}</td>
                      <td className="px-6 py-4 font-semibold">{c.claimAmount.toFixed(2)}</td>
                      <td className="px-6 py-4">{c.lossType}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          c.fraudRiskScore >= 50 ? 'bg-orange-950 text-orange-400' : 'bg-teal-950 text-teal-400'
                        }`}>
                          Score: {c.fraudRiskScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            // Find corresponding task ID
                            const tasksList = mockDb.getTasks();
                            const task = tasksList.find(t => t.claimId === c.id);
                            if (task) navigate(`/processor/tasks/${task.id}`);
                          }}
                          className="bg-teal-600 hover:bg-teal-500 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition-all shadow-md"
                        >
                          Workstation Review
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

  // Render Manager Dashboard
  const renderManagerDashboard = () => {
    const escalatedClaimsList = claims.filter(c => c.status === 'FLAGGED_FOR_REVIEW');
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#111827]/60 border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Escalated Claims</span>
              <span className="text-lg font-bold text-orange-400 mt-1 block">{stats.escalated || 0}</span>
            </div>
            <Link to="/manager/escalated" className="bg-orange-500/10 text-orange-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-orange-500/25 transition-all">
              Inspect Queue
            </Link>
          </div>
          <div className="bg-[#111827]/60 border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">High-Value Claims (&gt;= 5000)</span>
              <span className="text-lg font-bold text-indigo-400 mt-1 block">{stats.highValue || 0}</span>
            </div>
            <Link to="/manager/high-value" className="bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-500/25 transition-all">
              Inspect List
            </Link>
          </div>
          <div className="bg-[#111827]/60 border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pending Tasks Queue</span>
              <span className="text-lg font-bold text-yellow-400 mt-1 block">{stats.pendingAction || 0}</span>
            </div>
            <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl"><PendingIcon /></div>
          </div>
        </div>

        {/* High Risk Table */}
        <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800">
            <h3 className="font-semibold text-slate-200 text-lg">High-Risk Escalations Alert</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#111827]/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Claim ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Fraud Score</th>
                  <th className="px-6 py-4">Triggered Flags</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {escalatedClaimsList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      No escalated claims awaiting review. Standard workflows clean.
                    </td>
                  </tr>
                ) : (
                  escalatedClaimsList.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-all border-l-2 border-orange-500">
                      <td className="px-6 py-4 font-semibold text-teal-400">{c.id}</td>
                      <td className="px-6 py-4">{c.customerName}</td>
                      <td className="px-6 py-4 font-semibold text-slate-200">{c.claimAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold text-orange-400">{c.fraudRiskScore}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {c.fraudFlags.join(', ') || 'NONE'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            const tasksList = mockDb.getTasks();
                            const task = tasksList.find(t => t.claimId === c.id);
                            if (task) navigate(`/processor/tasks/${task.id}`);
                          }}
                          className="bg-orange-600 hover:bg-orange-500 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition-all shadow-md"
                        >
                          Manager Review
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

  // Render Auditor Dashboard
  const renderCustomerAuditorDashboard = () => {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#111827]/60 border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total System Log Actions</span>
              <span className="text-lg font-bold text-teal-400 mt-1 block">{stats.totalLogs || 0}</span>
            </div>
            <Link to="/auditor/logs" className="bg-teal-500/10 text-teal-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-teal-500/25 transition-all">
              Inspect Audit Engine
            </Link>
          </div>
          <div className="bg-[#111827]/60 border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Decisive Actions Audited</span>
              <span className="text-lg font-bold text-indigo-400 mt-1 block">{stats.criticalActions || 0}</span>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl"><DoneIcon /></div>
          </div>
          <div className="bg-[#111827]/60 border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">MFA / Session Events</span>
              <span className="text-lg font-bold text-emerald-400 mt-1 block">{stats.userLogins || 0}</span>
            </div>
            <Link to="/auditor/reports" className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-500/25 transition-all">
              Export Compliance
            </Link>
          </div>
        </div>

        {/* Recent Audit Timeline */}
        <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="font-semibold text-slate-200 text-lg mb-5 border-b border-slate-800 pb-3">Compliance Auditing Logs Trail</h3>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {logs.slice(0, 10).map((l) => (
              <div key={l.id} className="flex gap-4 p-3 bg-slate-900/50 rounded-xl border border-slate-800/50 text-xs">
                <div className="w-40 shrink-0 text-slate-400 font-semibold">{new Date(l.timestamp).toLocaleString()}</div>
                <div className="w-32 shrink-0 font-mono text-teal-400">{l.action}</div>
                <div className="w-48 shrink-0 text-slate-300 font-medium truncate">{l.username} (ID: {l.userId})</div>
                <div className="flex-1 text-slate-400">{l.details}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render System Admin Dashboard
  const renderAdminDashboard = () => {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-[#111827]/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Registered Accounts</span>
              <span className="text-lg font-bold text-slate-200 mt-1 block">{stats.totalUsers || 0}</span>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl"><DnsIcon /></div>
          </div>
          <div className="bg-[#111827]/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Fraud Trigger Score</span>
              <span className="text-lg font-bold text-orange-400 mt-1 block">{stats.fraudThreshold || 0}</span>
            </div>
            <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl"><WarningIcon /></div>
          </div>
          <div className="bg-[#111827]/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">High Value Limit</span>
              <span className="text-lg font-bold text-teal-400 mt-1 block">${stats.highValueThreshold || 0}</span>
            </div>
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl"><MoneyIcon /></div>
          </div>
          <div className="bg-[#111827]/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Sessions</span>
              <span className="text-lg font-bold text-emerald-400 mt-1 block">{stats.activeSessions || 0}</span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><SpeedIcon /></div>
          </div>
        </div>

        {/* System Monitoring Console Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Configs */}
          <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-2xl shadow-xl">
            <h3 className="font-semibold text-slate-200 text-lg mb-4 flex items-center gap-2">
              <TrendIcon className="text-teal-400" /> Platform Workflow Configuration
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium text-slate-200 block">Strict Multi-Factor Authentication (MFA)</span>
                  <span className="text-xs text-slate-500 block">Requires all accounts to login using 6-digit OTP codes.</span>
                </div>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-xs px-2.5 py-0.5 rounded font-semibold uppercase">ACTIVE</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium text-slate-200 block">Automated Claim Approval Routing</span>
                  <span className="text-xs text-slate-500 block">Auto-resolves clear auto claims below $500 score rules.</span>
                </div>
                <span className="bg-yellow-950 text-yellow-400 border border-yellow-900 text-xs px-2.5 py-0.5 rounded font-semibold uppercase">PAUSED</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium text-slate-200 block">File Constraints Filter Engine</span>
                  <span className="text-xs text-slate-500 block">Allows uploads only for PDF/PNG formats up to 10MB limit.</span>
                </div>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-xs px-2.5 py-0.5 rounded font-semibold uppercase">ACTIVE</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Link to="/admin/settings" className="text-xs text-teal-400 hover:underline">Manage Settings Configuration &gt;</Link>
            </div>
          </div>

          {/* Infrastructure Metrics */}
          <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-slate-200 text-lg mb-4 flex items-center gap-2">
                <DnsIcon className="text-indigo-400" /> Platform Infrastructure Metrics
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Active Connection Pools (MySQL)</span>
                    <span className="font-semibold text-slate-200">12 / 50</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="w-[24%] h-full bg-teal-500"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Redis Cache Hit Rate</span>
                    <span className="font-semibold text-slate-200">94.8%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="w-[94.8%] h-full bg-indigo-500"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Logstash Ingestion Latency</span>
                    <span className="font-semibold text-slate-200">18 ms</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="w-[8%] h-full bg-emerald-500"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Link to="/admin/monitoring" className="text-xs text-teal-400 hover:underline">Inspect Health Metrics &gt;</Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getDashboardByRole = () => {
    switch (user?.role) {
      case 'CUSTOMER':
        return renderCustomerDashboard();
      case 'CLAIM_OFFICER':
        return renderProcessorDashboard();
      case 'CLAIM_MANAGER':
      case 'FRAUD_DETECTION_MANAGER':
        return renderManagerDashboard();
      case 'AUDITOR':
        return renderCustomerAuditorDashboard();
      case 'SYSTEM_ADMIN':
        return renderAdminDashboard();
      default:
        return <div className="text-center py-12">Session expired or missing role configuration.</div>;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-slate-100 uppercase tracking-tight">
          System Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor your workflow queues, details checklists, and regulatory compliance actions here.
        </p>
      </div>
      {getDashboardByRole()}
    </div>
  );
};

export default Dashboard;
