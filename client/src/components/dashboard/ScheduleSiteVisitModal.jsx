import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Clock, Send, AlertCircle } from 'lucide-react';
import { sendMockWhatsApp } from '../layout/MockWhatsApp';

const ScheduleSiteVisitModal = ({ isOpen, onClose, grievances, initialGrievance, onScheduleSuccess }) => {
    const [selectedId, setSelectedId] = useState(initialGrievance?.grievanceId || '');
    const [visitDate, setVisitDate] = useState('');
    const [visitTime, setVisitTime] = useState('');
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (initialGrievance) {
            setSelectedId(initialGrievance.grievanceId);
        }
    }, [initialGrievance]);

    if (!isOpen) return null;

    const pendingGrievances = grievances.filter(g =>
        g.status === 'PENDING' ||
        g.status === 'IN_PROGRESS' ||
        g.status === 'ESCALATED' ||
        g.status === 'REOPENED'
    );

    const handleSchedule = async (e) => {
        e.preventDefault();
        if (!selectedId) {
            alert('Please select a grievance first');
            return;
        }

        setLoading(true);
        try {
            // Find the full grievance object
            const grievance = grievances.find(g => g.grievanceId === selectedId);
            if (!grievance) throw new Error('Selected grievance not found in list');

            const tokenData = localStorage.getItem('kda_user');
            const token = tokenData ? JSON.parse(tokenData).token : null;

            const response = await fetch(`http://localhost:3000/api/grievances/${grievance.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'IN_PROGRESS',
                    remarks: `SITE VISIT SCHEDULED: ${visitDate} at ${visitTime}. ${remarks}`,
                    userId: 'Officer Workstation'
                })
            });

            const data = await response.json();
            if (data.success) {
                sendMockWhatsApp(`Namaste! A site visit for your grievance ${selectedId} has been scheduled for ${visitDate} at ${visitTime}. Our team will contact you. - KDA`);
                setSuccess(true);
                if (onScheduleSuccess) onScheduleSuccess();
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    // Reset form
                    setSelectedId('');
                    setVisitDate('');
                    setVisitTime('');
                    setRemarks('');
                }, 2000);
            } else {
                alert('Failed to schedule visit: ' + data.message);
            }
        } catch (error) {
            console.error('Error scheduling site visit:', error);
            alert('Error connecting to server. Please ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-2 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-[95vw] h-[94vh] shadow-2xl animate-fade-in-up overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-emerald-600 px-8 py-6 flex justify-between items-center text-white">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Schedule Site Visit</h3>
                            <p className="text-emerald-100 text-sm">On-site verification planning</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {success ? (
                    <div className="p-12 text-center space-y-4">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                            <Send className="w-10 h-10" />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900">Visit Scheduled!</h4>
                        <p className="text-gray-500">The notification has been sent via WhatsApp.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSchedule} className="p-8 space-y-6 overflow-y-auto flex-1">
                        {/* Select Grievance */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Select Grievance</label>
                            {initialGrievance ? (
                                <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-700 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2 text-emerald-600" />
                                    {initialGrievance.grievanceId} - {initialGrievance.category}
                                </div>
                            ) : (
                                <select
                                    required
                                    value={selectedId}
                                    onChange={(e) => setSelectedId(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 font-bold text-gray-700"
                                >
                                    <option value="">-- Choose a Pending Task --</option>
                                    {pendingGrievances.map(g => (
                                        <option key={g.id} value={g.grievanceId}>
                                            {g.grievanceId} | {g.category} Issue ({g.name})
                                        </option>
                                    ))}
                                </select>
                            )}
                            {pendingGrievances.length === 0 && !initialGrievance && (
                                <p className="text-xs text-red-500 mt-2 font-medium">No pending grievances available for site visit.</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" /> Visit Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={visitDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setVisitDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 font-medium"
                                />
                            </div>

                            {/* Time */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-gray-400" /> Visit Time
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={visitTime}
                                    onChange={(e) => setVisitTime(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 font-medium"
                                />
                            </div>
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Instructions for Team</label>
                            <textarea
                                rows="3"
                                value={remarks}
                                maxLength={250}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 resize-none font-medium"
                                placeholder="E.g., Take photos of the road cracks, talk to local residents..."
                            ></textarea>
                            <p className={`text-xs text-right mt-1 ${remarks.length >= 250 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                {remarks.length} / 250 characters
                            </p>
                        </div>

                        <div className="bg-amber-50 p-4 rounded-xl flex items-start space-x-3 border border-amber-100 text-amber-800">
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] leading-relaxed">
                                <strong>System Note:</strong> Confirming this will move the status to <strong>In Progress</strong> and notify the applicant instantly.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || (!selectedId && !initialGrievance)}
                            className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    <span>CONFIRM SCHEDULE</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ScheduleSiteVisitModal;
