import React, { useState, useEffect } from 'react';
import { mockDb } from '../../services/mockDb';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Settings as SettingsIcon } from '@mui/icons-material';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    setSettings(mockDb.getSettings());
  }, []);

  const handleToggle = async (key) => {
    if (!settings) return;
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    mockDb.saveSettings(updated);
    await mockDb.addAuditLog(user.id, user.username, null, 'TOGGLE_SYSTEM_SETTING', `System setting ${key} set to ${!settings[key]}.`);
    toast.success(`System preference updated.`);
  };

  if (!settings) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">System Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Adjust global variables and policy switches.
        </p>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 text-teal-400 border-b border-slate-855 pb-3">
          <SettingsIcon />
          <h2 className="text-lg font-semibold text-slate-200">Global Settings Panel</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex justify-between items-center text-sm">
            <div>
              <span className="font-semibold text-slate-200 block">Enforce 2-Factor Authentication (MFA)</span>
              <span className="text-xs text-slate-500 block mt-0.5">Force all logging users to verify identity with OTP.</span>
            </div>
            <button
              onClick={() => handleToggle('mfaRequired')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                settings.mfaRequired
                  ? 'bg-emerald-950 text-emerald-450 border-emerald-900'
                  : 'bg-rose-950 text-rose-455 border-rose-900'
              }`}
            >
              {settings.mfaRequired ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex justify-between items-center text-sm">
            <div>
              <span className="font-semibold text-slate-200 block">Automated Claims Ingestion Processing</span>
              <span className="text-xs text-slate-500 block mt-0.5">Let rule-engine auto-approve low-value clear collision reports.</span>
            </div>
            <button
              onClick={() => handleToggle('autoApprovalEnabled')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                settings.autoApprovalEnabled
                  ? 'bg-emerald-950 text-emerald-450 border-emerald-900'
                  : 'bg-rose-950 text-rose-450 border-rose-900'
              }`}
            >
              {settings.autoApprovalEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
