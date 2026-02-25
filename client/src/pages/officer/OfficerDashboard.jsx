import React, { useState, useEffect } from 'react';
import {
    FileText, CheckCircle, Clock, Trash2, ChevronLeft, ChevronRight,
    AlertTriangle, Send, Calendar, Printer, Filter, MoreVertical,
    MessageSquare, Video, ShieldAlert, MapPin, Settings, XCircle, Activity, Search, CornerDownLeft
} from 'lucide-react';
import ManageGrievanceModal from '../../components/dashboard/ManageGrievanceModal';
import GrievanceDetailsModal from '../../components/dashboard/GrievanceDetailsModal';
import { sendMockWhatsApp } from '../../components/layout/MockWhatsApp';
import ScheduleVCModal from '../../components/dashboard/ScheduleVCModal';
import DailyReportModal from '../../components/dashboard/DailyReportModal';
import AssignZoneModal from '../../components/dashboard/AssignZoneModal';
import { useAuth } from '../../context/AuthContext';

// Enhanced Stat Card as Filter Button
const StatCard = ({ title, value, subtext, icon: Icon, color, trend, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-6 rounded-2xl shadow-sm border transition-all duration-200 group relative overflow-hidden flex flex-col justify-between h-full ${isActive
            ? `ring-2 ring-offset-2 ring-${color.replace('bg-', '').split('-')[0]}-500 bg-white border-${color.replace('bg-', '').split('-')[0]}-200`
            : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
            }`}
    >
        <div className="flex justify-between items-start w-full relative z-10">
            <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>{title}</p>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color} text-white shadow-lg transform transition-transform group-hover:scale-110`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>

        <div className="mt-4 relative z-10">
            <p className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : (trend === 'down' ? 'text-red-500' : 'text-gray-400')}`}>
                {subtext}
            </p>
        </div>

        {/* Decorative Background */}
        <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-white to-${color.replace('bg-', '').split('-')[0]}-100 rounded-full opacity-50 transition-transform group-hover:scale-125 pointer-events-none`}></div>
        {isActive && (
            <div className={`absolute bottom-0 left-0 h-1 w-full ${color}`}></div>
        )}
    </button>
);

const OfficerDashboard = () => {
    const { user } = useAuth();

    // Dynamic Sub-Official Title based on Section
    // Dynamic Sub-Official Title based on Section
    const subOfficialTitle = user?.section === 'Director Engineering' ? 'Executive Engineer' :
        user?.section?.includes('commissioner') ? 'Tehsildar' :
            user?.section?.includes('Planning') ? 'Planner' :
                user?.section?.includes('Legal') ? 'Legal Official' :
                    user?.section?.includes('Finance') ? 'Assistant Accounts Officer' : 'Official';

    const subOfficialShort = user?.section === 'Director Engineering' ? 'EE' :
        user?.section?.includes('commissioner') ? 'TDR' :
            user?.section?.includes('Planning') ? 'ATP' :
                user?.section?.includes('Legal') ? 'LO' :
                    user?.section?.includes('Finance') ? 'AAO' : 'Official';
    const [grievances, setGrievances] = useState([]);
    const [selectedManageGrievance, setSelectedManageGrievance] = useState(null);
    const [selectedDetailsGrievance, setSelectedDetailsGrievance] = useState(null);
    const [showVCModal, setShowVCModal] = useState(false);
    const [showDailyReportModal, setShowDailyReportModal] = useState(false);
    const [vcGrievance, setVcGrievance] = useState(null);
    const [activeTab, setActiveTab] = useState('ALL');
    const [filterPriority, setFilterPriority] = useState('ALL');
    const [sourceFilter, setSourceFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAssignGrievance, setSelectedAssignGrievance] = useState(null);
    const [directorFilter, setDirectorFilter] = useState('ALL');

    // Fetch Data
    const fetchData = async () => {
        try {
            const token = getToken();
            const response = await fetch('http://localhost:3000/api/grievances', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                // Determine if we need to filter by section (if backend returns all)
                // For now, assuming backend handles major filtering or we show all returned
                setGrievances(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch grievances:', err);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStatusUpdate = async (id, updates) => {
        try {
            const token = getToken();
            let body;
            let headers = {
                'Authorization': `Bearer ${token}`
            };

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

            const response = await fetch(`http://localhost:3000/api/grievances/${id}`, {
                method: 'PUT',
                headers: headers,
                body: body
            });
            const data = await response.json();
            if (data.success) {
                if (updates.status === 'RESOLVED') {
                    const grievance = grievances.find(g => g.id === id);
                    if (grievance) {
                        const actionReport = updates.remarks || updates.description || 'Grievance has been resolved.';
                        sendMockWhatsApp(`RESOLVED_PROMPT:::${grievance.id}:::${grievance.grievanceId}:::${actionReport}`);
                    }
                }
                alert('Status Updated Successfully');
                fetchData();
                setSelectedManageGrievance(null);
            } else {
                alert(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Update failed');
        }
    };

    const handleScheduleVC = (g) => {
        setVcGrievance(g);
        setShowVCModal(true);
    };

    // Helper to get token
    const getToken = () => {
        const stored = localStorage.getItem('kda_user');
        return stored ? JSON.parse(stored).token : null;
    };

    const handleAssignZone = async (grievanceId, zone, note, expectedDate) => {
        try {
            const grievance = grievances.find(g => g.id === grievanceId);
            if (!grievance) return;

            const token = getToken();

            const response = await fetch(`http://localhost:3000/api/grievances/${grievance.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    assignedZone: zone,
                    directorNote: note,
                    expectedDate: expectedDate,
                    subStatus: 'ASSIGNED_TO_SUB',
                    status: 'IN_PROGRESS',
                    eeRemarks: null, // Reset previous official's remarks
                    eeStatus: null,  // Reset previous official's status
                    eeActionDate: null,
                    performedBy: user?.name || 'Director'
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('Zone Assigned Successfully');
                fetchData();
                setSelectedAssignGrievance(null);
            } else {
                alert(data.message || 'Failed to assign zone');
            }
        } catch (error) {
            console.error('Error assigning zone:', error);
            alert('Error assigning zone');
        }
    };

    const checkIsCritical = (g) => {
        const daysOld = (new Date() - new Date(g.createdAt)) / (1000 * 60 * 60 * 24);

        // 1. Pending & Unassigned for > 7 days
        const isUnassignedOverdue = g.status === 'PENDING' && !g.assignedSection && daysOld > 7;

        // 2. Assigned but no response/date for > 7 days
        const isNoResponseOverdue = g.assignedSection && (g.status === 'PENDING' || g.status === 'ACCEPTED') && !g.expectedDate && daysOld > 7;

        // 3. Crossed expected date of disposal
        const isPastExpectedDate = g.expectedDate && new Date(g.expectedDate) < new Date().setHours(0, 0, 0, 0);

        return isUnassignedOverdue || isNoResponseOverdue || isPastExpectedDate;
    };

    // Helper function to check if grievance was returned by Sub-Official
    const isReturnedBySub = (g) => {
        return g.eeStatus === 'RETURNED';
    };

    // Filter Logic
    const filteredGrievances = grievances.filter(g => {
        let matchesTab = true;
        if (activeTab === 'PENDING') {
            matchesTab = g.status === 'PENDING' || g.status === 'ACCEPTED' || g.status === 'REOPENED';

            // For Directors, also include In-Progress items that need their action
            if (user?.isDirector) {
                matchesTab = matchesTab || (
                    g.status === 'IN_PROGRESS' &&
                    (!g.assignedZone || g.eeStatus === 'RETURNED' || g.eeStatus === 'REPLIED')
                );
            }
        }
        else if (activeTab === 'IN_PROGRESS') {
            matchesTab = g.status === 'IN_PROGRESS';

            // Director Engineering specific filter for IN_PROGRESS tab
            if (user?.isDirector && directorFilter !== 'ALL') {
                if (directorFilter === 'ACTION_PENDING') {
                    // Show cases where:
                    // 1. Director accepted but not assigned to any zone
                    // 2. EE has returned the case
                    // 3. EE has replied and waiting for director's action
                    matchesTab = matchesTab && (
                        (!g.assignedZone) ||
                        (g.eeStatus === 'RETURNED') ||
                        (g.eeStatus === 'REPLIED')
                    );
                } else if (directorFilter === 'ASSIGNED_TO_EE') {
                    // Show only cases assigned to EE and pending their action
                    matchesTab = matchesTab && g.assignedZone && !g.eeStatus;
                }
            }
        }
        else if (activeTab === 'ESCALATED') matchesTab = checkIsCritical(g);
        else if (activeTab === 'RESOLVED') matchesTab = g.status === 'RESOLVED';
        else if (activeTab === 'ESCALATED') matchesTab = checkIsCritical(g);
        else if (activeTab === 'RESOLVED') matchesTab = g.status === 'RESOLVED';
        else if (activeTab === 'REJECTED') matchesTab = g.status === 'REJECTED';
        else if (activeTab === 'UNSATISFIED') matchesTab = g.status === 'UNSATISFIED' || ['NOT_SATISFIED', 'VC_SCHEDULED_SO', 'VC_DONE_SO', 'NOT_SATISFIED_POST_VC_SO'].includes(g.satisfactionStatus);

        const matchesSource = sourceFilter === 'ALL' || g.source === sourceFilter;
        const lowerSearch = searchTerm.toLowerCase();
        const matchesSearch =
            (g.grievanceId?.toLowerCase().includes(lowerSearch)) ||
            (g.mobile?.toLowerCase().includes(lowerSearch)) ||
            (g.name?.toLowerCase().includes(lowerSearch));

        // Section/Department Filter
        // If user has a zone, they should also see what is assigned to that zone
        const userSection = (user?.section || '').trim().toLowerCase();
        const userZone = (user?.zone || '').trim().toLowerCase();
        const grievanceSection = (g.assignedSection || '').trim().toLowerCase();
        const grievanceZone = (g.assignedZone || '').trim().toLowerCase();

        let matchesSection = true;
        if (userZone) {
            // User has a specific zone (like TDR Zone 1) - show if either section or zone matches
            matchesSection = (grievanceZone === userZone) || (userSection && grievanceSection === userSection);
        } else if (userSection) {
            // User only has a section - must match section
            matchesSection = (grievanceSection === userSection);
        }

        // VISIBILITY RULE:
        // Fresh grievances (PENDING & Unassigned) should ONLY be visible to Moderator.
        // If we are in OfficerDashboard, we are likely a Section Officer/Director.
        // So we must HIDE fresh unassigned grievances.
        const isFreshUnassigned = g.status === 'PENDING' && !g.assignedSection;
        if (isFreshUnassigned) return false;

        return matchesTab && matchesSource && matchesSearch && matchesSection;
    });

    const priorityGrievances = filteredGrievances.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).filter(g => {
        if (filterPriority === 'HIGH') return checkIsCritical(g);
        return true;
    });

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Officer Workstation</h1>
                    <p className="text-gray-500">Section: <span className="font-bold text-kota-600">{user?.section || user?.department || 'KDA Official'}</span></p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowDailyReportModal(true)}
                        className="flex items-center px-4 py-2 bg-kota-600 text-white rounded-xl font-bold hover:bg-kota-700 shadow-lg shadow-kota-200 transition-all hover:scale-105 active:scale-95"
                    >
                        <Printer className="w-4 h-4 mr-2" /> Daily Report
                    </button>
                </div>
            </div>

            {/* Stats Overview - Now Filter Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <StatCard
                    title="Total Tasks"
                    value={grievances.length}
                    subtext="All assigned"
                    icon={FileText}
                    color="bg-blue-500"
                    trend="neutral"
                    onClick={() => { setActiveTab('ALL'); setDirectorFilter('ALL'); setCurrentPage(1); }}
                    isActive={activeTab === 'ALL'}
                />
                <StatCard
                    title="Action Pending"
                    value={grievances.filter(g =>
                        (g.status === 'PENDING' || g.status === 'ACCEPTED' || g.status === 'REOPENED') ||
                        (user?.isDirector && g.status === 'IN_PROGRESS' && (!g.assignedZone || g.eeStatus === 'RETURNED' || g.eeStatus === 'REPLIED'))
                    ).length}
                    subtext="Needs Attention"
                    icon={Clock}
                    color="bg-orange-500"
                    trend="up"
                    onClick={() => {
                        setActiveTab('PENDING');
                        if (user?.isDirector) setDirectorFilter('ACTION_PENDING');
                        setCurrentPage(1);
                    }}
                    isActive={activeTab === 'PENDING' || (user?.isDirector && activeTab === 'IN_PROGRESS' && directorFilter === 'ACTION_PENDING')}
                />
                <StatCard
                    title="In Progress"
                    value={grievances.filter(g =>
                        g.status === 'IN_PROGRESS' && (!user?.isDirector || (g.assignedZone && !g.eeStatus))
                    ).length}
                    subtext="With Under-officers"
                    icon={Activity}
                    color="bg-indigo-500"
                    trend="neutral"
                    onClick={() => {
                        setActiveTab('IN_PROGRESS');
                        if (user?.isDirector) setDirectorFilter('ASSIGNED_TO_EE');
                        setCurrentPage(1);
                    }}
                    isActive={activeTab === 'IN_PROGRESS' && (!user?.isDirector || directorFilter === 'ASSIGNED_TO_EE')}
                />
                <StatCard
                    title="Unsatisfied"
                    value={grievances.filter(g => g.status === 'UNSATISFIED' || ['NOT_SATISFIED', 'VC_SCHEDULED_SO', 'VC_DONE_SO', 'NOT_SATISFIED_POST_VC_SO'].includes(g.satisfactionStatus)).length}
                    subtext="Citizen Feedback"
                    icon={ShieldAlert}
                    color="bg-rose-600"
                    trend="up"
                    onClick={() => { setActiveTab('UNSATISFIED'); setDirectorFilter('ALL'); setCurrentPage(1); }}
                    isActive={activeTab === 'UNSATISFIED'}
                />
                <StatCard
                    title="Critical"
                    value={grievances.filter(checkIsCritical).length}
                    subtext="Overdue"
                    icon={AlertTriangle}
                    color="bg-red-500"
                    trend="up"
                    onClick={() => { setActiveTab('ESCALATED'); setDirectorFilter('ALL'); setCurrentPage(1); }}
                    isActive={activeTab === 'ESCALATED'}
                />
                <StatCard
                    title="Resolved"
                    value={grievances.filter(g => g.status === 'RESOLVED').length}
                    subtext="Completed"
                    icon={CheckCircle}
                    color="bg-green-500"
                    trend="up"
                    onClick={() => { setActiveTab('RESOLVED'); setDirectorFilter('ALL'); setCurrentPage(1); }}
                    isActive={activeTab === 'RESOLVED'}
                />
                <StatCard
                    title="Rejected"
                    value={grievances.filter(g => g.status === 'REJECTED').length}
                    subtext="Closed"
                    icon={XCircle}
                    color="bg-slate-500"
                    trend="neutral"
                    onClick={() => { setActiveTab('REJECTED'); setDirectorFilter('ALL'); setCurrentPage(1); }}
                    isActive={activeTab === 'REJECTED'}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Task Area - Full Width */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Controls & Label */}
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center px-4">
                        <div className="flex items-center space-x-3">
                            <h3 className="font-bold text-gray-900 mr-2">Task List</h3>
                            <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 uppercase tracking-wider shadow-sm">
                                Viewing: {activeTab === 'ALL' ? 'All Tasks' : activeTab === 'ESCALATED' ? 'Critical' : activeTab}
                            </span>
                            {/* Director Engineering Filter for IN_PROGRESS tab */}
                            {user?.isDirector && activeTab === 'IN_PROGRESS' && (
                                <span className="px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-bold text-purple-700 uppercase tracking-wider shadow-sm">
                                    {directorFilter === 'ACTION_PENDING' ? '⚡ Action Pending' : directorFilter === 'ASSIGNED_TO_EE' ? `📍 With ${subOfficialShort}` : 'All Cases'}
                                </span>
                            )}
                        </div>

                        {/* Search & Source Filter */}
                        <div className="relative flex-1 max-w-lg mx-4 flex items-center space-x-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-kota-200 focus:outline-none focus:ring-2 focus:ring-kota-500/20 text-sm transition-all"
                                />
                            </div>
                            <select
                                value={sourceFilter}
                                onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
                                className="px-3 py-1.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-kota-200 focus:outline-none focus:ring-2 focus:ring-kota-500/20 text-xs font-bold text-gray-600 transition-all cursor-pointer"
                            >
                                <option value="ALL">All Sources</option>
                                <option value="WEB_PORTAL">Via Citizen</option>
                                <option value="PHYSICAL_JANSUNWAI">Physical Jansunwai</option>
                                <option value="MINISTER_JANSUNWAI">Minister Jansunwai</option>
                                <option value="MP_MLA_GRIEVANCES">MP/MLA Grievances</option>
                                <option value="MISCELLANEOUS">Miscellaneous</option>
                            </select>
                            {/* Director Engineering specific filter dropdown */}
                            {user?.isDirector && activeTab === 'IN_PROGRESS' && (
                                <select
                                    value={directorFilter}
                                    onChange={(e) => { setDirectorFilter(e.target.value); setCurrentPage(1); }}
                                    className="px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg focus:bg-white focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-xs font-bold text-purple-700 transition-all cursor-pointer"
                                >
                                    <option value="ALL">All In-Progress</option>
                                    <option value="ACTION_PENDING">⚡ Action Pending</option>
                                    <option value="ASSIGNED_TO_EE">📍 Assigned to {subOfficialShort}</option>
                                </select>
                            )}
                        </div>

                        <div className="flex text-gray-400 items-center space-x-2">
                            <button
                                onClick={fetchData}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Refresh Data"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setFilterPriority(filterPriority === 'ALL' ? 'HIGH' : 'ALL')}
                                className={`p-2 rounded-lg transition-colors ${filterPriority === 'HIGH' ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Toggle High Priority Only"
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                        {priorityGrievances.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <CheckCircle className="w-12 h-12 mb-4 text-green-100" />
                                <p>No tasks found in {activeTab === 'ALL' ? 'total' : activeTab.toLowerCase()} category.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {(() => {
                                    const indexOfLastItem = currentPage * 10;
                                    const indexOfFirstItem = indexOfLastItem - 10;
                                    const currentItems = priorityGrievances.slice(indexOfFirstItem, indexOfLastItem);

                                    return currentItems.map((g, index) => (
                                        <div key={g.id} className="p-6 hover:bg-gray-50 transition-colors group">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-sm font-black text-slate-300">
                                                        {(indexOfFirstItem + index + 1).toString().padStart(2, '0')}
                                                    </span>
                                                    <span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                        {g.grievanceId}
                                                    </span>
                                                    {isReturnedBySub(g) && (
                                                        <span className="flex items-center text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-1 rounded border border-amber-300 animate-pulse" title={`Returned by ${subOfficialTitle}`}>
                                                            <CornerDownLeft className="w-3 h-3 mr-1" /> RETURNED
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 uppercase tracking-tighter">
                                                        {g.source?.replace('_', ' ') || 'WEB PORTAL'}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${g.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                                                        g.status === 'UNSATISFIED' ? 'bg-rose-100 text-rose-700' :
                                                            'bg-gray-100 text-gray-600'}`}>
                                                        {g.status}
                                                    </span>

                                                    {/* Satisfaction Flags */}
                                                    {g.satisfactionStatus === 'SATISFIED' && (
                                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold border border-green-200 flex items-center">
                                                            <CheckCircle className="w-3 h-3 mr-1" /> Satisfied
                                                        </span>
                                                    )}
                                                    {g.satisfactionStatus === 'NOT_SATISFIED' && (
                                                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold border border-red-200 flex items-center">
                                                            <ShieldAlert className="w-3 h-3 mr-1" /> Dissatisfied
                                                        </span>
                                                    )}
                                                    {g.satisfactionStatus === 'VC_SCHEDULED_SO' && (
                                                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold border border-yellow-200 flex items-center">
                                                            <Video className="w-3 h-3 mr-1" /> VC Scheduled
                                                        </span>
                                                    )}
                                                    {g.satisfactionStatus === 'VC_DONE_SO' && (
                                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-200 flex items-center">
                                                            <Video className="w-3 h-3 mr-1" /> VC Done
                                                        </span>
                                                    )}
                                                    {g.satisfactionStatus === 'SATISFIED_POST_VC_SO' && (
                                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold border border-green-200 flex items-center">
                                                            <CheckCircle className="w-3 h-3 mr-1" /> Satisfied (Post VC)
                                                        </span>
                                                    )}
                                                    {g.satisfactionStatus === 'NOT_SATISFIED_POST_VC_SO' && (
                                                        <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold border border-orange-200 flex items-center">
                                                            <MapPin className="w-3 h-3 mr-1" /> Visit Office
                                                        </span>
                                                    )}

                                                    {g.subStatus && (
                                                        <span className="mt-1 text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
                                                            {(g.subStatus === 'ASSIGNED_TO_EE' || g.subStatus === 'ASSIGNED_TO_SUB')
                                                                ? `Assigned to ${subOfficialShort} ${g.assignedZone || ''}`
                                                                : g.subStatus.replace(/_/g, ' ')}
                                                        </span>
                                                    )}
                                                    {checkIsCritical(g) && (
                                                        <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                                                            <AlertTriangle className="w-3 h-3 mr-1" /> Overdue
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Activity</p>
                                                    <span className="text-xs text-blue-600 font-bold">
                                                        {new Date(g.updatedAt || g.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                    <p className="text-[9px] text-gray-400 mt-0.5">Filed: {new Date(g.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-start">
                                                <div className="pr-8">
                                                    <h4 className="font-bold text-gray-900 mb-1">{g.category} Issue</h4>
                                                    <p className="text-sm text-gray-600 line-clamp-2">{g.description}</p>
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{g.name} | {g.mobile} | {g.address}</p>
                                                        {g.expectedDate && (
                                                            <span className="text-[10px] bg-kota-50 text-kota-700 px-2 py-0.5 rounded flex items-center">
                                                                <Calendar className="w-3 h-3 mr-1" /> Exp: {g.expectedDate}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {(g.assignedSection || g.assignedZone) && (
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            {g.assignedSection && (
                                                                <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold border border-purple-200">
                                                                    📋 Section: {g.assignedSection}
                                                                </span>
                                                            )}
                                                            {g.assignedZone && (
                                                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold border border-indigo-200">
                                                                    📍 Area/Officer: {g.assignedZone}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {g.hearingLink && g.status !== 'RESOLVED' && g.status !== 'REJECTED' && (
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-bold border border-orange-200 flex items-center">
                                                                <Video className="w-3 h-3 mr-1" /> Hearing: {g.hearingDate} {g.hearingTime}
                                                            </span>
                                                            <a href={g.hearingLink} target="_blank" rel="noopener noreferrer" className="text-[10px] text-orange-600 underline hover:text-orange-800">
                                                                Join Link
                                                            </a>
                                                        </div>
                                                    )}
                                                    {g.vcScheduledDate && !['VC_DONE_SO', 'SATISFIED_POST_VC_SO', 'NOT_SATISFIED_POST_VC_SO', 'CLOSED_HIGHER_W_VC'].includes(g.satisfactionStatus) && (
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded font-bold border border-yellow-200 flex items-center">
                                                                <Video className="w-3 h-3 mr-1" /> VC: {new Date(g.vcScheduledDate).toLocaleString()}
                                                            </span>
                                                            {g.vcMeetingLink && (
                                                                <a href={g.vcMeetingLink} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 underline hover:text-blue-800">
                                                                    Join Link
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex flex-wrap gap-2 justify-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity max-w-[200px]">
                                                    <button
                                                        onClick={() => setSelectedDetailsGrievance(g)}
                                                        className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                                                    >
                                                        <FileText className="w-3 h-3 mr-2" /> View Details
                                                    </button>
                                                    {g.status !== 'RESOLVED' && g.status !== 'REJECTED' && (
                                                        <>
                                                            <button
                                                                onClick={() => setSelectedManageGrievance(g)}
                                                                className="flex items-center px-3 py-1.5 bg-kota-50 text-kota-700 text-xs font-bold rounded-lg hover:bg-kota-100 transition-colors border border-kota-200"
                                                            >
                                                                <Settings className="w-3 h-3 mr-2" /> Manage
                                                            </button>

                                                            {/* Director Engineering Assignment Button */}
                                                            {user?.isDirector && (
                                                                <button
                                                                    onClick={() => setSelectedAssignGrievance(g)}
                                                                    className="flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                                                                >
                                                                    <MapPin className="w-3 h-3 mr-2" /> {g.assignedZone ? 'Re-Assign Officer/Area' : 'Assign Officer/Area'}
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Show EE Response to Director */}
                                            {user?.isDirector && g.eeRemarks && (
                                                <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                                                    <p className="font-bold text-gray-700 text-xs uppercase mb-1">
                                                        {subOfficialTitle} ({g.assignedZone}) Remarks:
                                                    </p>
                                                    <p className="text-gray-800">{g.eeRemarks}</p>
                                                    <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Submitted on {new Date(g.eeActionDate).toLocaleString()}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-3 flex justify-end">
                                                {(g.status === 'RESOLVED' || g.status === 'UNSATISFIED') ? (
                                                    <div className="flex gap-2">
                                                        {g.satisfactionStatus === 'NOT_SATISFIED' && (
                                                            <button
                                                                onClick={() => handleScheduleVC(g)}
                                                                className="flex items-center px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg hover:bg-orange-100 transition-colors"
                                                            >
                                                                <Video className="w-3 h-3 mr-2" /> Schedule Hearing
                                                            </button>
                                                        )}

                                                        {g.satisfactionStatus === 'VC_SCHEDULED_SO' && (
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm("Mark VC as done? This will trigger a satisfaction check for the citizen.")) {
                                                                        const res = await fetch(`http://localhost:3000/api/grievances/${g.id}/complete-vc`, {
                                                                            method: 'POST',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ level: 'SO' })
                                                                        });
                                                                        const data = await res.json();
                                                                        if (data.success) {
                                                                            sendMockWhatsApp(`VC_DONE_PROMPT:::${g.id}:::${g.grievanceId}`);
                                                                            alert("VC marked as Done. Citizen has been asked for feedback.");
                                                                            fetchData();
                                                                        }
                                                                    }
                                                                }}
                                                                className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors"
                                                            >
                                                                <CheckCircle className="w-3 h-3 mr-2" /> Mark VC Done
                                                            </button>
                                                        )}

                                                        {['SATISFIED', 'SATISFIED_POST_VC_SO', 'NOT_SATISFIED_POST_VC_SO', 'CLOSED_HIGHER_W_VC'].includes(g.satisfactionStatus) && (
                                                            <span className="text-xs text-gray-400 italic px-3 py-1.5">
                                                                Case Closed
                                                            </span>
                                                        )}

                                                        {(!g.satisfactionStatus || g.satisfactionStatus === 'PENDING_FEEDBACK') && (
                                                            <span className="text-xs text-gray-400 italic px-3 py-1.5 flex items-center">
                                                                <Clock className="w-3 h-3 mr-1" /> Waiting for Feedback
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    (g.status === 'REJECTED') ? (
                                                        <span className="text-xs text-gray-400 italic px-3 py-1.5">
                                                            Case Closed (Rejected)
                                                        </span>
                                                    ) : (
                                                        null
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls - Specific Design Match */}
                    {
                        priorityGrievances.length > 10 && (
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
                                            const totalPages = Math.ceil(priorityGrievances.length / 10);
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
                                                        ? 'bg-kota-600 border-kota-600 text-white'
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
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(priorityGrievances.length / 10)))}
                                        disabled={currentPage === Math.ceil(priorityGrievances.length / 10)}
                                        className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                                    >
                                        Next <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>

                                {/* Results Text */}
                                <div className="text-sm text-gray-500 font-medium">
                                    <span className="font-semibold text-gray-700">{((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, priorityGrievances.length)}</span> of <span className="font-semibold text-gray-700">{priorityGrievances.length}</span> Results
                                </div>
                            </div>
                        )
                    }

                    {/* Modals */}
                    {
                        selectedDetailsGrievance && (
                            <GrievanceDetailsModal
                                grievance={selectedDetailsGrievance}
                                onClose={() => setSelectedDetailsGrievance(null)}
                            />
                        )
                    }

                    {
                        selectedManageGrievance && (
                            <ManageGrievanceModal
                                grievance={selectedManageGrievance}
                                onClose={() => setSelectedManageGrievance(null)}
                                onSave={handleStatusUpdate}
                            />
                        )
                    }

                    {
                        showVCModal && vcGrievance && (
                            <ScheduleVCModal
                                isOpen={showVCModal}
                                onClose={() => setShowVCModal(false)}
                                grievance={vcGrievance}
                                onSuccess={fetchData}
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

                    {
                        selectedAssignGrievance && (
                            <AssignZoneModal
                                grievance={selectedAssignGrievance}
                                onClose={() => setSelectedAssignGrievance(null)}
                                onAssign={handleAssignZone}
                            />
                        )
                    }
                </div >
            </div >
        </div >
    );
};

export default OfficerDashboard;
