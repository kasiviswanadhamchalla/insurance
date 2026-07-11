import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockDb } from '../../services/mockDb';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { CloudUpload as UploadIcon, Delete as DeleteIcon, LibraryBooks as FormIcon } from '@mui/icons-material';

const getEarliestAllowedDate = () => {
  let date = new Date();
  let businessDaysCount = 0;
  while (businessDaysCount < 7) {
    date.setDate(date.getDate() - 1);
    const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDaysCount++;
    }
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

const ClaimSchema = Yup.object().shape({
  policyNumber: Yup.string()
    .matches(/^POL-\d{8}$/, 'Policy number must match format: POL-XXXXXXXX (8 digits)')
    .required('Policy number is required'),
  claimAmount: Yup.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount exceeds standard insurance ceiling')
    .required('Claim amount is required'),
  lossType: Yup.string()
    .required('Loss type is required'),
  lossDate: Yup.date()
    .max(new Date(), 'Date of occurrence cannot be in the future')
    .test('is-within-7-business-days', 'Claim must be submitted within 7 business days of the incident', (value) => {
      if (!value) return false;
      const incidentDate = new Date(value);
      incidentDate.setHours(0, 0, 0, 0);
      const earliestDate = getEarliestAllowedDate();
      return incidentDate >= earliestDate;
    })
    .required('Loss date is required'),
  description: Yup.string()
    .min(20, 'Please provide more details (minimum 20 characters)')
    .max(500, 'Description cannot exceed 500 characters')
    .required('Loss description is required')
});

const SubmitClaim = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // to reset input field

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file extensions
    const invalidFile = files.find(f => !['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(f.type));
    if (invalidFile) {
      toast.error('Selected file format is invalid. Upload PDF or image only.');
      return;
    }

    // Store actual File objects for backend upload along with metadata
    const docs = files.map(f => ({
      file: f,
      id: `doc-${Math.floor(1000 + Math.random() * 9000)}`,
      name: f.name,
      category: f.name.toLowerCase().includes('report') ? 'Police Report' : 'Receipt / Estimate',
      size: `${(f.size / (1024 * 1024)).toFixed(1)}MB`,
      uploadedAt: new Date().toISOString()
    }));

    setUploadedFiles(prev => [...prev, ...docs]);
    setFileInputKey(Date.now()); // reset file input
    toast.success(`${files.length} document(s) uploaded to staging.`);
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    if (uploadedFiles.length === 0) {
      toast.warning('Additional documentation has been requested. Review file requirements (minimum 1 supporting file required).');
      setSubmitting(false);
      return;
    }

    try {
      const claimData = {
        ...values,
        documents: uploadedFiles
      };
      
      const newClaim = await mockDb.submitClaim(claimData, user);
      toast.success(`Claim created successfully under ID: ${newClaim.id}`);
      navigate('/dashboard');
    } catch (error) {
      toast.error('An error occurred during claim submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">Submit Claim Draft</h1>
          <p className="text-slate-400 text-sm mt-1">Submit insurance claims with supporting files for automated policy checking.</p>
        </div>
        <Link to="/dashboard" className="text-xs text-slate-400 hover:text-teal-400 border border-slate-800 hover:border-teal-500/50 px-4 py-2 rounded-xl transition-all">
          Back to Portal
        </Link>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-teal-400 border-b border-slate-800 pb-3">
            <FormIcon />
            <h2 className="font-semibold text-lg text-slate-200">Claim Particulars Form</h2>
          </div>

          <Formik
            initialValues={{
              policyNumber: 'POL-12345678',
              claimAmount: '',
              lossType: 'Auto Collision',
              lossDate: '',
              description: ''
            }}
            validationSchema={ClaimSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Policy Number</label>
                    <Field
                      name="policyNumber"
                      type="text"
                      className={`w-full bg-slate-900 border ${errors.policyNumber && touched.policyNumber ? 'border-rose-500' : 'border-slate-800'} focus:border-teal-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition-all`}
                      placeholder="POL-12345678"
                    />
                    {errors.policyNumber && touched.policyNumber && (
                      <span className="text-xs text-rose-400 mt-1 block">{errors.policyNumber}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Claim Amount ($)</label>
                    <Field
                      name="claimAmount"
                      type="number"
                      className={`w-full bg-slate-900 border ${errors.claimAmount && touched.claimAmount ? 'border-rose-500' : 'border-slate-800'} focus:border-teal-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition-all`}
                      placeholder="1500.00"
                    />
                    {errors.claimAmount && touched.claimAmount && (
                      <span className="text-xs text-rose-400 mt-1 block">{errors.claimAmount}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Loss Type Category</label>
                    <Field
                      as="select"
                      name="lossType"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition-all"
                    >
                      <option value="Auto Collision">Auto Collision</option>
                      <option value="Water Damage">Water Damage</option>
                      <option value="Theft/Burglary">Theft/Burglary</option>
                      <option value="Fire Damage">Fire Damage</option>
                      <option value="Medical Injury">Medical Injury</option>
                    </Field>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Occurrence</label>
                    <Field
                      name="lossDate"
                      type="date"
                      className={`w-full bg-slate-900 border ${errors.lossDate && touched.lossDate ? 'border-rose-500' : 'border-slate-800'} focus:border-teal-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition-all`}
                    />
                    {errors.lossDate && touched.lossDate && (
                      <span className="text-xs text-rose-400 mt-1 block">{errors.lossDate}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Loss Description</label>
                  <Field
                    as="textarea"
                    name="description"
                    rows="4"
                    className={`w-full bg-slate-900 border ${errors.description && touched.description ? 'border-rose-500' : 'border-slate-800'} focus:border-teal-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition-all`}
                    placeholder="Provide a comprehensive statement detailing the incident..."
                  />
                  {errors.description && touched.description && (
                    <span className="text-xs text-rose-400 mt-1 block leading-normal">{errors.description}</span>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-teal-500/20 transition-all"
                  >
                    {isSubmitting ? 'Submitting Details...' : 'Submit Claim Package'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* Right Side File Upload */}
        <div className="space-y-6 lg:border-l lg:border-slate-800 lg:pl-8">
          <div className="flex items-center gap-2 text-teal-400 border-b border-slate-800 pb-3">
            <UploadIcon />
            <h2 className="font-semibold text-lg text-slate-200">Supporting Evidence</h2>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 border-dashed text-center">
            <input
              key={fileInputKey}
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center p-4">
              <UploadIcon className="text-4xl text-teal-500 mb-2" />
              <span className="text-sm font-semibold text-slate-200">Upload Attachments</span>
              <span className="text-[10px] text-slate-500 block mt-1">Accepts PDF, PNG, JPG formats up to 10MB</span>
            </label>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Uploaded Files ({uploadedFiles.length})</span>
            {uploadedFiles.length === 0 ? (
              <div className="p-6 bg-slate-900/30 rounded-xl text-center text-xs text-slate-500">
                No files uploaded yet. Minimum 1 file required to submit claim.
              </div>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="p-3 bg-slate-900/80 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
                    <div className="truncate pr-2">
                      <span className="font-medium text-slate-200 block truncate">{file.name}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{file.category} • {file.size}</span>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/20"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitClaim;
