import React, { useState } from 'react';
import { User, Phone, Mail, Plus } from 'lucide-react';
import OfficerModal from '../../components/admin/OfficerModal';

const OfficersPage = () => {
    // Initial Mock Data
    const [officers, setOfficers] = useState([
        { id: 1, name: 'Senior DC I', role: 'Deputy Commissioner', department: 'DC Section I', phone: '+91 98765 43210', email: 'dc1.admin@kda.gov.in' },
        { id: 2, name: 'Senior DC II', role: 'Deputy Commissioner', department: 'DC Section II', phone: '+91 98765 43211', email: 'dc2.admin@kda.gov.in' },
        { id: 3, name: 'Chief Engineer', role: 'Director', department: 'Engineering', phone: '+91 98765 43212', email: 'director.eng@kda.gov.in' },
        { id: 4, name: 'Finance Head', role: 'Director', department: 'Finance', phone: '+91 98765 43213', email: 'director.fin@kda.gov.in' },
        { id: 5, name: 'Planning Head', role: 'Director', department: 'Planning', phone: '+91 98765 43214', email: 'director.plan@kda.gov.in' },
        { id: 6, name: 'Legal Advisor', role: 'Director', department: 'Legal', phone: '+91 98765 43215', email: 'director.legal@kda.gov.in' },
        { id: 7, name: 'Anjali Gupta', role: 'Moderator', department: 'Admin', phone: '+91 98765 43216', email: 'anjali.admin@kda.gov.in' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOfficer, setEditingOfficer] = useState(null);

    const handleAddOfficer = () => {
        setEditingOfficer(null);
        setIsModalOpen(true);
    };

    const handleEditOfficer = (officer) => {
        setEditingOfficer(officer);
        setIsModalOpen(true);
    };

    const handleSaveOfficer = (officerData) => {
        if (editingOfficer) {
            // Update existing
            setOfficers(officers.map(off =>
                off.id === editingOfficer.id ? { ...off, ...officerData } : off
            ));
        } else {
            // Add new
            const newOfficer = {
                id: officers.length + 1,
                ...officerData
            };
            setOfficers([...officers, newOfficer]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Officers Directory</h1>
                    <p className="text-gray-500">Manage department officers and their roles</p>
                </div>
                <button
                    onClick={handleAddOfficer}
                    className="bg-kota-600 text-white px-4 py-2 rounded-lg font-bold flex items-center hover:bg-kota-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" /> Add New Officer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {officers.map(officer => (
                    <div key={officer.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                                <User className="w-6 h-6" />
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${officer.role === 'Moderator' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                {officer.role}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{officer.name}</h3>
                        <p className="text-kota-600 text-sm font-medium mb-4">{officer.department}</p>

                        <div className="space-y-2 text-sm text-gray-500">
                            <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2" /> {officer.phone}
                            </div>
                            <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-2" /> {officer.email}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => handleEditOfficer(officer)}
                                className="text-sm font-medium text-kota-600 hover:text-kota-800"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <OfficerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveOfficer}
                officer={editingOfficer}
            />
        </div>
    );
};

export default OfficersPage;
