import React, { useState, useEffect } from 'react';
import {
    FileText, CheckCircle, Clock, Trash2, Video, Search, Filter, AlertTriangle, Activity,
    LayoutDashboard, BarChart2, AlertCircle, RefreshCcw, MapPin, User, XCircle, Calendar, RotateCw, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import GrievanceDetailsModal from '../../components/dashboard/GrievanceDetailsModal';
import { sendMockWhatsApp } from '../../components/layout/MockWhatsApp';
import ManageGrievanceModal from '../../components/dashboard/ManageGrievanceModal'; // Ensure this can handle reopening or create new one


const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#8b5cf6', '#06b6d4'];

const CommissionerDashboard = () => {
    const { user } = useAuth();

    // Helper to get token
    const getToken = () => {
        const stored = localStorage.getItem('kda_user');
        return stored ? JSON.parse(stored).token : null;
    };

    const [grievances, setGrievances] = useState([]);
    const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, OVERDUE, RESOLVED, REOPENED
    const [timeFilter, setTimeFilter] = useState('ALL'); // ALL, 7, 15, 30, 90 (3mo), 150 (5mo), CUSTOM
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [reopenModalOpen, setReopenModalOpen] = useState(false);
    const [reopenReason, setReopenReason] = useState('');
    const [reopenTarget, setReopenTarget] = useState(null);

    // Reporting & Drill-down State
    const [showSectionStats, setShowSectionStats] = useState(false);
    const [reportView, setReportView] = useState('SECTION');
    const [showDrillDown, setShowDrillDown] = useState(false);
    const [drillDownData, setDrillDownData] = useState({ title: '', grievances: [] });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    // View States
    const [showAnalytics, setShowAnalytics] = useState(false); // Default hidden to focus on grievances

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

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, timeFilter, searchTerm, startDate, endDate]);

    const fetchData = async () => {
        try {
            const token = getToken();
            console.log('Fetching Commissioner Data with token:', token ? 'Present' : 'Missing');

            const response = await fetch('http://localhost:3000/api/grievances', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            console.log('Commissioner Data Response:', data);

            if (data.success) {
                // Commissioner sees EVERYTHING, but exclude drafts if any
                // Also default to sorting by newest
                setGrievances(data.data.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)));
            } else {
                console.error('Failed to load Commissioner data:', data.message);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReopen = async () => {
        if (!reopenTarget || !reopenReason) return;

        try {
            const token = getToken();
            const response = await fetch(`http://localhost:3000/api/grievances/${reopenTarget.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'PENDING', // Send back to pending queue
                    subStatus: 'REOPENED_BY_COMMISSIONER', // Flag for system
                    assignedSection: null, // Reset assignment so it goes back to Moderator pool
                    assignedToId: null,
                    isReopened: true,
                    reopenedBy: user.name || 'Commissioner',
                    reopenReason: reopenReason,
                    remarks: `Re-opened by Commissioner: ${reopenReason}`
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('Grievance Re-opened Successfully');
                setReopenModalOpen(false);
                setReopenTarget(null);
                setReopenReason('');
                fetchData();
            } else {
                alert('Failed to re-open');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatClick = (tabName) => {
        setActiveTab(tabName);
        setShowSectionStats(false); // ensure we are seeking the list
        setShowAnalytics(false); // focus on list
        // Optional: Scroll to list
        const element = document.getElementById('grievance-list-section');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    // Advanced Filtering Logic
    const getFilteredGrievances = () => {
        if (!Array.isArray(grievances)) return [];

        return grievances.filter(g => {
            if (!g) return false;

            // 1. Tab Filter
            let matchesTab = true;
            if (activeTab === 'PENDING') matchesTab = g.status === 'PENDING';
            if (activeTab === 'IN_PROGRESS') matchesTab = ['IN_PROGRESS', 'ACCEPTED'].includes(g.status);
            if (activeTab === 'RESOLVED') matchesTab = g.status === 'RESOLVED';
            if (activeTab === 'REJECTED') matchesTab = g.status === 'REJECTED';
            if (activeTab === 'ESCALATED') matchesTab = g.status === 'ESCALATED';
            if (activeTab === 'ESCALATED_FEEDBACK') matchesTab = g.status === 'UNSATISFIED' || g.satisfactionStatus === 'NOT_SATISFIED_POST_VC_SO' || g.satisfactionStatus === 'VC_SCHEDULED_COMMISSIONER';
            if (activeTab === 'REOPENED') matchesTab = !!g.isReopened;
            if (activeTab === 'OVERDUE') {
                const created = g.createdAt ? new Date(g.createdAt) : new Date();
                const daysOld = (new Date() - created) / (1000 * 60 * 60 * 24);
                matchesTab = (g.status === 'PENDING' || g.status === 'IN_PROGRESS') && daysOld > 15;
            }

            // 2. Registration Date Filter
            let matchesTime = true;
            const createdDate = g.createdAt ? new Date(g.createdAt) : null;
            const today = new Date();

            if (createdDate && !isNaN(createdDate.getTime())) {
                if (timeFilter === '7') {
                    const diff = (today - createdDate) / (1000 * 60 * 60 * 24);
                    matchesTime = diff <= 7;
                } else if (timeFilter === '30') {
                    const diff = (today - createdDate) / (1000 * 60 * 60 * 24);
                    matchesTime = diff <= 30;
                } else if (timeFilter === 'CUSTOM') {
                    if (startDate) {
                        const sDate = new Date(startDate);
                        sDate.setHours(0, 0, 0, 0);
                        matchesTime = matchesTime && createdDate >= sDate;
                    }
                    if (endDate) {
                        const eDate = new Date(endDate);
                        eDate.setHours(23, 59, 59, 999);
                        matchesTime = matchesTime && createdDate <= eDate;
                    }
                }
            } else if (timeFilter !== 'ALL') {
                // If we have a filter but no valid date, exclude it
                matchesTime = false;
            }

            // 3. Search
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch = (g.grievanceId || '').toLowerCase().includes(lowerSearch) ||
                (g.name || '').toLowerCase().includes(lowerSearch) ||
                (g.mobile && g.mobile.includes(lowerSearch));

            return matchesTab && matchesTime && matchesSearch;
        }).sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt || 0);
            const dateB = new Date(b.updatedAt || b.createdAt || 0);
            return dateB - dateA;
        });
    };

    const filteredList = getFilteredGrievances();

    // Pagination Logic
    const totalPages = Math.ceil(filteredList.length / pageSize);
    const paginatedList = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Departmental / Section Stats
    const getStats = () => {
        const sections = {};
        const officers = {};

        grievances.forEach(g => {
            const section = g.assignedSection || 'Pending at Moderator';
            const officer = g.assignedOfficer || (g.assignedSection ? 'Officer Not Assigned' : 'Moderator Office');
            const officerKey = `${section} - ${officer}`;

            // Section Aggregation
            if (!sections[section]) {
                sections[section] = { name: section, pending: 0, overdue: 0, resolved: 0, total: 0 };
            }
            sections[section].total++;
            if (g.status === 'RESOLVED') sections[section].resolved++;
            if (g.status === 'PENDING' || g.status === 'IN_PROGRESS' || g.status === 'ACCEPTED') {
                sections[section].pending++;
                const daysOld = (new Date() - new Date(g.createdAt)) / (1000 * 60 * 60 * 24);
                if (daysOld > 15) sections[section].overdue++;
            }

            // Officer Aggregation
            if (g.assignedSection) {
                if (!officers[officerKey]) {
                    officers[officerKey] = { name: officer, section: section, pending: 0, overdue: 0, resolved: 0, total: 0 };
                }
                officers[officerKey].total++;
                if (g.status === 'RESOLVED') officers[officerKey].resolved++;
                if (g.status === 'PENDING' || g.status === 'IN_PROGRESS' || g.status === 'ACCEPTED') {
                    officers[officerKey].pending++;
                    const daysOld = (new Date() - new Date(g.createdAt)) / (1000 * 60 * 60 * 24);
                    if (daysOld > 15) officers[officerKey].overdue++;
                }
            }
        });

        return {
            sections: Object.values(sections).map(s => ({
                ...s,
                resolutionRate: s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 0
            })).sort((a, b) => b.overdue - a.overdue),
            officers: Object.values(officers).map(o => ({
                ...o,
                resolutionRate: o.total > 0 ? Math.round((o.resolved / o.total) * 100) : 0
            })).sort((a, b) => b.total - a.total)
        };
    };

    // Advanced Trend Analytics
    const getTrendData = () => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        return last7Days.map(date => {
            const dayGrievances = grievances.filter(g => g.createdAt.startsWith(date));
            return {
                name: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
                count: dayGrievances.length,
                resolved: dayGrievances.filter(g => g.status === 'RESOLVED').length
            };
        });
    };

    const getCategoryData = () => {
        const categories = {};
        grievances.forEach(g => {
            categories[g.category] = (categories[g.category] || 0) + 1;
        });
        return Object.entries(categories)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    };

    const getMoMStats = () => {
        const now = new Date();
        const thisMonth = grievances.filter(g => {
            const d = new Date(g.createdAt);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        const lastMonth = grievances.filter(g => {
            const d = new Date(g.createdAt);
            const prev = new Date();
            prev.setMonth(now.getMonth() - 1);
            return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
        }).length;

        if (lastMonth === 0) return { val: thisMonth, growth: 0 };
        const growth = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
        return { val: thisMonth, growth };
    };

    const getAverageAging = () => {
        const resolved = grievances.filter(g => g.status === 'RESOLVED' && g.updatedAt);
        if (resolved.length === 0) return 0;
        const totalDays = resolved.reduce((acc, g) => {
            const days = (new Date(g.updatedAt) - new Date(g.createdAt)) / (1000 * 60 * 60 * 24);
            return acc + days;
        }, 0);
        return (totalDays / resolved.length).toFixed(1);
    };

    const getSourceData = () => {
        const sources = { WHATSAPP: 0, WEB_PORTAL: 0, PHYSICAL_JANSUNWAI: 0, OTHER: 0 };
        grievances.forEach(g => {
            const s = g.source || 'WEB_PORTAL';
            if (sources[s] !== undefined) sources[s]++;
            else sources.OTHER++;
        });
        return Object.entries(sources).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
    };


    const handleDrillDown = (type, value, filter, sectionName = null) => {
        console.log(`Drilling down: type=${type}, value=${value}, filter=${filter}, section=${sectionName}`);
        const filtered = grievances.filter(g => {
            let match = false;
            if (type === 'SECTION') {
                const sName = g.assignedSection || 'Pending at Moderator';
                match = sName === value;
            } else if (type === 'OFFICER') {
                const sName = g.assignedSection || 'Pending at Moderator';
                const oName = g.assignedOfficer || (g.assignedSection ? 'Officer Not Assigned' : 'Moderator Office');
                match = oName === value && sName === sectionName;
            } else {
                // Global status or ALL
                match = true;
            }

            if (!match) return false;

            if (filter === 'PENDING') return ['PENDING', 'IN_PROGRESS', 'ACCEPTED'].includes(g.status);
            if (filter === 'RESOLVED') return g.status === 'RESOLVED';
            if (filter === 'REOPENED') return g.isReopened;
            if (filter === 'OVERDUE') {
                const daysOld = (new Date() - new Date(g.createdAt)) / (1000 * 60 * 60 * 24);
                return (g.status === 'PENDING' || g.status === 'IN_PROGRESS') && daysOld > 15;
            }
            return true; // ALL
        });

        setDrillDownData({
            title: `${value} - ${filter} Cases`,
            grievances: filtered,
            type: filter,
            context: value
        });
        setShowDrillDown(true);
    };

    const exportDetailedCSV = (data, title) => {
        const headers = ["Grievance ID", "Date", "Applicant", "Mobile", "Category", "Status", "Section", "Officer", "Expected Date", "Remarks"];
        const rows = data.map(g => [
            g.grievanceId,
            new Date(g.createdAt).toLocaleDateString(),
            g.name,
            g.mobile,
            g.category,
            g.status,
            g.assignedSection || 'Pending at Moderator',
            g.assignedOfficer || (g.assignedSection ? 'Officer Not Assigned' : 'Moderator Office'),
            g.expectedDate || 'N/A',
            (g.remarks || 'No remarks').replace(/,/g, ';').replace(/\n/g, ' ')
        ]);

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `detailed_report_${title.replace(/\s+/g, '_').toLowerCase()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportDetailedPDF = async (data, title) => {
        try {
            const jspdfModule = await import('jspdf');
            const jsPDF = jspdfModule.jsPDF || jspdfModule.default;
            const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more columns

            doc.setFontSize(16);
            doc.text(`Detailed Grievance Report: ${title}`, 14, 20);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

            let y = 40;
            const cols = [14, 45, 75, 105, 135, 165, 190, 220, 250];
            doc.setFont(undefined, 'bold');
            doc.text("ID", cols[0], y);
            doc.text("Date", cols[1], y);
            doc.text("Applicant", cols[2], y);
            doc.text("Category", cols[3], y);
            doc.text("Status", cols[4], y);
            doc.text("Section", cols[5], y);
            doc.text("Officer", cols[6], y);
            doc.text("Exp. Date", cols[7], y);
            doc.text("Remarks", cols[8], y);

            doc.line(14, y + 2, 285, y + 2);
            y += 10;
            doc.setFont(undefined, 'normal');

            data.forEach(g => {
                if (y > 185) {
                    doc.addPage('l', 'mm', 'a4');
                    y = 20;
                }
                doc.text(String(g.grievanceId || 'N/A'), cols[0], y);
                doc.text(new Date(g.createdAt).toLocaleDateString(), cols[1], y);
                doc.text(String(g.name || '').substring(0, 15), cols[2], y);
                doc.text(String(g.category || '').substring(0, 15), cols[3], y);
                doc.text(String(g.status || 'N/A'), cols[4], y);
                doc.text(String(g.assignedSection || 'Pending at Moderator').substring(0, 15), cols[5], y);
                doc.text(String(g.assignedOfficer || (g.assignedSection ? 'Officer Not Assigned' : 'Moderator Office')).substring(0, 15), cols[6], y);
                doc.text(String(g.expectedDate || 'N/A'), cols[7], y);
                doc.text(String(g.remarks || '').substring(0, 20), cols[8], y);
                y += 8;
            });

            doc.save(`detailed_report_${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
        } catch (err) {
            console.error(err);
            alert("Error generating PDF.");
        }
    };

    // Export Functions
    const exportCSV = () => {
        let headers, rows, filename;
        if (reportView === 'SECTION') {
            headers = ["Section Name", "Total Cases", "Pending", "Resolved", "Overdue (>15 days)"];
            rows = sectionStats.map(s => [s.name, s.total, s.pending, s.resolved, s.overdue]);
            filename = "kda_section_pendency_report.csv";
        } else {
            headers = ["Officer Name", "Section", "Total Cases", "Pending", "Resolved", "Overdue (>15 days)"];
            rows = officerStats.map(o => [o.name, o.section, o.total, o.pending, o.resolved, o.overdue]);
            filename = "kda_officer_pendency_report.csv";
        }

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportPDF = async () => {
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            const now = new Date();

            // Header Section
            doc.setFillColor(30, 41, 59); // slate-800
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont(undefined, 'bold');
            doc.setFontSize(22);
            doc.text("KDA EXECUTIVE SUMMARY", 14, 20);
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Official Governance Report | ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 14, 28);

            // Metrics Grid
            doc.setTextColor(0, 0, 0);
            doc.setDrawColor(226, 232, 240);
            doc.setFillColor(248, 250, 252);

            // Stats Boxes
            const boxes = [
                { label: "Total Cases", val: stats.total },
                { label: "Pending", val: stats.pending },
                { label: "Resolved", val: stats.resolved },
                { label: "Efficiency", val: `${stats.avgAging} Days` }
            ];

            boxes.forEach((box, i) => {
                const x = 14 + (i * 48);
                doc.rect(x, 50, 44, 25, 'F');
                doc.setFontSize(8);
                doc.setTextColor(100, 116, 139);
                doc.text(box.label, x + 4, 58);
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(15, 23, 42);
                doc.text(box.val.toString(), x + 4, 68);
            });

            // Growth Section
            let y = 90;
            doc.setFontSize(14);
            doc.text("Performance Insights", 14, y);
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            y += 8;
            doc.text(`- Monthly Growth: ${momData.growth >= 0 ? '+' : ''}${momData.growth}% vs previous month`, 14, y);
            y += 6;
            doc.text(`- Critical / Overdue Volume: ${stats.overdue} cases requiring immediate attention`, 14, y);

            // Top/Bottom Performers Highlights
            y += 15;
            doc.setFont(undefined, 'bold');
            doc.text("Sectional Accountability Scan", 14, y);
            y += 8;

            const sortedByEfficiency = [...sectionStats].sort((a, b) => b.resolutionRate - a.resolutionRate);
            const top = sortedByEfficiency[0];
            const bottom = sortedByEfficiency[sortedByEfficiency.length - 1];

            doc.setFillColor(240, 253, 244); // green-50
            doc.rect(14, y, 182, 12, 'F');
            doc.setTextColor(22, 101, 52);
            doc.setFontSize(9);
            doc.text(`★ TOP PERFORMER: ${top?.name || 'N/A'} (Res. Rate: ${top?.resolutionRate || 0}%)`, 18, y + 8);

            y += 15;
            doc.setFillColor(254, 242, 242); // red-50
            doc.rect(14, y, 182, 12, 'F');
            doc.setTextColor(153, 27, 27);
            doc.text(`⚠ UNDER REVIEW: ${bottom?.name || 'N/A'} (Overdue: ${bottom?.overdue || 0})`, 18, y + 8);

            // Detailed Data Table
            y += 20;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.text(reportView === 'SECTION' ? "Complete Sectional Audit" : "Officer Accountability Log", 14, y);
            y += 8;

            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            if (reportView === 'SECTION') {
                doc.text("Section Name", 14, y);
                doc.text("Total", 100, y);
                doc.text("Pending", 125, y);
                doc.text("Resolved", 150, y);
                doc.text("Overdue", 175, y);
            } else {
                doc.text("Officer Name", 14, y);
                doc.text("Total", 120, y);
                doc.text("Pending", 140, y);
                doc.text("Resolved", 165, y);
                doc.text("Overdue", 185, y);
            }

            doc.line(14, y + 2, 195, y + 2);
            y += 10;
            doc.setFont(undefined, 'normal');

            const data = reportView === 'SECTION' ? sectionStats : officerStats;
            data.forEach(s => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                if (reportView === 'SECTION') {
                    doc.text(s.name.substring(0, 45), 14, y);
                    doc.text(s.total.toString(), 100, y);
                    doc.text(s.pending.toString(), 125, y);
                    doc.text(s.resolved.toString(), 150, y);
                    doc.text(s.overdue.toString(), 175, y);
                } else {
                    doc.text(s.name.substring(0, 40), 14, y);
                    doc.text(s.total.toString(), 120, y);
                    doc.text(s.pending.toString(), 140, y);
                    doc.text(s.resolved.toString(), 165, y);
                    doc.text(s.overdue.toString(), 185, y);
                }
                y += 7;
            });

            doc.save(reportView === 'SECTION' ? "kda_executive_summary_sections.pdf" : "kda_executive_summary_officers.pdf");
        } catch (err) {
            console.error(err);
            alert("Error generating Executive PDF.");
        }
    };

    const stats = {
        total: grievances.length,
        pending: grievances.filter(g => g.status === 'PENDING').length,
        inProgress: grievances.filter(g => ['IN_PROGRESS', 'ACCEPTED'].includes(g.status)).length,
        resolved: grievances.filter(g => g.status === 'RESOLVED').length,
        rejected: grievances.filter(g => g.status === 'REJECTED').length,
        escalated: grievances.filter(g => g.status === 'ESCALATED').length,
        escalatedFeedback: grievances.filter(g => g.status === 'UNSATISFIED' || g.satisfactionStatus === 'NOT_SATISFIED_POST_VC_SO').length,
        reopened: grievances.filter(g => !!g.isReopened).length,
        overdue: grievances.filter(g => {
            const created = g.createdAt ? new Date(g.createdAt) : new Date();
            const daysOld = (new Date() - created) / (1000 * 60 * 60 * 24);
            return (g.status === 'PENDING' || g.status === 'IN_PROGRESS') && daysOld > 15;
        }).length,
        avgAging: getAverageAging()
    };

    const momData = getMoMStats();
    const { sections: sectionStats, officers: officerStats } = getStats();

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in-up pb-12">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Commissioner's Control Center</h1>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100">Live Analytics</span>
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">KDA Governance Monitoring System v2.0</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowSectionStats(!showSectionStats)}
                            className={`px-4 py-2 border rounded-lg flex items-center gap-2 font-bold transition-colors ${showSectionStats ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            <BarChart2 className="w-5 h-5" />
                            {showSectionStats ? 'Show Overview' : 'Section Reports'}
                        </button>
                        <button
                            onClick={() => setShowAnalytics(!showAnalytics)}
                            className={`px-4 py-2 border rounded-lg flex items-center gap-2 font-bold transition-colors ${showAnalytics ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            <BarChart2 className="w-5 h-5" />
                            {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
                        </button>
                        <button onClick={fetchData} className="p-2 bg-white border rounded-lg hover:bg-gray-50">
                            <RefreshCcw className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Top Stat Cards API Grid - New Layout */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <StatCard
                        title="Total Grievances"
                        value={stats.total}
                        icon={FileText}
                        color="bg-blue-500"
                        onClick={() => handleStatClick('ALL')}
                        isActive={activeTab === 'ALL'}
                    />
                    <StatCard
                        title="Pending"
                        value={stats.pending}
                        icon={Clock}
                        color="bg-orange-500"
                        onClick={() => handleStatClick('PENDING')}
                        isActive={activeTab === 'PENDING'}
                    />
                    <StatCard
                        title="In Progress"
                        value={stats.inProgress}
                        icon={Activity}
                        color="bg-indigo-500"
                        onClick={() => handleStatClick('IN_PROGRESS')}
                        isActive={activeTab === 'IN_PROGRESS'}
                    />
                    <StatCard
                        title="Resolved"
                        value={stats.resolved}
                        icon={CheckCircle}
                        color="bg-green-500"
                        onClick={() => handleStatClick('RESOLVED')}
                        isActive={activeTab === 'RESOLVED'}
                    />
                    <StatCard
                        title="Rejected"
                        value={stats.rejected}
                        icon={XCircle}
                        color="bg-gray-500"
                        onClick={() => handleStatClick('REJECTED')}
                        isActive={activeTab === 'REJECTED'}
                    />
                    <StatCard
                        title="Escalated"
                        value={stats.escalated}
                        icon={AlertTriangle}
                        color="bg-red-500"
                        onClick={() => handleStatClick('ESCALATED')}
                        isActive={activeTab === 'ESCALATED'}
                    />
                    <StatCard
                        title="Escalated (Feedback)"
                        value={stats.escalatedFeedback}
                        icon={ShieldAlert}
                        color="bg-rose-700"
                        onClick={() => handleStatClick('ESCALATED_FEEDBACK')}
                        isActive={activeTab === 'ESCALATED_FEEDBACK'}
                    />
                </div>

                {/* Performance Analytics Tier - Collapsible */}
                {showAnalytics && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[400px] animate-fade-in-up">
                        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 relative overflow-hidden group">
                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Volume Trends</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">7-Day Registration Velocity</p>
                                </div>
                                <div className="bg-blue-50 px-3 py-1 rounded-xl border border-blue-100 font-black text-[10px] text-blue-600">REALTIME</div>
                            </div>
                            <div className="h-[250px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={getTrendData()}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
                                            itemStyle={{ fontSize: '12px', textTransform: 'uppercase' }}
                                        />
                                        <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                                        <Area type="monotone" dataKey="resolved" stroke="#16a34a" strokeWidth={2} fill="transparent" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Source Audit</h3>
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={getSourceData()}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {getSourceData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                {getSourceData().map((src, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{src.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-gray-900">{src.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-black tracking-tight mb-2">Efficiency Index</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Avg Disposal Speed</p>

                                <div className="flex items-baseline gap-2 mb-2">
                                    <h4 className="text-6xl font-black text-blue-400 tracking-tighter">{stats.avgAging}</h4>
                                    <span className="text-lg font-black text-slate-400 uppercase tracking-widest">Days</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                                    <div className="bg-blue-500 h-full w-[70%]"></div>
                                </div>
                                <p className="text-xs font-bold text-slate-400 mt-8 leading-relaxed">
                                    Current average time taken by sections to successfully resolve a citizen grievance from registration to closure.
                                </p>

                                <div className="mt-8 pt-8 border-t border-slate-800">
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">MoM Growth</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-2xl font-black ${momData.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {momData.growth >= 0 ? '+' : ''}{momData.growth}%
                                        </span>
                                        <span className="text-xs font-bold text-slate-500">vs last month</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                )}

                {
                    showSectionStats ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-bold text-gray-800">Operational Performance Report</h2>
                                    <div className="flex mt-2 bg-gray-100 p-1 rounded-lg w-fit">
                                        <button
                                            onClick={() => setReportView('SECTION')}
                                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${reportView === 'SECTION' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Section-wise
                                        </button>
                                        <button
                                            onClick={() => setReportView('OFFICER')}
                                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${reportView === 'OFFICER' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Officer-wise
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={exportCSV} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Export Excel
                                    </button>
                                    <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Export PDF
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                            <th className="p-4">{reportView === 'SECTION' ? 'Department / Section' : 'Section Officer Name'}</th>
                                            {reportView === 'OFFICER' && <th className="p-4">Department</th>}
                                            <th className="p-4">Total Cases</th>
                                            <th className="p-4">Pending</th>
                                            <th className="p-4 text-green-600">Resolved</th>
                                            <th className="p-4 text-red-600">Overdue (&gt;15 Days)</th>
                                            <th className="p-4">Resolution Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(reportView === 'SECTION' ? sectionStats : officerStats).map((s, idx) => {
                                            const resolutionRate = s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 0;
                                            const isHighRisk = s.overdue > 10 || (resolutionRate < 30 && s.total > 10);
                                            return (
                                                <tr key={idx} className={`hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-all ${isHighRisk ? 'bg-rose-50/50' : ''}`}>
                                                    <td className="p-4 font-bold text-gray-800">
                                                        <div className="flex items-center gap-2">
                                                            {reportView === 'OFFICER' && <User className="w-4 h-4 text-gray-400" />}
                                                            {s.name}
                                                            {isHighRisk && (
                                                                <span className="px-2 py-0.5 bg-rose-600 text-[8px] font-black text-white rounded-full uppercase tracking-widest animate-pulse">UNDERPERFORMING</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    {reportView === 'OFFICER' && (
                                                        <td className="p-4">
                                                            <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-600 uppercase">
                                                                {s.section}
                                                            </span>
                                                        </td>
                                                    )}
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => handleDrillDown(reportView, s.name, 'ALL', s.section)}
                                                            className="font-mono hover:text-blue-600 hover:underline decoration-blue-600 font-bold px-2 py-1 rounded hover:bg-blue-50 transition-all"
                                                        >
                                                            {s.total}
                                                        </button>
                                                    </td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => handleDrillDown(reportView, s.name, 'PENDING', s.section)}
                                                            className="font-mono text-orange-600 font-bold hover:underline px-2 py-1 rounded hover:bg-orange-50 transition-all"
                                                        >
                                                            {s.pending || 0}
                                                        </button>
                                                    </td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => handleDrillDown(reportView, s.name, 'RESOLVED', s.section)}
                                                            className="font-mono text-green-600 font-bold hover:underline px-2 py-1 rounded hover:bg-green-50 transition-all"
                                                        >
                                                            {s.resolved || 0}
                                                        </button>
                                                    </td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => handleDrillDown(reportView, s.name, 'OVERDUE', s.section)}
                                                            className="font-mono text-red-600 font-bold hover:underline px-2 py-1 rounded hover:bg-red-50 transition-all"
                                                        >
                                                            {s.overdue || 0}
                                                        </button>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full ${resolutionRate > 80 ? 'bg-green-500' : resolutionRate > 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${resolutionRate}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs font-bold">{resolutionRate}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <>

                            {/* Filters & Controls */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4" id="grievance-list-section">
                                <div className="flex flex-col gap-4">
                                    {/* Interactive Tabs */}
                                    <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-gray-100">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Calendar className="w-5 h-5" />
                                                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Registration Period:</span>
                                            </div>
                                            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                                                {[
                                                    { label: 'All Grievances', value: 'ALL' },
                                                    { label: 'Last 7 Days', value: '7' },
                                                    { label: 'Last 30 Days', value: '30' },
                                                    { label: 'Custom Range', value: 'CUSTOM' }
                                                ].map(t => (
                                                    <button
                                                        key={t.value}
                                                        onClick={() => setTimeFilter(t.value)}
                                                        className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-tight transition-all ${timeFilter === t.value ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-800'}`}
                                                    >
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="relative flex-1 max-w-md">
                                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Search cases by ID, applicant name or mobile..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Date Range Sub-menu */}
                                {timeFilter === 'CUSTOM' && (
                                    <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">From</span>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">To</span>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            />
                                        </div>
                                        <button
                                            onClick={() => { setStartDate(''); setEndDate(''); }}
                                            className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest ml-auto px-3 py-1 bg-white rounded-lg border border-blue-100 transition-all hover:bg-blue-50"
                                        >
                                            Clear Dates
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Main Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                                <th className="p-4 w-16">S.No.</th>
                                                <th className="p-4">ID / Date</th>
                                                <th className="p-4">Source</th>
                                                <th className="p-4">Applicant</th>
                                                <th className="p-4">Category / Desc</th>
                                                <th className="p-4">Status / Pending With</th>
                                                <th className="p-4">Aging</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {paginatedList.map((g, index) => {
                                                const daysOld = Math.floor((new Date() - new Date(g.createdAt)) / (1000 * 60 * 60 * 24));
                                                const serialNo = (currentPage - 1) * pageSize + index + 1;
                                                return (
                                                    <tr key={g.id} className="hover:bg-blue-50/30 transition-all duration-200 group border-b border-gray-50 last:border-0">
                                                        <td className="p-4 align-top font-bold text-gray-400 text-xs">
                                                            {serialNo.toString().padStart(2, '0')}
                                                        </td>
                                                        <td className="p-4 align-top">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono font-black text-blue-600 block bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shadow-sm">{g.grievanceId}</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-gray-400 mt-1 block uppercase tracking-wide">{new Date(g.createdAt).toLocaleDateString()}</span>
                                                            {g.isReopened && (
                                                                <span className="inline-flex items-center mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full font-bold border border-purple-200 animate-pulse">
                                                                    <RefreshCcw className="w-3 h-3 mr-1" /> Re-opened
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 align-top">
                                                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200 uppercase tracking-tight">
                                                                {(g.source || 'WEB_PORTAL').replace(/_/g, ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 align-top">
                                                            <p className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{g.name}</p>
                                                            <p className="text-xs text-gray-500 font-medium">{g.mobile}</p>
                                                        </td>
                                                        <td className="p-4 align-top max-w-xs">
                                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-bold uppercase mb-1 inline-block border border-slate-200">
                                                                {g.category}
                                                            </span>
                                                            <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg italic group-hover:bg-white transition-colors">{g.description}</p>
                                                        </td>
                                                        <td className="p-4 align-top">
                                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block mb-1 shadow-sm
                                                ${g.status === 'PENDING' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                                    g.status === 'RESOLVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                                        g.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                                            g.status === 'UNSATISFIED' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                                                                'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                                                {g.status}
                                                            </span>
                                                            {g.status !== 'RESOLVED' && g.status !== 'REJECTED' && (
                                                                <div className="flex items-center gap-1.5 mt-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse"></div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                                        {g.assignedZone ? `Zone: ${g.assignedZone}` : (g.assignedSection ? `Section: ${g.assignedSection}` : 'Awaiting Moderation')}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {/* Video Links */}
                                                            {g.hearingLink && g.status !== 'RESOLVED' && g.status !== 'REJECTED' && (
                                                                <div className="flex items-center space-x-2 mt-1">
                                                                    <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-black border border-orange-200">
                                                                        HEARING: {g.hearingDate}
                                                                    </span>
                                                                    <a href={g.hearingLink} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-600 underline font-black">JOIN</a>
                                                                </div>
                                                            )}
                                                            {g.vcMeetingLink && !['SATISFIED_POST_VC_SO', 'CLOSED_HIGHER_W_VC'].includes(g.satisfactionStatus) && (
                                                                <div className="flex items-center space-x-2 mt-1">
                                                                    <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-black border border-indigo-200">
                                                                        SAT-VC
                                                                    </span>
                                                                    <a href={g.vcMeetingLink} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-600 underline font-black">JOIN</a>
                                                                </div>
                                                            )}
                                                            {/* Feedback Alerts */}
                                                            {g.satisfactionStatus === 'NOT_SATISFIED_POST_VC_SO' && ['WHATSAPP', 'WEB_PORTAL'].includes(g.source || 'WEB_PORTAL') && (
                                                                <div className="mt-2 bg-rose-50 border border-rose-100 p-1.5 rounded text-center">
                                                                    <p className="text-[9px] font-black text-rose-700 uppercase">⚠️ CITIZEN NOT SATISFIED AFTER OFFICER VC</p>
                                                                    <button
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            const date = prompt("Enter Commissioner VC Date (YYYY-MM-DD HH:MM):", new Date().toISOString().slice(0, 16).replace('T', ' '));
                                                                            if (date) {
                                                                                const meetingLink = `${window.location.origin}/hearing/COM-VC-${g.grievanceId}`;
                                                                                const res = await fetch(`http://localhost:3000/api/grievances/${g.id}/schedule-vc`, {
                                                                                    method: 'POST',
                                                                                    headers: { 'Content-Type': 'application/json' },
                                                                                    body: JSON.stringify({ date, link: meetingLink, level: 'COMMISSIONER' })
                                                                                });
                                                                                const data = await res.json();
                                                                                if (data.success) {
                                                                                    sendMockWhatsApp(`VC_SCHEDULED:::${g.grievanceId}:::${date}:::${meetingLink}`);
                                                                                    alert("Final VC Scheduled & Citizen Notified");
                                                                                    fetchData();
                                                                                }
                                                                            }
                                                                        }}
                                                                        className="mt-1 w-full bg-rose-600 text-white text-[9px] font-bold py-1 rounded hover:bg-rose-700"
                                                                    >
                                                                        Schedule Final VC
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-4 align-top">
                                                            <span className={`font-mono font-black text-sm px-2 py-1 rounded-lg ${daysOld > 15 ? 'text-red-600 bg-red-50' : daysOld > 7 ? 'text-orange-500 bg-orange-50' : 'text-green-600 bg-green-50'}`}>
                                                                {daysOld}d
                                                            </span>
                                                        </td>
                                                        <td className="p-4 align-top text-right">
                                                            <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => setSelectedGrievance(g)}
                                                                    className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg shadow-sm font-bold text-xs transition-all active:scale-95 flex items-center gap-1"
                                                                    title="View Details"
                                                                >
                                                                    View
                                                                </button>
                                                                {(g.status === 'RESOLVED' || g.status === 'REJECTED') && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setReopenTarget(g);
                                                                            setReopenModalOpen(true);
                                                                        }}
                                                                        className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-all"
                                                                        title="Re-open Case"
                                                                    >
                                                                        <RefreshCcw className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredList.length === 0 && (
                                    <div className="p-12 text-center text-gray-400">
                                        <p>No records found matching filters</p>
                                    </div>
                                )}

                                {/* Pagination Controls */}
                                {filteredList.length > 0 && (
                                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-row-reverse">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-right">
                                            Showing <span className="text-blue-600">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-blue-600">{Math.min(currentPage * pageSize, filteredList.length)}</span> of <span className="text-blue-600">{filteredList.length}</span> records
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(prev => prev - 1)}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                Previous
                                            </button>
                                            <div className="flex items-center gap-1">
                                                {[...Array(totalPages)].map((_, i) => {
                                                    const pageNum = i + 1;
                                                    // Only show current, first, last, and pages around current
                                                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => setCurrentPage(pageNum)}
                                                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                                        return <span key={pageNum} className="text-gray-400">...</span>;
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                            <button
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(prev => prev + 1)}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )
                }
            </div >

            {/* Global Modals (Outside transform context) */}
            {
                selectedGrievance && (
                    <GrievanceDetailsModal
                        grievance={selectedGrievance}
                        onClose={() => setSelectedGrievance(null)}
                    />
                )
            }

            {
                reopenModalOpen && (
                    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl p-10 transform transition-all scale-100 animate-scale-in border border-white/20">
                            <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Re-open Case</h3>
                            <p className="text-sm text-gray-500 mb-8 font-medium leading-relaxed">
                                You are about to re-open grievance <span className="font-mono font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">{reopenTarget?.grievanceId}</span>.
                                The case will be directed back to the Moderator's queue for reassignment.
                            </p>

                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Reason for Re-opening</label>
                            <textarea
                                className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all placeholder:text-gray-300 min-h-[120px]"
                                placeholder="Please provide detailed justification for re-opening this case..."
                                value={reopenReason}
                                onChange={(e) => setReopenReason(e.target.value)}
                            ></textarea>

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    onClick={() => { setReopenModalOpen(false); setReopenTarget(null); }}
                                    className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReopen}
                                    disabled={!reopenReason.trim()}
                                    className="px-8 py-3 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-200 active:scale-95"
                                >
                                    Confirm Re-open
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showDrillDown && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
                        <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col scale-100 transition-all duration-300 border border-white/20 animate-scale-in">
                            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{drillDownData.title}</h3>
                                    <p className="text-sm text-gray-500 font-bold mt-2 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                                        <span className="text-blue-600">{drillDownData.grievances?.length || 0}</span> matching records found
                                    </p>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 px-3 gap-2">
                                        <button
                                            onClick={() => exportDetailedCSV(drillDownData.grievances, drillDownData.title)}
                                            className="px-4 py-2 text-emerald-700 hover:bg-emerald-50 rounded-xl text-sm font-black flex items-center gap-2 transition-all active:scale-95"
                                        >
                                            <FileText className="w-4 h-4" /> EXCEL
                                        </button>
                                        <div className="w-[1px] bg-gray-200 my-1"></div>
                                        <button
                                            onClick={() => exportDetailedPDF(drillDownData.grievances, drillDownData.title)}
                                            className="px-4 py-2 text-rose-700 hover:bg-rose-50 rounded-xl text-sm font-black flex items-center gap-2 transition-all active:scale-95"
                                        >
                                            <FileText className="w-4 h-4" /> PDF
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setShowDrillDown(false)}
                                        className="p-3 bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-2xl transition-all shadow-sm border border-orange-50 group active:scale-90"
                                    >
                                        <XCircle className="w-8 h-8 transition-transform group-hover:rotate-90" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-10 pt-6 custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-20">
                                        <tr className="border-b border-gray-200 text-[11px] uppercase tracking-[0.3em] text-gray-400 font-black">
                                            <th className="pb-6 pt-2 w-12 text-center">S.No.</th>
                                            <th className="pb-6 pt-2">ID / Date</th>
                                            <th className="pb-6 pt-2">Source</th>
                                            <th className="pb-6 pt-2">Applicant</th>
                                            <th className="pb-6 pt-2">Summary</th>
                                            <th className="pb-6 pt-2 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {drillDownData.grievances.map((g, index) => (
                                            <tr key={g.id} className="hover:bg-slate-50/50 group transition-colors">
                                                <td className="py-6 align-top text-center font-black text-gray-300 text-[10px]">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </td>
                                                <td className="py-6 align-top">
                                                    <div className="font-mono font-black text-blue-600 text-sm tracking-tighter">{g.grievanceId}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{new Date(g.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                </td>
                                                <td className="py-6 align-top">
                                                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border
                                                ${g.source === 'WHATSAPP' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            g.source === 'OPERATOR' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                                        {g.source || 'WEB PORTAL'}
                                                    </span>
                                                </td>
                                                <td className="py-6 align-top">
                                                    <div className="font-black text-gray-900 text-sm">{g.name}</div>
                                                    <div className="text-xs font-bold text-gray-400 mt-0.5">{g.mobile}</div>
                                                </td>
                                                <td className="py-6 align-top max-w-sm">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-wider">{g.category}</div>
                                                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{g.description}</p>
                                                </td>
                                                <td className="py-6 align-top text-right">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedGrievance(g);
                                                            setShowDrillDown(false);
                                                        }}
                                                        className="p-4 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all border border-blue-100 hover:border-blue-600 shadow-sm active:scale-95"
                                                    >
                                                        <FileText className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};


export default CommissionerDashboard;
