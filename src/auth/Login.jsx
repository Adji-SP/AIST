import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';

const Login = () => {
    const { login, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Already logged in → go to dashboard
    if (!authLoading && user) {
        navigate('/overview', { replace: true });
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('Please fill in all fields.'); return; }
        setLoading(true);
        try {
            await login(email, password);
            navigate('/overview', { replace: true });
        } catch (err) {
            const messages = {
                'auth/invalid-credential': 'Invalid email or password.',
                'auth/user-not-found': 'No account found with this email.',
                'auth/wrong-password': 'Incorrect password.',
                'auth/too-many-requests': 'Too many attempts. Please try again later.',
                'auth/network-request-failed': 'Network error. Check your connection.',
            };
            setError(messages[err.code] || 'Sign-in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">

            {/* Card */}
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <img src="/assets/logo/LOGO.png" alt="Logo" className="w-12 h-12 object-contain group-hover:scale-105 transition-transform" />
                        <div className="text-left">
                            <p className="text-xl font-bold text-slate-800">Greenara</p>
                            <p className="text-xs text-slate-400 font-medium">Precision Agriculture Platform</p>
                        </div>
                    </Link>
                </div>

                {/* Form card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
                        <p className="text-slate-500 text-sm mt-1">Sign in to access your dashboard</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl mb-5 text-sm text-red-700">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="login-password"
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    tabIndex={-1}
                                >
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>
                    {/* Link to register */}
                    <p className="text-center text-sm text-slate-500 mt-5">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                            Create one
                        </Link>
                    </p>
                </div>

                {/* Back to home */}
                <p className="text-center text-sm text-slate-400 mt-6">
                    <Link to="/" className="hover:text-green-600 transition-colors font-medium">
                        ← Back to home
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
