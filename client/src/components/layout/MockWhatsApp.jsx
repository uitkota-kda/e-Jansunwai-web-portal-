import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MockWhatsApp = () => {
    const [messages, setMessages] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Load events from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('kda_chat_history');
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse chat history');
            }
        }
    }, []);

    // Save to local storage whenever messages change
    useEffect(() => {
        localStorage.setItem('kda_chat_history', JSON.stringify(messages));
    }, [messages]);

    // Listen for custom events dispatched by other components (e.g., successful submission)
    useEffect(() => {
        const handleNewMessage = (event) => {
            // Store raw text for state persistence and dynamic rendering
            const newMessage = {
                id: Date.now(),
                text: event.detail.text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: 'KDA Official',
                isUser: false
            };
            setMessages(prev => {
                const updated = [...prev, newMessage];
                localStorage.setItem('kda_chat_history', JSON.stringify(updated));
                return updated;
            });
            setIsOpen(true);
        };

        window.addEventListener('mock-whatsapp-message', handleNewMessage);
        return () => window.removeEventListener('mock-whatsapp-message', handleNewMessage);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleWebFeedback = async (id, status, messageId) => {
        // 1. Simluate User Reply
        const userMsg = {
            id: Date.now(),
            text: status === 'SATISFIED' ? 'YES - I am satisfied' : 'NO - I am not satisfied',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: 'You',
            isUser: true
        };

        // Update state: Add user message AND update the prompt message to DONE
        setMessages(prev => {
            const updated = prev.map(msg => {
                if (msg.id === messageId) {
                    if (msg.text.startsWith('RESOLVED_PROMPT:::')) {
                        // Convert prompt to done state to disable buttons
                        return { ...msg, text: msg.text.replace('RESOLVED_PROMPT:::', 'RESOLVED_DONE:::') };
                    } else if (msg.text.startsWith('VC_DONE_PROMPT:::')) {
                        return { ...msg, text: msg.text.replace('VC_DONE_PROMPT:::', 'VC_DONE_FINISHED:::') };
                    }
                }
                return msg;
            });
            const finalUpdated = [...updated, userMsg];
            localStorage.setItem('kda_chat_history', JSON.stringify(finalUpdated));
            return finalUpdated;
        });

        // 2. Update Backend
        try {
            await fetch(`http://localhost:3000/api/grievances/${id}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    feedback: status === 'SATISFIED' ? 'YES' : 'NO'
                })
            });
        } catch (e) {
            console.error("Failed to update status", e);
        }

        // 3. Bot Reply
        setTimeout(() => {
            let replyProtocolString;

            // Determine response based on previous prompt type (inferred or stored? We can infer from current satisfactionStatus update but here we are in frontend)
            // Wait, we need to know WHICH prompt we are replying to. 
            // In MockWhatsApp we don't strictly know if it was initial or post-VC unless we track it or check the message ID.
            // However, the user prompted "VC_DONE_PROMPT" will result in a call to backend.

            // Simplification: We will just check if text was SATISFIED or NOT_SATISFIED.
            // But we need a special message for Post-VC Dissatisfaction ("Visit KDA Office").
            // One way is to check the message that was clicked.
            const originalPrompt = messages.find(m => m.id === messageId)?.text || "";
            const isPostVc = originalPrompt.includes('VC_DONE_PROMPT');

            if (status === 'SATISFIED') {
                replyProtocolString = "FEEDBACK_RESPONSE_SATISFIED:::";
            } else {
                if (isPostVc) {
                    replyProtocolString = "FEEDBACK_RESPONSE_VISIT_OFFICE:::";
                } else {
                    replyProtocolString = "FEEDBACK_RESPONSE_UNSATISFIED:::";
                }
            }

            const botMsg = {
                id: Date.now() + 1,
                text: replyProtocolString,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: 'KDA Official',
                isUser: false
            };
            setMessages(prev => {
                const updated = [...prev, botMsg];
                localStorage.setItem('kda_chat_history', JSON.stringify(updated));
                return updated;
            });
        }, 1000);
    };

    const linkify = (text) => {
        if (typeof text !== 'string') return text;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    const renderMessageContent = (msg) => {
        if (typeof msg.text !== 'string') return msg.text;

        if (msg.text.startsWith('RESOLVED_PROMPT:::')) {
            const parts = msg.text.split(':::');
            const uuid = parts[1];
            const displayId = parts[2];
            const remarks = parts[3];

            return (
                <div className="space-y-2">
                    <p className="font-bold text-sm text-gray-900">Grievance Resolved ✅</p>
                    <p className="text-xs">ID: {displayId}</p>
                    <p className="text-xs italic text-gray-600">"{remarks}"</p>
                    <div className="my-2 border-t border-gray-200 pt-2">
                        <p className="text-xs font-semibold mb-2 text-center">Are you satisfied with the resolution?</p>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleWebFeedback(uuid, 'SATISFIED', msg.id)}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition shadow-sm active:scale-95"
                            >
                                YES
                            </button>
                            <button
                                onClick={() => handleWebFeedback(uuid, 'NOT_SATISFIED', msg.id)}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition shadow-sm active:scale-95"
                            >
                                NO
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (msg.text.startsWith('RESOLVED_DONE:::')) {
            const parts = msg.text.split(':::');
            const displayId = parts[2];
            const remarks = parts[3];
            return (
                <div className="space-y-2 opacity-70 grayscale">
                    <p className="font-bold text-sm text-gray-800">Grievance Resolved ✅</p>
                    <p className="text-xs">ID: {displayId}</p>
                    <p className="text-xs italic text-gray-500">"{remarks}"</p>
                    <div className="my-2 border-t border-gray-300 pt-2">
                        <div className="bg-gray-100 p-2 rounded text-center text-xs font-bold text-gray-500 border border-gray-200">
                            Feedback Submitted
                        </div>
                    </div>
                </div>
            );
        }

        if (msg.text === 'FEEDBACK_RESPONSE_SATISFIED:::') {
            return (
                <div className="space-y-2 text-center">
                    <div className="w-full h-24 bg-green-50 rounded-lg flex items-center justify-center mb-2 text-4xl animate-bounce">
                        🎉
                    </div>
                    <p className="font-bold text-green-800 text-sm">Thank you for your feedback!</p>
                    <p className="text-xs">We are glad we could help. We welcome you to use our services again.</p>
                    <p className="text-[10px] text-gray-500 font-bold mt-1">Jai Hind 🇮🇳</p>
                </div>
            );
        }

        if (msg.text === 'FEEDBACK_RESPONSE_UNSATISFIED:::') {
            return (
                <div className="space-y-2">
                    <p className="font-bold text-red-800 text-sm">We've received your feedback.</p>
                    <p className="text-xs">We are sorry you are not satisfied with the resolution. Your feedback has been recorded and an officer will review it shortly. They may contact you for a Video Conference to better understand your concerns.</p>
                </div>
            );
        }

        // Add handling for VC_SCHEDULED
        if (msg.text.startsWith('VC_SCHEDULED:::')) {
            const parts = msg.text.split(':::');
            // Format: VC_SCHEDULED:::GrievanceID:::DateTime:::Link
            const displayId = parts[1];
            const dateTime = parts[2];
            const link = parts[3];

            return (
                <div className="space-y-2 bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <p className="font-bold text-blue-900 text-sm flex items-center">
                        <span className="mr-2">📅</span> VC Scheduled
                    </p>
                    <p className="text-xs text-blue-800">An officer has scheduled a Video Conference regarding your grievance <strong>{displayId}</strong>.</p>

                    <div className="mt-2 bg-white p-2 rounded border border-blue-100">
                        <p className="text-[10px] uppercase font-bold text-gray-500">Date & Time</p>
                        <p className="text-sm font-semibold text-gray-800">{dateTime}</p>
                    </div>

                    <div className="mt-1 bg-white p-2 rounded border border-blue-100">
                        <p className="text-[10px] uppercase font-bold text-gray-500">Meeting Link</p>
                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline font-medium break-all block">
                            {link}
                        </a>
                    </div>

                    <p className="text-[10px] text-blue-600 italic text-center mt-1">
                        Please be ready 5 mins before the time.
                    </p>
                </div>
            );
        }


        // Add handling for VC_DONE_PROMPT
        if (msg.text.startsWith('VC_DONE_PROMPT:::')) {
            const parts = msg.text.split(':::');
            const uuid = parts[1];
            const displayId = parts[2];

            return (
                <div className="space-y-2">
                    <p className="font-bold text-sm text-gray-900">Video Conference Completed 🎥</p>
                    <p className="text-xs">ID: {displayId}</p>
                    <p className="text-xs text-gray-600">The officer has marked the Video Conference as complete.</p>
                    <div className="my-2 border-t border-gray-200 pt-2">
                        <p className="text-xs font-semibold mb-2 text-center">Are you satisfied with the resolution now?</p>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleWebFeedback(uuid, 'SATISFIED', msg.id)}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition shadow-sm active:scale-95"
                            >
                                YES
                            </button>
                            <button
                                onClick={() => handleWebFeedback(uuid, 'NOT_SATISFIED', msg.id)}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition shadow-sm active:scale-95"
                            >
                                NO
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (msg.text.startsWith('VC_DONE_FINISHED:::')) {
            const parts = msg.text.split(':::');
            const displayId = parts[2];
            return (
                <div className="space-y-2 opacity-70 grayscale">
                    <p className="font-bold text-sm text-gray-800">VC Feedback Submitted ✅</p>
                    <p className="text-xs">ID: {displayId}</p>
                    <div className="my-2 border-t border-gray-300 pt-2">
                        <div className="bg-gray-100 p-2 rounded text-center text-xs font-bold text-gray-500 border border-gray-200">
                            Response Recorded
                        </div>
                    </div>
                </div>
            );
        }

        if (msg.text === 'FEEDBACK_RESPONSE_VISIT_OFFICE:::') {
            return (
                <div className="space-y-2">
                    <p className="font-bold text-orange-800 text-sm">Please visit KDA Office.</p>
                    <p className="text-xs">Since you are still not satisfied after the Video Conference, we request you to kindly visit the KDA office in person for further resolution.</p>
                    <div className="bg-orange-50 p-2 rounded text-[10px] text-orange-700 border border-orange-200 mt-1 font-semibold flex items-start">
                        <span className="mr-1">📍</span> Kota Development Authority, C.A.D. Circle, Kota, Rajasthan- 324009
                    </div>
                </div>
            );
        }

        // Handle React Elements (legacy) or plain text
        return <p className="text-sm text-gray-800 leading-relaxed">{linkify(msg.text)}</p>;
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // User Message
        const userMsg = {
            id: Date.now(),
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: 'You',
            isUser: true
        };

        setMessages(prev => [...prev, userMsg]);
        const userInput = input.toLowerCase();
        setInput('');

        // Smart Auto Reply Logic
        setTimeout(() => {
            let replyText;

            if (userInput.includes('status') || userInput.includes('track')) {
                replyText = (
                    <span>
                        To track your grievance, please provide your 10-digit mobile number or Grievance ID.
                        <br /><br />
                        You can also track online here:
                        <br />
                        <button
                            onClick={() => {
                                navigate('/track');
                                setIsOpen(false);
                            }}
                            className="bg-kota-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold mt-2 hover:bg-kota-700 transition-all shadow-sm active:scale-95"
                        >
                            Open Tracking Portal
                        </button>
                    </span>
                );
            } else if (userInput.includes('thank')) {
                replyText = "You're welcome! We are here to serve. Jai Hind. \uD83C\uDDEE\uD83C\uDDF3";
            } else if (userInput.includes('hello') || userInput.includes('hi') || userInput.includes('namaste')) {
                replyText = (
                    <span>
                        Namaste! How can I assist you today?
                        <br /><br />
                        To register a new grievance, click below:
                        <br />
                        <button
                            onClick={() => {
                                navigate('/submit');
                                setIsOpen(false);
                            }}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold mt-2 hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                        >
                            Register Grievance
                        </button>
                    </span>
                );
            } else {
                replyText = (
                    <span>
                        I didn't quite catch that. But if you want to submit a new grievance, click here:
                        <br />
                        <button
                            onClick={() => {
                                navigate('/submit');
                                setIsOpen(false);
                            }}
                            className="text-blue-600 underline text-left hover:text-blue-800 font-medium mt-1 inline-block"
                        >
                            Submit New Grievance
                        </button>
                    </span>
                );
            }

            const replyMsg = {
                id: Date.now() + 1,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: 'KDA Official',
                isUser: false,
                text: replyText
            };
            setMessages(prev => [...prev, replyMsg]);
        }, 1000);
    };

    // Helper to start chat if empty
    const openChat = () => {
        setIsOpen(true);
        if (messages.length === 0) {
            setMessages([{
                id: Date.now(),
                text: "Hello! Type 'Hi' to start.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: 'KDA Official',
                isUser: false
            }]);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
            {/* Messages Stack */}
            {isOpen && (
                <div className="bg-[#e5ddd5] rounded-2xl shadow-2xl border border-gray-200 w-80 h-[500px] flex flex-col overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-[#075e54] text-white p-3 flex justify-between items-center shadow-md">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="font-bold block text-sm">KDA Official</span>
                                <span className="text-xs text-green-100">Online</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-[#128c7e] p-1 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] p-2 px-3 rounded-lg shadow-sm relative ${msg.isUser
                                    ? 'bg-[#dcf8c6] rounded-tr-none'
                                    : 'bg-white rounded-tl-none'
                                    }`}>
                                    {renderMessageContent(msg)}
                                    <span className="text-[10px] text-gray-500 block text-right mt-1 opacity-70">
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="bg-[#f0f0f0] p-2 flex items-center space-x-2 border-t border-gray-200">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-[#075e54] text-sm"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="p-2 bg-[#008a7c] text-white rounded-full hover:bg-[#075e54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-5 h-5 pl-0.5" />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={openChat}
                    className="group flex items-center bg-[#25D366] text-white px-5 py-4 rounded-full shadow-lg hover:bg-[#20bd5a] transition-all hover:-translate-y-1"
                >
                    <MessageSquare className="w-6 h-6 mr-2" />
                    <span className="font-bold">Chat with KDA</span>
                    {messages.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                            {messages.length}
                        </span>
                    )}
                </button>
            )}
        </div>
    );
};

// Helper to trigger messages
export const sendMockWhatsApp = (text) => {
    const event = new CustomEvent('mock-whatsapp-message', { detail: { text } });
    window.dispatchEvent(event);
};

export default MockWhatsApp;
