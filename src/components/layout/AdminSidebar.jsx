import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users, HardDrive, Settings, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const { logout, user } = useAuth();

    return (
        <aside
            className={`absolute left-0 top-0 z-50 flex h-screen w-[280px] flex-col overflow-y-hidden bg-[#1C2434] duration-300 ease-linear lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between gap-2 px-6 py-[22px] lg:py-6.5">
                <NavLink to="/admin" className="flex items-center gap-3">
                    <img src="/assets/logo/WHITE.png" alt="Admin Logo" className="w-8 h-8 object-contain" />
                    <h1 className="text-2xl font-bold text-white tracking-wide">
                        Green<span className="text-green-500 font-light">Admin</span>
                    </h1>
                </NavLink>

                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="block lg:hidden text-gray-400 hover:text-white"
                >
                    <svg className="fill-current" width="20" height="18" viewBox="0 0 20 18" fill="none">
                        <path
                            d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                            fill=""
                        />
                    </svg>
                </button>
            </div>

            {/* Sidebar Menu */}
            <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
                <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
                    <div>
                        <h3 className="mb-4 ml-4 text-sm font-semibold text-gray-400 uppercase tracking-widest">
                            Configuration
                        </h3>

                        <ul className="mb-6 flex flex-col gap-1.5">
                            {/* Dashboard */}
                            <li>
                                <NavLink
                                    to="/admin/dashboard"
                                    className={({ isActive }) =>
                                        'group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white ' +
                                        (isActive && '!bg-gray-800 text-white')
                                    }
                                >
                                    <LayoutDashboard className="w-[18px] h-[18px]" />
                                    Analytics
                                </NavLink>
                            </li>
                            {/* Users */}
                            <li>
                                <NavLink
                                    to="/admin/users"
                                    className={({ isActive }) =>
                                        'group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white ' +
                                        (isActive && '!bg-gray-800 text-white')
                                    }
                                >
                                    <Users className="w-[18px] h-[18px]" />
                                    User Management
                                </NavLink>
                            </li>
                            {/* Devices */}
                            <li>
                                <NavLink
                                    to="/admin/devices"
                                    className={({ isActive }) =>
                                        'group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white ' +
                                        (isActive && '!bg-gray-800 text-white')
                                    }
                                >
                                    <HardDrive className="w-[18px] h-[18px]" />
                                    Device Registry
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="mb-4 ml-4 text-sm font-semibold text-gray-400 uppercase tracking-widest">
                            System
                        </h3>

                        <ul className="mb-6 flex flex-col gap-1.5">
                            <li>
                                <NavLink
                                    to="/admin/settings"
                                    className={({ isActive }) =>
                                        'group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white ' +
                                        (isActive && '!bg-gray-800 text-white')
                                    }
                                >
                                    <Settings className="w-[18px] h-[18px]" />
                                    Settings
                                </NavLink>
                            </li>
                            <li>
                                <button
                                    onClick={logout}
                                    className="w-full group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium justify-start text-red-400 duration-300 ease-in-out hover:bg-gray-800 hover:text-red-300"
                                >
                                    <LogOut className="w-[18px] h-[18px]" />
                                    Sign Out
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default AdminSidebar;
