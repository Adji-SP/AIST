import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

// Fungsi bantuan getGreeting (tidak berubah)
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const Header = ({ onMenuClick, alerts = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  const greeting = getGreeting();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-4 sm:px-6 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {greeting}, <span className="font-semibold text-green-600">{displayName}</span>!
            </h1>
            <p className="hidden md:block text-sm text-slate-500">
              Welcome to your agricultural command center.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Notifications Dropdown Container */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell className="w-6 h-6 text-slate-500" />
                {alerts.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {alerts.length > 99 ? '99+' : alerts.length}
                  </span>
                )}
              </button>

              {/* Notifications Menu */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden origin-top-right transition-all animate-fade-in-up">
                  <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800">Notifications</p>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{alerts.length}</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {alerts.length > 0 ? (
                      alerts.map((alert, idx) => (
                        <div key={alert.id || idx} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-800 truncate">{alert.title || alert.type || 'Alert'}</p>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                alert.severity === 'warning' ? 'bg-orange-100 text-orange-700' :
                                  'bg-blue-100 text-blue-700'
                              }`}>
                              {alert.severity || 'Info'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2">{alert.description || alert.message || 'Check dashboard for details.'}</p>
                          {alert.timestamp && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(typeof alert.timestamp?.toDate === 'function' ? alert.timestamp.toDate() : alert.timestamp).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-500">
                        <p className="text-sm font-medium">No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Container */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-white ring-transparent hover:ring-green-300 transition-all focus:outline-none focus:ring-green-400"
                aria-label="User profile"
                aria-expanded={dropdownOpen}
              >
                <span className="text-white text-sm font-bold">{initials}</span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden origin-top-right transition-all animate-fade-in-up">
                  {/* User Info Header */}
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white text-sm font-bold">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{email}</p>
                    </div>
                    {role === 'superadmin' && (
                      <span title="Super Admin" className="flex-shrink-0">
                        <Shield className="w-4 h-4 text-amber-500" />
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;