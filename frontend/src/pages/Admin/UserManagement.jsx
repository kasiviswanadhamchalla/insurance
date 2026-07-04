import React, { useState, useEffect } from 'react';
import { mockDb } from '../../services/mockDb';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { People as UserIcon } from '@mui/icons-material';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);

  const loadUsers = () => {
    const list = mockDb.getUsers();
    setUsers(list);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApproveUser = (userId) => {
    try {
      const allUsers = mockDb.getUsers();
      const idx = allUsers.findIndex(u => u.id === userId);
      if (idx > -1) {
        allUsers[idx].approved = true;
        mockDb.saveUsers(allUsers);
        loadUsers();

        // Add audit trail entry
        mockDb.addAuditLog(
          currentUser.id,
          currentUser.username,
          null,
          'APPROVE_USER_REGISTRATION',
          `Approved registration for user: ${allUsers[idx].username} (ID: ${userId}) with role: ${allUsers[idx].role}`
        );

        toast.success(`Account for ${allUsers[idx].name} approved successfully.`);
      }
    } catch (e) {
      toast.error('Failed to approve user registration.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">User Management</h1>
        <p className="text-slate-400 text-sm mt-1">
          Admin console to review platform registered accounts and approve employee roles.
        </p>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="font-semibold text-slate-200 text-lg border-b border-slate-850 pb-3 flex items-center gap-2">
          <UserIcon className="text-teal-400" /> Platform Registered Accounts ({users.length})
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-350">
            <thead className="bg-[#111827]/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email / Login</th>
                <th className="px-6 py-4">System Role</th>
                <th className="px-6 py-4">Approval Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="px-6 py-4 font-semibold text-teal-400">USR-{u.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-200">{u.name}</td>
                  <td className="px-6 py-4">{u.username}</td>
                  <td className="px-6 py-4 text-xs font-semibold">
                    <span className="bg-slate-850 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {u.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className={`px-2 py-0.5 rounded border font-semibold ${
                      u.approved !== false
                        ? 'bg-emerald-950 text-emerald-450 border-emerald-900'
                        : 'bg-yellow-950 text-yellow-450 border-yellow-900'
                    }`}>
                      {u.approved !== false ? 'APPROVED' : 'PENDING APPROVAL'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.approved === false && (
                      <button
                        onClick={() => handleApproveUser(u.id)}
                        className="bg-teal-600 hover:bg-teal-500 text-white font-semibold py-1 px-3 rounded-lg text-xs transition-all shadow-md active:scale-95"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
