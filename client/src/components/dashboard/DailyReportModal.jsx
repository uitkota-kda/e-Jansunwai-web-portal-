import React, { useRef } from 'react';
import { X, Printer, Download, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const DailyReportModal = ({ isOpen, onClose, grievances }) => {
    const reportRef = useRef();

    if (!isOpen) return null;

    const today = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const stats = {
        total: grievances.length,
        pending: grievances.filter(g => g.status === 'PENDING').length,
        resolved: grievances.filter(g => g.status === 'RESOLVED').length,
        escalated: grievances.filter(g => g.status === 'ESCALATED').length
    };

    const handlePrint = () => {
        const printContent = reportRef.current.innerHTML;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); // To restore React state
    };

    return (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/60 backdrop-blur-sm">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}></div>

                <div className="relative transform overflow-hidden rounded-[1rem] bg-white text-left shadow-2xl transition-all sm:my-2 w-[98vw] h-[96vh] animate-scale-in flex flex-col border border-white/20">
                    {/* Header */}
                    <div className="bg-slate-900 px-8 py-4 flex justify-between items-center text-white shrink-0">
                        <div className="flex items-center space-x-3">
                            <FileText className="w-6 h-6 text-kota-400" />
                            <h3 className="text-xl font-bold">Daily Activity Report</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handlePrint}
                                className="flex items-center px-4 py-2 bg-kota-600 hover:bg-kota-700 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                <Printer className="w-4 h-4 mr-2" /> Print Report
                            </button>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Report Preview */}
                    <div className="flex-1 overflow-y-auto p-12 bg-gray-50">
                        <div ref={reportRef} className="bg-white p-12 shadow-sm border border-gray-200 min-h-full mx-auto max-w-3xl font-serif text-gray-800">
                            {/* Letterhead */}
                            <div className="text-center border-b-2 border-slate-900 pb-6 mb-8 flex flex-col items-center">
                                <img src="/logo.png" alt="KDA Logo" className="h-20 w-auto mb-4 object-contain" />
                                <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-900">Kota Development Authority</h2>
                                <p className="text-sm font-medium text-slate-600">Public Grievance Redressal Cell</p>
                                <p className="text-xs text-slate-500 mt-1 italic">"Serving with Transparency and Efficiency"</p>
                            </div>

                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Report Type</p>
                                    <h4 className="text-xl font-bold text-slate-900">Daily Grievance Summary</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Date of Issue</p>
                                    <h4 className="text-lg font-bold text-slate-900">{today}</h4>
                                </div>
                            </div>

                            {/* Summary Stats Grid */}
                            <div className="grid grid-cols-4 gap-4 mb-10 text-center">
                                {[
                                    { label: 'Total Received', value: stats.total, color: 'text-slate-900' },
                                    { label: 'Pending Cases', value: stats.pending, color: 'text-orange-600' },
                                    { label: 'Resolved Today', value: stats.resolved, color: 'text-emerald-600' },
                                    { label: 'Escalated', value: stats.escalated, color: 'text-red-600' }
                                ].map((s, i) => (
                                    <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{s.label}</p>
                                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Grievance Table */}
                            <div className="mb-10">
                                <h5 className="text-sm font-bold border-b border-gray-200 pb-2 mb-4 uppercase text-slate-900">Case Breakdown</h5>
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-slate-100">
                                            <th className="py-3 font-bold text-slate-600">ID</th>
                                            <th className="py-3 font-bold text-slate-600">Category</th>
                                            <th className="py-3 font-bold text-slate-600">Citizen Name</th>
                                            <th className="py-3 font-bold text-slate-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grievances.slice(0, 15).map((g, i) => (
                                            <tr key={i} className="border-b border-gray-50">
                                                <td className="py-2.5 font-mono text-xs">{g.grievanceId}</td>
                                                <td className="py-2.5">{g.category}</td>
                                                <td className="py-2.5">{g.name}</td>
                                                <td className="py-2.5">
                                                    <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full border ${g.status === 'RESOLVED' ? 'bg-green-50 border-green-200 text-green-700' :
                                                        g.status === 'ESCALATED' ? 'bg-red-50 border-red-200 text-red-700' :
                                                            'bg-orange-50 border-orange-200 text-orange-700'
                                                        }`}>
                                                        {g.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {grievances.length > 15 && (
                                    <p className="text-[10px] text-gray-400 italic mt-4">...and {grievances.length - 15} more records</p>
                                )}
                            </div>
                            {/* Signature Section */}
                            <div className="mt-20 flex justify-between">
                                <div className="w-48 border-t border-slate-300 pt-2 text-center">
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Section Officer</p>
                                    <p className="text-xs font-bold text-slate-900 mt-1">Digital Signature</p>
                                </div>
                                <div className="w-48 border-t border-slate-300 pt-2 text-center">
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Office Seal</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyReportModal;
