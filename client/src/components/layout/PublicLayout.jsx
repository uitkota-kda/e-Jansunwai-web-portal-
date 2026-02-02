import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 relative overflow-x-hidden">
            <Header />
            <main className="w-full px-4 md:px-12 py-8 flex-1 animate-fade-in relative z-10">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
