import React from 'react';
import { Link } from 'react-router-dom';
import { Warning as ShieldAlertIcon } from '@mui/icons-material';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1d] px-4 text-center">
      <div className="p-4 bg-rose-500/10 text-rose-455 border border-rose-900 rounded-3xl mb-6 shadow-xl shadow-rose-500/10">
        <ShieldAlertIcon className="text-5xl" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">Access Restricted</h1>
      <p className="text-slate-400 text-sm mt-2 max-w-md leading-relaxed">
        Your current account privilege tier is unauthorized to view this portal folder. Please coordinate with the system administrator.
      </p>
      <Link
        to="/dashboard"
        className="mt-8 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
