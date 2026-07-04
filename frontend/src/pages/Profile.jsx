import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AccountCircle as ProfileIcon } from '@mui/icons-material';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">Account settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review profile details and update verification parameters.
        </p>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Profile details */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-teal-400 border-b border-slate-855 pb-3">
            <ProfileIcon />
            <h2 className="text-lg font-semibold text-slate-200">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 block mb-0.5">Full Name</span>
              <span className="font-semibold text-slate-200">{user.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Role Authorization</span>
              <span className="font-semibold text-teal-400 uppercase text-xs tracking-wider">
                {user.role.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="md:col-span-2">
              <span className="text-slate-500 block mb-0.5">Email Identifier</span>
              <span className="font-semibold text-slate-200">{user.email}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
