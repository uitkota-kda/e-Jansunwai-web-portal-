import React, { useState, useEffect } from 'react';
import { UserPlus, Key, Trash2, Edit2, Shield, Briefcase, Terminal, Search } from 'lucide-react';
import { ENGINEERING_ZONES } from '../../constants';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'MODERATOR',
        section: '',
        zone: '',
        email: ''
    });

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/users');
            const data = await res.json();
            if (data.success) setUsers(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editUser ? `http://localhost:3000/api/users/${editUser.id}` : 'http://localhost:3000/api/users';
        const method = editUser ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert(editUser ? 'User updated!' : 'User created!');
                setShowModal(false);
                setEditUser(null);
                setFormData({ name: '', username: '', password: '', role: 'MODERATOR', section: '', zone: '', email: '' });
                fetchUsers();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Error saving user');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await fetch(`http://localhost:3000/api/users/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setUsers(users.filter(u => u.id !== id));
            }
        } catch (err) {
            alert('Error deleting user');
        }
    };

    const handleEdit = (user) => {
        setEditUser(user);
        setFormData({
            name: user.name,
            username: user.username,
            password: user.password,
            role: user.role,
            section: user.section || '',
            zone: user.zone || '',
            email: user.email || ''
        });
        setShowModal(true);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleIcon = (role) => {
        switch (role) {
            case 'SUPER_ADMIN': return <Shield className="w-4 h-4 text-red-600" />;
            case 'MODERATOR': return <Shield className="w-4 h-4 text-blue-600" />;
            case 'SECTION_OFFICER': return <Briefcase className="w-4 h-4 text-emerald-600" />;
            case 'EXECUTIVE_ENGINEER': return <Briefcase className="w-4 h-4 text-orange-500" />;
            case 'OPERATOR': return <Terminal className="w-4 h-4 text-sky-600" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage portal access for moderators, officers, and operators</p>
                </div>
                <button
                    onClick={() => { setEditUser(null); setFormData({ name: '', username: '', password: '', role: 'MODERATOR', section: '', zone: '', email: '' }); setShowModal(true); }}
                    className="flex items-center px-4 py-2 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Create New User
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                />
            </div>

            {/* User Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Name / Username</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Section / Zone</th>
                            <th className="px-6 py-4">Password</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center">Loading users...</td></tr>
                        ) : filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-all">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{user.name}</span>
                                        <span className="text-xs text-gray-500">@{user.username}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full w-fit">
                                        {getRoleIcon(user.role)}
                                        <span className="text-[10px] font-black uppercase tracking-tighter">
                                            {user.role === 'SUPER_ADMIN' ? 'ADMIN' : user.role === 'MODERATOR' ? 'MODERATOR' : user.role.replace('_', ' ')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-medium text-gray-600">{user.section || user.zone || '-'}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center group">
                                        <span className="font-mono text-gray-400 blur-[2px] group-hover:blur-0 transition-all cursor-help">{user.password}</span>
                                        <Key className="w-3 h-3 ml-2 text-gray-300" />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => handleEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit/Reset">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            disabled={user.role === 'SUPER_ADMIN'}
                                            className={`p-2 rounded-lg transition-all ${user.role === 'SUPER_ADMIN' ? 'text-gray-200' : 'text-red-500 hover:bg-red-50'}`}
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-black p-6 text-white text-center">
                            <h3 className="text-xl font-bold">{editUser ? 'Edit User Credentials' : 'Create New Portal User'}</h3>
                            <p className="text-gray-400 text-sm mt-1">{editUser ? 'Update access or reset password' : 'Grant system access to staff'}</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: (e.target.value).toLowerCase() })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                                    >
                                        <option value="MODERATOR">Moderator</option>
                                        <option value="SECTION_OFFICER">Section Officer</option>
                                        <option value="EXECUTIVE_ENGINEER">Executive Engineer</option>
                                        <option value="OPERATOR">Data Entry Operator</option>
                                        <option value="SUPER_ADMIN">Admin</option>
                                    </select>
                                </div>

                                {formData.role === 'SECTION_OFFICER' && (
                                    <div className="col-span-2 space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign Section</label>
                                        <select
                                            value={formData.section}
                                            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                                        >
                                            <option value="">Select Section...</option>
                                            <option value="Deputy commissioner I">Deputy Commissioner I</option>
                                            <option value="Deputy commissioner II">Deputy Commissioner II</option>
                                            <option value="Director Engineering">Director Engineering</option>
                                            <option value="Director Finance">Director Finance</option>
                                            <option value="Director Planning">Director Planning</option>
                                            <option value="Director legal">Director Legal</option>
                                        </select>
                                    </div>
                                )}
                                {formData.role === 'EXECUTIVE_ENGINEER' && (
                                    <div className="col-span-2 space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign Area/Officer</label>
                                        <select
                                            value={formData.zone}
                                            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                                        >
                                            <option value="">Select Zone...</option>
                                            {ENGINEERING_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-black text-white font-bold hover:bg-gray-800 rounded-lg transition-all"
                                >
                                    {editUser ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;
