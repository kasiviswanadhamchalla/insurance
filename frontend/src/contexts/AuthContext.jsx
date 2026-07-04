import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mfaSession, setMfaSession] = useState(null); // { transactionId, tempUser }

  useEffect(() => {
    // Check for existing token and user session
    const token = localStorage.getItem('ins_token');
    const savedUser = localStorage.getItem('ins_current_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const loginStep1 = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const data = response.data;
      
      if (data.success && data.data) {
        const loginData = data.data;
        if (loginData.mfaRequired) {
          const tempMapped = mapUserRole(loginData.user);
          setMfaSession({
            transactionId: loginData.mfaTransactionId,
            tempUser: tempMapped
          });
          return { success: true, mfaRequired: true, transactionId: loginData.mfaTransactionId };
        } else {
          completeLogin(loginData.accessToken, loginData.user);
          return { success: true, mfaRequired: false, user: mapUserRole(loginData.user) };
        }
      } else {
        toast.error(data.message || 'Invalid credentials');
        return { success: false, mfaRequired: false };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid credentials. Please verify username and password.';
      toast.error(errorMsg);
      return { success: false, mfaRequired: false };
    }
  };

  const verifyMfa = async (transactionId, otpCode) => {
    try {
      const response = await api.post('/auth/login/mfa/verify', {
        mfaTransactionId: transactionId,
        code: otpCode
      });
      const data = response.data;
      
      if (data.success && data.data) {
        completeLogin(data.data.accessToken, data.data.user);
        setMfaSession(null);
        return { success: true, user: mapUserRole(data.data.user) };
      } else {
        toast.error(data.message || 'MFA token incorrect or expired.');
        return { success: false };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'MFA token incorrect or expired.');
      return { success: false };
    }
  };

  const completeLogin = (token, rawUser) => {
    const mapped = mapUserRole(rawUser);
    localStorage.setItem('ins_token', token);
    localStorage.setItem('ins_current_user', JSON.stringify(mapped));
    setUser(mapped);
    toast.success('Logged successfully');
  };

  const mapUserRole = (rawUser) => {
    let feRole = 'CUSTOMER';
    if (rawUser.roles && rawUser.roles.length > 0) {
      const beRole = rawUser.roles[0];
      if (beRole === 'ROLE_ADMIN') feRole = 'SYSTEM_ADMIN';
      else if (beRole === 'ROLE_PROCESSOR') feRole = 'CLAIM_OFFICER';
      else if (beRole === 'ROLE_MANAGER') feRole = 'CLAIM_MANAGER';
      else if (beRole === 'ROLE_AUDITOR') feRole = 'AUDITOR';
    }
    return {
      id: rawUser.id.toString(),
      username: rawUser.username,
      email: rawUser.email,
      role: feRole,
      name: rawUser.username.split('@')[0].replace(/_/g, ' '),
      mfaEnabled: rawUser.mfaEnabled,
      approved: rawUser.approved !== false
    };
  };

  const register = async (username, email, password, name, role) => {
    try {
      let beRole = 'ROLE_USER';
      if (role === 'SYSTEM_ADMIN') beRole = 'ROLE_ADMIN';
      else if (role === 'CLAIM_OFFICER') beRole = 'ROLE_PROCESSOR';
      else if (role === 'CLAIM_MANAGER') beRole = 'ROLE_MANAGER';
      else if (role === 'AUDITOR') beRole = 'ROLE_AUDITOR';

      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        fullName: name,
        roles: [beRole]
      });
      
      if (response.data.success) {
        toast.success('Registration successful! Pending admin approval.');
        return true;
      } else {
        toast.error(response.data.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred during registration.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('ins_token');
    localStorage.removeItem('ins_current_user');
    setUser(null);
    toast.success('You have successfully logged out.');
  };

  const toggleMfa = async (enabled) => {
    try {
      await api.post(`/auth/mfa/setup`, { enabled });
      const updatedUser = { ...user, mfaEnabled: enabled };
      setUser(updatedUser);
      localStorage.setItem('ins_current_user', JSON.stringify(updatedUser));
      toast.success(`MFA has been ${enabled ? 'enabled' : 'disabled'} successfully.`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update MFA settings.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, mfaSession, loginStep1, verifyMfa, register, logout, toggleMfa }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
