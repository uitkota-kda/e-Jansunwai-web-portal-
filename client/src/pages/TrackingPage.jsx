import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, AlertTriangle, ArrowRight, Video } from 'lucide-react';

const TrackingPage = () => {
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('id') || '');
    const [statusData, setStatusData] = useState(null);
    const [grievanceList, setGrievanceList] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setSearchQuery(id);
            // We need a way to call handleTrack. 
            // Since handleTrack depends on searchQuery, and we just set it,
            // it's better to extract the fetch logic.
            performSearch(id);
        }
    }, [searchParams]);

    const performSearch = async (query) => {
        if (!query) return;
        setError('');
        setStatusData(null);
        setGrievanceList(null);
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:3000/api/grievances/${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.success) {
                if (data.type === 'list') {
                    setGrievanceList(data.data);
                } else {
                    setStatusData(data.data);
                }
            } else {
                setError(data.message || 'Grievance not found');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = async (e) => {
        if (e) e.preventDefault();
        performSearch(searchQuery);
    };

    const handleSelectGrievance = (grievance) => {
        setStatusData(grievance);
        setGrievanceList(null);
    };

    const formatDate = (dateString, options = {}) => {
        if (!dateString) return 'Pending...';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Not available';
        return options.time ? date.toLocaleString() : date.toLocaleDateString();
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 mt-10">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Track Your Grievance</h2>
                <p className="text-gray-500">Enter your Grievance ID or Mobile Number to check status.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Enter ID (KDA-2026-0001) or Mobile Number"
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-kota-500 outline-none text-lg transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-kota-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-kota-700 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Tracking...' : 'Track Status'}
                    </button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        {error}
                    </div>
                )}

                {/* List View for Mobile Number Search */}
                {grievanceList && (
                    <div className="mt-8 border-t border-gray-100 pt-8 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Found {grievanceList.length} Grievances</h3>
                        <div className="space-y-4">
                            {grievanceList.map((g) => (
                                <div
                                    key={g.id}
                                    onClick={() => handleSelectGrievance(g)}
                                    className="p-4 bg-gray-50 hover:bg-white border hover:border-kota-300 rounded-xl cursor-pointer transition-all flex justify-between items-center group"
                                >
                                    <div>
                                        <p className="font-bold text-gray-900">{g.grievanceId}</p>
                                        <p className="text-sm text-gray-500">{formatDate(g.createdAt)} - {g.category}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold mr-4
                                            ${g.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                                g.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {g.status}
                                        </span>
                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-kota-600" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Detail View */}
                {statusData && (
                    <div className="mt-8 border-t border-gray-100 pt-8 animate-fade-in-up">
                        {grievanceList === null && searchQuery.match(/^\d{10}$/) && (
                            <button onClick={() => { setGrievanceList([]); handleTrack(); }} className="text-sm text-gray-500 hover:text-kota-600 mb-4 flex items-center">
                                &larr; Back to Results
                            </button>
                        )}

                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Grievance Details</h3>
                                <p className="text-sm text-gray-500">ID: {statusData.grievanceId}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full font-bold text-sm 
                                ${statusData.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                    statusData.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {statusData.status}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Category</p>
                                    <p className="font-medium text-gray-900">{statusData.category}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Date Submitted</p>
                                    <p className="font-medium text-gray-900">{formatDate(statusData.createdAt)}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase font-semibold">Description</p>
                                <p className="font-medium text-gray-900 mt-1">{statusData.description}</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h4 className="font-bold text-gray-900 mb-4">Case History</h4>
                            <div className="space-y-6 border-l-2 border-kota-100 ml-3 pl-8 relative">
                                <div className="relative">
                                    <div className="absolute -left-[41px] bg-green-500 h-6 w-6 rounded-full border-4 border-white shadow-sm"></div>
                                    <p className="font-bold text-gray-900">Grievance Submitted</p>
                                    <p className="text-sm text-gray-500">{formatDate(statusData.createdAt, { time: true })}</p>
                                    <p className="text-gray-600 mt-1">Your grievance has been received and assigned to the relevant department.</p>
                                </div>

                                {statusData.logs && statusData.logs.length > 0 && statusData.logs.map((log, index) => (
                                    <div key={log.id || index} className="relative animate-fade-in-up">
                                        <div className={`absolute -left-[41px] h-6 w-6 rounded-full border-4 border-white shadow-sm ${log.action.includes('RESOLVED') ? 'bg-green-600' :
                                            log.action.includes('ESCALATED') ? 'bg-red-500' : 'bg-blue-500'
                                            }`}></div>
                                        <p className="font-bold text-gray-900">{log.action}</p>
                                        <p className="text-sm text-gray-500">{formatDate(log.timestamp, { time: true })}</p>
                                        <p className="text-gray-600 mt-1 flex flex-col">
                                            <span>Performed by: {log.performedBy}</span>
                                            {log.attachmentPath && log.attachmentPath.startsWith('Remarks:') && (
                                                <span className="italic text-gray-400 text-xs mt-1">{log.attachmentPath}</span>
                                            )}
                                        </p>
                                    </div>
                                ))}

                                {statusData.status !== 'RESOLVED' && statusData.status !== 'REJECTED' && (
                                    <div className="relative opacity-60">
                                        <div className="absolute -left-[41px] bg-gray-200 h-6 w-6 rounded-full border-4 border-white"></div>
                                        <p className="font-bold text-gray-500">Under Process</p>
                                        <p className="text-sm text-gray-400">Officer Verification Pending</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {statusData.hearingLink && (
                            <div className="mt-8 p-6 bg-orange-50 border-2 border-orange-200 rounded-2xl animate-pulse">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-orange-500 p-3 rounded-full text-white">
                                            <Video className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-orange-900">Video Hearing Scheduled</h4>
                                            <p className="text-orange-700">{statusData.hearingDate} at {statusData.hearingTime}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const meetingId = statusData.hearingLink.split('/').pop();
                                            window.open(`/hearing/${meetingId}`, '_blank');
                                        }}
                                        className="w-full md:w-auto px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-lg"
                                    >
                                        Join Video Hearing Now
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackingPage;
