import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ExternalLink, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <img src="/logo.png" alt="KDA Logo" className="h-12 w-auto object-contain bg-white rounded-lg p-1" />
                            <div>
                                <h3 className="font-display font-bold text-xl leading-none !text-white">Kota Development</h3>
                                <p className="text-xs !text-white/80 font-medium tracking-widest uppercase mt-0.5">Authority</p>
                            </div>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Committed to sustainable urban development and providing efficient civic services to the citizens of Kota.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            {[Facebook, Twitter, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="p-2 bg-white/10 rounded-lg hover:bg-kota-600 hover:text-white text-white/60 transition-all duration-300 hover:-translate-y-1">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 flex items-center !text-white">
                            <span className="w-8 h-1 bg-kota-500 rounded-full mr-3"></span>
                            Quick Links
                        </h4>
                        <ul className="space-y-3 text-sm text-white/80">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'Track Status', path: '/track' },
                                { name: 'Officer Login', path: '/login' },
                                { name: 'Operator Login', path: '/operator-login' },
                                { name: 'KDA Website', path: 'https://kda.rajasthan.gov.in/', external: true }
                            ].map((link) => (
                                <li key={link.name}>
                                    {link.external ? (
                                        <a href={link.path} target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center group transition-colors">
                                            <ExternalLink className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {link.name}
                                        </a>
                                    ) : (
                                        <Link to={link.path} className="hover:text-white flex items-center group transition-colors">
                                            <ExternalLink className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {link.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 flex items-center !text-white">
                            <span className="w-8 h-1 bg-kota-500 rounded-full mr-3"></span>
                            Contact Us
                        </h4>
                        <ul className="space-y-4 text-sm text-white/80">
                            <li className="flex items-start">
                                <MapPin className="w-5 h-5 mr-3 text-kota-500 shrink-0" />
                                <span>Kota Development Authority (KDA) <br /> Cad Circle, Dadabari,<br />Kota, Rajasthan 324009</span>
                            </li>

                            <li className="flex items-center">
                                <Mail className="w-5 h-5 mr-3 text-kota-500 shrink-0" />
                                <span> UIT.KOTA@RAJASTHAN.GOV.IN </span>
                            </li>
                        </ul>
                    </div>

                    {/* Map / Newsletter */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 flex items-center !text-white">
                            <span className="w-8 h-1 bg-kota-500 rounded-full mr-3"></span>
                            Locate Us
                        </h4>
                        <div className="bg-slate-800 rounded-xl p-2 h-40 w-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer border border-slate-700">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113911.23725595305!2d75.7665706!3d25.176527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396f9b30c41bb44d%3A0x5f5c103200000000!2sKota%20Development%20Authority!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0, borderRadius: '0.5rem' }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Kota Development Authority. All Rights Reserved.</p>
                    <div className="flex items-center mt-4 md:mt-0 space-x-6">
                        <a href="https://kda.rajasthan.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">KDA Website</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <span className="flex items-center text-slate-600">
                            Made with <Heart className="w-3 h-3 mx-1 text-red-500 animate-pulse" /> for Citizens
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
