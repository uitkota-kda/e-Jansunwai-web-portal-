import { API_BASE_URL } from '../../config';
import React, { useState, useRef } from 'react';
import { Send, Upload, User, MapPin, FileText, AlertCircle, File, X, Camera, CheckCircle2, LayoutDashboard, Phone, ShieldCheck } from 'lucide-react';

const SUBJECTS = [
    "Sports", "Boundary wall", "Tree Guards", "Transfer of Names", "Subdivision/Reconstitution of Plots",
    "Street Light", "Service-related Issues of Personnel", "Road Cutting Permission", "Reservation of Community Centre",
    "Regularisation of Kachi Basti", "Refund of Earnest/Security Money", "Payment of work", "No Dues", "NOC",
    "Issue of Possession Letter", "Issue of Lease Deed/Patta", "Development and maintenance of Park",
    "Copies of Documents/Maps", "Complaint of Personnel", "Compensation of Acquired Land",
    "Change of Land Use/Land Conversion", "Approval of Layout Plan", "Approval of Building Plan",
    "Approval of 90A Applications", "Sale Permission", "Lease Exemption Certificate",
    "Land Allotment (As per policy 2015)", "General Section", "Housing Construction Related",
    "Town Planning-BPC (BP)", "Town Planning-BPC (LP)", "Town Planning-Projects", "Town Planning-Master Plan",
    "Legal and Court", "Strip of Land", "Illegal Construction (Non-Scheme)", "Illegal Construction (Scheme)",
    "Encroachment Removal (Non-Scheme)", "Encroachment Removal (Scheme)", "Sewerage Construction / Repair",
    "Drainage Construction / Repair", "Road Construction / Repair", "CMJY", "PMJY",
    "Drinking Water supply related issue", "Rehabilitation"
];

const OperatorGrievanceForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        address: '',
        description: '',
        source: 'PHYSICAL_JANSUNWAI',
        category: 'General',
        subject: '',
        wardNo: '',
        files: null
    });

    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(true);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastGrievanceId, setLastGrievanceId] = useState('');
    const fileInputRef = useRef(null);


    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 1 * 1024 * 1024) {
                alert('File size exceeds 1MB limit.');
                e.target.value = '';
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                alert('Only JPEG, PNG, and PDF files are allowed.');
                e.target.value = '';
                return;
            }
            setFormData(prev => ({ ...prev, files: file }));
        }
    };

    const triggerFileSelect = () => { fileInputRef.current.click(); };

    const removeFile = (e) => {
        e.stopPropagation();
        setFormData(prev => ({ ...prev, files: null }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('mobile', formData.mobile);
            submitData.append('address', formData.address);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('source', formData.source);
            submitData.append('subject', formData.subject);
            submitData.append('wardNo', formData.wardNo);
            if (formData.files) { submitData.append('attachment', formData.files); }

            const response = await fetch(`${API_BASE_URL}/grievances`, {
                method: 'POST',
                body: submitData,
            });
            const data = await response.json();
            if (data.success) {
                setLastGrievanceId(data.grievanceId);
                setShowSuccessModal(true);
                setFormData({ name: '', mobile: '', address: '', description: '', source: 'PHYSICAL_JANSUNWAI', category: 'General', subject: '', wardNo: '', files: null });
                setIsOtpSent(false);
                setOtp('');
            } else {
                alert('Submission failed: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error connecting to server');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name' && !/^[a-zA-Z\s]*$/.test(value)) return;
        if (name === 'mobile') {
            if (!/^\d*$/.test(value) || value.length > 10) return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const sources = [
        { id: 'PHYSICAL_JANSUNWAI', label: 'Physical Jansunwai' },
        { id: 'MINISTER_JANSUNWAI', label: 'Minister Jansunwai' },
        { id: 'MP_MLA_GRIEVANCES', label: 'MP/MLA Grievances' },
        { id: 'DIVISIONAL_COMMISSIONER', label: 'Divisional Commissioner' },
        { id: 'MISCELLANEOUS', label: 'Miscellaneous' }
    ];

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-10 text-white relative">
                    <div className="relative z-10 text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-xl mb-4 backdrop-blur-sm">
                            <LayoutDashboard className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-extrabold mb-2 tracking-tight text-white italic uppercase">
                            Operator Grievance <span className="text-blue-100">Entry</span>
                        </h2>
                        <p className="text-blue-100 font-medium op-80">Official Counter Registration Portal</p>
                    </div>
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
                            <defs>
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                        </svg>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">

                    <div className="grid grid-cols-1 gap-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                        {/* Source Selection */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-3 ml-1 uppercase tracking-wider">
                                Complaint Source (शिकायत का स्रोत) <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                {sources.map((src) => (
                                    <button
                                        key={src.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, source: src.id })}
                                        className={`px-4 py-3 rounded-xl text-[10px] md:text-xs font-bold transition-all border-2 ${formData.source === src.id
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                    >
                                        {src.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                                Applicant Name (आवेदक का नाम) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <User className="h-5 w-5 font-bold" />
                                </span>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-gray-50/50 transition-all font-medium text-gray-800"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        {/* Mobile & OTP */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                                Mobile Number (मोबाइल नंबर) <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-col gap-3">
                                <div className="relative group">
                                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                        <Phone className="h-5 w-5" />
                                    </span>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        required
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-gray-50/50 transition-all font-medium text-gray-800"
                                        placeholder="10-digit mobile number"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Area / Colony */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                            Area / Colony / Scheme (क्षेत्र / कॉलोनी / योजना) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                <MapPin className="h-5 w-5" />
                            </span>
                            <input
                                type="text"
                                name="address"
                                required
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-gray-50/50 transition-all font-medium text-gray-800"
                                placeholder="Enter area or colony name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Ward Number */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                                Ward Number (वार्ड संख्या) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <select
                                    name="wardNo"
                                    required
                                    value={formData.wardNo}
                                    onChange={handleChange}
                                    className="w-full px-4 py-4 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-gray-50/50 transition-all font-medium text-gray-800 appearance-none"
                                >
                                    <option value="">Select Ward</option>
                                    {[...Array(100)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>Ward {i + 1}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                    <LayoutDashboard className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                                Subject (विषय) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <select
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-4 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-gray-50/50 transition-all font-medium text-gray-800 appearance-none"
                                >
                                    <option value="">Select Subject</option>
                                    {SUBJECTS.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                    <FileText className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                            Grievance Details (शिकायत का विवरण) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <span className="absolute top-4 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                <FileText className="h-5 w-5" />
                            </span>
                            <textarea
                                name="description"
                                required
                                value={formData.description}
                                maxLength={250}
                                onChange={handleChange}
                                rows="4"
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-gray-50/50 resize-none transition-all font-medium text-gray-800"
                                placeholder="Describe the issue in detail..."
                            ></textarea>
                            <div className="absolute bottom-4 right-4 text-[10px] font-bold text-gray-300">
                                {formData.description.length} / 250
                            </div>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Attachments (संलग्नक)</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50/30 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all group cursor-pointer relative" onClick={triggerFileSelect}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*,.pdf"
                            />

                            {formData.files ? (
                                <div className="flex flex-col items-center justify-center animate-in zoom-in duration-200">
                                    <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-2xl border-2 border-blue-100 text-blue-700 shadow-sm mb-3">
                                        <File className="w-5 h-5 pointer-events-none" />
                                        <span className="text-sm font-bold truncate max-w-[200px] text-blue-700">{formData.files.name}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFile(e); }}
                                            className="p-1 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <X className="w-5 h-5 text-red-500" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-green-600 font-extrabold flex items-center uppercase tracking-tighter"><CheckCircle2 className="w-3 h-3 mr-1" /> Ready for upload</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-gray-600">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-400">PDF, PNG, JPG (Max. 1MB)</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full font-black text-xl py-5 rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-3 transform active:scale-[0.98] ${submitting
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-blue-200'}`}
                        >
                            {submitting ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>SUBMITTING...</span>
                                </div>
                            ) : (
                                <>
                                    <Send className="w-6 h-6" />
                                    <span>SUBMIT GRIEVANCE</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden transform animate-in zoom-in duration-300">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-center text-white">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-md">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black mb-1 leading-none tracking-tighter">SUCCESS!</h3>
                            <p className="text-green-50 font-medium">Grievance Registered Successfully</p>
                        </div>
                        <div className="p-8 text-center">
                            <div className="mb-6">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Grievance ID</p>
                                <div className="text-3xl font-black text-blue-600 tracking-tighter bg-blue-50 py-3 rounded-2xl border-2 border-dashed border-blue-200">
                                    {lastGrievanceId}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                            >
                                CLOSE & CONTINUE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OperatorGrievanceForm;
