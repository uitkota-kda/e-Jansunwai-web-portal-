import { API_BASE_URL } from '../config';
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Upload, User, MapPin, FileText, AlertCircle, File, X, Camera, CheckCircle2, PhoneCall } from 'lucide-react';

const GrievanceForm = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        mobile: location.state?.mobile || '',
        address: '',
        description: '',
        files: null
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!location.state?.mobile) {
            navigate('/submit');
        }
    }, [location, navigate]);

    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 10 * 1024 * 1024) {
                alert('File size exceeds 10MB limit.');
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

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    const removeFile = (e) => {
        e.stopPropagation();
        setFormData(prev => ({ ...prev, files: null }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.mobile) {
            alert('Mobile number is missing. Please login again.');
            navigate('/submit');
            return;
        }

        try {
            setSubmitting(true);
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('mobile', formData.mobile);
            submitData.append('address', formData.address);
            submitData.append('description', formData.description);
            submitData.append('category', 'General');
            submitData.append('source', 'WEB_PORTAL');
            if (formData.files) {
                submitData.append('attachment', formData.files);
            }

            const response = await fetch(`${API_BASE_URL}/grievances`, {
                method: 'POST',
                body: submitData,
            });

            const data = await response.json();

            if (data.success) {
                const grievanceId = data.grievanceId;
                alert(`Grievance Submitted! ID: ${grievanceId}`);

                navigate('/track?id=' + grievanceId);
            } else {
                alert('Submission failed: ' + data.message);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Error connecting to server: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'name') {
            if (!/^[a-zA-Z\s]*$/.test(value)) return;
        }



        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="text-center pt-8 pb-4 border-b border-gray-100 px-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">शिकायत पंजीकरण</h2>
                    <p className="text-gray-500">अपनी समस्या हमारे साथ साझा करें, हम समाधान के लिए प्रतिबद्ध हैं।</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                आवेदक का नाम (Name) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <User className="h-5 w-5" />
                                </span>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 transition-all"
                                    placeholder="आपका पूरा नाम लिखें"
                                />
                            </div>
                        </div>

                        {/* Mobile Number - Readonly */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    मोबाइल नंबर (Mobile)
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <PhoneCall className="h-5 w-5" />
                                    </span>
                                    <input
                                        type="tel"
                                        readOnly
                                        value={formData.mobile}
                                        className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-lg bg-green-50 border-green-200 text-green-700 font-bold outline-none cursor-not-allowed"
                                    />
                                    <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Area / Colony */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            क्षेत्र / कॉलोनी / योजना (Area/Colony) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <MapPin className="h-5 w-5" />
                            </span>
                            <input
                                type="text"
                                name="address"
                                required
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50"
                                placeholder="अपने क्षेत्र या कॉलोनी का नाम लिखें"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            शिकायत का विवरण (Grievance Details) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute top-3 left-3 flex items-center pointer-events-none text-gray-400">
                                <FileText className="h-5 w-5" />
                            </span>
                            <textarea
                                name="description"
                                required
                                value={formData.description}
                                maxLength={250}
                                onChange={handleChange}
                                rows="5"
                                className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 resize-none transition-all"
                                placeholder="अपनी समस्या का विस्तार से वर्णन करें... (अधिकतम 250 शब्द)"
                            ></textarea>
                            <p className={`text-xs text-right mt-1 ${formData.description.length >= 250 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                {formData.description.length} / 250 characters
                            </p>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">दस्तावेज़ / फोटो अपलोड (Upload Files)</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50/50 text-center hover:border-blue-400 transition-colors group">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*,.pdf"
                            />

                            {formData.files ? (
                                <div className="flex flex-col items-center justify-center animate-in zoom-in duration-200">
                                    <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 text-blue-700 mb-2">
                                        <File className="w-4 h-4" />
                                        <span className="text-sm font-medium">{formData.files.name}</span>
                                        <button onClick={removeFile} className="hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                                    </div>
                                    <p className="text-xs text-green-600 font-bold flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> File Selected</p>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <button
                                        type="button"
                                        onClick={triggerFileSelect}
                                        className="flex items-center justify-center space-x-2 px-6 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-bold w-full sm:w-auto transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Upload className="w-4 h-4 text-blue-500" />
                                        <span>फ़ाइल चुनें</span>
                                    </button>
                                    <span className="text-gray-400 text-sm font-medium">या</span>
                                    <button
                                        type="button"
                                        onClick={triggerFileSelect}
                                        className="flex items-center justify-center space-x-2 px-6 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-bold w-full sm:w-auto transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Camera className="w-4 h-4 text-purple-500" />
                                        <span>फोटो लें</span>
                                    </button>
                                </div>
                            )}
                            <p className="text-xs text-gray-400 mt-3">अधिकतम फ़ाइल आकार: 10 MB | JPEG, PNG, PDF समर्थित</p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full font-bold text-lg py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.98] ${!submitting
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-blue-200'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}`}
                        >
                            {submitting ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Send className={`w-5 h-5 animate-bounce`} />
                                    शिकायत दर्ज करें (Submit)
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default GrievanceForm;
