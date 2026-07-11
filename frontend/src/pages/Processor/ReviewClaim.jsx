import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockDb } from '../../services/mockDb';
import { toast } from 'react-toastify';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Assignment as TaskIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Cancel as ErrorIcon,
  CloudDownload as DownloadIcon,
  VerifiedUser as PolicyIcon
} from '@mui/icons-material';

const DecisionSchema = Yup.object().shape({
  action: Yup.string().required('Decision action is required'),
  comment: Yup.string().min(10, 'Please enter a more detailed rationale (minimum 10 characters)').required('Decision comment/rationale is required')
});

const ReviewClaim = () => {
  const { taskId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [claim, setClaim] = useState(null);

  useEffect(() => {
    const loadTaskAndClaim = async () => {
      const allTasks = await mockDb.getTasks();
      const foundTask = allTasks.find(t => t.id === taskId);
      if (foundTask) {
        setTask(foundTask);
        const allClaims = await mockDb.getClaims();
        const foundClaim = allClaims.find(c => c.id === foundTask.claimId);
        setClaim(foundClaim);
      }
    };
    loadTaskAndClaim();
  }, [taskId]);

  const handleDownload = (docName) => {
    toast.info(`[GridFS Download] Fetching binary for ${docName} from MongoDB chunks...`);
  };

  const handleDecisionSubmit = async (values, { setSubmitting }) => {
    try {
      const isManager = user.role === 'CLAIM_MANAGER' || user.role === 'FRAUD_DETECTION_MANAGER';
      const isTaskForManager = task.assignedRole === 'CLAIM_MANAGER' || task.assignedRole === 'FRAUD_DETECTION_MANAGER';
      if (isTaskForManager && !isManager) {
        toast.error('Privilege Error: This claim is escalated. Only a Manager can record decisions.');
        setSubmitting(false);
        return;
      }

      await mockDb.processClaim(task.id, values.action, values.comment, user);
      
      if (values.action === 'APPROVE') {
        toast.success('Decision recorded. Claim approved and payout initiated.');
      } else if (values.action === 'REJECT') {
        toast.error('Decision recorded. Claim rejected.');
      } else {
        toast.warning('Additional documentation has been requested. Notification sent.');
      }

      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to submit decision.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!task || !claim) {
    return <div className="text-center py-12">Task details not found.</div>;
  }

  const isLocked = task.assignedUser === user.username;
  const isManagerTask = task.assignedRole === 'CLAIM_MANAGER' || task.assignedRole === 'FRAUD_DETECTION_MANAGER';
  const hasAccess = !isManagerTask || user.role === 'CLAIM_MANAGER' || user.role === 'FRAUD_DETECTION_MANAGER';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner Info */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-teal-500/10 text-teal-400"><TaskIcon /></span>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{task.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">Task ID: {task.id} • Claim ID: {task.claimId}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs text-slate-400 hover:text-teal-400 border border-slate-800 hover:border-teal-500/50 px-4 py-2 rounded-xl transition-all"
        >
          Close Workstation
        </button>
      </div>

      {/* Security alert if not manager but visiting manager task */}
      {isManagerTask && user.role !== 'CLAIM_MANAGER' && (
        <div className="bg-rose-950/40 border border-rose-900/60 p-4 rounded-2xl flex gap-3 text-sm text-rose-350">
          <WarningIcon className="text-rose-400" />
          <div>
            <span className="font-semibold block">Escalated Claim Warning</span>
            This task requires Manager authority due to fraud triggers or amount limits. You can view details, but editing/authorizing decisions is restricted.
          </div>
        </div>
      )}

      {/* Double Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Hand: Claim Particulars & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim info */}
          <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-850 pb-3">Claim Profile Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-0.5">Claimant Name</span>
                <span className="font-semibold text-slate-200">{claim.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Policy Number</span>
                <span className="font-semibold text-slate-200">{claim.policyNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Occurrence Date</span>
                <span className="font-semibold text-slate-200">{claim.lossDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Requested Payout</span>
                <span className="font-extrabold text-teal-400 text-base">{(claim.claimAmount || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Loss Category</span>
                <span className="font-semibold text-slate-200">{claim.lossType}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Workflow Status</span>
                <span className="font-semibold text-yellow-400 uppercase text-xs tracking-wider">{claim.status.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-slate-500 block text-sm mb-1">Loss Explanation Statement</span>
              <p className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl text-slate-300 text-sm leading-relaxed">
                {claim.description}
              </p>
            </div>
          </div>

          {/* GridFS Documents List */}
          <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-850 pb-3">Unstructured Document Vault (GridFS)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {claim.documents.map((d) => (
                <div key={d.id} className="p-4 bg-slate-900/50 border border-slate-850 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-200 block truncate max-w-[200px]">{d.name}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{d.category} • {d.size}</span>
                  </div>
                  <button
                    onClick={() => handleDownload(d.name)}
                    className="p-2 bg-slate-800 hover:bg-teal-600 hover:text-white text-slate-400 rounded-xl transition-all"
                  >
                    <DownloadIcon fontSize="small" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Hand: Validation Rules & Workstation Decision */}
        <div className="space-y-6">
          {/* Automated Fraud Engine Card */}
          <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-850 pb-3 flex items-center gap-2">
              <PolicyIcon className="text-teal-400" /> Automated Risk Report
            </h2>
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-2xl flex flex-col items-center justify-center font-extrabold text-xl ${
                claim.fraudRiskScore >= 50
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-900/50'
                  : 'bg-teal-500/10 text-teal-400 border border-teal-900/50'
              }`}>
                <span>{claim.fraudRiskScore}</span>
                <span className="text-[9px] uppercase tracking-wider -mt-1 font-semibold">Risk</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Automated Flag Threshold: 50</span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  {claim.fraudRiskScore >= 50 ? 'WARNING: High Fraud Marker detected.' : 'PASS: Risk level falls within normal bounds.'}
                </span>
              </div>
            </div>

            {claim.fraudFlags.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Triggered Fraud Flags</span>
                <div className="flex flex-wrap gap-1.5">
                  {claim.fraudFlags.map((f, idx) => (
                    <span key={idx} className="bg-rose-950/60 text-rose-400 border border-rose-900 text-[10px] px-2 py-0.5 rounded font-mono font-semibold uppercase">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Decision workstation box */}
          {hasAccess && (
            <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-850 pb-3">Workstation Decision Log</h2>
              
              {!isLocked ? (
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 text-center text-xs text-slate-400 space-y-2">
                  <span>To record decisions on this task, lock it to your working folder.</span>
                  <button
                    onClick={async () => {
                      try {
                        await mockDb.claimTask(task.id, user);
                        setTask({ ...task, assignedUser: user.username, status: 'CLAIMED' });
                        toast.success('Task claimed and workstation unlocked.');
                      } catch (err) {
                        toast.error('Failed to claim task.');
                      }
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 rounded-xl text-xs transition-all mt-2 shadow-md"
                  >
                    Claim & Lock Task
                  </button>
                </div>
              ) : (
                <Formik
                  initialValues={{ action: 'APPROVE', comment: '' }}
                  validationSchema={DecisionSchema}
                  onSubmit={handleDecisionSubmit}
                >
                  {({ errors, touched, isSubmitting, values }) => (
                    <Form className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Record Decision</label>
                        <Field
                          as="select"
                          name="action"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition-all text-sm font-semibold uppercase tracking-wider"
                        >
                          <option value="APPROVE">Approve & Pay</option>
                          <option value="REJECT">Reject Claim</option>
                          <option value="REQUEST_DOCS">Request Additional Documents</option>
                        </Field>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Decision Rationale</label>
                        <Field
                          as="textarea"
                          name="comment"
                          rows="4"
                          className={`w-full bg-slate-900 border ${errors.comment && touched.comment ? 'border-rose-500' : 'border-slate-800'} focus:border-teal-500 rounded-xl py-3 px-4 text-slate-200 text-xs focus:outline-none transition-all`}
                          placeholder="Provide a detailed audit explanation justifying your decision..."
                        />
                        {errors.comment && touched.comment && (
                          <span className="text-xs text-rose-400 mt-1 block">{errors.comment}</span>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full font-semibold py-3.5 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider text-white ${
                          values.action === 'APPROVE'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20'
                            : values.action === 'REJECT'
                              ? 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 shadow-rose-500/20'
                              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20'
                        }`}
                      >
                        {isSubmitting ? 'Recording Decision...' : 'Commit Decision to Logs'}
                      </button>
                    </Form>
                  )}
                </Formik>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewClaim;
