import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Security as SecurityIcon, LockOutlined as LockIcon, PersonOutlined as UserIcon, Visibility, VisibilityOff } from '@mui/icons-material';

const LoginSchema = Yup.object().shape({
  username: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(8, 'Minimum 8 characters').required('Password is required'),
});

const OTPSchema = Yup.object().shape({
  otpCode: Yup.string().length(6, 'Must be exactly 6 digits').matches(/^\d+$/, 'Digits only').required('OTP Code is required'),
});

const Login = () => {
  const { loginStep1, verifyMfa } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // 1: credentials, 2: OTP
  const [mfaTxnId, setMfaTxnId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getHomePathByRole = (role) => {
    switch (role) {
      case 'CUSTOMER': return '/dashboard';
      case 'CLAIM_OFFICER':
      case 'FRAUD_DETECTION_OFFICER': return '/processor/queue';
      case 'CLAIM_MANAGER':
      case 'FRAUD_DETECTION_MANAGER': return '/manager/high-value';
      case 'AUDITOR': return '/auditor/logs';
      case 'SYSTEM_ADMIN': return '/admin/users';
      default: return '/dashboard';
    }
  };

  const handleCredentialsSubmit = async (values) => {
    setLoading(true);
    console.log(values);
    const result = await loginStep1(values.username, values.password);
    setLoading(false);

    if (result.success) {
      if (result.mfaRequired) {
        setMfaTxnId(result.transactionId);
        setStep(2);
      } else {
        const targetPath = location.state?.from?.pathname || getHomePathByRole(result.user.role);
        navigate(targetPath, { replace: true });
      }
    }
  };

  const handleOtpSubmit = async (values) => {
    setLoading(true);
    const result = await verifyMfa(mfaTxnId, values.otpCode);
    setLoading(false);
    
    if (result.success) {
      const targetPath = location.state?.from?.pathname || getHomePathByRole(result.user.role);
      navigate(targetPath, { replace: true });
    }
  };

  // Helper login function for quick testing
  const handleQuickLogin = async (username) => {
    setLoading(true);
    const result = await loginStep1(username, 'Password123!');
    setLoading(false);
    if (result.success) {
      if (result.mfaRequired) {
        setMfaTxnId(result.transactionId);
        setStep(2);
      } else {
        const targetPath = location.state?.from?.pathname || getHomePathByRole(result.user.role);
        navigate(targetPath, { replace: true });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] px-4 py-12 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[100px] -top-40 -left-40 z-0"></div>
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] -bottom-40 -right-40 z-0"></div>

      <div className="w-full max-w-md glass-card rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white shadow-xl shadow-teal-500/20 mb-4">
            <SecurityIcon className="text-3xl" />
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
            ClaimFlow
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Secure Digital Insurance Claim Management Portal
          </p>
        </div>

        {step === 1 ? (
          <Formik
            initialValues={{ username: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleCredentialsSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <UserIcon fontSize="small" />
                    </span>
                    <Field
                      name="username"
                      type="email"
                      className={`w-full bg-slate-900 border ${
                        errors.username && touched.username ? 'border-rose-500' : 'border-slate-800'
                      } focus:border-teal-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none transition-all`}
                      placeholder="customer@insurance.com"
                    />
                  </div>
                  {errors.username && touched.username && (
                    <span className="text-xs text-rose-400 mt-1 block">{errors.username}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <LockIcon fontSize="small" />
                    </span>
                    <Field
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`w-full bg-slate-900 border ${
                        errors.password && touched.password ? 'border-rose-500' : 'border-slate-800'
                      } focus:border-teal-500 rounded-xl py-3 pl-10 pr-10 text-slate-200 placeholder-slate-500 focus:outline-none transition-all`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <span className="text-xs text-rose-400 mt-1 block">{errors.password}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{ otpCode: '' }}
            validationSchema={OTPSchema}
            onSubmit={handleOtpSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-6">
                <div className="text-center p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 mb-4">
                  <span className="text-xs text-teal-400 font-semibold uppercase tracking-wider block mb-1">
                    Multi-Factor Verification
                  </span>
                  <p className="text-xs text-slate-400">
                    A 6-digit verification code has been dispatched. Enter it below to unlock access.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                    Enter Verification Code (OTP)
                  </label>
                  <Field
                    name="otpCode"
                    type="text"
                    maxLength="6"
                    className={`w-full bg-slate-900 border text-center tracking-[0.5em] text-2xl font-bold ${
                      errors.otpCode && touched.otpCode ? 'border-rose-500' : 'border-slate-800'
                      } focus:border-teal-500 rounded-xl py-3 text-slate-200 placeholder-slate-500 focus:outline-none transition-all`}
                    placeholder="000000"
                  />
                  {errors.otpCode && touched.otpCode && (
                    <span className="text-xs text-rose-400 mt-1 block text-center">{errors.otpCode}</span>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/2 border border-slate-850 hover:bg-slate-800/50 text-slate-300 py-3 rounded-xl transition-all"
                  >
                    Go Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-1/2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}



        <div className="mt-6 text-center text-sm text-slate-405 flex flex-col gap-2.5">
          <div>
            New client?{' '}
            <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium">
              Register Account
            </Link>
          </div>
          <div className="pt-2.5 border-t border-slate-850/60">
            <Link to="/" className="text-xs text-slate-500 hover:text-teal-400 transition-all font-semibold uppercase tracking-wider">
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
