import React, { useState } from 'react';
import { Video, Calendar, Clock, User, Link as LinkIcon, ExternalLink, Plus } from 'lucide-react';
import ScheduleVCModal from '../../components/dashboard/ScheduleVCModal';

const VCHearingsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock Data for Scheduled Hearings
    const [hearings, setHearings] = useState([]);

    React.useEffect(() => {
        fetch('http://localhost:3000/api/grievances')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Filter grievances that have a hearing link
                    const scheduledHearings = data.data.filter(g => g.hearingLink);
                    setHearings(scheduledHearings);
                }
            })
            .catch(err => console.error('Failed to fetch hearings:', err));
    }, [isModalOpen]); // Refresh when modal closes if opened here, or polling

    const handleScheduleNew = () => {
        // In a real app, you'd select a grievance first. 
        // For this demo, we'll open the modal with a placeholder or require selection from the complaints list.
        // Or simpler: Open a modal that lets you type the ID.
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Video Hearings</h1>
                    <p className="text-gray-500">Manage digital jan-sunwai sessions</p>
                </div>
                {/* <button onClick={handleScheduleNew} className="bg-kota-600 text-white px-4 py-2 rounded-lg font-bold flex items-center hover:bg-kota-700 transition-colors">
                    <Plus className="w-5 h-5 mr-2" /> Schedule New
                </button> */}
            </div>

            {/* Upcoming Hearings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                        <Video className="w-5 h-5 mr-2 text-kota-500" /> Upcoming Sessions
                    </h3>
                    <div className="space-y-4">
                        {hearings.filter(h => h.hearingLink).map(hearing => (
                            <div key={hearing.id} className="p-4 border border-gray-100 rounded-lg hover:border-kota-200 transition-colors bg-gray-50">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">
                                            {hearing.grievanceId}
                                        </span>
                                        <h4 className="font-bold text-gray-900 mt-1">{hearing.name}</h4>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="w-3 h-3 mr-1" /> {hearing.hearingDate}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 mt-1 justify-end">
                                            <Clock className="w-3 h-3 mr-1" /> {hearing.hearingTime}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Hosted via Jitsi Meet</span>
                                    <a
                                        href={hearing.hearingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-sm font-bold text-kota-600 hover:text-kota-800"
                                    >
                                        Join Meeting <ExternalLink className="w-4 h-4 ml-1" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Past/History */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-gray-500" /> Past Hearings
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 font-semibold">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Applicant</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {hearings.filter(h => h.status === 'RESOLVED').map(hearing => (
                                    <tr key={hearing.id}>
                                        <td className="px-4 py-3 font-medium">{hearing.grievanceId}</td>
                                        <td className="px-4 py-3">{hearing.name}</td>
                                        <td className="px-4 py-3">{hearing.hearingDate}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-green-600 font-bold text-xs flex items-center">
                                                Completed
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default VCHearingsPage;
