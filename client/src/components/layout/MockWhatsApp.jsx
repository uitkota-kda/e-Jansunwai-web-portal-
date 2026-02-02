import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
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
            const newMessage = {
                id: Date.now(),
                text: event.detail.text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: 'KDA Official',
                isUser: false
            };
            setMessages(prev => {
                const updated = [...prev, newMessage];
                // Ensure we save immediately here too just in case
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
                                    <p className="text-sm text-gray-800 leading-relaxed">{msg.text}</p>
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
