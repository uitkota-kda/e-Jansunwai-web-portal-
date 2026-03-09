import { API_BASE_URL } from '../../config';
import React, { useState, useEffect, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Download, Calendar, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CommissionerDashboard = () => {
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/grievances`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setGrievances(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                setLoading(false);
            });
    }, []);

    // Analytics Calculations
    const { dailyData, statusData, sectionData, metrics, criticalItems } = useMemo(() => {
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        // 1. Daily Intake vs Resolved
        const dailyStats = last7Days.map(dateStr => {
            const dayStart = new Date(dateStr).setHours(0, 0, 0, 0);
            const dayEnd = new Date(dateStr).setHours(23, 59, 59, 999);

            const intake = grievances.filter(g => {
                const gDate = new Date(g.createdAt).getTime();
                return gDate >= dayStart && gDate <= dayEnd;
            }).length;

            const resolved = grievances.filter(g => {
                if (g.status !== 'RESOLVED') return false;
                const gDate = new Date(g.updatedAt).getTime();
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

        // 4. metrics
        const todayStr = today.toISOString().split('T')[0];
        const intakeToday = grievances.filter(g => g.createdAt.startsWith(todayStr)).length;

        const totalDisposed = grievances.filter(g => g.status === 'RESOLVED' || g.status === 'REJECTED').length;
        const total = grievances.length;
        const disposalRate = total > 0 ? ((totalDisposed / total) * 100).toFixed(1) : 0;

        // Critical Pendency List (>7 Days)
        const criticalList = grievances.filter(g => {
            if (g.status === 'RESOLVED' || g.status === 'REJECTED') return false;
            const diffTime = Math.abs(today - new Date(g.createdAt));
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) > 7;
        });

        return {
            dailyData: dailyStats,
            statusData: statusStats,
            sectionData: sectionStats,
            criticalItems: criticalList,
            metrics: { intakeToday, disposalRate, criticalPendency: criticalList.length }
        };
    }, [grievances]);

    return (
        <div className="space-y-8 animate-fade-in-up bg-slate-50 p-6 -m-6 min-h-screen">
            {/* Executive Header */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center space-x-4">
                    <div className="bg-kota-100 p-3 rounded-full">
                        <Activity className="w-8 h-8 text-kota-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Commissioner's Control Panel</h1>
                        <p className="text-slate-500">System-wide performance monitoring & pendency tracking</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    <div className="text-right hidden md:block">
                        <p className="text-sm text-slate-500">Last Updated</p>
                        <p className="font-bold text-slate-900">{new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 h-full w-1 bg-blue-500"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Intake</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">{grievances.length}</h3>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-lg"><Activity className="w-5 h-5 text-blue-600" /></div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-blue-600 font-bold">
                        <span className="bg-blue-50 px-2 py-1 rounded text-xs">Today: +{metrics?.intakeToday || 0}</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 h-full w-1 bg-green-500"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Disposal Rate</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">{metrics?.disposalRate}%</h3>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600 font-bold">
                        <span className="bg-green-50 px-2 py-1 rounded text-xs">Target: >85%</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 h-full w-1 bg-purple-500"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Pending</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">
                                {grievances.filter(g => g.status === 'PENDING' || g.status === 'IN_PROGRESS').length}
                            </h3>
                        </div>
                        <div className="bg-purple-50 p-2 rounded-lg"><Clock className="w-5 h-5 text-purple-600" /></div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-purple-600 font-bold">
                        <span className="bg-purple-50 px-2 py-1 rounded text-xs">In Progress</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 h-full w-1 bg-red-500"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Critical Pendency</p>
                            <h3 className={`text-3xl font-bold mt-2 ${metrics?.criticalPendency > 0 ? 'text-red-500' : 'text-slate-900'}`}>{metrics?.criticalPendency}</h3>
                        </div>
                        <div className="bg-red-50 p-2 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-red-600 font-bold">
                        <span className="bg-red-50 px-2 py-1 rounded text-xs">> 7 Days Overdue</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Trends Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-blue-500" />
                        System Performance Trends (Last 7 Days)
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIntakeC" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorResolvedC" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="intake" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorIntakeC)" name="New" />
                                <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolvedC)" name="Disposed" />
                                <Legend verticalAlign="top" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Section Pendency Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 mb-6">Departmental Lag</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={sectionData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: '#475569' }} />
                                <Tooltip cursor={{ fill: '#F8FAFC' }} />
                                <Legend />
                                <Bar dataKey="Over 7 Days" name="Critical (>7d)" stackId="a" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={20} />
                                <Bar dataKey="Under 7 Days" name="Normal (<7d)" stackId="a" fill="#94A3B8" radius={[4, 0, 0, 4]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Critical Pendency Monitor Table (RED ZONE) */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                    <div className="flex items-center text-red-700">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        <h3 className="font-bold text-lg">Critical Pendency Monitor (Action Required)</h3>
                    </div>
                    <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                        {criticalItems.length} Cases
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Grievance ID</th>
                                <th className="px-6 py-4">Days Pending</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Assigned Officer</th>
                                <th className="px-6 py-4">Current Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {criticalItems.length > 0 ? (
                                criticalItems.map((g) => {
                                    const days = Math.ceil(Math.abs(new Date() - new Date(g.createdAt)) / (1000 * 60 * 60 * 24));
                                    return (
                                        <tr key={g.id} className="hover:bg-red-50/30 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-800">{g.grievanceId}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-red-600 font-bold">{days} Days</span>
                                            </td>
                                            <td className="px-6 py-4">{g.category}</td>
                                            <td className="px-6 py-4 font-medium">
                                                {g.assignedOfficer || <span className="text-slate-400 italic">Unassigned</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                                    {g.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 flex flex-col items-center">
                                        <CheckCircle className="w-12 h-12 mb-3 text-green-400 opacity-50" />
                                        <p>No critical pendency. Good job!</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CommissionerDashboard;
