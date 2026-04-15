import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, ArrowRight, Shield, Briefcase, Terminal, Fingerprint } from 'lucide-react';

const roleConfig = {
    ADMIN: {
        id: 'ADMIN',
        label: 'Super Admin',
        title: 'KDA Headquarters',
        subtitle: 'Master Control & User Management',
        color: 'from-kota-900 to-kota-700',
        btnColor: 'bg-kota-600 hover:bg-kota-700 shadow-kota-200',
        icon: Shield
    },
    COMMISSIONER: {
        id: 'COMMISSIONER',
        label: 'Commissioner',
        title: 'Commissioner Office',
        subtitle: 'High Level Monitoring & Review',
        color: 'from-purple-900 to-purple-700',
        btnColor: 'bg-purple-600 hover:bg-purple-700 shadow-purple-200',
        icon: Briefcase
    },
    MODERATOR: {
        id: 'MODERATOR',
        label: 'Moderator',
        title: 'Moderator Access',
        subtitle: 'Grievance Review & Assignment',
        color: 'from-kota-900 to-kota-700',
        btnColor: 'bg-kota-600 hover:bg-kota-700 shadow-kota-200',
        icon: Shield
    },
    OFFICIALS: {
        id: 'OFFICIALS',
        label: 'Officials',
        title: 'Departmental Officials',
        subtitle: 'Directors & Deputy Commissioners',
        color: 'from-kota-900 to-kota-700',
        btnColor: 'bg-kota-600 hover:bg-kota-700 shadow-kota-200',
        icon: Briefcase
    },
    ZONES: {
        id: 'ZONES',
        label: 'Zones Login',
        title: 'Executive Engineers',
        subtitle: 'Zone Level Grievance Redressal',
        color: 'from-kota-900 to-kota-700',
        btnColor: 'bg-kota-600 hover:bg-kota-700 shadow-kota-200',
        icon: Briefcase
    },
    REVENUE: {
        id: 'REVENUE',
        label: 'Revenue Login',
        title: 'Revenue Officials',
        subtitle: 'TDR & AAO Revenue Desk',
        color: 'from-kota-900 to-kota-700',
        btnColor: 'bg-kota-600 hover:bg-kota-700 shadow-kota-200',
        icon: Briefcase
    },
    PLANNING: {
        id: 'PLANNING',
        label: 'Planning Login',
        title: 'Planning Officials',
        subtitle: 'DTP & ATP Team',
        color: 'from-kota-900 to-kota-700',
        btnColor: 'bg-kota-600 hover:bg-kota-700 shadow-kota-200',
        icon: Briefcase
    },
    LEGAL: {
        id: 'LEGAL',
        label: 'Legal Login',
        title: 'Legal Team',
        subtitle: 'DLR, SLO & JLO Desk',
        color: 'from-kota-900 to-kota-700',
        btnColor: 'bg-kota-600 hover:bg-kota-700 shadow-kota-200',
        icon: Shield
    },
    FINANCE: {
        id: 'FINANCE',
        label: 'Finance Login',
        title: 'Finance Team',
        subtitle: 'Assistant Accounts Officers',
        color: 'from-kota-900 to-kota-700',
        btnColor: 'bg-kota-600 hover:bg-kota-700 shadow-kota-200',
        icon: Briefcase
    },
    OPERATORS: {
        id: 'OPERATORS',
        label: 'Operators',
        title: 'Operator Desk',
        subtitle: 'Physical & Voice Grievance Entry',
        color: 'from-kota-900 to-kota-700',
        btnColor: 'bg-kota-600 hover:bg-kota-700 shadow-kota-200',
        icon: Terminal
    }
};

const LoginPage = ({ defaultRole }) => {
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role');

    // Initialize state from URL if valid, then defaultRole prop, then default to ADMIN
    const [activeRole, setActiveRole] = useState(() => {
        if (roleParam && roleConfig[roleParam]) {
            return roleParam;
        }
        if (defaultRole && roleConfig[defaultRole]) {
            return defaultRole;
        }
        return 'ADMIN';
    });

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, logout, user } = useAuth();
    const navigate = useNavigate();

    // Logout if accessing login page while authenticated (e.g. via Back button)
    useEffect(() => {
        if (user) {
            logout();
        }
    }, []); // Empty dependency array ensures this runs only on mount


    useEffect(() => {
        if (roleParam && roleConfig[roleParam]) {
            setActiveRole(roleParam);
            setError('');
        } else if (defaultRole && roleConfig[defaultRole]) {
            setActiveRole(defaultRole);
            setError('');
        } else {
            // Fallback to default (usually ADMIN) if no specific role is requested
            setActiveRole('ADMIN');
            setError('');
        }
    }, [roleParam, defaultRole]);

    const currentConfig = roleConfig[activeRole];
    const Icon = currentConfig.icon;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(username, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-[calc(100vh-74px)] bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">


            <div className="max-w-md w-full relative z-10 space-y-8">
                {/* Header Information */}
                <div className="text-center animate-fade-in">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Login Portal</h2>
                    <p className="text-slate-500 mt-2 font-medium">Please authenticate to access your professional dashboard</p>
                </div>



                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-scale-in">
                    <div className={`bg-gradient-to-br ${currentConfig.color} p-10 text-white text-center relative transition-all duration-500`}>
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                        <div className="relative z-10 text-center">
                            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-2xl border border-white/20 rotate-3 transition-transform">
                                <Icon className="w-10 h-10 text-white" />
                            </div>
                            <h2 style={{ color: 'white' }} className="text-2xl font-black tracking-tight text-white">{currentConfig.title}</h2>
                            <p style={{ color: 'white', opacity: 0.8 }} className="text-white/80 text-sm mt-2 font-medium">{currentConfig.subtitle}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center animate-shake border border-red-100 font-bold">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></span>
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Authority ID
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-3.5 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-slate-400 group-focus-within:text-kota-600 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-kota-500/10 focus:border-kota-500 transition-all font-bold text-slate-700"
                                    placeholder={`Enter ${activeRole.toLowerCase()} username`}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Passphrase
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-3.5 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-kota-600 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-kota-500/10 focus:border-kota-500 transition-all font-bold text-slate-700"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`w-full ${currentConfig.btnColor} text-white py-4 rounded-2xl font-black transition-all shadow-xl flex items-center justify-center group active:scale-[0.98]`}
                        >
                            <span>Login</span>
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>


                    </form>
                </div>


            </div>
        </div>
    );
};

export default LoginPage;
