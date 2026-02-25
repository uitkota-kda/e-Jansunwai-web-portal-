import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-red-100">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
                        <p className="text-gray-600 mb-4">The application encountered an error. Please report this to the technical team.</p>

                        <div className="bg-gray-100 p-4 rounded-lg overflow-auto mb-6 max-h-64">
                            <p className="font-mono text-sm text-red-800 font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
                            <pre className="font-mono text-xs text-gray-700 whitespace-pre-wrap">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>

                        <button
                            onClick={() => window.location.href = '/login'}
                            className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
                        >
                            Return to Login
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
