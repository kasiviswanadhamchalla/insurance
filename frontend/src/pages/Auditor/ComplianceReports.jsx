import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Assessment as ReportIcon, PictureAsPdf as PdfIcon, GridOn as ExcelIcon } from '@mui/icons-material';

const ComplianceReports = () => {
  const [reportConfig, setReportConfig] = useState({
    quarter: 'Q2',
    year: '2026',
    format: 'PDF',
    reportType: 'FRAUD_SUMMARY'
  });
  const [compiling, setCompiling] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    setCompiling(true);
    setTimeout(() => {
      setCompiling(false);
      toast.success(`[Audit Reports] Compliance report (${reportConfig.reportType}_${reportConfig.quarter}_${reportConfig.year}.${reportConfig.format.toLowerCase()}) successfully generated & archived in Audit logs.`);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">Compliance Reporting</h1>
        <p className="text-slate-400 text-sm mt-1">
          Compile and export official regulatory insurance reports.
        </p>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 text-teal-400 border-b border-slate-850 pb-3">
          <ReportIcon />
          <h2 className="text-lg font-semibold text-slate-200">Regulatory Export Manager</h2>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Report Profile</label>
              <select
                value={reportConfig.reportType}
                onChange={(e) => setReportConfig({ ...reportConfig, reportType: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition-all text-sm"
              >
                <option value="FRAUD_SUMMARY">Fraud Flags & Risk Summaries</option>
                <option value="PAYOUT_LOGS">Claim Payout & Approval Timelines</option>
                <option value="HIPAA_COMPLIANCE">Data HIPAA Compliance Audit</option>
                <option value="MFA_SESSION_HEALTH">User Security & Session Logs</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReportConfig({ ...reportConfig, format: 'PDF' })}
                  className={`py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border transition-all uppercase tracking-wider ${
                    reportConfig.format === 'PDF'
                      ? 'bg-rose-950 text-rose-400 border-rose-900'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PdfIcon fontSize="small" /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => setReportConfig({ ...reportConfig, format: 'XLSX' })}
                  className={`py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border transition-all uppercase tracking-wider ${
                    reportConfig.format === 'XLSX'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ExcelIcon fontSize="small" /> EXCEL
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quarter</label>
              <select
                value={reportConfig.quarter}
                onChange={(e) => setReportConfig({ ...reportConfig, quarter: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition-all text-sm"
              >
                <option value="Q1">Q1 (Jan - Mar)</option>
                <option value="Q2">Q2 (Apr - Jun)</option>
                <option value="Q3">Q3 (Jul - Sep)</option>
                <option value="Q4">Q4 (Oct - Dec)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Year</label>
              <select
                value={reportConfig.year}
                onChange={(e) => setReportConfig({ ...reportConfig, year: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition-all text-sm"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-850 flex justify-end">
            <button
              type="submit"
              disabled={compiling}
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
            >
              {compiling ? 'Compiling Registry Data...' : 'Compile & Export Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplianceReports;
