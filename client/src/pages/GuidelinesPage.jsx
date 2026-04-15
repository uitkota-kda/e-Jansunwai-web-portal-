import React from 'react';
import { HelpCircle, Clock, MapPin, ChevronDown, ArrowLeft, Info, CheckCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-5 text-left transition-all hover:text-kota-600 group"
            >
                <span className="text-lg font-semibold text-slate-800 group-hover:text-kota-600 transition-colors">
                    {question}
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-kota-600' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    {answer}
                </p>
            </div>
        </div>
    );
};

const GuidelinesPage = () => {
    const faqs = [
        {
            question: "How do I register a grievance?",
            answer: "Grievance registration is currently handled physically. Visit the dedicated counter at the KDA office during working hours. An operator will assist you in filling out the form and capturing necessary details."
        },
        {
            question: "What information is required for registration?",
            answer: "You should provide your basic contact details (Name, Mobile Number, Address) and a detailed description of your grievance. Supporting documents or photos related to the issue are highly recommended."
        },
        {
            question: "How can I track my submitted grievance?",
            answer: "Once registered, you can track your grievance by using your registered mobile number and if you want our operator gives you Tracking ID. You can use this ID or your registered mobile number on our home page under 'Quick Status Track' to see real-time updates on your application."
        },
        {
            question: "What is the expected resolution timeline?",
            answer: "The KDA aims to provide an initial response or action taken report within 7-10 working days. Some complex issues might require more time, which will be communicated through the tracking portal."
        },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
            {/* Header Section */}
            <div className="flex flex-col space-y-6">
                <Link
                    to="/"
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-kota-600 transition-colors w-fit group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1.5 bg-kota-600 rounded-full hidden md:block"></div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Guidelines & <span className="text-kota-600">FAQ</span>
                    </h1>
                    <p className="mt-3 text-lg text-slate-500 max-w-2xl">
                        Everything you need to know about the KDA Jansunwai process and how we handle your grievances.
                    </p>
                </div>
            </div>

            {/* Physical Jansunwai Important Notice */}
            <div className="relative overflow-hidden bg-gradient-to-br from-kota-900 to-slate-900 rounded-3xl p-1 px-1 shadow-xl group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                <div className="relative bg-slate-900/40 backdrop-blur-sm rounded-[22px] p-8 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="bg-kota-500/20 p-4 rounded-2xl border border-kota-500/30">
                            <Clock className="w-8 h-8 text-kota-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-kota-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Schedule</span>
                                {/* <h2 className="text-2xl font-bold text-white">Physical Jansunwai</h2> */}

                                <h2 style={{ color: "white" }} className="text-2xl font-bold text-white">Physical Jansunwai</h2>
                            </div>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                We organise physical jansunwai on every <span className="text-white font-bold underline decoration-kota-500 underline-offset-4">2nd and 4th Thursday</span> of every month at <span className="text-white font-semibold">KDA (Kota Development Authority) office</span>.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-md">
                                <MapPin className="w-5 h-5 text-kota-400" />
                                <span className="text-slate-200 text-sm font-medium">KDA Main Campus, Kota</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-md">
                                <Info className="w-5 h-5 text-kota-400" />
                                <span className="text-slate-200 text-sm font-medium">11:00 AM onwards</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Values / Process Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: Shield, title: "Accountability", desc: "Every grievance is assigned to a responsible officer with defined timelines." },
                    { icon: CheckCircle, title: "Transparency", desc: "Track every step of your application's journey through our digital portal." },
                    { icon: Info, title: "Accessibility", desc: "Physical counters and online tracking ensure everyone can seek redressal." }
                ].map((item, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <item.icon className="w-6 h-6 text-kota-600" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">{item.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <HelpCircle className="w-6 h-6 text-kota-600" />
                    <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
                </div>

                <div className="divide-y divide-slate-100">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-slate-50 rounded-3xl p-8 md:p-10 text-center space-y-4 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">Still have questions?</h3>
                <p className="text-slate-500 max-w-lg mx-auto">
                    If you couldn't find the answer you're looking for, please visit our control room or contact your local area representative.
                </p>
                {/* <div className="pt-4">
                    <Link
                        to="/"
                        className="bg-kota-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-kota-900/20 transition-all inline-block"
                    >
                        Return to Dashboard
                    </Link>
                </div> */}
            </div>
        </div>
    );
};

export default GuidelinesPage;
