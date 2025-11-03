import React from 'react';
import { 
  Leaf, X, Home, BarChart2, History, Wrench, Users, LogOut, ChevronsLeft, ChevronsRight 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ 
  isOpen, 
  onClose,
  isCollapsed,
  onToggleCollapse
}) => {

  const customMenuItems = [
    { path: '/overview', icon: Home, label: 'Overview' },
    { path: '/data', icon: History, label: 'Data Analytics' },
    { path: '/finance-analytics', icon: BarChart2, label: 'ESG & SDGS' },
    { path: '/maintenance', icon: Wrench, label: 'Task Schedule' },
    { path: '/team-profile', icon: Users, label: 'Team Profile' },
  ];

  const location = useLocation();

  return (
    <>
      {/* Overlay untuk perangkat seluler */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}
      
      {/* Kontainer Sidebar Utama dengan tema terang */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 h-screen flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        
        {/* Header Sidebar */}
        <div className="flex items-center p-4 border-b border-slate-200 flex-shrink-0 h-[68px]">
          <div className={`flex items-center space-x-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && <span className="text-xl font-bold text-slate-800 whitespace-nowrap">Activities</span>}
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-slate-800"><X className="w-6 h-6" /></button>
        </div>
        
        {/* Navigasi Utama */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <nav className="mt-4 pb-4">
            {customMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`w-full flex items-center py-3 transition-colors ${
                    isCollapsed ? 'justify-center px-2' : 'px-6' // Justify center saat diciutkan
                  } ${isActive 
                    ? 'bg-green-50 text-green-700 font-semibold' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* [DIPERBAIKI] Bagian Bawah Sidebar (Footer) */}
        <div className="p-4 border-t border-slate-200 flex-shrink-0 space-y-2">
           <button 
             onClick={onToggleCollapse} 
             className={`w-full justify-center hidden lg:flex items-center text-slate-500 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors ${
                isCollapsed ? 'px-2' : 'px-4' // Padding dinamis
             }`}
           >
             {isCollapsed ? (
                <ChevronsRight className="w-5 h-5" />
             ) : (
                <>
                    <ChevronsLeft className="w-5 h-5" />
                    <span className="ml-2">Collapse</span>
                </>
             )}
           </button>

           <button 
            className={`w-full justify-center flex items-center bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 hover:text-slate-900 transition-colors ${
                isCollapsed ? 'px-2' : 'px-4' // Padding dinamis
            }`}
           >
            {isCollapsed ? (
                <LogOut className="w-5 h-5" />
            ) : (
                <>
                    <LogOut className="w-5 h-5" />
                    <span className="ml-2">Logout</span>
                </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;