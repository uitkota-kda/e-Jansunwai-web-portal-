import React, { useState } from 'react';
import { X, Video, Calendar, Clock, Copy, Link as LinkIcon } from 'lucide-react';
import { sendMockWhatsApp } from '../layout/MockWhatsApp';

const ScheduleVCModal = ({ grievance, onClose, onSuccess }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [scheduling, setScheduling] = useState(false);

    const handleSchedule = async (e) => {
        e.preventDefault();
        setScheduling(true);

        const meetingId = `KDA-${grievance.grievanceId}-${Date.now().toString().slice(-4)}`;
        const link = `${window.location.origin}/hearing/${meetingId}`;

        const tokenData = localStorage.getItem('kda_user');
        const tokenToken = tokenData ? JSON.parse(tokenData) : null;
        const token = tokenToken?.token;
        const userName = tokenToken?.name || 'Officer';

        // Check if this is a "Satisfaction VC" (Unsatisfied citizen) or a regular hearing
        const isSatisfactionVC = ['UNSATISFIED', 'RESOLVED'].includes(grievance.status) &&
            (grievance.satisfactionStatus === 'NOT_SATISFIED' || grievance.satisfactionStatus === 'VC_SCHEDULED_SO');

        try {
            let url, method, body;

            if (isSatisfactionVC) {
                // Use the dedicated satisfaction VC endpoint
                url = `http://localhost:3000/api/grievances/${grievance.id}/schedule-vc`;
                method = 'POST';
                body = JSON.stringify({
                    date: date + 'T' + time,
                    link: link,
                    level: 'SO',
                    performedBy: userName
                });
            } else {
                // Use regular grievance update for normal hearings
                url = `http://localhost:3000/api/grievances/${grievance.id}`;
                method = 'PUT';
                body = JSON.stringify({
                    hearingDate: date,
                    hearingTime: time,
                    hearingLink: link,
                    performedBy: userName
                });
            }

            console.log(`Scheduling VC (${isSatisfactionVC ? 'Satisfaction' : 'Regular'}):`, url);

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to schedule');

            if (data.success) {
                setGeneratedLink(link);
                const msg = `VC_SCHEDULED:::${grievance.grievanceId}:::${date} at ${time}:::${link}`;
                sendMockWhatsApp(msg);
                if (onSuccess) onSuccess();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (err) {
            console.error('VC SCHEDULING ERROR:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setScheduling(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        alert('Meeting link copied to clipboard!');
    };

    return (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/60 backdrop-blur-sm">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}></div>

                <div className="relative transform overflow-hidden rounded-[1.5rem] bg-white text-left shadow-2xl transition-all sm:my-4 w-full max-w-4xl h-[90vh] flex flex-col animate-scale-in border border-white/20">
                    <div className="bg-kota-900 px-6 py-4 rounded-t-2xl flex justify-between items-center text-white">
                        <div className="flex items-center space-x-2">
                            <Video className="w-5 h-5" />
                            <h3 className="text-lg font-bold">Schedule Video Hearing</h3>
                        </div>
                        <button onClick={onClose} className="text-kota-300 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                        {!generatedLink ? (
                            <form onSubmit={handleSchedule} className="space-y-4">
                                <div className="bg-blue-50 p-3 rounded-lg text-blue-800 text-sm">
                                    Scheduling VC for <strong>{grievance.grievanceId}</strong>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-kota-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="time"
                                            required
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-kota-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={scheduling}
                                    className="w-full bg-kota-600 text-white font-bold py-3 rounded-xl hover:bg-kota-700 transition-colors shadow-lg flex items-center justify-center"
                                >
                                    {scheduling ? 'Scheduling...' : 'Generate Meeting Link'}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-6 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                                    <LinkIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">Meeting Scheduled!</h4>
                                    <p className="text-gray-500 text-sm mt-1">Notification sent to citizen via WhatsApp.</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 break-all">
                                    <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="text-kota-600 font-medium text-sm hover:underline">{generatedLink}</a>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
                                    >
                                        <Copy className="w-4 h-4 mr-2" /> Copy Link
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="flex-1 bg-kota-600 text-white font-bold py-3 rounded-xl hover:bg-kota-700 transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleVCModal;
