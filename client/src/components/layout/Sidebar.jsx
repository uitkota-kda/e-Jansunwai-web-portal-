import React from 'react';
import { LayoutDashboard, FileText, Users, Settings, LogOut, BarChart2, Video, Activity, PlusCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    // Fallback if user is null (shouldn't happen in protected route, but good for safety)
    const getRoleLabel = (role) => {
        if (role === 'MODERATOR') return 'Moderator';
        if (role === 'OPERATOR') return 'Data Entry Operator';
        if (role === 'SUPER_ADMIN') return 'Admin';
        return 'Section Officer';
    };
    const roleDisplay = getRoleLabel(user?.role);
    const nameDisplay = user?.name || 'User';
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ];

    if (user?.role === 'MODERATOR') {
        menuItems.push(
            { name: 'Grievances', icon: FileText, path: '/dashboard/grievances' },
            { name: 'Officers', icon: Users, path: '/dashboard/officers' },
            { name: 'VC Hearings', icon: Video, path: '/dashboard/hearings' },
            { name: 'Reports', icon: FileText, path: '/dashboard/reports' }
        );
    }

    if (user?.role === 'OPERATOR') {
        menuItems.push(
            { name: 'Register Complaint', icon: PlusCircle, path: '/dashboard/submit-grievance' }
        );
    }

    if (user?.role === 'SUPER_ADMIN') {
        menuItems.push(
            { name: 'Users Control', icon: Users, path: '/dashboard/users' },
            { name: 'Grievances', icon: FileText, path: '/dashboard/grievances' },
            { name: 'Reports', icon: BarChart2, path: '/dashboard/reports' }
        );
    }

    // Settings is common for everyone
    menuItems.push({ name: 'Settings', icon: Settings, path: '/dashboard/settings' });

    return (
        <aside className="w-72 bg-kota-950 text-white min-h-screen sticky top-0 h-screen hidden md:flex flex-col border-r border-white/5 shadow-2xl relative z-50 shrink-0">
            {/* Background Gradient Mesh */}
            <div className="absolute top-0 -left-20 w-64 h-64 bg-kota-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="p-8 border-b border-white/5 relative z-10">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-kota-400 to-kota-600 flex items-center justify-center text-white font-display font-bold text-xl shadow-lg shadow-kota-500/30">
                            {nameDisplay.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-kota-950 rounded-full"></div>
                    </div>
                    <div>
                        <h4 className="font-display font-bold text-white tracking-wide text-lg leading-tight">{nameDisplay}</h4>
                        <p className="text-xs text-kota-300 uppercase tracking-widest font-medium mt-1">{roleDisplay}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto relative z-10 custom-scrollbar">
                <p className="px-4 text-xs font-bold text-kota-400 uppercase tracking-widest mb-4">Main Menu</p>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-gradient-to-r from-kota-600 to-kota-500 text-white shadow-lg shadow-kota-500/25 border border-white/10'
                                : 'text-kota-100/70 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-kota-400 group-hover:text-white'}`} />
                            <span className="font-medium tracking-wide text-sm">{item.name}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5 relative z-10">
                <div className="bg-kota-900/50 rounded-2xl p-4 mb-4 border border-white/5">
                    <p className="text-xs text-kota-300 mb-2">System Status</p>
                    <div className="flex items-center space-x-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-bold text-green-400">Online</span>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center px-6 py-3 text-red-400 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all duration-300 group"
                >
                    <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
