import React, { useState, useRef, useEffect } from 'react';
import { Home, ChevronDown, Shield, Briefcase, Terminal, LayoutDashboard, Settings, UserCircle, Globe, Wallet, Scale, Map, Landmark } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsLoginOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const loginGroups = [
        {
            title: 'Management',
            items: [
                { id: 'COMMISSIONER', label: 'Commissioner', icon: Briefcase, color: 'text-kota-600', bg: 'bg-kota-50' },
                { id: 'ADMIN', label: 'Super Admin', icon: Settings, color: 'text-kota-600', bg: 'bg-kota-50' },
                { id: 'MODERATOR', label: 'Moderator', icon: Shield, color: 'text-kota-600', bg: 'bg-kota-50' },
                { id: 'OPERATORS', label: 'Operator Desk', icon: Terminal, color: 'text-kota-600', bg: 'bg-kota-50' },
            ]
        },
        {
            title: 'Departmental',
            items: [
                { id: 'OFFICIALS', label: 'Directors / DCs', icon: UserCircle, color: 'text-kota-600', bg: 'bg-kota-50' },
                { id: 'REVENUE', label: 'Revenue/Sale', icon: Wallet, color: 'text-kota-600', bg: 'bg-kota-50' },
                { id: 'PLANNING', label: 'Planning Login', icon: Map, color: 'text-kota-600', bg: 'bg-kota-50' },
                { id: 'LEGAL', label: 'Legal Login', icon: Scale, color: 'text-kota-600', bg: 'bg-kota-50' },
                { id: 'FINANCE', label: 'Finance Login', icon: Landmark, color: 'text-kota-600', bg: 'bg-kota-50' },
                { id: 'ZONES', label: 'Zones (EE/JE)', icon: Globe, color: 'text-kota-600', bg: 'bg-kota-50' },
            ]
        }
    ];

    const handleRoleSelect = (roleId) => {
        navigate(`/login?role=${roleId}`);
        setIsLoginOpen(false);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled
                    ? 'bg-white/80 backdrop-blur-xl border-white/20 shadow-lg py-2'
                    : 'bg-white/0 border-transparent py-4'
                }`}
        >
            <div className="w-full px-6 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-3 group relative">
                    <div className="absolute inset-0 bg-kota-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img src="/logo.png" alt="KDA Logo" className="h-10 w-auto object-contain relative z-10" />
                    <div className="relative z-10 flex flex-col">
                        <h1 className="text-xl font-black text-kota-900 leading-none tracking-tight font-display group-hover:text-kota-600 transition-colors">
                            Kota Development Authority
                        </h1>
                        <p className="text-[10px] text-kota-600 font-black uppercase tracking-[0.2em] mt-0.5">e-Jansunwai Portal</p>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center space-x-1">
                    <Link to="/" className="flex items-center text-slate-600 hover:text-kota-700 font-semibold px-4 py-2 rounded-xl hover:bg-kota-50 transition-all text-sm">
                        <Home className="w-4 h-4 mr-2" />
                        <span>Home</span>
                    </Link>
                    <Link to="/track" className="text-slate-600 hover:text-kota-700 font-semibold px-4 py-2 rounded-xl hover:bg-kota-50 transition-all text-sm">
                        Track Status
                    </Link>

                    {/* Portal Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsLoginOpen(!isLoginOpen)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${isLoginOpen ? 'bg-kota-900 text-white shadow-lg' : 'text-slate-600 hover:bg-kota-50 hover:text-kota-700'
                                }`}
                        >
                            <LayoutDashboard className={`w-4 h-4 ${isLoginOpen ? 'text-white' : 'text-kota-600'}`} />
                            <span>Departmental Login</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLoginOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isLoginOpen && (
                            <div className="absolute right-0 mt-3 w-[480px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-in origin-top-right ring-1 ring-black/5">
                                <div className="p-4 grid grid-cols-2 gap-6 bg-slate-50/50">
                                    {loginGroups.map((group, idx) => (
                                        <div key={idx}>
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center">
                                                <span className="w-1.5 h-1.5 rounded-full bg-kota-400 mr-2"></span>
                                                {group.title}
                                            </h3>
                                            <div className="space-y-1">
                                                {group.items.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => handleRoleSelect(item.id)}
                                                        className="w-full flex items-center p-2.5 rounded-xl hover:bg-white hover:shadow-md transition-all group text-left"
                                                    >
                                                        <div className={`w-8 h-8 ${item.bg} ${item.color} rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-sm`}>
                                                            <item.icon className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-700 group-hover:text-kota-700 transition-colors">
                                                                {item.label}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-medium capitalize">
                                                                {item.id.toLowerCase()} access
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Link to="/submit" className="btn-primary shadow-kota-500/30 hover:shadow-kota-500/50 ml-2">
                        Submit Grievance
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
