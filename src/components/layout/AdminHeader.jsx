import React from 'react';
import { Search, Bell, MessageSquare, ChevronDown } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Link } from 'react-router-dom';

const AdminHeader = ({ sidebarOpen, setSidebarOpen }) => {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-40 flex w-full bg-white drop-shadow-sm">
            <div className="flex flex-grow items-center justify-between py-4 px-4 shadow-2 md:px-6 2xl:px-11">
                <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                    {/* Hamburger Toggle BTN */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSidebarOpen(!sidebarOpen);
                        }}
                        className="z-50 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm lg:hidden"
                    >
                        <span className="relative block h-5.5 w-5.5 cursor-pointer">
                            <span className="block absolute right-0 h-full w-full">
                                <span
                                    className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out ${!sidebarOpen && '!w-full delay-300'
                                        }`}
                                ></span>
                                <span
                                    className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out ${!sidebarOpen && 'delay-400 !w-full'
                                        }`}
                                ></span>
                                <span
                                    className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out ${!sidebarOpen && '!w-full delay-500'
                                        }`}
                                ></span>
                            </span>
                        </span>
                    </button>
                    {/* Hamburger Toggle BTN */}
                </div>

                {/* Left side: Search Area */}
                <div className="hidden sm:block">
                    <form action="https://formbold.com/s/unique_form_id" method="POST">
                        <div className="relative">
                            <button className="absolute left-0 top-1/2 -translate-y-1/2">
                                <Search className="w-5 h-5 text-gray-400" />
                            </button>
                            <input
                                type="text"
                                placeholder="Type to search..."
                                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none xl:w-125"
                            />
                        </div>
                    </form>
                </div>

                {/* Right side: Notifications & Profile */}
                <div className="flex items-center gap-3 2xsm:gap-7">
                    <ul className="flex items-center gap-2 2xsm:gap-4">
                        {/* Notification Icon */}
                        <li className="relative">
                            <button className="flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-gray-200 bg-gray-50 hover:text-blue-500 text-gray-500">
                                <Bell className="w-[18px] h-[18px]" />
                                <span className="absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-red-500">
                                    <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                                </span>
                            </button>
                        </li>

                        {/* Messages Icon */}
                        <li className="relative">
                            <button className="flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-gray-200 bg-gray-50 hover:text-blue-500 text-gray-500">
                                <MessageSquare className="w-[18px] h-[18px]" />
                            </button>
                        </li>
                    </ul>

                    {/* User Area */}
                    <Link to="#" className="flex items-center gap-4 border-l border-gray-200 pl-4">
                        <span className="hidden text-right lg:block">
                            <span className="block text-sm font-medium text-black">
                                {user?.displayName || 'Administrator'}
                            </span>
                            <span className="block text-xs font-medium text-gray-500">Super Admin</span>
                        </span>

                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl font-bold text-gray-400">
                                    {(user?.displayName || 'A').charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <ChevronDown className="hidden w-4 h-4 text-gray-500 lg:block" />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
