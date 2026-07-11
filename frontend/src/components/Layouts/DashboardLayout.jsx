import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockDb } from '../../services/mockDb';
import {
  Dashboard as DashboardIcon,
  PostAdd as PostAddIcon,
  ListAlt as ListAltIcon,
  QueuePlayNext as QueueIcon,
  AssignmentTurnedIn as AssignmentIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  PublishedWithChanges as OverrideIcon,
  HistoryToggleOff as AuditIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Gavel as GavelIcon,
  MonitorHeart as MonitorIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationsIcon,
  AccountCircle as ProfileIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch recent notifications based on user's role
  useEffect(() => {
    if (!user) return;
    
    const loadNotifications = async () => {
      try {
        const claims = await mockDb.getClaims();
        const tasks = await mockDb.getTasks();
        const list = [];

        if (user.role === 'CUSTOMER') {
          const myClaims = claims.filter(c => c.customerId === user.email || c.customerId === user.username);
          myClaims.forEach(c => {
            list.push({
              id: `notif-${c.id}`,
              title: `Claim ${c.id} Status: ${c.status}`,
              time: new Date(c.history[c.history.length - 1].updatedAt).toLocaleTimeString(),
              details: c.history[c.history.length - 1].comment,
              unread: true
            });
          });
        } else if (user.role === 'CLAIM_OFFICER') {
          const pendingTasks = tasks.filter(t => t.assignedRole === 'CLAIM_OFFICER' && !t.assignedUser);
          pendingTasks.forEach(t => {
            list.push({
              id: `notif-${t.id}`,
              title: `New Pending Task in Queue`,
              time: new Date(t.createdAt).toLocaleTimeString(),
              details: t.title,
              unread: true
            });
          });
        } else if (user.role === 'CLAIM_MANAGER') {
          const escalatedTasks = tasks.filter(t => t.assignedRole === 'CLAIM_MANAGER');
          escalatedTasks.forEach(t => {
            list.push({
              id: `notif-${t.id}`,
              title: `High-Value Claim Action Needed`,
              time: new Date(t.createdAt).toLocaleTimeString(),
              details: t.title,
              unread: true
            });
          });
        } else {
          const logs = await mockDb.getAuditLogs();
          const logsSlice = logs.slice(0, 5);
          logsSlice.forEach(l => {
            list.push({
              id: `notif-${l.id}`,
              title: `${l.action} logged`,
              time: new Date(l.timestamp).toLocaleTimeString(),
              details: l.details,
              unread: true
            });
          });
        }

        setNotifications(list.slice(0, 6));
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    loadNotifications();
  }, [user, location.pathname]);

  const menuItems = {
    CUSTOMER: [
      { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { path: '/claims/new', label: 'Submit New Claim', icon: <PostAddIcon /> },
      { path: '/claims/my', label: 'My Claims', icon: <ListAltIcon /> },
      { path: '/profile', label: 'Profile & security', icon: <ProfileIcon /> }
    ],
    CLAIM_OFFICER: [
      { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { path: '/processor/queue', label: 'Pending Queue', icon: <QueueIcon /> },
      { path: '/processor/assigned', label: 'Assigned Claims', icon: <AssignmentIcon /> },
      { path: '/profile', label: 'Profile & Settings', icon: <ProfileIcon /> }
    ],
    FRAUD_DETECTION_OFFICER: [
      { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { path: '/processor/queue', label: 'Pending Queue', icon: <QueueIcon /> },
      { path: '/processor/assigned', label: 'Assigned Claims', icon: <AssignmentIcon /> },
      { path: '/profile', label: 'Profile & Settings', icon: <ProfileIcon /> }
    ],
    FRAUD_DETECTION_MANAGER: [
      { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { path: '/manager/high-value', label: 'High-Value Claims', icon: <MoneyIcon /> },
      { path: '/manager/escalated', label: 'Escalated Claims', icon: <WarningIcon /> },
      { path: '/manager/override', label: 'Override Console', icon: <OverrideIcon /> },
      { path: '/manager/history', label: 'Approval History', icon: <AuditIcon /> },
      { path: '/profile', label: 'Profile & Settings', icon: <ProfileIcon /> }
    ],
    CLAIM_MANAGER: [
      { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { path: '/manager/high-value', label: 'High-Value Claims', icon: <MoneyIcon /> },
      { path: '/manager/escalated', label: 'Escalated Claims', icon: <WarningIcon /> },
      { path: '/manager/override', label: 'Override Console', icon: <OverrideIcon /> },
      { path: '/manager/history', label: 'Approval History', icon: <AuditIcon /> },
      { path: '/profile', label: 'Profile & Settings', icon: <ProfileIcon /> }
    ],
    AUDITOR: [
      { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { path: '/auditor/logs', label: 'Audit Logs', icon: <AuditIcon /> },
      { path: '/auditor/reports', label: 'Compliance Reports', icon: <AssessmentIcon /> }
    ],
    SYSTEM_ADMIN: [
      { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { path: '/admin/users', label: 'User Management', icon: <PeopleIcon /> },
      { path: '/admin/rules', label: 'Fraud Rules Config', icon: <GavelIcon /> },
      { path: '/admin/monitoring', label: 'System Monitoring', icon: <MonitorIcon /> },
      { path: '/admin/settings', label: 'System Settings', icon: <SettingsIcon /> }
    ]
  };

  const currentRoleMenu = menuItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f1d] text-slate-100 font-sans">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 ease-in-out bg-[#0f172a] border-r border-slate-800 flex flex-col justify-between z-20`}
      >
        <div>
          {/* Logo Section */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 rounded-lg bg-teal-600 text-white shrink-0 shadow-lg shadow-teal-500/20">
                <GavelIcon className="text-xl" />
              </div>
              {sidebarOpen && (
                <span className="font-bold text-lg bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent truncate">
                  ClaimFlow
                </span>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              {sidebarOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
            </button>
          </div>

          {/* User Role Badge */}
          {sidebarOpen && user && (
            <div className="p-4 mx-3 my-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col gap-1">
              <span className="text-xs text-teal-400 font-semibold tracking-wider uppercase">
                {user.role.replace('_', ' ')}
              </span>
              <span className="text-sm font-medium text-slate-200 truncate">{user.name}</span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="mt-4 px-3 flex flex-col gap-1">
            {currentRoleMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-teal-600/90 text-white font-medium shadow-md shadow-teal-600/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'}`}>
                    {item.icon}
                  </span>
                  {sidebarOpen && <span className="truncate text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-3 py-3 rounded-lg text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-all duration-200"
          >
            <LogoutIcon />
            {sidebarOpen && <span className="text-sm font-medium">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-[#0f172a]/70 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex flex-col">
            <h1 className="text-base font-semibold text-slate-100">
              Welcome back, {user?.name?.split(' ')[0] || ''}
            </h1>
            <span className="text-xs text-slate-400">
              System Time: 2026-07-04 11:02 AM
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Drawer */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-teal-400 hover:bg-slate-750 transition-all duration-200 relative"
              >
                <NotificationsIcon />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-teal-500 animate-ping"></span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-30">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2">
                    <span className="font-semibold text-sm text-slate-200">Notifications</span>
                    <button
                      onClick={() => setNotifications([])}
                      className="text-xs text-slate-400 hover:text-teal-400"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <span className="text-xs text-slate-500 text-center py-4">No new notifications</span>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-2 rounded bg-slate-800/40 hover:bg-slate-800 border-l-2 border-teal-500 text-xs">
                          <div className="flex justify-between font-medium text-slate-300 mb-0.5">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-500">{n.time}</span>
                          </div>
                          <p className="text-slate-400 leading-normal">{n.details}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar / Logged Role */}
            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
                {user?.name?.split(' ')?.map(n => n[0])?.join('') || ''}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs text-slate-400 capitalize">{user?.role.toLowerCase().replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0b1329] bg-gradient-to-b from-[#0a0f1d] to-[#0b1329]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
