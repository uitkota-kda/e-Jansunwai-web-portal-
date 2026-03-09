import React, { useState, useEffect } from 'react';
import { X, Calendar, Download, FileText, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    ENGINEERING_ZONES,
    REVENUE_ZONES,
    PLANNING_ZONES,
    LEGAL_ZONES,
    FINANCE_ZONES,
    SECTIONS,
    OFFICER_LIST
} from '../../constants';
import { SERVER_URL } from '../../config';

const ManageGrievanceModal = ({ grievance, onClose, onSave }) => {
    const { user } = useAuth();
    const isModerator = user?.role === 'MODERATOR' || user?.role === 'SUPER_ADMIN';

    const [formData, setFormData] = useState({
        status: '',
        expectedDate: '',
        assignedSection: '',
        assignedOfficer: '',
        assignedZone: '',
        remarks: ''
    });

    useEffect(() => {
        if (grievance) {
            let initialStatus = grievance.status || 'PENDING';
            // For section officers, treat both ACCEPTED and IN_PROGRESS as PENDING in the dropdown
            if (!isModerator && (initialStatus === 'IN_PROGRESS' || initialStatus === 'ACCEPTED')) {
                initialStatus = 'PENDING';
            }
            setFormData({
                status: initialStatus,
                expectedDate: grievance.expectedDate || '',
                assignedSection: grievance.assignedSection || '',
                assignedOfficer: grievance.assignedOfficer || '',
                assignedZone: grievance.assignedZone || '',
                remarks: grievance.remarks || ''
            });
        }
    }, [grievance, isModerator]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Security check: Moderator cannot manage IN_PROGRESS, ACCEPTED, RESOLVED, or REJECTED grievances
        if (isModerator && (['IN_PROGRESS', 'ACCEPTED', 'RESOLVED', 'REJECTED'].includes(grievance.status))) {
            alert('Action restricted: This grievance is either being processed or has been closed.');
            return;
        }

        if (!isModerator) {
            // Director Engineering Special Logic: Auto-assign to Zone
            if (user?.isDirector && formData.assignedZone && formData.status === 'PENDING') {
                if (!formData.expectedDate) {
                    alert('Please provide an expected date of disposal before assigning to a zone.');
                    return;
                }
                const finalData = {
                    ...formData,
                    status: 'IN_PROGRESS',
                    subStatus: 'ASSIGNED_TO_SUB',
                    eeRemarks: null, // Wipe old response
                    eeStatus: null,  // Mark as pending for new official
                    eeActionDate: null,
                    performedBy: `${user.name} (${user.section})`
                };
                onSave(grievance.id, finalData);
                return;
            }

            // Standard Section Officer Logic
            if (formData.status === 'PENDING') {
                if (!formData.expectedDate) {
                    alert('Please provide an expected date of disposal for pending grievances.');
                    return;
                }
                // Transition to IN_PROGRESS upon submission with date
                const finalData = { ...formData, status: 'IN_PROGRESS' };
                onSave(grievance.id, finalData);
                return;
            }

            if (formData.status === 'RESOLVED' || formData.status === 'REJECTED') {
                if (!formData.remarks || formData.remarks.trim().length < 20) {
                    alert('Please provide detailed action taken / remarks (minimum 20 characters).');
                    return;
                }
            }

            if (formData.status === 'REASSIGN') {
                if (!formData.remarks || formData.remarks.trim().length < 20) {
                    alert('Please provide a reason for reassignment (minimum 20 characters).');
                    return;
                }
                // Send back to moderator by clearing section and setting status back to PENDING
                const finalData = { ...formData, status: 'PENDING', assignedSection: '', assignedOfficer: '', performedBy: `${user.name} (${user.section})` };
                onSave(grievance.id, finalData);
                return;
            }
        } else {
            // Moderator logic
            if (formData.status === 'PENDING') {
                alert('Please change the status before saving.');
                return;
            }

            if (formData.status === 'ACCEPTED') {
                if (!formData.assignedSection) {
                    alert('Please assign a section for accepted grievance.');
                    return;
                }
            }

            if (formData.status === 'REJECTED') {
                if (!formData.remarks || formData.remarks.trim().length < 20) {
                    alert('Please provide detailed remarks (minimum 20 characters) for rejection.');
                    return;
                }
            }
        }

        const finalData = { ...formData, performedBy: user.role === 'MODERATOR' ? 'Moderator' : `${user.name} (${user.section})` };
        onSave(grievance.id, finalData);
    };

    if (!grievance) return null;

    return (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/60 backdrop-blur-sm">
            {/* This element is to trick the browser into centering the modal contents. */}
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}></div>

                <div className="relative transform overflow-hidden rounded-[2rem] bg-white text-left shadow-2xl transition-all sm:my-4 w-full max-w-7xl h-[92vh] flex flex-col animate-scale-in border border-white/20">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 pb-2">
                        <h2 className="text-2xl font-bold text-gray-900">Manage Grievance</h2>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 pt-2 space-y-6 overflow-y-auto flex-1">
                        {/* Details Box */}
                        <div className="bg-gray-100/80 rounded-lg p-6 space-y-2 text-sm text-gray-700">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <span className="font-semibold text-gray-500">ID:</span>
                                        <span className="font-medium text-gray-900">{grievance.grievanceId}</span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <span className="font-semibold text-gray-500">Citizen:</span>
                                        <span className="font-medium text-gray-900">{grievance.name} ({grievance.mobile})</span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <span className="font-semibold text-gray-500">Category:</span>
                                        <span className="font-medium text-gray-900">{grievance.category}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${grievance.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                        {grievance.status}
                                    </span>
                                    {grievance.subStatus && (
                                        <span className="mt-1 text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                            {(grievance.subStatus === 'ASSIGNED_TO_EE' || grievance.subStatus === 'ASSIGNED_TO_SUB')
                                                ? `Assigned to ${grievance.assignedZone || 'Official'}`
                                                : grievance.subStatus.replace(/_/g, ' ')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-[100px_1fr] gap-2 mt-2">
                                <span className="font-semibold text-gray-500">Description:</span>
                                <span className="text-gray-900">{grievance.description}</span>
                            </div>

                            {grievance.directorNote && (
                                <div className="mt-2 bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-100 text-xs">
                                    <div className="flex items-center gap-1 mb-1 font-bold uppercase tracking-wider">
                                        <Info className="w-3 h-3" /> Director's Instruction
                                    </div>
                                    {grievance.directorNote}
                                </div>
                            )}

                            {grievance.attachmentPath && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Attachment</span>
                                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                        <div className="flex items-center flex-1 min-w-0 mr-4">
                                            <FileText className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
                                            <span className="text-sm font-medium text-gray-700 truncate">
                                                {grievance.attachmentPath.split(/[/\\]/).pop()}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <a
                                                href={`${SERVER_URL}/${grievance.attachmentPath.replace(/\\/g, '/')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                                title="View / Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                    {/\.(jpg|jpeg|png|gif)$/i.test(grievance.attachmentPath) && (
                                        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex justify-center">
                                            <img
                                                src={`${SERVER_URL}/${grievance.attachmentPath.replace(/\\/g, '/')}`}
                                                alt="Preview"
                                                className="max-h-40 object-contain"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Update Status</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Status */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Action (कार्य)</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                                    >
                                        {isModerator ? (
                                            <>
                                                <option value="PENDING">Pending (लंबित)</option>
                                                <option value="ACCEPTED">Accept & Assign</option>
                                                <option value="REJECTED">Reject (खारिज)</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="PENDING">Accept and Assign</option>
                                                <option value="RESOLVED">Resolved (निस्तारित)</option>
                                                <option value="REJECTED">Rejected (अस्वीकार)</option>
                                                <option value="REASSIGN">Not related to me</option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                {/* Assigned Section - For Moderators and Non-Director Officials */}
                                {!user?.isDirector && !(isModerator && formData.status === 'REJECTED') && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Assigned Section</label>
                                        {isModerator ? (
                                            <select
                                                value={formData.assignedSection}
                                                onChange={(e) => setFormData({ ...formData, assignedSection: e.target.value, assignedOfficer: '' })}
                                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                                            >
                                                <option value="">Select Section</option>
                                                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                disabled
                                                value={formData.assignedSection}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md outline-none"
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Dynamic Assignment Config for Directors - Only show for Accept & Assign */}
                                {(() => {
                                    if (!user?.isDirector || formData.status !== 'PENDING') return null;
                                    const section = user.section || '';
                                    let zones = [];
                                    let title = 'Official';

                                    if (section === 'Director Engineering') {
                                        zones = ENGINEERING_ZONES;
                                        title = 'EE';
                                    } else if (['Deputy commissioner I', 'Deputy commissioner II'].includes(section)) {
                                        zones = REVENUE_ZONES;
                                        title = 'Tehsildar';
                                    } else if (section === 'Director Planning') {
                                        zones = PLANNING_ZONES;
                                        title = 'Planner';
                                    } else if (section === 'Director Legal') {
                                        zones = LEGAL_ZONES;
                                        title = 'Legal Official';
                                    } else if (section === 'Director Finance') {
                                        zones = FINANCE_ZONES;
                                        title = 'Finance Official';
                                    }

                                    return (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Assign Area/Official</label>
                                            <select
                                                value={formData.assignedZone}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    assignedZone: e.target.value,
                                                    assignedOfficer: `${title} - ${e.target.value}`
                                                })}
                                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
                                            >
                                                <option value="">-- Select {title} --</option>
                                                {zones.map(z => <option key={z} value={z}>{z}</option>)}
                                            </select>
                                            {formData.assignedZone && (
                                                <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mt-1">
                                                    Will be routed to {formData.assignedZone}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Expected Date - Hide for Moderator, show only for Section Officers when Pending or Accepted */}
                                {(!isModerator && (formData.status === 'PENDING' || formData.status === 'ACCEPTED')) && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Expected Disposal Date</label>
                                        <input
                                            type="date"
                                            min={new Date().toLocaleDateString('en-CA')}
                                            value={formData.expectedDate}
                                            onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                                        />
                                    </div>
                                )}

                                {/* Standard Officer List for Non-Directors */}
                                {!isModerator && !user?.isDirector && !(formData.status === 'REJECTED' || formData.status === 'REASSIGN' || formData.status === 'RESOLVED') && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Assigned Officer</label>
                                        <select
                                            value={formData.assignedOfficer}
                                            onChange={(e) => setFormData({ ...formData, assignedOfficer: e.target.value })}
                                            disabled={!formData.assignedSection}
                                            className={`w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 outline-none transition-shadow ${!formData.assignedSection ? 'bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">{formData.assignedSection ? '-- Select Officer --' : 'Select a section first'}</option>
                                            {formData.assignedSection && OFFICER_LIST[formData.assignedSection]?.map(officer => (
                                                <option key={officer} value={officer}>{officer}</option>
                                            ))}
                                            {formData.assignedSection && <option value="Other">Other (Type below...)</option>}
                                        </select>
                                        {formData.assignedOfficer === 'Other' && (
                                            <input
                                                type="text"
                                                placeholder="Enter Officer Name"
                                                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
                                                onChange={(e) => setFormData({ ...formData, assignedOfficer: e.target.value })}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Remarks */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Action Taken / Remarks</label>
                                <textarea
                                    placeholder={isModerator && formData.status === 'REJECTED' ? "Minimum 20 characters required..." : "Enter details of action taken..."}
                                    rows="5"
                                    value={formData.remarks}
                                    maxLength={250}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow resize-y"
                                ></textarea>
                                <div className="flex justify-between items-center mt-1">
                                    {((!isModerator && (formData.status === 'RESOLVED' || formData.status === 'REJECTED' || formData.status === 'REASSIGN')) || (isModerator && formData.status === 'REJECTED')) && (
                                        <p className={`text-xs ${formData.remarks.length < 20 ? 'text-red-500' : 'text-green-500'}`}>
                                            Min 20 characters required
                                        </p>
                                    )}
                                    <p className={`text-xs ml-auto ${formData.remarks.length >= 250 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                        {formData.remarks.length} / 250 characters
                                    </p>
                                </div>
                            </div>

                            {/* Optional File Attachment */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Attach Document / Image (Optional)</label>
                                <div className="flex items-center space-x-2">
                                    <label className="cursor-pointer flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*,.pdf"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setFormData({ ...formData, attachment: e.target.files[0] });
                                                }
                                            }}
                                        />
                                        <FileText className="w-4 h-4 mr-2" />
                                        {formData.attachment ? 'Change File' : 'Choose File'}
                                    </label>
                                    {formData.attachment && (
                                        <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm border border-blue-100">
                                            <span className="truncate max-w-[150px]">{formData.attachment.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, attachment: null })}
                                                className="ml-2 hover:text-red-500"
                                            >
                                                <X className="w-4 h-4 ml-1" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2 border border-teal-600 text-teal-700 font-semibold rounded-md hover:bg-teal-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-6 py-2 text-white font-semibold rounded-md transition-colors shadow-sm active:scale-95 transform bg-[#005f73] hover:bg-[#0a4f61]`}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageGrievanceModal;
