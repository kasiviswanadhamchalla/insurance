import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockDb } from '../../services/mockDb';
import { toast } from 'react-toastify';
import {
  CloudUpload as UploadIcon,
  Timeline as HistoryIcon,
  Attachment as FileIcon,
  VerifiedUser as ValidIcon,
  HelpOutlined as InfoIcon
} from '@mui/icons-material';

const ClaimDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [claim, setClaim] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchClaimDetails = () => {
    const claims = mockDb.getClaims();
    const foundClaim = claims.find(c => c.id === id);
    setClaim(foundClaim);
  };

  useEffect(() => {
    fetchClaimDetails();
  }, [id]);

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Selected file format is invalid. Upload PDF or image only.');
      return;
    }

    setUploading(true);
    setTimeout(() => {
      try {
        const updated = mockDb.uploadDocument(claim.id, file.name, 'Supporting Receipt', user);
        setClaim(updated);
        toast.success(`Supporting document uploaded: ${file.name}. Claim status synchronized.`);
      } catch (error) {
        toast.error('An error occurred during file upload.');
      } finally {
        setUploading(false);
      }
    }, 1000);
  };

  if (!claim) {
    return <div className="text-center py-12">Claim not found.</div>;
  }

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

  // State machine progress bar mapping
  const steps = [
    { label: 'Created', active: true },
    { label: 'Submitted', active: ['SUBMITTED', 'PENDING_REVIEW', 'FLAGGED_FOR_REVIEW', 'PENDING_DOCUMENTATION', 'APPROVED', 'REJECTED'].includes(claim.status) },
    { label: 'Under Review', active: ['PENDING_REVIEW', 'FLAGGED_FOR_REVIEW', 'PENDING_DOCUMENTATION', 'APPROVED', 'REJECTED'].includes(claim.status) },
    { label: 'Decision', active: ['APPROVED', 'REJECTED'].includes(claim.status) }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">{claim.id}</h1>
            {getStatusBadge(claim.status)}
          </div>
          <p className="text-slate-400 text-sm mt-1">Submitted on {new Date(claim.submittedAt).toLocaleString()}</p>
        </div>
        <Link to="/dashboard" className="text-xs text-slate-400 hover:text-teal-400 border border-slate-800 hover:border-teal-500/50 px-4 py-2 rounded-xl transition-all">
          Back to Dashboard
        </Link>
      </div>

      {/* Progress Timeline */}
      <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="font-semibold text-slate-200 text-sm uppercase tracking-wider mb-6 text-slate-400">Claim Process Stage</h3>
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 h-1 bg-slate-800 -z-1"></div>
          {steps.map((s, idx) => (
            <div key={idx} className="flex flex-col items-center relative z-10">
              <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                s.active
                  ? 'bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-600/35'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                {idx + 1}
              </div>
              <span className={`text-xs mt-2 font-medium ${s.active ? 'text-slate-200' : 'text-slate-500'}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Particulars Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-semibold text-slate-200 text-lg border-b border-slate-800 pb-3 flex items-center gap-2">
              <ValidIcon className="text-teal-400" /> Claim Particulars Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400 block mb-0.5">Policy Number</span>
                <span className="font-semibold text-slate-200">{claim.policyNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Requested Amount</span>
                <span className="font-extrabold text-teal-400">{claim.claimAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Loss Type Category</span>
                <span className="font-semibold text-slate-200">{claim.lossType}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Date of Occurrence</span>
                <span className="font-semibold text-slate-200">{claim.lossDate}</span>
              </div>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block text-sm mb-1">Detailed Description</span>
              <p className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl text-slate-350 text-sm leading-relaxed">
                {claim.description}
              </p>
            </div>
          </div>

          {/* Workflow Action History */}
          <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-semibold text-slate-200 text-lg border-b border-slate-800 pb-3 flex items-center gap-2">
              <HistoryIcon className="text-indigo-400" /> Process Audit Trail
            </h3>
            <div className="space-y-4">
              {claim.history.map((h, idx) => (
                <div key={idx} className="flex gap-4 text-sm">
                  <div className="w-36 shrink-0 text-slate-400 text-xs font-medium">{new Date(h.updatedAt).toLocaleString()}</div>
                  <div className="flex-1">
                    <span className="font-semibold text-slate-200">{h.updatedBy}</span>
                    <span className="text-slate-400 text-xs block mt-0.5">{h.comment}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Files */}
        <div className="space-y-6">
          {/* Action Call for requested documentation */}
          {claim.status === 'PENDING_DOCUMENTATION' && (
            <div className="bg-pink-950/40 border border-pink-900/50 p-5 rounded-3xl text-sm space-y-3 shadow-md animate-pulse">
              <div className="flex items-center gap-2 text-pink-400 font-semibold">
                <InfoIcon /> Additional Documentation Requested
              </div>
              <p className="text-xs text-pink-300/80 leading-relaxed">
                The claim reviewer has requested supporting evidence (receipt, report, photos). Please upload using the drop zone below to resume evaluation.
              </p>
            </div>
          )}

          {/* Document Upload Zone */}
          <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-semibold text-slate-200 text-lg border-b border-slate-800 pb-3 flex items-center gap-2">
              <FileIcon className="text-teal-400" /> Supporting Documents
            </h3>

            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {claim.documents.map((d) => (
                <div key={d.id} className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
                  <div className="truncate pr-2">
                    <span className="font-medium text-slate-200 block truncate">{d.name}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{d.category} • {d.size}</span>
                  </div>
                  <span className="bg-teal-950 text-teal-400 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">STORED</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-850">
              <input
                id="doc-upload"
                type="file"
                onChange={handleDocumentUpload}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="doc-upload"
                className={`cursor-pointer flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 text-slate-300 hover:text-white font-medium rounded-xl text-xs transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <UploadIcon fontSize="small" />
                {uploading ? 'Uploading to GridFS...' : 'Upload Additional Receipt'}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetails;
