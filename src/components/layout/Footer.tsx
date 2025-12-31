import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin, Twitter, Linkedin, Github } from 'lucide-react';

const footerLinks = {
    product: [
        { name: 'Features', href: '/#features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'How It Works', href: '/#how-it-works' },
        { name: 'FAQ', href: '/#faq' },
    ],
    company: [
        { name: 'About Us', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
    ],
    resources: [
        { name: 'Documentation', href: '/docs' },
        { name: 'Blog', href: '/blog' },
        { name: 'Support', href: '/support' },
    ],
};

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark-900 border-t border-dark-800">
            <div className="container-custom py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text">Stachbit</span>
                        </Link>
                        <p className="text-dark-400 mb-6 max-w-sm">
                            AI-powered lead generation platform that helps you find businesses who need websites.
                            Automate your outreach and grow your client base.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass-button rounded-full flex items-center justify-center hover:text-primary-400 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass-button rounded-full flex items-center justify-center hover:text-primary-400 transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass-button rounded-full flex items-center justify-center hover:text-primary-400 transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <Link to={link.href} className="text-dark-400 hover:text-white transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link to={link.href} className="text-dark-400 hover:text-white transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-dark-400">
                                <Mail className="w-4 h-4 text-primary-400" />
                                <span>support@stachbit.in</span>
                            </li>
                            <li className="flex items-center gap-3 text-dark-400">
                                <Phone className="w-4 h-4 text-primary-400" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-start gap-3 text-dark-400">
                                <MapPin className="w-4 h-4 text-primary-400 mt-1" />
                                <span>Bengaluru, Karnataka, India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-dark-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-dark-500 text-sm">
                        © {currentYear} Stachbit. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-dark-500">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
