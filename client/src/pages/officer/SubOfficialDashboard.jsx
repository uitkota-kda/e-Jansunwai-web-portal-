
import React, { useState, useEffect } from 'react';
import {
    FileText, CheckCircle, Clock, AlertTriangle, MessageSquare,
    ArrowLeft, Send, XCircle, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GrievanceDetailsModal from '../../components/dashboard/GrievanceDetailsModal';

// Enhanced Clickable Stat Card with Active State
const StatCard = ({ title, value, color, icon: Icon, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-6 rounded-2xl shadow-sm border transition-all duration-200 group relative overflow-hidden ${isActive
            ? `ring-2 ring-offset-2 ring-${color.replace('bg-', '').split('-')[0]}-500 bg-white border-${color.replace('bg-', '').split('-')[0]}-200`
            : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
            }`}
    >
        <div className="flex items-center justify-between relative z-10">
            <div>
                <p className={`text-sm font-bold uppercase tracking-wider ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>{title}</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color} text-white shadow-lg transform transition-transform group-hover:scale-110`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
        {isActive && (
            <div className={`absolute bottom-0 left-0 h-1 w-full ${color}`}></div>
        )}
    </button>
);

const SubOfficialDashboard = () => {
    const { user } = useAuth();
    const [grievances, setGrievances] = useState([]);
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [selectedDetailsGrievance, setSelectedDetailsGrievance] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [file, setFile] = useState(null);
    const [actionType, setActionType] = useState('REPLY'); // 'REPLY' or 'RETURN'
    const [activeTab, setActiveTab] = useState('PENDING'); // 'ALL', 'PENDING', 'PROCESSED'

    const fetchGrievances = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/grievances');
            const data = await response.json();

            if (data.success) {
                // Filter by the zone/desk name assigned to this user
                const filtered = data.data.filter(g =>
                    (user.zone && g.assignedZone === user.zone) ||
                    (user.section && g.assignedSection === user.section)
                ).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
                setGrievances(filtered);
            }
        } catch (err) {
            console.error('Failed to fetch:', err);
        }
    };

    useEffect(() => {
        if (user) fetchGrievances();
    }, [user]);

    const handleSubmit = async () => {
        if (!remarks.trim()) return alert('Please enter remarks.');

        try {
            const formData = new FormData();
            formData.append('eeRemarks', remarks);
            formData.append('eeStatus', actionType === 'RETURN' ? 'RETURNED' : 'REPLIED');
            formData.append('subStatus', actionType === 'RETURN' ? 'SUB_RETURNED' : 'SUB_SUBMITTED');
            formData.append('performedBy', user.name);

            if (file) {
                formData.append('attachment', file);
            }

            // If returning, set status back to PENDING so it appears in Officer's pending list
            if (actionType === 'RETURN') {
                formData.append('status', 'PENDING');
            }

            const response = await fetch(`http://localhost:3000/api/grievances/${selectedGrievance.id}`, {
                method: 'PUT',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert(`Grievance ${actionType === 'RETURN' ? 'returned' : 'replied'} successfully.`);
                setRemarks('');
                setFile(null);
                setSelectedGrievance(null);
                fetchGrievances();
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    // Derived Lists
    const pendingTasks = grievances.filter(g => !g.eeStatus || g.eeStatus === 'PENDING' || g.eeStatus === 'ACCEPTED');
    const completedTasks = grievances.filter(g => g.eeStatus === 'REPLIED' || g.eeStatus === 'RETURNED');

    // Filtered grievances based on active tab
    const displayedGrievances = activeTab === 'ALL'
        ? grievances
        : activeTab === 'PENDING'
            ? pendingTasks
            : completedTasks;

    // Dynamic Title
    const dashboardTitle = user?.role?.replace('_', ' ')?.toLowerCase()
        ?.replace(/\b\w/g, c => c.toUpperCase()) || 'Official Dashboard';

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{dashboardTitle} Dashboard</h1>
                    <p className="text-gray-500">Assignment Area: <span className="font-bold text-blue-600">{user?.zone || user?.section}</span></p>
                </div>
            </div>

            {/* Clickable Filter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Tasks"
                    value={grievances.length}
                    color="bg-blue-500"
                    icon={FileText}
                    onClick={() => setActiveTab('ALL')}
                    isActive={activeTab === 'ALL'}
                />
                <StatCard
                    title="Pending Action"
                    value={pendingTasks.length}
                    color="bg-orange-500"
                    icon={Clock}
                    onClick={() => setActiveTab('PENDING')}
                    isActive={activeTab === 'PENDING'}
                />
                <StatCard
                    title="Processed"
                    value={completedTasks.length}
                    color="bg-green-500"
                    icon={CheckCircle}
                    onClick={() => setActiveTab('PROCESSED')}
                    isActive={activeTab === 'PROCESSED'}
                />
                <StatCard
                    title="Returned"
                    value={grievances.filter(g => g.eeStatus === 'RETURNED').length}
                    color="bg-red-500"
                    icon={ArrowLeft}
                    onClick={() => setActiveTab('RETURNED')}
                    isActive={activeTab === 'RETURNED'}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* List */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div className="flex items-center space-x-3">
                            <h3 className="font-bold text-gray-800">Task List</h3>
                            <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 uppercase tracking-wider shadow-sm">
                                Viewing: {activeTab === 'ALL' ? 'All Tasks' : activeTab === 'PENDING' ? 'Pending Action' : activeTab === 'PROCESSED' ? 'Processed' : 'Returned'}
                            </span>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {(() => {
                            let filteredList = [];
                            if (activeTab === 'ALL') filteredList = grievances;
                            else if (activeTab === 'PENDING') filteredList = pendingTasks;
                            else if (activeTab === 'PROCESSED') filteredList = completedTasks;
                            else if (activeTab === 'RETURNED') filteredList = grievances.filter(g => g.eeStatus === 'RETURNED');

                            if (filteredList.length === 0) {
                                return (
                                    <div className="p-8 text-center text-gray-400">
                                        No {activeTab === 'ALL' ? '' : activeTab.toLowerCase()} tasks found.
                                    </div>
                                );
                            }

                            return filteredList.map((g, index) => (
                                <div key={g.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-start group">
                                    <div className="flex gap-4">
                                        <div className="mt-1">
                                            <span className="text-xs font-black text-slate-300">{(index + 1).toString().padStart(2, '0')}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{g.grievanceId}</span>
                                                <span className="text-xs font-bold text-blue-600">{g.category}</span>
                                                {g.eeStatus && (
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${g.eeStatus === 'REPLIED' ? 'bg-green-100 text-green-700' :
                                                        g.eeStatus === 'RETURNED' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {g.eeStatus}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-800 line-clamp-2">{g.description}</p>
                                            <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50">
                                                <div className="text-left">
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Filing Date</p>
                                                    <p className="text-xs text-gray-600 font-medium">{new Date(g.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight italic">Last Activity</p>
                                                    <p className="text-xs text-blue-600 font-bold">
                                                        {new Date(g.updatedAt || g.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 font-bold mt-2 uppercase tracking-tighter">Citizen: <span className="text-gray-900">{g.name}</span></p>
                                            {(g.assignedSection || g.assignedZone) && (
                                                <div className="flex items-center space-x-1 mt-1">
                                                    {g.assignedSection && (
                                                        <span className="text-[9px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold border border-purple-200">
                                                            📋 {g.assignedSection}
                                                        </span>
                                                    )}
                                                    {g.assignedZone && (
                                                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold border border-indigo-200">
                                                            📍 Area: {g.assignedZone}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {g.directorNote && (
                                                <div className="mt-2 bg-yellow-50 text-yellow-800 p-2 rounded text-xs border border-yellow-100">
                                                    <strong>Authority Instruction:</strong> {g.directorNote}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-base">
                                        <button
                                            onClick={() => setSelectedDetailsGrievance(g)}
                                            className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 border border-gray-200"
                                        >
                                            View
                                        </button>
                                        {(!g.eeStatus || g.eeStatus === 'PENDING' || g.eeStatus === 'ACCEPTED') && (
                                            <button
                                                onClick={() => setSelectedGrievance(g)}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100"
                                            >
                                                Take Action
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* Details / Action Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-fit sticky top-24">
                    {selectedGrievance ? (
                        <div className="p-6 space-y-6">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-900">Take Action</h3>
                                <button onClick={() => setSelectedGrievance(null)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2">
                                <p><strong className="text-gray-500">ID:</strong> {selectedGrievance.grievanceId}</p>
                                <p><strong className="text-gray-500">Desc:</strong> {selectedGrievance.description}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActionType('REPLY')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg border ${actionType === 'REPLY' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
                                    >
                                        Submit Report
                                    </button>
                                    <button
                                        onClick={() => setActionType('RETURN')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg border ${actionType === 'RETURN' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200'}`}
                                    >
                                        Return Case
                                    </button>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">
                                        {actionType === 'REPLY' ? 'Findings / Action Taken' : 'Reason for Return'}
                                    </label>
                                    <textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        rows="4"
                                        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={actionType === 'REPLY' ? "Enter report details..." : "Why are you returning this case?"}
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">
                                        Attach PDF/Image (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" /> Submit to Authroity
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-400">
                            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>Select a grievance task to respond</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedDetailsGrievance && (
                <GrievanceDetailsModal
                    grievance={selectedDetailsGrievance}
                    onClose={() => setSelectedDetailsGrievance(null)}
                />
            )}
        </div>
    );
};

export default SubOfficialDashboard;
