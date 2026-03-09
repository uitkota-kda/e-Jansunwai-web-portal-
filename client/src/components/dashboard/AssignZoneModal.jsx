import { API_BASE_URL } from '../../config';

import React, { useState, useEffect } from 'react';
import {
    ENGINEERING_ZONES,
    REVENUE_ZONES,
    PLANNING_ZONES,
    LEGAL_ZONES,
    FINANCE_ZONES
} from '../../constants';
import { useAuth } from '../../context/AuthContext';

const AssignZoneModal = ({ grievance, onClose, onAssign }) => {
    const { user } = useAuth();
    const [selectedZone, setSelectedZone] = useState('');
    const [note, setNote] = useState('');
    const [expectedDate, setExpectedDate] = useState('');
    const [officials, setOfficials] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAssignmentConfig = (user) => {
        const section = user?.section || '';

        if (section === 'Director Engineering') {
            return {
                zones: ENGINEERING_ZONES,
                role: 'EXECUTIVE_ENGINEER',
                title: 'Executive Engineer',
                label: 'Officer/Area'
            };
        }
        if (['Deputy commissioner I', 'Deputy commissioner II'].includes(section)) {
            return {
                zones: REVENUE_ZONES,
                role: 'REVENUE_OFFICIAL',
                title: 'Tehsildar',
                label: 'Officer/Area'
            };
        }
        if (section === 'Director Planning') {
            return {
                zones: PLANNING_ZONES,
                role: 'PLANNING_OFFICIAL',
                title: 'Planning Official',
                label: 'Officer/Area'
            };
        }
        if (section === 'Director Legal') {
            return {
                zones: LEGAL_ZONES,
                role: 'LEGAL_OFFICIAL',
                title: 'Legal Official',
                label: 'Officer/Area'
            };
        }
        if (section === 'Director Finance') {
            return {
                zones: FINANCE_ZONES,
                role: 'FINANCE_OFFICIAL',
                title: 'Finance Official',
                label: 'Officer/Area'
            };
        }
        // Default Fallback
        return {
            zones: [],
            role: '',
            title: 'Official',
            label: 'Officer/Area'
        };
    };

    const config = getAssignmentConfig(user);

    useEffect(() => {
        const fetchOfficials = async () => {
            if (!config.role) return;
            try {
                const tokenData = localStorage.getItem('kda_user');
                const token = tokenData ? JSON.parse(tokenData).token : null;

                const response = await fetch(`${API_BASE_URL}/users/role/${config.role}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setOfficials(result.data);
                }
            } catch (err) {
                console.error('Error fetching officials:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOfficials();
    }, [config.role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        onAssign(grievance.id, selectedZone, note, expectedDate);
    };

    return (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/60 backdrop-blur-sm">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}></div>

                <div className="relative transform overflow-hidden rounded-[1.5rem] bg-white text-left shadow-2xl transition-all sm:my-4 w-full max-w-4xl h-[94vh] flex flex-col animate-scale-in border border-white/20">
                    <div className="p-6 border-b border-gray-100 bg-[#1e293b] text-white">
                        <h3 className="text-xl font-bold">Assign to {config.title}</h3>
                        <p className="text-slate-400 text-sm mt-1 uppercase tracking-wider font-bold">Grievance #{grievance.grievanceId}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Target {config.label}</label>
                            <select
                                required
                                value={selectedZone}
                                onChange={(e) => setSelectedZone(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                            >
                                <option value="">-- Select {config.title} --</option>
                                {config.zones.map(z => {
                                    const official = officials.find(o => o.zone === z);
                                    return (
                                        <option key={z} value={z}>
                                            {z} {official ? `(${official.name})` : '(Vacant/Auto)'}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Expected Disposal Date</label>
                            <input
                                type="date"
                                required
                                min={new Date().toLocaleDateString('en-CA')} // en-CA gives YYYY-MM-DD
                                value={expectedDate}
                                onChange={(e) => setExpectedDate(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Instruction / Director's Note</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows="4"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                                placeholder={`Add any specific instructions for the ${config.title}...`}
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!selectedZone || !expectedDate}
                                className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95 text-sm"
                            >
                                Confirm Assignment
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignZoneModal;
