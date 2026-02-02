import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Briefcase, Shield } from 'lucide-react';

const OfficerModal = ({ isOpen, onClose, onSave, officer }) => {
    const [formData, setFormData] = useState({
        name: '',
        role: 'Section Officer',
        department: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        if (officer) {
            setFormData(officer);
        } else {
            setFormData({
                name: '',
                role: 'Section Officer',
                department: '',
                phone: '',
                email: ''
            });
        }
    }, [officer, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">
                        {officer ? 'Edit Officer Profile' : 'Add New Officer'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                            <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kota-500 outline-none"
                                placeholder="e.g. Rajesh Sharma"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <div className="relative">
                            <Shield className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kota-500 outline-none bg-white"
                            >
                                <option value="Section Officer">Section Officer</option>
                                <option value="Moderator">Moderator</option>
                                <option value="Department Head">Department Head</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <div className="relative">
                            <Briefcase className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                name="department"
                                required
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kota-500 outline-none"
                                placeholder="e.g. Roads & Construction"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kota-500 outline-none"
                                    placeholder="+91..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kota-500 outline-none"
                                    placeholder="officer@kda.gov.in"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-kota-600 text-white font-bold py-2.5 rounded-lg hover:bg-kota-700 transition-colors shadow-lg shadow-kota-100"
                        >
                            {officer ? 'Update Profile' : 'Add Officer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OfficerModal;
