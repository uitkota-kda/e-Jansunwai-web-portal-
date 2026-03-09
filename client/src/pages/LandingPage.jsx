import React, { useState } from 'react';
import { MessageCircle, Search, FileText, ArrowRight, HelpCircle, Phone, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ServiceCard = ({ icon: Icon, title, description, to, color, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer group flex flex-col items-start h-full"
    >
        <div className={`p-3 rounded-xl ${color.bg} ${color.text} mb-4 group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-4 flex-grow">{description}</p>

        {to ? (
            <Link to={to} className={`flex items-center font-semibold text-sm ${color.text} hover:opacity-80`}>
                Open Service <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
        ) : (
            <span className={`flex items-center font-semibold text-sm ${color.text}`}>
                Access Now <ArrowRight className="w-4 h-4 ml-1" />
            </span>
        )}
    </div>
);

const LandingPage = () => {
    const navigate = useNavigate();
    const [trackId, setTrackId] = useState('');

    const handleTrack = () => {
        if (trackId.trim()) {
            navigate(`/track?id=${trackId}`);
        } else {
            navigate('/track');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 mt-8 px-4">
            {/* Citizen Panel Hero */}
            <div className="bg-gradient-to-r from-kota-900 to-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>

                <div className="relative z-10 max-w-2xl">
                    <span className="bg-kota-500/30 text-kota-100 text-xs font-bold px-3 py-1 rounded-full border border-kota-500/50 uppercase tracking-widest mb-4 inline-block">
                        Citizen Services Portal
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                        <span className="text-kota-200">We are here to</span> <span className="text-white">Heal & Help</span>.
                    </h1>
                    <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                        Welcome to the Kota Development Authority's public grievance redressal system.
                        Efficient, transparent, and bound by time.
                    </p>

                    <div className="bg-white/10 p-1.5 rounded-xl inline-flex backdrop-blur-md border border-white/20 w-full max-w-md">
                        <input
                            type="text"
                            value={trackId}
                            onChange={(e) => setTrackId(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                            placeholder="Enter Grievance Reference No."
                            className="bg-transparent text-white placeholder-slate-400 outline-none px-4 py-2 w-full"
                        />
                        <button
                            onClick={handleTrack}
                            className="bg-white text-kota-900 px-6 py-2 rounded-lg font-bold hover:bg-slate-100 transition-colors flex items-center"
                        >
                            Track <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Services Grid */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Globe className="w-6 h-6 mr-3 text-kota-600" /> Online Services
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ServiceCard
                        title="File New Grievance"
                        description="Submit a new complaint regarding Sanitation, Lighting, Engineering, or other civic issues."
                        icon={FileText}
                        to="/submit"
                        color={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
                    />
                    <ServiceCard
                        title="Quick Status Track"
                        description="Check the real-time progress of your submitted application using your reference ID."
                        icon={Search}
                        to="/track"
                        color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
                    />
                    <ServiceCard
                        title="Guidelines & FAQ"
                        description="Understand the grievance redressal process, timelines, and escalation matrix."
                        icon={HelpCircle}
                        to="/guidelines" // Assuming we might make this later, or just a placeholder for now
                        color={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
                    />
                    <ServiceCard
                        title="Contact Control Room"
                        description="Emergency contact numbers and helpline for urgent civic issues."
                        icon={Phone}
                        color={{ bg: 'bg-orange-50', text: 'text-orange-600' }}
                    />
                </div>
            </div>

            {/* Process Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                    <span className="text-kota-600 font-bold tracking-wider text-sm uppercase mb-2 block">Transparency First</span>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">How it works?</h3>
                    <ul className="space-y-4">
                        {[
                            'Submit grievance via Web Portal.',
                            'Receive a unique Tracking ID instantly.',
                            'Concerned Officer files action taken report within 7 days.',
                            'If not resolved, auto-escalation to senior officials.',
                            'Option for Video Hearing if unsatisfied with resolution.'
                        ].map((step, i) => (
                            <li key={i} className="flex items-start">
                                <div className="bg-white border border-gray-200 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 mr-3 mt-0.5 shadow-sm">
                                    {i + 1}
                                </div>
                                <span className="text-gray-600">{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default LandingPage;
