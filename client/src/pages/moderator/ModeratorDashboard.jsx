import { API_BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, Video, Paperclip, Trash2, XCircle, Activity, AlertCircle, ChevronLeft, ChevronRight, ChevronsRight, Search, Settings, Printer, CornerDownLeft, Flag, ShieldAlert } from 'lucide-react';
import GrievanceDetailsModal from '../../components/dashboard/GrievanceDetailsModal';
import ManageGrievanceModal from '../../components/dashboard/ManageGrievanceModal';
import DailyReportModal from '../../components/dashboard/DailyReportModal';


const StatCard = ({ title, value, icon: Icon, color, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-6 rounded-2xl shadow-sm border transition-all duration-200 group relative overflow-hidden ${isActive
            ? `ring-2 ring-offset-2 ring-${color.split('-')[1]}-500 bg-white border-${color.split('-')[1]}-200`
            : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
            }`}
    >
        <div className="flex items-center relative z-10">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center mr-4 transition-transform group-hover:scale-110 ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className={`text-base font-bold uppercase tracking-wide ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{title}</p>
                <h3 className="text-4xl font-extrabold text-gray-900">{value}</h3>
            </div>
        </div>
        {isActive && (
            <div className={`absolute bottom-0 left-0 h-1 w-full ${color}`}></div>
        )}
    </button>
);

const ModeratorDashboard = () => {
    const [grievances, setGrievances] = useState([]);
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [manageGrievance, setManageGrievance] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [activeTab, setActiveTab] = useState('ALL');
    const [sourceFilter, setSourceFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDailyReportModal, setShowDailyReportModal] = useState(false);

    // Helper to get token
    const getToken = () => {
        const stored = localStorage.getItem('kda_user');
        return stored ? JSON.parse(stored).token : null;
    };

    const fetchGrievances = async () => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/grievances`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setGrievances(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch grievances:', err);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredGrievances.map(g => g.grievanceId));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };



    const handleSaveGrievance = async (id, updates) => {
        try {
            const grievance = grievances.find(g => g.id === id);
            if (!grievance) return;

            let body;
            let headers = {};

            if (updates.attachment) {
                body = new FormData();
                Object.keys(updates).forEach(key => {
                    if (updates[key] !== undefined) {
                        body.append(key, updates[key]);
                    }
                });
            } else {
                headers['Content-Type'] = 'application/json';
                body = JSON.stringify(updates);
            }

            const token = getToken();
            if (!headers['Content-Type']) {
                // If no Content-Type (FormData), only add Auth
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/grievances/${grievance.id}`, {
                method: 'PUT',
                headers: headers,
                body: body
            });

            const data = await response.json();

            if (data.success) {
                setGrievances(prev => prev.map(g => g.id === id ? { ...g, ...data.data } : g));
                setManageGrievance(null);

                // Notifications (Moved after successful state update)
                if (updates.status === 'REJECTED') {
                    console.log(`UPDATE: Your grievance ${grievance.grievanceId} has been rejected.\n\nReason: ${updates.remarks || 'No specific reason provided.'}`);
                } else if (updates.status === 'IN_PROGRESS' && updates.assignedSection) {
                    console.log(`UPDATE: Your grievance ${grievance.grievanceId} has been accepted and assigned to ${updates.assignedSection}.`);
                }
                alert('Grievance updated successfully!');
            }
        } catch (err) {
            console.error(err);
            alert('Update failed: ' + err.message);
        }
    };



    useEffect(() => {
        fetchGrievances();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-orange-100 text-orange-700';
            case 'RESOLVED': return 'bg-green-100 text-green-700';
            case 'ESCALATED': return 'bg-red-100 text-red-700';
            case 'ACCEPTED': return 'bg-blue-100 text-blue-700';
            case 'REJECTED': return 'bg-gray-100 text-gray-700';
            case 'UNSATISFIED': return 'bg-rose-100 text-rose-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Helper function to check if grievance was returned to moderator
    const isReturnedGrievance = (grievance) => {
        // Check if it was returned by officer (REASSIGN action - status back to PENDING with remarks)
        const wasReassigned = grievance.status === 'PENDING' &&
            !grievance.assignedSection &&
            grievance.remarks &&
            grievance.remarks.length > 0;

        // Check if it was returned by EE
        const returnedByEE = grievance.eeStatus === 'RETURNED';

        // Check if returned by Commissioner
        const returnedByComm = grievance.subStatus === 'REOPENED_BY_COMMISSIONER' || grievance.isReopened;

        return wasReassigned || returnedByEE || returnedByComm;
    };

    const filteredGrievances = grievances.filter(g => {
        const matchesTab = activeTab === 'ALL'
            ? true
            : activeTab === 'IN_PROGRESS'
                ? (g.status === 'IN_PROGRESS' || g.status === 'ACCEPTED')
                : activeTab === 'UNSATISFIED'
                    ? (g.status === 'UNSATISFIED' || g.satisfactionStatus === 'NOT_SATISFIED')
                    : g.status === activeTab;
        const matchesSource = sourceFilter === 'ALL' || g.source === sourceFilter;
        const lowerSearch = searchTerm.toLowerCase();
        const matchesSearch =
            (g.grievanceId?.toLowerCase().includes(lowerSearch)) ||
            (g.mobile?.toLowerCase().includes(lowerSearch)) ||
            (g.name?.toLowerCase().includes(lowerSearch));

        return matchesTab && matchesSource && matchesSearch;
    }).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <button
                    onClick={() => setShowDailyReportModal(true)}
                    className="flex items-center px-4 py-2 bg-kota-600 text-white rounded-xl font-bold hover:bg-kota-700 shadow-lg shadow-kota-200 transition-all hover:scale-105 active:scale-95"
                >
                    <Printer className="w-4 h-4 mr-2" /> Daily Report
                </button>
            </div>

            {/* Stats Grid - Now acts as Filter Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <StatCard
                    title="Total Grievances"
                    value={grievances.length}
                    icon={FileText}
                    color="bg-blue-500"
                    onClick={() => { setActiveTab('ALL'); setCurrentPage(1); }}
                    isActive={activeTab === 'ALL'}
                />
                <StatCard
                    title="Pending"
                    value={grievances.filter(g => g.status === 'PENDING').length}
                    icon={Clock}
                    color="bg-orange-500"
                    onClick={() => { setActiveTab('PENDING'); setCurrentPage(1); }}
                    isActive={activeTab === 'PENDING'}
                />
                <StatCard
                    title="In Progress"
                    value={grievances.filter(g => g.status === 'IN_PROGRESS' || g.status === 'ACCEPTED').length}
                    icon={Activity}
                    color="bg-indigo-500"
                    onClick={() => { setActiveTab('IN_PROGRESS'); setCurrentPage(1); }}
                    isActive={activeTab === 'IN_PROGRESS'}
                />
                <StatCard
                    title="Resolved"
                    value={grievances.filter(g => g.status === 'RESOLVED').length}
                    icon={CheckCircle}
                    color="bg-green-500"
                    onClick={() => { setActiveTab('RESOLVED'); setCurrentPage(1); }}
                    isActive={activeTab === 'RESOLVED'}
                />
                <StatCard
                    title="Rejected"
                    value={grievances.filter(g => g.status === 'REJECTED').length}
                    icon={XCircle}
                    color="bg-gray-500"
                    onClick={() => { setActiveTab('REJECTED'); setCurrentPage(1); }}
                    isActive={activeTab === 'REJECTED'}
                />
                <StatCard
                    title="Escalated"
                    value={grievances.filter(g => g.status === 'ESCALATED').length}
                    icon={AlertTriangle}
                    color="bg-red-500"
                    onClick={() => { setActiveTab('ESCALATED'); setCurrentPage(1); }}
                    isActive={activeTab === 'ESCALATED'}
                />
                <StatCard
                    title="Unsatisfied"
                    value={grievances.filter(g => g.status === 'UNSATISFIED' || g.satisfactionStatus === 'NOT_SATISFIED').length}
                    icon={ShieldAlert}
                    color="bg-rose-600"
                    onClick={() => { setActiveTab('UNSATISFIED'); setCurrentPage(1); }}
                    isActive={activeTab === 'UNSATISFIED'}
                />
            </div>

            {/* Recent Grievances Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-3">
                            <h3 className="font-bold text-gray-900 mr-2">Grievance List</h3>
                            <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 uppercase tracking-wider shadow-sm">
                                Viewing: {activeTab === 'ALL' ? 'All Records' : activeTab}
                            </span>
                        </div>

                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-md mx-4 flex items-center space-x-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search by ID, Mobile..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all shadow-sm"
                                />
                            </div>
                            <select
                                value={sourceFilter}
                                onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-gray-600 transition-all shadow-sm"
                            >
                                <option value="ALL">All Sources</option>
                                <option value="WEB_PORTAL">Via Citizen</option>
                                <option value="PHYSICAL_JANSUNWAI">Physical Jansunwai</option>
                                <option value="MINISTER_JANSUNWAI">Minister Jansunwai</option>
                                <option value="MP_MLA_GRIEVANCES">MP/MLA Grievances</option>
                                <option value="DIVISIONAL_COMMISSIONER">Divisional Commissioner</option>
                                <option value="MISCELLANEOUS">Miscellaneous</option>
                            </select>
                        </div>


                        <div className="flex items-center space-x-3 ml-auto">



                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-base text-gray-700">
                        <thead className="bg-white text-gray-500 font-bold uppercase text-sm tracking-wider border-b border-gray-100">
                            <tr>

                                <th className="px-6 py-4 w-10 text-xs font-bold text-gray-400 capitalize whitespace-nowrap">S.No.</th>
                                <th className="px-6 py-4">Grievance ID</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {/* Pagination Logic */}
                            {(() => {
                                const indexOfLastItem = currentPage * 10;
                                const indexOfFirstItem = indexOfLastItem - 10;
                                const currentItems = filteredGrievances.slice(indexOfFirstItem, indexOfLastItem);

                                if (currentItems.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">No grievances found in {activeTab === 'ALL' ? 'the system' : activeTab.toLowerCase() + ' status'}.</td>
                                        </tr>
                                    );
                                }

                                return currentItems.map((grievance) => (
                                    <tr key={grievance.id} className={`group hover:bg-slate-50 transition-all ${selectedIds.includes(grievance.grievanceId) ? 'bg-blue-50/50' : ''} ${isReturnedGrievance(grievance) ? 'border-l-4 border-amber-400' : ''}`}>

                                        <td className="px-6 py-4 text-sm font-bold text-gray-400">
                                            {indexOfFirstItem + currentItems.indexOf(grievance) + 1}.
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-bold text-gray-900">{grievance.grievanceId}</span>
                                                    <div className="flex space-x-1">
                                                        {isReturnedGrievance(grievance) && (
                                                            <span className={`flex items-center text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border animate-pulse ${grievance.isReopened ? 'text-purple-700 bg-purple-100 border-purple-300' : 'text-amber-700 bg-amber-100 border-amber-300'}`} title="Returned Grievance">
                                                                <CornerDownLeft className="w-3 h-3 mr-0.5" /> {grievance.isReopened ? 'COMMISSIONER RETURNED' : 'RETURNED'}
                                                            </span>
                                                        )}
                                                        {grievance.hearingLink && <Video className="w-3.5 h-3.5 text-orange-500" />}
                                                        {grievance.attachmentPath && <Paperclip className="w-3.5 h-3.5 text-blue-500" />}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-700 mt-1 font-medium">
                                                    {grievance.name} <span className="text-gray-400">|</span> {grievance.mobile}
                                                </div>
                                                <div className="flex gap-4 mt-1.5 pt-1.5 border-t border-gray-100">
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Filed</p>
                                                        <p className="text-xs text-gray-600 font-medium">{new Date(grievance.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="ml-auto text-right">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter italic">Last Activity</p>
                                                        <p className="text-xs text-teal-600 font-bold">
                                                            {new Date(grievance.updatedAt || grievance.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                {(grievance.assignedSection || grievance.assignedZone) && (
                                                    <div className="flex items-center space-x-1 mt-1">
                                                        {grievance.assignedSection && (
                                                            <span className="text-[9px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold border border-purple-200">
                                                                📋 {grievance.assignedSection}
                                                            </span>
                                                        )}
                                                        {grievance.assignedZone && (
                                                            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold border border-indigo-200">
                                                                📍 {grievance.assignedZone}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-xs text-gray-400 uppercase tracking-tighter mb-1">Origin</span>
                                                <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-md w-fit capitalize">
                                                    {(grievance.source || 'WEB_PORTAL').toLowerCase().replace('_', ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-500">{grievance.category}</span>
                                                {grievances.filter(g => g.mobile === grievance.mobile).length > 1 && (
                                                    <span className="flex items-center text-[10px] font-bold text-amber-600 mt-1 bg-amber-50 px-2 py-0.5 rounded-full w-fit border border-amber-100" title="This user has submitted multiple grievances">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Repeat User ({grievances.filter(g => g.mobile === grievance.mobile).length})
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${getStatusColor(grievance.status)}`}>
                                                {grievance.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setManageGrievance(grievance)}
                                                    disabled={['IN_PROGRESS', 'ACCEPTED', 'RESOLVED', 'REJECTED'].includes(grievance.status)}
                                                    className={`p-2 rounded-lg transition-colors ${(['IN_PROGRESS', 'ACCEPTED', 'RESOLVED', 'REJECTED'].includes(grievance.status))
                                                        ? 'text-gray-300 cursor-not-allowed border-gray-100 bg-gray-50'
                                                        : 'text-teal-600 hover:bg-teal-50 border border-transparent'
                                                        }`}
                                                    title={(['IN_PROGRESS', 'ACCEPTED', 'RESOLVED', 'REJECTED'].includes(grievance.status)) ? "Action restricted" : "Manage"}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedGrievance(grievance)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Quick View"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls - Specific Design Match */}
                {filteredGrievances.length > 10 && (
                    <div className="flex flex-col justify-center items-center mt-6 gap-3">
                        {/* Buttons Container */}
                        <div className="flex items-center space-x-2">
                            {/* Back Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Back
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center space-x-1">
                                {(() => {
                                    const totalPages = Math.ceil(filteredGrievances.length / 10);
                                    const pages = [];

                                    if (totalPages <= 5) {
                                        for (let i = 1; i <= totalPages; i++) {
                                            pages.push(i);
                                        }
                                    } else {
                                        if (currentPage <= 3) {
                                            pages.push(1, 2, 3, '...', totalPages);
                                        } else if (currentPage >= totalPages - 2) {
                                            pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
                                        } else {
                                            pages.push(1, '...', currentPage, '...', totalPages);
                                        }
                                    }

                                    return pages.map((page, index) => (
                                        <button
                                            key={index}
                                            onClick={() => typeof page === 'number' ? setCurrentPage(page) : null}
                                            disabled={typeof page !== 'number'}
                                            className={`px-3 py-1.5 rounded-md font-medium text-sm transition-all border ${page === currentPage
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : typeof page === 'number'
                                                    ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    : 'bg-transparent border-transparent text-gray-500 cursor-default'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ));
                                })()}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredGrievances.length / 10)))}
                                disabled={currentPage === Math.ceil(filteredGrievances.length / 10)}
                                className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                            >
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>

                        {/* Results Text */}
                        <div className="text-sm text-gray-500 font-medium">
                            <span className="font-semibold text-gray-700">{((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, filteredGrievances.length)}</span> of <span className="font-semibold text-gray-700">{filteredGrievances.length}</span> Results
                        </div>
                    </div>
                )}



            </div>

            {
                selectedGrievance && (
                    <GrievanceDetailsModal
                        grievance={selectedGrievance}
                        onClose={() => setSelectedGrievance(null)}
                    />
                )
            }

            {
                manageGrievance && (
                    <ManageGrievanceModal
                        grievance={manageGrievance}
                        onClose={() => setManageGrievance(null)}
                        onSave={handleSaveGrievance}
                    />
                )
            }
            {
                showDailyReportModal && (
                    <DailyReportModal
                        isOpen={showDailyReportModal}
                        onClose={() => setShowDailyReportModal(false)}
                        grievances={grievances}
                    />
                )
            }
        </div >
    );
};

export default ModeratorDashboard;
