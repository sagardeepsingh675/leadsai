import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Zap, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Pricing', href: '/pricing' },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuth();
    const location = useLocation();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-700/50">
            <nav className="container-custom py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text">Stachbit</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={`nav-link ${location.pathname === link.href ? 'nav-link-active' : ''}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <Link to="/dashboard" className="btn-primary">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn-ghost">
                                    <LogIn className="w-4 h-4" />
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 glass-button rounded-lg"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 py-4 border-t border-dark-700 animate-slide-down">
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={`nav-link ${location.pathname === link.href ? 'nav-link-active' : ''}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-2 pt-4 border-t border-dark-700">
                                {user ? (
                                    <Link to="/dashboard" className="btn-primary" onClick={() => setIsMenuOpen(false)}>
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/login" className="btn-secondary" onClick={() => setIsMenuOpen(false)}>
                                            Login
                                        </Link>
                                        <Link to="/register" className="btn-primary" onClick={() => setIsMenuOpen(false)}>
                                            Get Started Free
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
