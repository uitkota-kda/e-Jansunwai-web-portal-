import { useNavigate } from 'react-router-dom';
import { X, User, Phone, MapPin, FileText, Calendar, Clock, Download, Video, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const GrievanceDetailsModal = ({ grievance, onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isModerator = user?.role === 'MODERATOR' || user?.role === 'SUPER_ADMIN';

    if (!grievance) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-orange-100 text-orange-700';
            case 'RESOLVED': return 'bg-green-100 text-green-700';
            case 'ESCALATED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        const logsHtml = (grievance.logs || []).map(log => `
            <div class="timeline-item">
                <div class="timeline-meta">
                    <span class="timeline-action">${log.action}</span>
                    <span class="timeline-date">${new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div class="timeline-content">
                    <div class="timeline-remarks">${log.attachmentPath && log.attachmentPath.startsWith('Remarks:') ? log.attachmentPath.replace('Remarks: ', '') : 'Status updated.'}</div>
                    <div class="timeline-by">Action by: ${log.performedBy || 'System'}</div>
                </div>
            </div>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Grievance Details - ${grievance.grievanceId}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.4; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                        .logo { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                        .sub { color: #666; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                        .field { margin-bottom: 15px; }
                        .label { font-size: 10px; color: #666; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; }
                        .value { font-size: 13px; font-weight: 600; margin-top: 4px; }
                        .box { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #eee; }
                        .status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-weight: bold; background: #eee; font-size: 11px; }
                        
                        h4 { font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 25px; margin-bottom: 15px; text-transform: uppercase; color: #555; }
                        
                        .timeline { margin-top: 20px; }
                        .timeline-item { border-left: 2px solid #ddd; padding-left: 15px; margin-bottom: 15px; position: relative; }
                        .timeline-item::before { content: ''; position: absolute; left: -6px; top: 0; width: 10px; height: 10px; background: #999; border-radius: 50%; }
                        .timeline-meta { display: flex; justify-content: space-between; margin-bottom: 5px; }
                        .timeline-action { font-weight: bold; font-size: 12px; color: #000; }
                        .timeline-date { font-size: 10px; color: #888; }
                        .timeline-remarks { font-size: 12px; color: #444; }
                        .timeline-by { font-size: 10px; color: #777; font-weight: bold; margin-top: 4px; }
                        
                        @media print {
                            body { padding: 0; }
                            .box { break-inside: avoid; }
                            .timeline-item { break-inside: avoid; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <img src="${window.location.origin}/logo.png" style="height: 80px; width: auto; margin-bottom: 10px; object-fit: contain;" />
                        <div class="logo">Kota Development Authority</div>
                        <div class="sub">e-Jansunwai Grievance Portal - Official Record</div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                        <div>
                            <div class="label">Grievance ID</div>
                            <div style="font-size: 22px; font-weight: bold; color: #005f73;">${grievance.grievanceId}</div>
                        </div>
                        <div style="text-align: right;">
                            <div class="label">Current Status</div>
                            <span class="status">${grievance.status}</span>
                        </div>
                    </div>

                    <div class="grid">
                        <div class="field">
                            <div class="label">Applicant Name</div>
                            <div class="value">${grievance.name}</div>
                        </div>
                        <div class="field">
                            <div class="label">Mobile Number</div>
                            <div class="value">${grievance.mobile}</div>
                        </div>
                        <div class="field">
                            <div class="label">Date Submitted</div>
                            <div class="value">${new Date(grievance.createdAt).toLocaleString()}</div>
                        </div>
                        <div class="field">
                            <div class="label">Location / Area</div>
                            <div class="value">${grievance.address}</div>
                        </div>
                        <div class="field">
                            <div class="label">Grievance Source</div>
                            <div class="value">${grievance.source?.replace('_', ' ') || 'WEB PORTAL'}</div>
                        </div>
                    </div>

                    <div class="box">
                        <div class="label" style="margin-bottom: 8px;">Grievance Description</div>
                        <div class="value" style="font-weight: normal; line-height: 1.6;">${grievance.description}</div>
                    </div>

                    ${(grievance.assignedSection || grievance.assignedOfficer || grievance.assignedZone || grievance.expectedDate || grievance.subStatus) ? `
                        <div class="box" style="background: #e3f2fd; border-color: #90caf9;">
                            <div class="label" style="margin-bottom: 10px; color: #1565c0;">INTERNAL STATUS & ASSIGNMENT</div>
                            <div class="grid">
                                ${grievance.assignedSection ? `
                                    <div class="field">
                                        <div class="label">Assigned Section</div>
                                        <div class="value">${grievance.assignedSection}</div>
                                    </div>
                                ` : ''}
                                ${grievance.assignedOfficer ? `
                                    <div class="field">
                                        <div class="label">Assigned Officer</div>
                                        <div class="value">${grievance.assignedOfficer}</div>
                                    </div>
                                ` : ''}
                                ${grievance.assignedZone ? `
                                    <div class="field">
                                        <div class="label">Assigned Area/Officer</div>
                                        <div class="value">${grievance.assignedZone}</div>
                                    </div>
                                ` : ''}
                                ${grievance.expectedDate && !isModerator ? `
                                    <div class="field">
                                        <div class="label">Expected Disposal Date</div>
                                        <div class="value">${grievance.expectedDate}</div>
                                    </div>
                                ` : ''}
                                ${grievance.subStatus ? `
                                    <div class="field">
                                        <div class="label">Sub Status</div>
                                        <div class="value">${(grievance.subStatus === 'ASSIGNED_TO_EE' || grievance.subStatus === 'ASSIGNED_TO_SUB') ? `Assigned to ${grievance.assignedZone || 'Official'}` : grievance.subStatus.replace(/_/g, ' ')}</div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}

                    <h4>Grievance Life Cycle & Action History</h4>
                    <div class="timeline">
                        ${logsHtml || '<div class="value">No action history recorded yet.</div>'}
                    </div>

                    <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 20px;">
                        This document provides the complete processing history for Grievance ID: ${grievance.grievanceId}.<br>
                        Generated by e-Jansunwai Portal on ${new Date().toLocaleString()}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    };

    return (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/60 backdrop-blur-sm">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}></div>

                <div className="relative transform overflow-hidden rounded-[2rem] bg-white text-left shadow-2xl transition-all sm:my-4 w-full max-w-7xl h-[92vh] flex flex-col animate-scale-in border border-white/20">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-900">Grievance Details</h3>
                                <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-black uppercase tracking-widest border
                                    ${grievance.source === 'WHATSAPP' ? 'bg-green-50 text-green-700 border-green-200' :
                                        grievance.source === 'OPERATOR' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                    {grievance.source?.replace('_', ' ') || 'WEB PORTAL'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 font-mono">{grievance.grievanceId}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="p-6 overflow-y-auto space-y-6">

                        {/* Status Badge */}
                        <div className="flex justify-between items-start">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusColor(grievance.status)}`}>
                                {grievance.status}
                            </span>
                            <div className="text-right text-sm text-gray-500">
                                <div className="flex items-center justify-end">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {new Date(grievance.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center justify-end mt-1">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {new Date(grievance.createdAt).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>

                        {/* Personal Info */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Applicant Details</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start">
                                        <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">{grievance.name}</p>
                                            <p className="text-xs text-gray-500">Complainant</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">{grievance.mobile}</p>
                                            <p className="text-xs text-gray-500">Contact Number</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start pt-2 border-t border-gray-100/50">
                                        <div className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex items-center justify-center">
                                            <Activity className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-xs uppercase tracking-wider">{grievance.source?.replace('_', ' ') || 'WEB PORTAL'}</p>
                                            <p className="text-[10px] text-gray-500">Grievance Source</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Location</h4>
                                <div className="flex items-start">
                                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-gray-900 leading-snug">{grievance.address}</p>
                                        <p className="text-xs text-gray-500 mt-1">Area / Colony</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Complaint Details */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-kota-500" /> Description
                            </h4>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {grievance.description}
                            </div>
                        </div>

                        {/* Internal Tracking */}
                        {(grievance.assignedOfficer || grievance.assignedSection || grievance.assignedZone || grievance.expectedDate || grievance.remarks) && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Internal Status & Assignment</h4>
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    {grievance.assignedSection && (
                                        <div>
                                            <p className="text-xs text-blue-600 font-semibold uppercase">Assigned Section</p>
                                            <p className="text-sm font-bold text-gray-900">{grievance.assignedSection}</p>
                                        </div>
                                    )}
                                    {grievance.assignedOfficer && (
                                        <div>
                                            <p className="text-xs text-blue-600 font-semibold uppercase">Assigned Officer</p>
                                            <p className="text-sm font-bold text-gray-900">{grievance.assignedOfficer}</p>
                                        </div>
                                    )}
                                    {grievance.assignedZone && (
                                        <div>
                                            <p className="text-xs text-blue-600 font-semibold uppercase">Assigned Area/Officer</p>
                                            <p className="text-sm font-bold text-gray-900">{grievance.assignedZone}</p>
                                        </div>
                                    )}
                                    {grievance.expectedDate && !isModerator && (
                                        <div>
                                            <p className="text-xs text-blue-600 font-semibold uppercase">Expected Disposal</p>
                                            <p className="text-sm font-bold text-gray-900">{grievance.expectedDate}</p>
                                        </div>
                                    )}
                                    {grievance.subStatus && (
                                        <div>
                                            <p className="text-xs text-blue-600 font-semibold uppercase">Sub Status</p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {(grievance.subStatus === 'ASSIGNED_TO_EE' || grievance.subStatus === 'ASSIGNED_TO_SUB')
                                                    ? `Assigned to ${grievance.assignedZone || 'Official'}`
                                                    : grievance.subStatus.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {grievance.remarks && (
                                    <div className="pt-3 border-t border-blue-200">
                                        <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Remarks / Action Taken</p>
                                        <p className="text-sm text-gray-800">{grievance.remarks}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video Hearing Details */}
                        {grievance.hearingLink && (
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                <h4 className="text-sm font-bold text-orange-800 mb-3 flex items-center">
                                    <Video className="w-4 h-4 mr-2" /> Scheduled Video Hearing
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-orange-600 font-semibold uppercase">Date & Time</p>
                                        <p className="text-sm font-bold text-gray-900">{grievance.hearingDate} at {grievance.hearingTime}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-orange-600 font-semibold uppercase mb-1">Platform</p>
                                        <p className="text-xs font-bold text-gray-500">Jitsi Meet</p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-orange-200">
                                    <button
                                        onClick={() => {
                                            const meetingId = grievance.hearingLink.split('/').pop();
                                            navigate(`/hearing/${meetingId}`);
                                            onClose();
                                        }}
                                        className="flex items-center justify-center w-full py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition"
                                    >
                                        Join Hearing Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Attachments */}
                        {grievance.attachmentPath && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                    <Download className="w-4 h-4 mr-2 text-kota-500" /> Attachments
                                </h4>
                                <div className="space-y-4">
                                    {/* File Preview Component */}
                                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 max-w-sm">
                                        <div className="p-3 bg-white border-b border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-600 mr-2">
                                                    {grievance.attachmentPath.toLowerCase().endsWith('.pdf') ? 'PDF' : <FileText className="w-4 h-4" />}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                                                    {grievance.attachmentPath.split('/').pop()}
                                                </span>
                                            </div>
                                            <a
                                                href={`http://localhost:3000/${grievance.attachmentPath}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="Download/View"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>

                                        {/* Image Preview */}
                                        {!grievance.attachmentPath.toLowerCase().endsWith('.pdf') && (
                                            <div className="p-2 flex justify-center bg-gray-100 min-h-[100px] items-center">
                                                <img
                                                    src={`http://localhost:3000/${grievance.attachmentPath}`}
                                                    alt="Attachment Preview"
                                                    className="max-h-48 rounded-lg shadow-sm object-contain"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div className="hidden flex-col items-center text-gray-400 py-8">
                                                    <FileText className="w-8 h-8 mb-2" />
                                                    <p className="text-xs">Preview unavailable</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grievance Lifecycle & Timeline */}
                        {grievance.logs && grievance.logs.length > 0 && (
                            <div className="pt-6 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 mb-6 flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-indigo-500" /> Grievance Lifecycle & Timeline
                                </h4>
                                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-100 before:via-indigo-100 before:to-transparent">
                                    {grievance.logs.map((log, index) => (
                                        <div key={log.id} className="relative flex items-start group">
                                            <div className="absolute left-0 flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-50 shadow-sm transition-transform group-hover:scale-110">
                                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                                            </div>
                                            <div className="ml-14 flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${log.action.includes('Returned') ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {log.action}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400">
                                                        {new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </span>
                                                </div>
                                                <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 shadow-sm">
                                                    <p className="text-sm text-gray-800 leading-relaxed">
                                                        {log.attachmentPath && log.attachmentPath.startsWith('Remarks:')
                                                            ? log.attachmentPath.replace('Remarks: ', '')
                                                            : log.action.includes('Returned') ? 'Requested reassignment to another section.' : 'Status updated.'}
                                                    </p>
                                                    <div className="mt-2 flex items-center text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                                                        <User className="w-3 h-3 mr-1" />
                                                        Action by: {log.performedBy || 'System'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Satisfaction Workflow Tracking & Simulation */}
                        {grievance.satisfactionStatus && (
                            <div className="pt-6 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                    <Activity className="w-4 h-4 mr-2 text-purple-500" /> Citizen Satisfaction Status
                                </h4>
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest text-purple-600">Current Status</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight
                                            ${grievance.satisfactionStatus.includes('NOT_SATISFIED') ? 'bg-red-100 text-red-700' :
                                                grievance.satisfactionStatus.includes('SATISFIED') ? 'bg-green-100 text-green-700' :
                                                    'bg-amber-100 text-amber-700'}`}>
                                            {grievance.satisfactionStatus.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    {/* Simulation Controls - For Demo Purpose Only */}
                                    {(grievance.satisfactionStatus === 'PENDING_FEEDBACK' || grievance.satisfactionStatus === 'VC_DONE_SO') && (
                                        <div className="mt-4 pt-4 border-t border-purple-200">
                                            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Developer Simulation: Simulate WhatsApp Reply</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const response = await fetch(`http://localhost:3000/api/grievances/${grievance.id}/feedback`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ feedback: 'YES' })
                                                            });
                                                            if (response.ok) { window.alert("Simulated: Citizen replied YES"); onClose(); }
                                                        } catch (e) { alert("Error simulating feedback"); }
                                                    }}
                                                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition"
                                                >
                                                    Simulate "YES, SATISFIED"
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const response = await fetch(`http://localhost:3000/api/grievances/${grievance.id}/feedback`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ feedback: 'NO' })
                                                            });
                                                            if (response.ok) { window.alert("Simulated: Citizen replied NO"); onClose(); }
                                                        } catch (e) { alert("Error simulating feedback"); }
                                                    }}
                                                    className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
                                                >
                                                    Simulate "NO, UNSATISFIED"
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
                        >
                            Close
                        </button>
                        <button
                            className="px-5 py-2 bg-kota-600 text-white rounded-lg font-bold hover:bg-kota-700 transition shadow-lg shadow-kota-100"
                            onClick={handlePrint}
                        >
                            Print Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrievanceDetailsModal;
