import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Security as SecurityIcon, Visibility, VisibilityOff } from '@mui/icons-material';

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Full Name is required'),
  username: Yup.string().email('Must be a valid email').required('Email Username is required'),
  password: Yup.string()
    .min(8, 'Minimum 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/\d/, 'Must contain at least one digit')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  role: Yup.string().required('Role assignment is required')
});

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    const success = await register(
      values.username,
      values.username,
      values.password,
      values.name,
      values.role
    );
    setLoading(false);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] px-4 py-12 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[100px] -top-40 -left-40 z-0"></div>
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] -bottom-40 -right-40 z-0"></div>

      <div className="w-full max-w-lg glass-card rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-500 text-white shadow-xl shadow-teal-500/20 mb-3.5">
            <SecurityIcon className="text-2xl" />
          </div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Register your digital profile with ClaimFlow
          </p>
        </div>

        <Formik
          initialValues={{ name: '', username: '', password: '', confirmPassword: '', role: 'CUSTOMER' }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <Field
                    name="name"
                    type="text"
                    className={`w-full bg-slate-900 border ${
                      errors.name && touched.name ? 'border-rose-500' : 'border-slate-800'
                    } focus:border-teal-500 rounded-xl py-2.5 px-4 text-slate-200 text-sm placeholder-slate-500 focus:outline-none transition-all`}
                    placeholder="Jane Doe"
                  />
                  {errors.name && touched.name && (
                    <span className="text-[11px] text-rose-400 mt-1 block">{errors.name}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    System Role
                  </label>
                  <Field
                    as="select"
                    name="role"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl py-2.5 px-4 text-slate-200 text-sm focus:outline-none transition-all"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="CLAIM_OFFICER">Claim Officer</option>
                    <option value="FRAUD_DETECTION_MANAGER">Fraud Detection Manager</option>
                    <option value="AUDITOR">Auditor</option>
                  </Field>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address / Username
                </label>
                <Field
                  name="username"
                  type="email"
                  className={`w-full bg-slate-900 border ${
                    errors.username && touched.username ? 'border-rose-500' : 'border-slate-800'
                  } focus:border-teal-500 rounded-xl py-2.5 px-4 text-slate-200 text-sm placeholder-slate-500 focus:outline-none transition-all`}
                  placeholder="jane.doe@insurance.com"
                />
                {errors.username && touched.username && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{errors.username}</span>
                )}
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Field
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`w-full bg-slate-900 border ${
                        errors.password && touched.password ? 'border-rose-500' : 'border-slate-800'
                      } focus:border-teal-500 rounded-xl py-2.5 pl-4 pr-10 text-slate-200 text-sm placeholder-slate-500 focus:outline-none transition-all`}
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
                    <span className="text-[11px] text-rose-400 mt-1 block leading-normal">{errors.password}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Field
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`w-full bg-slate-900 border ${
                        errors.confirmPassword && touched.confirmPassword ? 'border-rose-500' : 'border-slate-800'
                      } focus:border-teal-500 rounded-xl py-2.5 pl-4 pr-10 text-slate-200 text-sm placeholder-slate-500 focus:outline-none transition-all`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                    >
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </button>
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <span className="text-[11px] text-rose-400 mt-1 block leading-normal">{errors.confirmPassword}</span>
                  )}
                </div>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 mt-4 text-sm"
              >
                {loading ? 'Creating Account...' : 'Register Profile'}
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-6 text-center text-sm text-slate-405 flex flex-col gap-2.5">
          <div>
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">
              Sign In
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

export default Register;
