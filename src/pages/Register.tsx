import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();

    const passwordRequirements = [
        { met: password.length >= 8, text: 'At least 8 characters' },
        { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
        { met: /[a-z]/.test(password), text: 'One lowercase letter' },
        { met: /[0-9]/.test(password), text: 'One number' },
    ];

    const isPasswordValid = passwordRequirements.every((req) => req.met);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isPasswordValid) {
            setError('Please meet all password requirements');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const { error: signUpError } = await signUp(email, password, fullName);
            if (signUpError) throw signUpError;
            setSuccess(true);
        } catch (err) {
            setError((err as Error).message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-dark-950">
                <div className="w-full max-w-md text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Check Your Email</h1>
                    <p className="text-dark-400 mb-8">
                        We've sent a confirmation link to <span className="text-white">{email}</span>.
                        Please click the link to verify your account.
                    </p>
                    <Link to="/login" className="btn-primary">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent-900/30 to-primary-900/30 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 mesh-gradient"></div>
                <div className="absolute inset-0 grid-pattern opacity-20"></div>
                <div className="glow-orb glow-orb-accent w-96 h-96 top-20 left-20"></div>
                <div className="glow-orb glow-orb-primary w-80 h-80 bottom-20 right-20"></div>

                <div className="relative z-10 text-center max-w-lg px-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-accent-500 to-primary-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float">
                        <Zap className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Start Your Free Trial
                    </h2>
                    <p className="text-dark-300 mb-8">
                        Get 25 leads and 10 emails free for 7 days. No credit card required.
                    </p>
                    <div className="space-y-3 text-left max-w-xs mx-auto">
                        {['AI-powered lead discovery', 'Website quality analysis', 'Personalized email outreach', 'Export to CSV'].map((feature) => (
                            <div key={feature} className="flex items-center gap-3 text-dark-300">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text">Stachbit</span>
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
                        <p className="text-dark-400">Start your 7-day free trial today</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="label">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="input pl-12"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="label">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-12"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-12 pr-12"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {/* Password Requirements */}
                            {password && (
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    {passwordRequirements.map((req) => (
                                        <div key={req.text} className={`flex items-center gap-2 text-xs ${req.met ? 'text-green-400' : 'text-dark-500'}`}>
                                            <CheckCircle className={`w-3 h-3 ${req.met ? 'opacity-100' : 'opacity-50'}`} />
                                            <span>{req.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="label">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`input pl-12 ${confirmPassword && confirmPassword !== password ? 'input-error' : ''}`}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            {confirmPassword && confirmPassword !== password && (
                                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                            )}
                        </div>

                        {/* Terms */}
                        <p className="text-sm text-dark-500">
                            By signing up, you agree to our{' '}
                            <Link to="/terms" className="text-primary-400 hover:underline">Terms of Service</Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link>.
                        </p>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !isPasswordValid}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <span className="spinner" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <p className="text-center mt-8 text-dark-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
