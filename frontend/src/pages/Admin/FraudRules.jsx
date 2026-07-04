import React, { useState, useEffect } from 'react';
import { mockDb } from '../../services/mockDb';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Gavel as RulesIcon } from '@mui/icons-material';

const FraudRules = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    setSettings(mockDb.getSettings());
  }, []);

  const handleSliderChange = (key, value) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: parseInt(value) });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!settings) return;

    try {
      mockDb.saveSettings(settings);
      mockDb.addAuditLog(user.id, user.username, null, 'UPDATE_FRAUD_SETTINGS', `Fraud rules parameters modified. Threshold: ${settings.fraudThreshold}. High-Value Cap: $${settings.highValueThreshold}.`);
      toast.success('Fraud rules parameters updated and loaded into Redis cache.');
    } catch (e) {
      toast.error('Failed to save settings.');
    }
  };

  if (!settings) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">Fraud Rules Config</h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure rule triggers and thresholds loaded by the automated checking engine.
        </p>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 text-teal-400 border-b border-slate-850 pb-3">
          <RulesIcon />
          <h2 className="text-lg font-semibold text-slate-200">Rules Engine Threshold Weights</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Slider 1 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-200">Fraud Flag Risk Score Threshold</span>
              <span className="font-bold text-teal-400">{settings.fraudThreshold}</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={settings.fraudThreshold}
              onChange={(e) => handleSliderChange('fraudThreshold', e.target.value)}
              className="w-full accent-teal-500 bg-slate-900 rounded-lg h-2"
            />
            <p className="text-xs text-slate-500 leading-normal">
              Claims scoring at or above this value will be marked as FLAGGED_FOR_REVIEW and automatically escalated to the Claim Manager queue.
            </p>
          </div>

          {/* Slider 2 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-200">High-Value Limit Cap ($)</span>
              <span className="font-bold text-teal-400">${settings.highValueThreshold}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="20000"
              step="500"
              value={settings.highValueThreshold}
              onChange={(e) => handleSliderChange('highValueThreshold', e.target.value)}
              className="w-full accent-teal-500 bg-slate-900 rounded-lg h-2"
            />
            <p className="text-xs text-slate-500 leading-normal">
              Any claim requesting payout amounts equal to or exceeding this threshold will trigger the HIGH_VALUE_THRESHOLD flag and route to manager queue.
            </p>
          </div>

          {/* File size constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-850">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Max Document File Size (MB)</label>
              <input
                type="number"
                value={settings.maxFileSizeMB}
                onChange={(e) => setSettings({ ...settings, maxFileSizeMB: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition-all text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Rule Engine Status</label>
              <div className="py-3 px-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Rules checking Active</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-850 flex justify-end">
            <button
              type="submit"
              className="bg-teal-650 hover:bg-teal-650/90 text-white font-semibold py-3 px-6 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all border border-teal-500/30"
            >
              Save Configuration Rules
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FraudRules;
