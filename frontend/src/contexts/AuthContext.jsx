import React, { createContext, useState, useEffect, useContext } from 'react';
import { mockDb, initMockDb } from '../services/mockDb';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mfaSession, setMfaSession] = useState(null); // { transactionId, tempUser, otpCode }

  useEffect(() => {
    // Initialize Mock DB
    initMockDb();
    
    // Check for existing token
    const token = localStorage.getItem('ins_token');
    const savedUser = localStorage.getItem('ins_current_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const loginStep1 = async (username, password) => {
    try {
      const users = mockDb.getUsers();
      let normalizedUsername = username.trim().toLowerCase();
      if (normalizedUsername.startsWith('fruad_')) {
        normalizedUsername = normalizedUsername.replace('fruad_', 'fraud_');
      }
      if (normalizedUsername.startsWith('cliam_')) {
        normalizedUsername = normalizedUsername.replace('cliam_', 'claim_');
      }
      
      // Alias mapping
      if (normalizedUsername === 'fraud_manager@insurance.com') {
        normalizedUsername = 'manager@insurance.com';
      }
      if (normalizedUsername === 'fraud_officer@insurance.com' || normalizedUsername === 'processor@insurance.com') {
        normalizedUsername = 'claim_officer@insurance.com';
      }
      
      const foundUser = users.find(u => u.username.toLowerCase() === normalizedUsername && u.password === password);
      
      if (!foundUser) {
        toast.error('Invalid credentials. Please verify username and password.');
        return { success: false, mfaRequired: false };
      }

      if (foundUser.approved === false) {
        toast.error('Access Denied: Your staff account is pending administrator approval.');
        return { success: false, mfaRequired: false };
      }

      // Bypass MFA entirely and login directly
      completeLogin(foundUser);
      return { success: true, mfaRequired: false, user: foundUser };
    } catch (error) {
      toast.error('An error occurred during login.');
      return { success: false, mfaRequired: false };
    }
  };

  const verifyMfa = async (transactionId, otpCode) => {
    try {
      if (!mfaSession || mfaSession.transactionId !== transactionId) {
        toast.error('Invalid MFA session. Please log in again.');
        return { success: false };
      }

      if (mfaSession.otpCode !== otpCode) {
        toast.error('MFA token incorrect or expired. Resubmit new code.');
        mockDb.addAuditLog(mfaSession.tempUser.id, mfaSession.tempUser.username, null, 'MFA_FAILED', `Failed OTP verification for Txn ID ${transactionId}.`);
        return { success: false };
      }

      const loggedUser = mfaSession.tempUser;
      completeLogin(loggedUser);
      setMfaSession(null);
      return { success: true, user: loggedUser };
    } catch (error) {
      toast.error('An error occurred during MFA verification.');
      return { success: false };
    }
  };

  const completeLogin = (loggedInUser) => {
    // Generate a mock JWT
    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(loggedInUser))}.signature`;
    
    localStorage.setItem('ins_token', mockJwt);
    localStorage.setItem('ins_current_user', JSON.stringify(loggedInUser));
    
    setUser(loggedInUser);
    
    // Audit Log
    mockDb.addAuditLog(loggedInUser.id, loggedInUser.username, null, 'USER_LOGIN', `User logged in with role: ${loggedInUser.role}`);
    
    toast.success('Logged successfully');
  };

  const register = async (username, email, password, name, role) => {
    try {
      const users = mockDb.getUsers();
      if (users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase())) {
        toast.error('Username or email already exists.');
        return false;
      }

      const newUser = {
        id: (users.length + 1).toString(),
        username,
        email,
        password,
        role,
        name,
        mfaEnabled: true,
        approved: role === 'CUSTOMER'
      };

      users.push(newUser);
      mockDb.saveUsers(users);
      
      // Audit Log
      mockDb.addAuditLog(newUser.id, newUser.username, null, 'USER_REGISTER', `New user registered with role: ${role}`);
      
      toast.success('Register successfully');
      return true;
    } catch (error) {
      toast.error('An error occurred during registration.');
      return false;
    }
  };

  const logout = () => {
    if (user) {
      mockDb.addAuditLog(user.id, user.username, null, 'USER_LOGOUT', `User logged out.`);
      // Invalidate cache and clear storage
      localStorage.removeItem('ins_token');
      localStorage.removeItem('ins_current_user');
      setUser(null);
      toast.success('You have successfully logged out.');
    }
  };

  const toggleMfa = (enabled) => {
    if (!user) return;
    const users = mockDb.getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex > -1) {
      users[userIndex].mfaEnabled = enabled;
      mockDb.saveUsers(users);
      
      const updatedUser = { ...user, mfaEnabled: enabled };
      setUser(updatedUser);
      localStorage.setItem('ins_current_user', JSON.stringify(updatedUser));
      
      mockDb.addAuditLog(user.id, user.username, null, 'MFA_TOGGLE', `MFA preference set to ${enabled}.`);
      toast.success(`MFA has been ${enabled ? 'enabled' : 'disabled'} successfully.`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, mfaSession, loginStep1, verifyMfa, register, logout, toggleMfa }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
