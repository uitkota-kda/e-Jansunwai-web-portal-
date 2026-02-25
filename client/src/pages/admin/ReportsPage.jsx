import React, { useRef, useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Download, Calendar, Filter, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReportsPage = () => {
    const reportRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!reportRef.current) return;

        try {
            setIsExporting(true);
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#f9fafb',
                ignoreElements: (element) => element.dataset.html2canvasIgnore === 'true',
                scrollY: -window.scrollY
            });

            const imgData = canvas.toDataURL('image/png');

            // Calculate dimensions to fit width to A4 (210mm) while maintaining aspect ratio
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Create PDF with custom height to fit the entire content
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [imgWidth, imgHeight]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // Open PDF in new tab
            const pdfUrl = pdf.output('bloburl');
            window.open(pdfUrl, '_blank');

            // Optional: Still save it if needed, but 'Open' was requested
            // pdf.save(`KDA_Commissioner_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export report. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sourceFilter, setSourceFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('7');

    useEffect(() => {
        const tokenData = localStorage.getItem('kda_user');
        const token = tokenData ? JSON.parse(tokenData).token : null;

        fetch('http://localhost:3000/api/grievances', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setGrievances(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching report data:', err);
                setLoading(false);
            });
    }, []);

    // Analytics Calculations
    const { dailyData, statusData, sectionData, metrics, filteredGrievances } = React.useMemo(() => {
        const today = new Date();
        const daysToLookBack = parseInt(dateFilter);
        const lastDays = Array.from({ length: daysToLookBack }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - ((daysToLookBack - 1) - i));
            return d.toISOString().split('T')[0];
        });

        // 1. Daily Intake vs Resolved
        // 1. Daily Intake vs Resolved
        const dailyStats = lastDays.map(dateStr => {
            const dayStart = new Date(dateStr).setHours(0, 0, 0, 0);
            const dayEnd = new Date(dateStr).setHours(23, 59, 59, 999);

            const intake = grievances.filter(g => {
                const gDate = new Date(g.createdAt).getTime();
                return gDate >= dayStart && gDate <= dayEnd;
            }).length;

            const resolved = grievances.filter(g => {
                if (g.status !== 'RESOLVED') return false;
                const gDate = new Date(g.updatedAt).getTime(); // Using updatedAt for resolution date
                return gDate >= dayStart && gDate <= dayEnd;
            }).length;

            const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
            return { name: dayName, fullDate: dateStr, intake, resolved };
        });

        // 2. Status Distribution
        const statusStats = [
            { name: 'Resolved', value: grievances.filter(g => g.status === 'RESOLVED').length, color: '#10B981' },
            { name: 'Pending', value: grievances.filter(g => g.status === 'PENDING').length, color: '#F59E0B' },
            { name: 'In Progress', value: grievances.filter(g => g.status === 'IN_PROGRESS').length, color: '#3B82F6' },
            { name: 'Escalated', value: grievances.filter(g => g.status === 'ESCALATED').length, color: '#EF4444' },
            { name: 'Rejected', value: grievances.filter(g => g.status === 'REJECTED').length, color: '#6B7280' },
        ].filter(s => s.value > 0);

        // 3. Section-wise Pendency
        // Identify unique categories first
        const categories = [...new Set(grievances.map(g => g.category || 'General'))];
        const sectionStats = categories.map(cat => {
            const catGrievances = grievances.filter(g => (g.category || 'General') === cat && g.status !== 'RESOLVED' && g.status !== 'REJECTED');

            let under7 = 0;
            let over7 = 0;
            const now = new Date();

            catGrievances.forEach(g => {
                const diffTime = Math.abs(now - new Date(g.createdAt));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 7) over7++;
                else under7++;
            });

            return { name: cat, 'Under 7 Days': under7, 'Over 7 Days': over7 };
        });

        // 4. Key Metrics
        const todayStr = today.toISOString().split('T')[0];
        const intakeToday = grievances.filter(g => g.createdAt.startsWith(todayStr)).length;

        // Disposal Rate
        const totalDisposed = grievances.filter(g => g.status === 'RESOLVED' || g.status === 'REJECTED').length;
        const total = grievances.length;
        const disposalRate = total > 0 ? ((totalDisposed / total) * 100).toFixed(1) : 0;

        // Critical Pendency (>7 Days)
        const criticalPendency = grievances.filter(g => {
            if (g.status === 'RESOLVED' || g.status === 'REJECTED') return false;
            const diffTime = Math.abs(today - new Date(g.createdAt));
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) > 7;
        }).length;

        return {
            dailyData: dailyStats,
            statusData: statusStats,
            sectionData: sectionStats,
            metrics: { intakeToday, disposalRate, criticalPendency },
            filteredGrievances: grievances.filter(g => sourceFilter === 'ALL' || g.source === sourceFilter)
        };
    }, [grievances, sourceFilter, dateFilter]);

    return (
        <div ref={reportRef} className="space-y-8 animate-fade-in-up bg-gray-50 p-6 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Commissioner Dashboard & Analytics</h1>
                    <p className="text-gray-500">Real-time monitoring of grievance redressal performance</p>
                </div>
                <div className="flex space-x-3" data-html2canvas-ignore="true">
                    <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg font-medium outline-none focus:ring-2 focus:ring-kota-500 shadow-sm"
                    >
                        <option value="ALL">All Sources</option>
                        <option value="WEB_PORTAL">Via Citizen</option>
                        <option value="PHYSICAL_JANSUNWAI">Physical Jansunwai</option>
                        <option value="MINISTER_JANSUNWAI">Minister Jansunwai</option>
                        <option value="MP_MLA_GRIEVANCES">MP/MLA Grievances</option>
                        <option value="MISCELLANEOUS">Miscellaneous</option>
                    </select>
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg font-medium outline-none focus:ring-2 focus:ring-kota-500 shadow-sm"
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="15">Last 15 Days</option>
                        <option value="30">Last 30 Days</option>
                    </select>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-kota-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-kota-700 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5 mr-2" /> Export Report
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Top Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Intake (Today)</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{metrics?.intakeToday || 0}</h3>
                    </div>
                    <div className="mt-4 text-sm text-green-600 font-bold bg-green-50 w-fit px-2 py-1 rounded">
                        Live Update
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Disposal Rate</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{metrics?.disposalRate || 0}%</h3>
                    </div>
                    <div className="mt-4 text-sm text-blue-600 font-bold bg-blue-50 w-fit px-2 py-1 rounded">
                        Target: 80%
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Critical Pendency</p>
                        <h3 className={`text-3xl font-bold mt-2 ${metrics?.criticalPendency > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {metrics?.criticalPendency || 0}
                        </h3>
                    </div>
                    <div className="mt-4 text-sm text-red-600 font-bold bg-red-50 w-fit px-2 py-1 rounded">
                        &gt; 7 Days Overdue
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. Daily Intake Trends */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg text-gray-900 mb-6">Daily Intake vs Disposal (Last {dateFilter} Days)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIntake" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="intake" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorIntake)" name="New Grievances" />
                                <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" name="Disposed" />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Disposal vs Pending (Pie) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg text-gray-900 mb-6">Current Status Distribution</h3>
                    <div className="h-80 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Section-wise Pendency (Bar) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm lg:col-span-2">
                    <h3 className="font-bold text-lg text-gray-900 mb-6">Section-wise Pendency</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={sectionData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Bar dataKey="Under 7 Days" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} barSize={40} />
                                <Bar dataKey="Over 7 Days" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 4. Detailed Grievance Report Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900">Detailed Grievance Logs</h3>
                    <div className="text-sm text-gray-500">
                        Total Records: {grievances.length}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Complainant</th>
                                <th className="px-6 py-4">Origin</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Assigned To</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Resolution Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">Loading data...</td>
                                </tr>
                            ) : filteredGrievances.length > 0 ? (
                                filteredGrievances.map((g) => (
                                    <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{g.grievanceId}</td>
                                        <td className="px-6 py-4">{new Date(g.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{g.name}</div>
                                            <div className="text-xs text-gray-400">{g.mobile}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                {g.source?.replace('_', ' ') || 'WEB PORTAL'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{g.category}</td>
                                        <td className="px-6 py-4">
                                            {g.assignedOfficer ? (
                                                <>
                                                    <div className="font-medium">{g.assignedOfficer}</div>
                                                    <div className="text-xs text-gray-400">{g.assignedSection}</div>
                                                </>
                                            ) : <span className="text-gray-300">-</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${g.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                                g.status === 'ESCALATED' ? 'bg-red-100 text-red-700' :
                                                    g.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {g.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {g.status === 'RESOLVED' ? (
                                                <span className="text-green-600 font-medium">
                                                    {Math.ceil((new Date() - new Date(g.createdAt)) / (1000 * 60 * 60 * 24))} Days
                                                </span>
                                            ) : <span className="text-gray-400">-</span>}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
