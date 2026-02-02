import React from 'react';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children }) => {
    const { user } = useAuth();

    // Formatting role for display
    const getRoleDisplay = (role) => {
        if (!role) return 'Guest';
        if (role === 'MODERATOR') return 'System Moderator';
        if (role === 'OPERATOR') return 'Data Entry Operator';
        if (role === 'SUPER_ADMIN') return 'Super Admin';
        return 'Officer';
    };

    return (

        <div className="min-h-screen bg-slate-50 flex font-sans">
            <Sidebar />
            <div className="flex-1 transition-all duration-300 relative min-w-0">
                {/* Decorative background element */}
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-kota-100/50 rounded-full blur-3xl pointer-events-none -z-10"></div>

                {/* Top Header */}
                <header className="bg-white/80 backdrop-blur-md px-8 py-4 sticky top-0 z-40 border-b border-gray-200/50 flex justify-between items-center transition-all">
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">Overview</h2>
                        <p className="text-xs text-slate-500 font-medium">Welcome back to the control center</p>
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="relative p-2.5 text-slate-400 hover:text-kota-600 hover:bg-kota-50 rounded-xl transition-all duration-300 group">
                            <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        </button>

                        <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name || 'User'}</p>
                                <p className="text-[10px] uppercase font-black tracking-widest text-kota-600">{getRoleDisplay(user?.role)}</p>
                            </div>
                            <div className="relative group cursor-pointer">
                                <div className="absolute inset-0 bg-kota-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random&color=fff&bold=true`}
                                    alt="Profile"
                                    className="h-11 w-11 rounded-full border-2 border-white shadow-sm relative z-10"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="w-full p-2 md:p-4 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
