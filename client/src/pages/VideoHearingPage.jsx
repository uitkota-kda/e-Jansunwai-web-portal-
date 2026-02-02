import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PhoneOff, Video, Mic, MicOff, VideoOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VideoHearingPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const jitsiApi = React.useRef(null);

    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const scriptId = 'jitsi-external-api';

        const loadScript = () => {
            return new Promise((resolve, reject) => {
                if (window.JitsiMeetExternalAPI) {
                    resolve();
                    return;
                }

                const existingScript = document.getElementById(scriptId);
                if (existingScript) {
                    // Check if actually loaded
                    const checkInterval = setInterval(() => {
                        if (window.JitsiMeetExternalAPI) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                    // Timeout after 5s
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        if (!window.JitsiMeetExternalAPI) reject();
                    }, 5000);
                    return;
                }

                const script = document.createElement('script');
                script.id = scriptId;
                script.src = 'https://meet.jit.si/external_api.js';
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject();
                document.body.appendChild(script);
            });
        };

        loadScript()
            .then(() => {
                if (isMounted) {
                    setLoading(false);
                    // Small delay to ensure container is in DOM
                    setTimeout(() => initialiseJitsi(), 500);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
            if (jitsiApi.current) {
                jitsiApi.current.dispose();
            }
        };
    }, [roomId, retryCount]);

    const initialiseJitsi = () => {
        if (!window.JitsiMeetExternalAPI || !document.getElementById('jitsi-container')) {
            setError(true);
            return;
        }

        try {
            // Cleanup existing if any
            if (jitsiApi.current) jitsiApi.current.dispose();

            const domain = 'meet.jit.si';
            const options = {
                roomName: roomId,
                width: '100%',
                height: '100%',
                parentNode: document.getElementById('jitsi-container'),
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    prejoinPageEnabled: false,
                    disableDeepLinking: true,
                    enableWelcomePage: false,
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_REMOTE_DISPLAY_NAME: 'Participant'
                },
                userInfo: {
                    displayName: user?.name || (user?.role === 'SECTION_OFFICER' ? 'KDA Official' : 'Citizen')
                }
            };

            const api = new window.JitsiMeetExternalAPI(domain, options);
            jitsiApi.current = api;

            api.addEventListeners({
                videoConferenceLeft: () => navigate(-1),
                readyToClose: () => navigate(-1)
            });
        } catch (err) {
            console.error('Jitsi Error:', err);
            setError(true);
        }
    };

    if (error) {
        return (
            <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white font-sans">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20 shadow-2xl shadow-red-500/10">
                    <VideoOff className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Hearing Connection Failed</h2>
                <p className="text-slate-400 max-w-md mb-8 leading-relaxed font-medium">
                    We couldn't initialize the secure hearing room. This is usually caused by network firewalls or browser privacy settings.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                    >
                        Retry Connection
                    </button>
                    <a
                        href={`https://meet.jit.si/${roomId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-slate-700 active:scale-95"
                    >
                        Join via Direct Link
                    </a>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-900 w-full max-w-xs">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Support Tip</p>
                    <p className="text-xs text-slate-400 mt-2 italic">Try using Google Chrome or disabling ad-blockers for the best experience.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-black overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 text-white p-3 flex justify-between items-center z-20 shadow-xl">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <div className="bg-blue-500/20 p-2.5 rounded-xl border border-blue-500/30">
                            <Video className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-widest text-white/90">Digital Hearing Room</h1>
                        <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">ID: {roomId}</span>
                            <span className="text-[10px] text-green-400 font-bold uppercase tracking-tighter flex items-center">
                                <span className="w-1 h-1 bg-green-400 rounded-full mr-1 animate-ping"></span> Live Connection
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="hidden sm:flex items-center bg-slate-800/50 rounded-lg px-3 py-1.5 border border-white/5">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center text-[10px] font-bold mr-2 text-white">
                            {user?.name?.charAt(0) || 'G'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 font-bold uppercase leading-none">Participant</span>
                            <span className="text-[11px] font-semibold text-slate-200 leading-tight">{user?.name || 'Guest User'}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-500/20 flex items-center active:scale-95"
                    >
                        <PhoneOff className="w-4 h-4 mr-2" /> End Call
                    </button>
                </div>
            </div>

            {/* Video Container Area */}
            <div className="flex-1 relative bg-[#0a0a0c] flex flex-col group">
                <div id="jitsi-container" className="absolute inset-0 z-10" />

                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-0">
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute inset-0 border-[3px] border-white/5 rounded-full"></div>
                            <div className="absolute inset-0 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <Video className="absolute inset-0 m-auto w-8 h-8 text-blue-500/50" />
                        </div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Initializing Secure Channel</h3>
                        <p className="text-sm text-gray-500 mt-2 font-medium tracking-wide">Please grant camera and microphone permission if prompted.</p>
                    </div>
                )}

                {/* Direct Link Fallback (visible on hover/interaction if needed) */}
                <div className="absolute bottom-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center space-x-3 shadow-2xl pointer-events-auto">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Issue with embedded video?</p>
                            <a
                                href={`https://meet.jit.si/${roomId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 font-bold hover:underline"
                            >
                                Open in direct browser →
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar Hints */}
            <div className="bg-black border-t border-white/5 p-2 px-4 flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <Mic className="w-3 h-3 mr-1.5 text-blue-400" /> Audio: <span className="text-gray-300 ml-1">Active</span>
                    </div>
                    <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <Video className="w-3 h-3 mr-1.5 text-blue-400" /> Video: <span className="text-gray-300 ml-1">Active</span>
                    </div>
                </div>
                <div className="text-[10px] text-gray-600 font-medium italic">
                    Encrypted and secure e-hearing connection by KDA
                </div>
            </div>
        </div>
    );
};

export default VideoHearingPage;
