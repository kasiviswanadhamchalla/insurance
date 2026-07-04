import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Layouts/DashboardLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import LandingPage from './pages/LandingPage';
import Unauthorized from './pages/Unauthorized';

// Shared Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// Customer Pages
import SubmitClaim from './pages/Customer/SubmitClaim';
import MyClaims from './pages/Customer/MyClaims';
import ClaimDetails from './pages/Customer/ClaimDetails';

// Processor Pages
import Queue from './pages/Processor/Queue';
import AssignedClaims from './pages/Processor/AssignedClaims';
import ReviewClaim from './pages/Processor/ReviewClaim';

// Manager Pages
import HighValueClaims from './pages/Manager/HighValueClaims';
import EscalatedClaims from './pages/Manager/EscalatedClaims';
import OverrideConsole from './pages/Manager/OverrideConsole';
import ApprovalHistory from './pages/Manager/ApprovalHistory';

// Auditor Pages
import AuditLogs from './pages/Auditor/AuditLogs';
import ComplianceReports from './pages/Auditor/ComplianceReports';

// Admin Pages
import UserManagement from './pages/Admin/UserManagement';
import FraudRules from './pages/Admin/FraudRules';
import Monitoring from './pages/Admin/Monitoring';
import Settings from './pages/Admin/Settings';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Guarded Shared Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Guarded Customer Routes */}
          <Route
            path="/claims/new"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <DashboardLayout>
                  <SubmitClaim />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/claims/my"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <DashboardLayout>
                  <MyClaims />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/claims/:id"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <DashboardLayout>
                  <ClaimDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Guarded Processor Routes */}
          <Route
            path="/processor/queue"
            element={
              <ProtectedRoute allowedRoles={['CLAIM_OFFICER', 'CLAIM_MANAGER', 'FRAUD_DETECTION_MANAGER']}>
                <DashboardLayout>
                  <Queue />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/processor/assigned"
            element={
              <ProtectedRoute allowedRoles={['CLAIM_OFFICER', 'CLAIM_MANAGER', 'FRAUD_DETECTION_MANAGER']}>
                <DashboardLayout>
                  <AssignedClaims />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/processor/tasks/:taskId"
            element={
              <ProtectedRoute allowedRoles={['CLAIM_OFFICER', 'CLAIM_MANAGER', 'FRAUD_DETECTION_MANAGER']}>
                <DashboardLayout>
                  <ReviewClaim />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Guarded Manager Routes */}
          <Route
            path="/manager/high-value"
            element={
              <ProtectedRoute allowedRoles={['CLAIM_MANAGER', 'FRAUD_DETECTION_MANAGER']}>
                <DashboardLayout>
                  <HighValueClaims />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/escalated"
            element={
              <ProtectedRoute allowedRoles={['CLAIM_MANAGER', 'FRAUD_DETECTION_MANAGER']}>
                <DashboardLayout>
                  <EscalatedClaims />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/override"
            element={
              <ProtectedRoute allowedRoles={['CLAIM_MANAGER', 'FRAUD_DETECTION_MANAGER']}>
                <DashboardLayout>
                  <OverrideConsole />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/history"
            element={
              <ProtectedRoute allowedRoles={['CLAIM_MANAGER', 'FRAUD_DETECTION_MANAGER']}>
                <DashboardLayout>
                  <ApprovalHistory />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Guarded Auditor Routes */}
          <Route
            path="/auditor/logs"
            element={
              <ProtectedRoute allowedRoles={['AUDITOR']}>
                <DashboardLayout>
                  <AuditLogs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/auditor/reports"
            element={
              <ProtectedRoute allowedRoles={['AUDITOR']}>
                <DashboardLayout>
                  <ComplianceReports />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Guarded Admin Routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                <DashboardLayout>
                  <UserManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rules"
            element={
              <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                <DashboardLayout>
                  <FraudRules />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/monitoring"
            element={
              <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                <DashboardLayout>
                  <Monitoring />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </AuthProvider>
  );
}

export default App;
