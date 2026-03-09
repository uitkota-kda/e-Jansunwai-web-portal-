import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const GrievanceOtpLogin = () => {
    const navigate = useNavigate();
    const [mobile, setMobile] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const handleSendOTP = async () => {
        if (mobile.length !== 10) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }

        setSending(true);
        // Simulate sending OTP
        setTimeout(() => {
            const mockOtp = '123456'; // Static for demo
            console.log("Mock OTP sent:", mockOtp);
            setOtpSent(true);
            alert(`OTP sent to your mobile! (Use ${mockOtp} for demo)`);
            setSending(false);
        }, 800);
    };

    const handleVerifyOTP = async () => {
        if (otpValue.length !== 6) {
            alert('Please enter 6-digit OTP');
            return;
        }

        setVerifying(true);
        // Simulate verifying OTP
        setTimeout(() => {
            if (otpValue === '123456') {
                alert('Mobile number verified successfully!');
                navigate('/register-grievance', { state: { mobile } });
            } else {
                alert('Invalid OTP. Please try again.');
            }
            setVerifying(false);
        }, 600);
    };

    return (
        <div className="max-w-md mx-auto py-16 px-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <Phone className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Login / Register</h2>
                    <p className="text-gray-500 text-sm">Verify your mobile number to file a new grievance.</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-medium">
                                +91
                            </span>
                            <input
                                type="tel"
                                required
                                disabled={otpSent}
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="w-full pl-12 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50"
                                placeholder="Enter 10-digit number"
                            />
                        </div>
                    </div>

                    {!otpSent ? (
                        <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={mobile.length !== 10 || sending}
                            className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-95 ${mobile.length === 10 ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200' : 'bg-gray-300 cursor-not-allowed shadow-none'}`}
                        >
                            {sending ? 'Sending OTP...' : 'Get OTP'}
                        </button>
                    ) : (
                        <div className="animate-in fade-in zoom-in duration-300 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Enter 6-digit OTP</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={otpValue}
                                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50/20 text-center font-bold tracking-[0.4em] text-xl"
                                    placeholder="••••••"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleVerifyOTP}
                                disabled={otpValue.length !== 6 || verifying}
                                className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-95 ${otpValue.length === 6 ? 'bg-green-600 hover:bg-green-700 hover:shadow-green-200' : 'bg-gray-300 cursor-not-allowed shadow-none'}`}
                            >
                                {verifying ? 'Verifying...' : 'Verify Login'} <ArrowRight className="w-4 h-4" />
                            </button>
                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setOtpSent(false); setOtpValue(''); }}
                                    className="text-sm font-semibold text-blue-600 hover:underline"
                                >
                                    Change Mobile Number?
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GrievanceOtpLogin;
