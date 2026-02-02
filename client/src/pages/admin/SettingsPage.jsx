import React, { useState, useEffect } from 'react';
import { Save, User, Bell, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        emailNotifications: user?.emailNotifications ?? true,
        whatsappAlerts: user?.whatsappAlerts ?? true,
    });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                emailNotifications: user.emailNotifications ?? true,
                whatsappAlerts: user.whatsappAlerts ?? true,
            });
        }
    }, [user]);

    const handleSave = () => {
        setSaving(true);
        // Simulate API call delay
        setTimeout(() => {
            updateUser({
                name: formData.name,
                email: formData.email,
                emailNotifications: formData.emailNotifications,
                whatsappAlerts: formData.whatsappAlerts
            });
            setSaving(false);
            setSuccess(true);

            // Hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        }, 800);
    };

    return (
        <div className="max-w-4xl animate-fade-in-up">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-500 mb-8">Manage your profile and system preferences</p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 flex items-center">
                        <User className="w-5 h-5 mr-2 text-kota-500" /> Profile Settings
                    </h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-kota-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-kota-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        {success && (
                            <span className="text-green-600 text-sm font-bold flex items-center animate-fade-in">
                                <CheckCircle className="w-4 h-4 mr-2" /> Changes Saved Successfully!
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-6 py-2 rounded-lg font-bold transition-all shadow-lg flex items-center ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-kota-600 hover:bg-kota-700 text-white'
                            }`}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-kota-500" /> Notification Preferences
                    </h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">Email Notifications</p>
                            <p className="text-sm text-gray-500">Receive daily summaries of new grievances</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.emailNotifications}
                                onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kota-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">WhatsApp Alerts</p>
                            <p className="text-sm text-gray-500">Receive instant alerts for escalated items</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.whatsappAlerts}
                                onChange={(e) => setFormData({ ...formData, whatsappAlerts: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kota-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
