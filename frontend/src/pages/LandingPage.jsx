import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowForward as ArrowRightIcon,
  Security as SecurityIcon,
  VerifiedUser as PolicyIcon,
  HistoryToggleOff as AuditIcon,
  CloudUpload as UploadIcon,
  ArrowForwardIos as ChevronIcon
} from '@mui/icons-material';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070B14] py-12 px-6 lg:px-12 flex flex-col items-center justify-center relative overflow-hidden animate-fadeIn">
      {/* Decorative glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Header */}
      <div className="max-w-4xl text-center z-10 space-y-6">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 px-4 py-1.5 rounded-full text-xs text-teal-400 font-semibold tracking-wider uppercase shadow-lg shadow-teal-500/5">
          <SecurityIcon fontSize="inherit" /> ClaimFlow Enterprise Suite • v2.0
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-100 tracking-tight leading-tight m-0">
          ClaimFlow <br />
          <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
            Operations Portal
          </span>
        </h1>
        
        <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          An enterprise-grade, event-driven digital platform. Automate policy checking, fraud rules evaluation, and task routing inside secure role-based queues with full regulatory audit compliance.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {user ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-3.5 px-8 rounded-xl text-sm transition-all shadow-lg shadow-teal-500/20 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Enter System Dashboard <ArrowRightIcon fontSize="small" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-3.5 px-8 rounded-xl text-sm transition-all shadow-lg shadow-teal-500/20 hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                Access Claims Portal <ArrowRightIcon fontSize="small" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 text-slate-300 font-semibold py-3.5 px-8 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                Register Account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
