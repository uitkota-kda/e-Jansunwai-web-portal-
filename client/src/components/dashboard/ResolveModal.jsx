import React, { useState, useRef } from 'react';
import { X, CheckCircle, Upload, File } from 'lucide-react';
import { sendMockWhatsApp } from '../layout/MockWhatsApp';

const ResolveModal = ({ grievance, onClose, onResolve }) => {
    const [actionReport, setActionReport] = useState('');
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const submitData = new FormData();
            submitData.append('status', 'RESOLVED');
            submitData.append('description', actionReport);
            if (file) {
                submitData.append('attachment', file);
            }

            const response = await fetch(`http://localhost:3000/api/grievances/${grievance.id}`, {
                method: 'PUT',
                body: submitData
            });

            const data = await response.json();

            if (data.success) {
                const successMessage = `Grievance ${grievance.grievanceId} has been resolved. Action Report: ${actionReport.substring(0, 30)}...`;
                sendMockWhatsApp(successMessage);

                onResolve(grievance.id); // Update parent state
                onClose();
                alert('Action Report Submitted & Grievance Resolved!');
            } else {
                alert('Error resolving grievance: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error connecting to server');
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[92vh] shadow-2xl animate-fade-in-up flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Resolve Grievance</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Grievance</p>
                        <p className="font-medium text-gray-900">{grievance.category} - {grievance.grievanceId}</p>
                        <p className="text-sm text-gray-600 mt-1">{grievance.description}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Action Taken Report *</label>
                            <textarea
                                value={actionReport}
                                onChange={(e) => setActionReport(e.target.value)}
                                required
                                maxLength={250}
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-kota-500 outline-none"
                                placeholder="Describe the action taken to resolve this issue..."
                            ></textarea>
                            <p className={`text-xs text-right mt-1 ${actionReport.length >= 250 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                {actionReport.length} / 250 characters
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Proof (Optional)</label>
                            <div
                                onClick={triggerFileSelect}
                                className="border border-gray-300 rounded-xl p-3 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*,.pdf"
                                />
                                {file ? (
                                    <div className="flex items-center text-kota-600">
                                        <File className="w-5 h-5 mr-2" />
                                        <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="ml-2 p-1 hover:bg-red-50 text-red-500 rounded-full"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-600">Click to upload document/image</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center"
                        >
                            {submitting ? 'Submitting...' : (
                                <>
                                    <CheckCircle className="w-5 h-5 mr-2" /> Mark as Resolved
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResolveModal;
