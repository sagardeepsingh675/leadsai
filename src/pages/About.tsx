import { Link } from 'react-router-dom';
import {
    Target,
    Users,
    Heart,
    Award,
    Globe,
    ArrowRight,
    CheckCircle2,
    Lightbulb,
    Rocket,
} from 'lucide-react';

// Value Card Component
interface ValueCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
}

function ValueCard({ icon: Icon, title, description }: ValueCardProps) {
    return (
        <div className="card-hover group p-6 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-7 h-7 text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-dark-400">{description}</p>
        </div>
    );
}

// Team Member Card
interface TeamMemberProps {
    name: string;
    role: string;
    bio: string;
}

function TeamMember({ name, role, bio }: TeamMemberProps) {
    return (
        <div className="card p-6 text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white group-hover:scale-105 transition-transform">
                {name.split(' ').map(n => n[0]).join('')}
            </div>
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <p className="text-primary-400 text-sm mb-2">{role}</p>
            <p className="text-dark-400 text-sm">{bio}</p>
        </div>
    );
}

export default function About() {
    const values = [
        {
            icon: Target,
            title: 'Mission-Driven',
            description: 'We help web professionals find clients who truly need their services.',
        },
        {
            icon: Lightbulb,
            title: 'Innovation',
            description: 'Constantly improving our AI to deliver the most accurate leads.',
        },
        {
            icon: Heart,
            title: 'Customer-First',
            description: 'Your success is our success. We provide 24/7 support.',
        },
        {
            icon: Award,
            title: 'Quality',
            description: 'We never compromise on data accuracy and service quality.',
        },
    ];

    const team = [
        {
            name: 'Sagar Deep',
            role: 'Founder & CEO',
            bio: 'Full-stack developer with 5+ years of experience building SaaS products.',
        },
        {
            name: 'Tech Team',
            role: 'Development',
            bio: 'Passionate engineers building the future of lead generation.',
        },
        {
            name: 'Support Team',
            role: 'Customer Success',
            bio: 'Always here to help you get the most out of Stachbit.',
        },
    ];

    const milestones = [
        { number: '500+', label: 'Active Users' },
        { number: '50K+', label: 'Leads Generated' },
        { number: '10K+', label: 'Emails Sent' },
        { number: '98%', label: 'Satisfaction Rate' },
    ];

    return (
        <div className="pt-16">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 mesh-gradient"></div>
                <div className="absolute inset-0 grid-pattern opacity-30"></div>
                <div className="glow-orb glow-orb-primary w-80 h-80 -top-40 -right-40"></div>
                <div className="glow-orb glow-orb-accent w-60 h-60 bottom-0 left-0"></div>

                <div className="container-custom relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
                            <Users className="w-4 h-4 text-primary-400" />
                            <span className="text-sm text-dark-200">About Stachbit</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Empowering Web Professionals
                            <span className="block gradient-text">Worldwide</span>
                        </h1>
                        <p className="text-lg text-dark-300 mb-8">
                            We're on a mission to help web developers, designers, and agencies find
                            businesses that need their services—automatically and efficiently.
                        </p>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="section bg-dark-900">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="badge-primary mb-4">Our Story</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                Built by Developers, for Developers
                            </h2>
                            <div className="space-y-4 text-dark-300">
                                <p>
                                    Stachbit was born out of frustration. As freelance web developers,
                                    we spent countless hours searching for clients—browsing through
                                    directories, cold calling, and sending generic emails.
                                </p>
                                <p>
                                    We realized there had to be a better way. What if we could use
                                    technology to find businesses that genuinely need websites,
                                    analyze their current online presence, and reach out with
                                    personalized messages?
                                </p>
                                <p>
                                    That's exactly what Stachbit does. Our AI-powered platform
                                    automates the tedious parts of lead generation so you can
                                    focus on what you do best—building amazing websites.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="card p-8 space-y-6">
                                {milestones.map((milestone, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center">
                                            <span className="text-2xl font-bold gradient-text">{milestone.number}</span>
                                        </div>
                                        <span className="text-lg text-dark-300">{milestone.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="section bg-dark-950">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <span className="badge-accent mb-4">Our Values</span>
                        <h2 className="section-title">What Drives Us</h2>
                        <p className="section-subtitle">
                            The principles that guide everything we do at Stachbit.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value) => (
                            <ValueCard key={value.title} {...value} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="section bg-dark-900">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <span className="badge-primary mb-4">The Team</span>
                        <h2 className="section-title">Meet the People Behind Stachbit</h2>
                        <p className="section-subtitle">
                            A passionate team dedicated to your success.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {team.map((member) => (
                            <TeamMember key={member.name} {...member} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="section bg-dark-950">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="badge-accent mb-4">Why Stachbit?</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                The Smart Way to Find Clients
                            </h2>
                            <div className="space-y-4">
                                {[
                                    'AI-powered lead discovery saves hours of manual research',
                                    'Real-time website analysis identifies businesses needing help',
                                    'Personalized email templates improve response rates',
                                    'Export leads to CSV for use with your favorite CRM',
                                    'WhatsApp integration for instant outreach',
                                    '24/7 customer support to help you succeed',
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-dark-300">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card p-8 bg-gradient-to-br from-primary-500/10 to-accent-500/10 border-primary-500/20">
                            <div className="text-center">
                                <Rocket className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">Ready to Get Started?</h3>
                                <p className="text-dark-400 mb-6">
                                    Join 500+ web professionals who trust Stachbit for lead generation.
                                </p>
                                <Link to="/register" className="btn-primary btn-lg w-full">
                                    Start Free Trial
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <p className="text-dark-500 text-sm mt-3">No credit card required</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-gradient-to-br from-primary-900/50 to-accent-900/50 relative overflow-hidden">
                <div className="absolute inset-0 mesh-gradient"></div>
                <div className="container-custom relative z-10 text-center">
                    <Globe className="w-16 h-16 text-primary-400 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Join Our Growing Community
                    </h2>
                    <p className="text-lg text-dark-200 mb-8 max-w-2xl mx-auto">
                        Web developers and agencies from around the world use Stachbit
                        to find clients and grow their businesses.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="btn-primary btn-lg">
                            Get Started Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/contact" className="btn-secondary btn-lg">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
