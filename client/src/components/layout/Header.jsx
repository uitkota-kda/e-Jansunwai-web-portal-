import React, { useState, useRef, useEffect } from 'react';
import { Home, ChevronDown, Shield, Briefcase, Terminal, LayoutDashboard, Settings, UserCircle, Globe, Wallet, Scale, Map, Landmark, Menu, X, PlusCircle, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSubmenuOpen, setIsMobileSubmenuOpen] = useState(false);
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

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setIsMobileSubmenuOpen(false); // Reset submenu state when closing main menu
        }
    }, [isMobileMenuOpen]);

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
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Header Bar */}
            <header
                className={`fixed top-0 left-0 right-0 z-[120] transition-all duration-500 border-b ${isScrolled || isMobileMenuOpen
                    ? 'bg-white border-slate-200/60 shadow-xl py-2'
                    : 'bg-white/0 border-transparent py-4'
                    }`}
            >
                <div className="w-full px-4 lg:px-8 flex justify-between items-center max-w-[1600px] mx-auto">
                    <Link
                        to="/"
                        className="flex items-center space-x-2 lg:space-x-3 group relative transition-transform active:scale-95 z-[130]"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <div className="absolute -inset-2 bg-kota-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <img src="/logo.png" alt="KDA Logo" className="h-8 lg:h-10 w-auto object-contain relative z-10 transition-transform duration-500 group-hover:rotate-6" />
                        <div className="relative z-10 flex flex-col">
                            <h1 className="text-base lg:text-xl font-black text-kota-950 leading-none tracking-tight font-display group-hover:text-kota-600 transition-colors duration-300">
                                Kota Development Authority
                            </h1>
                            <p className="text-[8px] lg:text-[10px] text-kota-600 font-black uppercase tracking-[0.2em] mt-0.5 opacity-80">e-Jansunwai Portal</p>
                        </div>
                    </Link>

                    {/* Mobile Toggle Button */}
                    <div className="lg:hidden relative z-[130]">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 ${isMobileMenuOpen ? 'bg-kota-900 text-white rotate-90 shadow-lg' : 'bg-kota-50 text-kota-600 hover:bg-kota-100'
                                }`}
                            aria-label="Toggle Menu"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-1">
                        <Link to="/" className="flex items-center text-slate-600 hover:text-kota-700 font-bold px-4 py-2.5 rounded-xl hover:bg-kota-50 transition-all text-sm group">
                            <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            <span>Home</span>
                        </Link>
                        <Link to="/track" className="flex items-center text-slate-600 hover:text-kota-700 font-bold px-4 py-2.5 rounded-xl hover:bg-kota-50 transition-all text-sm group">
                            <Search className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            <span>Track Status</span>
                        </Link>

                        {/* Portal Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsLoginOpen(!isLoginOpen)}
                                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${isLoginOpen
                                    ? 'bg-kota-900 text-white shadow-xl shadow-kota-900/20'
                                    : 'text-slate-600 hover:bg-kota-50 hover:text-kota-700'
                                    }`}
                            >
                                <LayoutDashboard className={`w-4 h-4 ${isLoginOpen ? 'text-white' : 'text-kota-600'}`} />
                                <span>Departmental Login</span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${isLoginOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isLoginOpen && (
                                <div className="absolute right-0 mt-4 w-[520px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-scale-in origin-top-right ring-1 ring-black/5 z-[60]">
                                    <div className="p-6 grid grid-cols-2 gap-8 bg-slate-50/50">
                                        {loginGroups.map((group, idx) => (
                                            <div key={idx}>
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center">
                                                    <span className="w-2 h-2 rounded-full bg-kota-500 mr-2 shadow-sm shadow-kota-500/50"></span>
                                                    {group.title}
                                                </h3>
                                                <div className="space-y-1.5">
                                                    {group.items.map((item) => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => handleRoleSelect(item.id)}
                                                            className="w-full flex items-center p-3 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group text-left border border-transparent hover:border-slate-100"
                                                        >
                                                            <div className={`w-9 h-9 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                                                <item.icon className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-800 group-hover:text-kota-700 transition-colors">
                                                                    {item.label}
                                                                </div>
                                                                <div className="text-[10px] text-slate-400 font-semibold group-hover:text-slate-500">
                                                                    {item.id === 'OFFICIALS' ? 'Internal Access' : `${item.id.toLowerCase()} portal`}
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
                    </nav>
                </div>
            </header>

            {/* Mobile Menu Full Screen Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-white z-[110] lg:hidden flex flex-col pt-[88px] animate-fade-in overflow-hidden h-screen">
                    <div className="absolute top-[10%] -right-20 w-80 h-80 bg-kota-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide min-h-0 relative z-10">
                        <div className="max-w-md mx-auto space-y-8 pb-32">
                            {/* Navigation Section */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 px-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Navigation</span>
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { to: "/", icon: Home, label: "Home", color: "text-blue-600", bg: "bg-blue-50" },
                                        { to: "/track", icon: Search, label: "Track Status", color: "text-emerald-600", bg: "bg-emerald-50" }
                                    ].map((item, id) => (
                                        <Link
                                            key={id}
                                            to={item.to}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center p-4 rounded-2xl bg-slate-50 border border-slate-100/50 text-slate-800 font-bold active:scale-[0.98] transition-all animate-fade-in-up"
                                            style={{ animationDelay: `${id * 100}ms` }}
                                        >
                                            <div className={`w-11 h-11 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mr-4 shadow-sm relative overflow-hidden`}>
                                                <div className="absolute inset-0 bg-white/50"></div>
                                                <item.icon className="w-5.5 h-5.5 relative z-10" />
                                            </div>
                                            <span className="text-[17px] tracking-tight">{item.label}</span>
                                            <ChevronDown className="-rotate-90 ml-auto w-5 h-5 text-slate-300" />
                                        </Link>
                                    ))}

                                    {/* Departmental Login Accordion */}
                                    <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                                        <button
                                            onClick={() => setIsMobileSubmenuOpen(!isMobileSubmenuOpen)}
                                            className={`w-full flex items-center p-4 rounded-2xl border transition-all duration-300 active:scale-[0.98] ${isMobileSubmenuOpen
                                                ? 'bg-kota-900 text-white border-kota-800 shadow-[0_10px_40px_-10px_rgba(var(--kota-900),0.5)]'
                                                : 'bg-slate-50 border-slate-100/50 text-slate-800 font-bold hover:bg-slate-100'
                                                }`}
                                        >
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mr-4 shadow-sm transition-colors duration-300 ${isMobileSubmenuOpen ? 'bg-white/20' : 'bg-kota-50 text-kota-600'}`}>
                                                <LayoutDashboard className="w-5.5 h-5.5" />
                                            </div>
                                            <span className="text-[17px] tracking-tight">Departmental Login</span>
                                            <ChevronDown className={`ml-auto w-5.5 h-5.5 transition-transform duration-500 ${isMobileSubmenuOpen ? 'rotate-180 text-white/70' : 'text-slate-400'}`} />
                                        </button>

                                        {/* Accordion Content */}
                                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isMobileSubmenuOpen ? 'max-h-[1000px] opacity-100 mt-3 visible' : 'max-h-0 opacity-0 invisible'}`}>
                                            <div>
                                                <div className="space-y-6 bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                                    {loginGroups.map((group, groupIdx) => (
                                                        <div key={groupIdx} className="space-y-3">
                                                            <div className="flex items-center space-x-3 mb-4">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-kota-500 shadow-[0_0_10px_rgba(var(--kota-500),0.5)]"></div>
                                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{group.title}</span>
                                                                <div className="h-px bg-slate-100 flex-1"></div>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {group.items.map((item, itemIdx) => (
                                                                    <button
                                                                        key={item.id}
                                                                        onClick={() => handleRoleSelect(item.id)}
                                                                        className="w-full flex items-center p-3 rounded-2xl bg-slate-50/50 hover:bg-kota-50 active:bg-kota-100 border border-transparent hover:border-kota-200 active:scale-[0.98] transition-all duration-200 text-left group"
                                                                    >
                                                                        <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mr-4 shadow-sm bg-white group-hover:scale-110 transition-transform duration-300`}>
                                                                            <item.icon className="w-4.5 h-4.5" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="text-[14px] font-bold text-slate-900 group-hover:text-kota-800 transition-colors">{item.label}</div>
                                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 group-hover:text-kota-500 transition-colors">
                                                                                {item.id.replace('_', ' ')} Portal
                                                                            </div>
                                                                        </div>
                                                                        <ChevronDown className="-rotate-90 w-4 h-4 text-slate-300 group-hover:text-kota-400 group-hover:translate-x-1 transition-all" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border border-slate-200/50 text-center space-y-2 animate-fade-in-up relative overflow-hidden" style={{ animationDelay: '500ms' }}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-kota-400 to-kota-600"></div>
                                <p className="text-[10px] text-kota-600 font-black uppercase tracking-[0.2em]">Need Help?</p>
                                <p className="text-xl font-black text-slate-900 tracking-tight">1800-123-4567</p>
                                <p className="text-[10px] text-slate-500 font-bold">Toll Free Support | 10AM - 6PM</p>
                            </div>

                            {/* Footer in Menu */}
                            <div className="text-center space-y-1.5 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">2026 Kota Development Authority. All Rights Reserved.</p>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
