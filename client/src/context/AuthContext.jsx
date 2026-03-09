import { API_BASE_URL } from '../config';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ENGINEERING_ZONES } from '../constants';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('kda_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (result.success) {
                const userData = result.data;
                // Add extra client-side flags if needed (like isDirector)
                const isSectionOfficer = userData.role === 'SECTION_OFFICER';
                const sectionName = userData.section || '';
                // isDirector should only be true for SECTION_OFFICERs who are Directors or Deputy Commissioners
                userData.isDirector = isSectionOfficer && (sectionName.includes('Director') || sectionName.includes('Deputy commissioner'));

                // Sub-Official Zone Normalization Fallback (If missing from DB or cached stale)
                const subOfficialRoles = ['EXECUTIVE_ENGINEER', 'REVENUE_OFFICIAL', 'PLANNING_OFFICIAL', 'LEGAL_OFFICIAL', 'FINANCE_OFFICIAL'];
                if (subOfficialRoles.includes(userData.role) && !userData.zone) {
                    const uname = userData.username;
                    if (uname.startsWith('tdr_zone')) {
                        userData.zone = `TDR Zone ${uname.replace('tdr_zone', '')}`;
                    } else if (uname === 'aao_revenue') {
                        userData.zone = 'AAO- Kota South';
                    } else if (uname.startsWith('ee_')) {
                        const slug = uname.replace('ee_', '');
                        if (slug === 'housing') userData.zone = 'Housing';
                        else if (slug === 'crf') userData.zone = 'CRF';
                        else if (slug === 'electricity') userData.zone = 'Electricity';
                        else if (slug === 'horticulture_abd') userData.zone = 'Horticulture/ ABD';
                        else if (slug === 'sewerage') userData.zone = 'Sewerage';
                        else if (slug === 'water__i') userData.zone = 'Water - I';
                        else if (slug === 'water__ii') userData.zone = 'Water - II';
                        else userData.zone = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/_/g, ' ');
                    } else if (uname.startsWith('atp_zone')) {
                        userData.zone = `ATP Zone ${uname.replace('atp_zone', '')}`;
                    }
                }

                // Token is already in userData from server response
                setUser(userData);
                localStorage.setItem('kda_user', JSON.stringify(userData));
                return { success: true };
            } else {
                return { success: false, message: result.message || 'Invalid credentials' };
            }
        } catch (err) {
            console.error('Login Error:', err);
            return { success: false, message: 'Connection failed: ' + err.message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('kda_user');
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('kda_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
