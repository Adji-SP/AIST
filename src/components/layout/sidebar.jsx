import React from 'react';
import {
  Leaf, X, Home, History, Wrench, Users,
  LogOut, ChevronsLeft, ChevronsRight, Shield, PenLine, Settings
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const NAV_ITEMS = [
  { path: '/overview', icon: Home, label: 'Overview' },
  { path: '/data', icon: History, label: 'Data Analytics' },
  { path: '/maintenance', icon: Wrench, label: 'Task Schedule' },
];

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { role } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 h-screen flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200 ${isCollapsed ? 'w-20' : 'w-64'
        }`}>

        {/* Header */}
        <div className="flex items-center p-4 border-b border-slate-200 flex-shrink-0 h-[68px]">
          <div className={`flex items-center space-x-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <img src="/assets/logo/LOGO.png" alt="Logo" className="w-8 h-8 object-contain flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-xl font-bold text-slate-800 whitespace-nowrap">Greenara</span>
            )}
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-slate-800 ml-auto">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <nav className="mt-4 pb-4">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={label}
                  to={path}
                  className={`w-full flex items-center py-3 transition-colors ${isCollapsed ? 'justify-center px-2' : 'px-6'
                    } ${isActive
                      ? 'bg-green-50 text-green-700 font-semibold'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  title={isCollapsed ? label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
                  {!isCollapsed && <span>{label}</span>}
                </Link>
              );
            })}

            {/* Superadmin-only: Landing Editor */}
            {role === 'superadmin' && (
              <Link
                to="/landing-editor"
                className={`w-full flex items-center py-3 transition-colors ${isCollapsed ? 'justify-center px-2' : 'px-6'
                  } ${location.pathname === '/landing-editor'
                    ? 'bg-green-50 text-green-700 font-semibold'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                title={isCollapsed ? 'Landing Editor' : undefined}
              >
                <PenLine className={`w-5 h-5 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
                {!isCollapsed && <span>Landing Editor</span>}
              </Link>
            )}

            {/* Admin Portal Link */}
            {(role === 'admin' || role === 'superadmin') && (
              <Link
                to="/admin/dashboard"
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group text-slate-600 hover:bg-slate-50 hover:text-green-600`}
                title={isCollapsed ? 'Admin Portal' : undefined}
              >
                <Settings className={`w-5 h-5 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
                {!isCollapsed && <span>Admin Portal</span>}
              </Link>
            )}
          </nav>
        </div>

        {/* Footer — Actions */}
        <div className="border-t border-slate-200 flex-shrink-0">
          {/* Buttons */}
          <div className="p-3 space-y-1">
            {/* Collapse toggle (desktop only) */}
            <button
              onClick={onToggleCollapse}
              className={`w-full hidden lg:flex items-center justify-center text-slate-500 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors ${isCollapsed ? 'px-2' : 'px-4'
                }`}
            >
              {isCollapsed
                ? <ChevronsRight className="w-5 h-5" />
                : <><ChevronsLeft className="w-5 h-5" /><span className="ml-2">Collapse</span></>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;