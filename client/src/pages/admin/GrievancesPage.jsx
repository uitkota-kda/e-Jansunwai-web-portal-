import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, Eye, Trash2, CornerDownLeft, Video } from 'lucide-react';
import GrievanceDetailsModal from '../../components/dashboard/GrievanceDetailsModal';
import ManageGrievanceModal from '../../components/dashboard/ManageGrievanceModal';

const GrievancesPage = () => {
    const { user } = useAuth();
    const [grievances, setGrievances] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [sourceFilter, setSourceFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [selectedManageGrievance, setSelectedManageGrievance] = useState(null);

    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/api/grievances')
            .then(res => res.json())
            .then(data => {
                if (data.success) setGrievances(data.data);
            })
            .catch(err => console.error(err));
    }, []);

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





    const handleStatusUpdate = (id, updates) => {
        // ...Existing Logic...
        const grievance = grievances.find(g => g.id === id);
        if (!grievance) return;

        fetch(`http://localhost:3000/api/grievances/${grievance.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setGrievances(prev => prev.map(g => g.id === id ? { ...g, ...data.data } : g));
                    setSelectedManageGrievance(null);
                    alert('Grievance updated successfully!');
                } else {
                    alert(data.message || 'Failed to update grievance');
                    setSelectedManageGrievance(null);
                }
            })
            .catch(err => {
                console.error(err);
                alert('Error updating grievance');
                setSelectedManageGrievance(null);
            });
    };




    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const filteredGrievances = grievances.filter(g => {
        const matchesStatus = filter === 'ALL' || g.status === filter;
        const matchesSource = sourceFilter === 'ALL' || g.source === sourceFilter;
        const lowerSearch = search.toLowerCase();
        const matchesSearch =
            (g.grievanceId?.toLowerCase() || '').includes(lowerSearch) ||
            (g.mobile?.toLowerCase() || '').includes(lowerSearch) ||
            (g.name?.toLowerCase() || '').includes(lowerSearch);
        return matchesStatus && matchesSource && matchesSearch;
    }).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    const paginatedGrievances = filteredGrievances.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-orange-100 text-orange-700';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
            case 'RESOLVED': return 'bg-green-100 text-green-700';
            case 'ESCALATED': return 'bg-purple-100 text-purple-700';
            case 'ACCEPTED': return 'bg-indigo-100 text-indigo-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
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

        return wasReassigned || returnedByEE;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Grievances</h1>
                    <p className="text-gray-500">View and manage all citizen complaints</p>
                </div>

                <div className="flex items-center space-x-3">

                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search ID, Mobile, or Name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kota-500 outline-none w-64"
                        />
                    </div>
                    <select
                        value={sourceFilter}
                        onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kota-500 outline-none bg-white font-medium"
                    >
                        <option value="ALL">All Sources</option>
                        <option value="WEB_PORTAL">Via Citizen</option>
                        <option value="PHYSICAL_JANSUNWAI">Physical Jansunwai</option>
                        <option value="MINISTER_JANSUNWAI">Minister Jansunwai</option>
                        <option value="MP_MLA_GRIEVANCES">MP/MLA Grievances</option>
                        <option value="MISCELLANEOUS">Miscellaneous</option>
                    </select>
                    <select
                        value={filter}
                        onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kota-500 outline-none bg-white font-medium"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="ESCALATED">Escalated</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 w-10 text-center font-bold">S.No.</th>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Complainant</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Attachment</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedGrievances.length > 0 ? paginatedGrievances.map((g) => (
                                <tr key={g.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(g.grievanceId) ? 'bg-blue-50/30' : ''} ${isReturnedGrievance(g) ? 'border-l-4 border-amber-400' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-xs font-black text-slate-300">
                                            {((currentPage - 1) * ITEMS_PER_PAGE + paginatedGrievances.indexOf(g) + 1).toString().padStart(2, '0')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        <div className="flex items-center space-x-2">
                                            <span>{g.grievanceId}</span>
                                            {isReturnedGrievance(g) && (
                                                <span className="flex items-center text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 animate-pulse" title="Returned by Officer/EE">
                                                    <CornerDownLeft className="w-3 h-3 mr-0.5" /> RETURNED
                                                </span>
                                            )}
                                            {g.hearingLink && (
                                                <Video className="w-4 h-4 text-orange-500" title="VC Scheduled" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-700 font-medium">Filed: {new Date(g.createdAt).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-blue-600 font-bold mt-1 italic">
                                                Active: {new Date(g.updatedAt || g.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{g.name}</span>
                                            <span className="text-xs text-gray-500">{g.mobile}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600 uppercase">
                                            {g.source?.replace('_', ' ') || 'WEB PORTAL'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700">{g.category}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(g.status)}`}>
                                            {g.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {g.attachmentPath ? (
                                            <a
                                                href={`http://localhost:3000/${g.attachmentPath.replace(/\\/g, '/')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"
                                                title="Download Attachment"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paperclip"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                                            </a>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 flex items-center space-x-3">
                                        {user?.role !== 'SUPER_ADMIN' && !['IN_PROGRESS', 'RESOLVED', 'REJECTED'].includes(g.status) && (
                                            <button
                                                onClick={() => setSelectedManageGrievance(g)}
                                                disabled={user?.role === 'MODERATOR' && g.status === 'ACCEPTED'}
                                                className={`px-3 py-1 border text-xs font-bold rounded transition-colors ${(user?.role === 'MODERATOR' && g.status === 'ACCEPTED')
                                                    ? 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
                                                    : 'border-teal-600 text-teal-700 hover:bg-teal-50'
                                                    }`}
                                                title={(user?.role === 'MODERATOR' && g.status === 'ACCEPTED') ? "Restricted: Assigned to Section" : "Manage"}
                                            >
                                                Manage
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setSelectedGrievance(g)}
                                            className="text-kota-600 hover:text-kota-800 p-2 hover:bg-kota-50 rounded-full transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        No grievances found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls - Centered */}
            {filteredGrievances.length > ITEMS_PER_PAGE && (
                <div className="flex flex-col justify-center items-center mt-6 gap-3 pb-8">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                        >
                            Back
                        </button>

                        <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.ceil(filteredGrievances.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1.5 rounded-md font-medium text-sm transition-all border ${page === currentPage
                                        ? 'bg-kota-600 border-kota-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredGrievances.length / ITEMS_PER_PAGE)))}
                            disabled={currentPage === Math.ceil(filteredGrievances.length / ITEMS_PER_PAGE)}
                            className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                        >
                            Next
                        </button>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                        <span className="font-semibold text-gray-700">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredGrievances.length)}</span> of <span className="font-semibold text-gray-700">{filteredGrievances.length}</span> Results
                    </div>
                </div>
            )}

            {
                selectedGrievance && (
                    <GrievanceDetailsModal
                        grievance={selectedGrievance}
                        onClose={() => setSelectedGrievance(null)}
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
        </div >
    );
};

export default GrievancesPage;
