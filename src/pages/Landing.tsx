import { Link } from 'react-router-dom';
import {
    Search,
    BarChart3,
    Mail,
    Shield,
    Clock,
    Users,
    Globe,
    CheckCircle2,
    ArrowRight,
    Star,
    ChevronDown,
    Play,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { useSEO, pageSEO } from '../hooks/useSEO';

// Feature Card Component
interface FeatureCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <div className="card-hover group p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-dark-400">{description}</p>
        </div>
    );
}

// Step Card Component
interface StepCardProps {
    number: string;
    title: string;
    description: string;
}

function StepCard({ number, title, description }: StepCardProps) {
    return (
        <div className="relative">
            <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                    {number}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                <p className="text-dark-400">{description}</p>
            </div>
        </div>
    );
}

// FAQ Item Component
interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}

function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
    return (
        <div className="card overflow-hidden">
            <button
                onClick={onClick}
                className="flex items-center justify-between w-full p-6 text-left"
            >
                <span className="text-lg font-medium text-white">{question}</span>
                <ChevronDown className={`w-5 h-5 text-dark-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-6 pb-6 text-dark-400 animate-slide-down">
                    {answer}
                </div>
            )}
        </div>
    );
}

// Testimonial Card Component
interface TestimonialCardProps {
    name: string;
    role: string;
    content: string;
    rating: number;
    image?: string;
    company?: string;
}

function TestimonialCard({ name, role, content, rating, image, company }: TestimonialCardProps) {
    return (
        <div className="card p-6 testimonial-enhanced hover-tilt group">
            <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400 group-hover:animate-pulse" />
                ))}
            </div>
            <p className="text-dark-300 mb-6 text-lg leading-relaxed">"{content}"</p>
            <div className="flex items-center gap-4">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-500/30"
                    />
                ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {name.charAt(0)}
                    </div>
                )}
                <div>
                    <p className="text-white font-semibold">{name}</p>
                    <p className="text-primary-400 text-sm">{role}</p>
                    {company && <p className="text-dark-500 text-xs">{company}</p>}
                </div>
            </div>
        </div>
    );
}

export default function Landing() {
    useSEO(pageSEO.landing);
    const [openFAQ, setOpenFAQ] = useState<number | null>(0);

    const features = [
        {
            icon: Search,
            title: 'Smart Lead Discovery',
            description: 'Find potential clients in any industry using AI-powered search across multiple data sources.',
        },
        {
            icon: BarChart3,
            title: 'Business Analysis',
            description: 'Analyze business profiles, online presence, and identify high-value prospects.',
        },
        {
            icon: Mail,
            title: 'Email Outreach',
            description: 'Send personalized emails to prospects with customizable templates.',
        },
        {
            icon: Shield,
            title: 'Verified Data',
            description: 'Get accurate business data including name, address, phone, and email.',
        },
        {
            icon: Clock,
            title: 'Save Time',
            description: 'Automate your lead generation process and focus on closing deals.',
        },
        {
            icon: Globe,
            title: 'Global Coverage',
            description: 'Search for businesses worldwide with regional and industry filtering.',
        },
    ];

    const steps = [
        {
            number: '1',
            title: 'Define Your Target',
            description: 'Select your target location, industry, and ideal client criteria.',
        },
        {
            number: '2',
            title: 'Get Quality Leads',
            description: 'Our AI finds matching businesses with verified contact information.',
        },
        {
            number: '3',
            title: 'Reach Out',
            description: 'Send personalized emails and WhatsApp messages to convert leads.',
        },
    ];

    const faqs = [
        {
            question: 'What types of businesses can I find leads for?',
            answer: 'Stachbit works for any business type! Whether you offer web development, advertising, marketing, consulting, or any other B2B service - find clients who need what you sell.',
        },
        {
            question: 'Is there a free trial available?',
            answer: 'Yes! We offer a 7-day free trial with 25 leads and 10 emails. No credit card required to start.',
        },
        {
            question: 'Can I use my own email service?',
            answer: 'Absolutely! Stachbit supports custom SMTP configurations including Zoho, Gmail, SendGrid, and more.',
        },
        {
            question: 'How accurate is the business data?',
            answer: 'Our data comes from verified public sources including Google Maps, directories, and business registrations.',
        },
        {
            question: 'Can I filter leads by industry?',
            answer: 'Yes! Filter by industry, location, company size, and more to find your ideal clients.',
        },
    ];

    const testimonials = [
        {
            name: 'Rahul Sharma',
            role: 'Marketing Agency Owner',
            company: 'TechCraft Solutions',
            content: 'Stachbit helped me find 50 new advertising clients in my first month. The targeting is incredibly accurate!',
            rating: 5,
            image: '/images/testimonial_avatar_male_1.png',
        },
        {
            name: 'Priya Mehta',
            role: 'Digital Agency Owner',
            company: 'Digital Dreams Agency',
            content: 'We use it to find clients for web design, SEO, and social media services. The ROI is amazing!',
            rating: 5,
            image: '/images/testimonial_avatar_female.png',
        },
        {
            name: 'Amit Kumar',
            role: 'Business Consultant',
            company: 'AK Consulting',
            content: 'Finally, a lead gen tool that works for any business! I find new consulting clients every week.',
            rating: 5,
            image: '/images/testimonial_avatar_male_2.png',
        },
    ];

    return (
        <div className="pt-16">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 mesh-gradient"></div>
                <div className="absolute inset-0 grid-pattern opacity-30"></div>
                <div className="glow-orb glow-orb-primary w-96 h-96 -top-48 -right-48"></div>
                <div className="glow-orb glow-orb-accent w-80 h-80 bottom-0 left-1/4"></div>

                {/* Floating Particles */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>
                </div>

                <div className="container-custom relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left - Content */}
                        <div className="text-center lg:text-left">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8 animate-fade-in">
                                <Sparkles className="w-4 h-4 text-primary-400 animate-pulse" />
                                <span className="text-sm text-dark-200">AI-Powered Lead Generation</span>
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">New</span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up">
                                Find Leads For
                                <span className="block gradient-text typing-cursor">Your Business</span>
                            </h1>

                            {/* Subheadline */}
                            <p className="text-lg md:text-xl text-dark-300 mb-10 max-w-xl animate-slide-up" style={{ animationDelay: '100ms' }}>
                                Discover potential clients in any industry. Whether you offer websites, advertising,
                                marketing, or consulting — find businesses that need your services.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
                                <Link to="/register" className="btn-primary btn-lg btn-shimmer animate-pulse-glow group">
                                    <Play className="w-5 h-5" />
                                    Start Free Trial
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/pricing" className="btn-secondary btn-lg">
                                    View Pricing
                                </Link>
                            </div>

                            {/* Social Proof */}
                            <div className="mt-12 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-6 text-dark-400 animate-fade-in" style={{ animationDelay: '400ms' }}>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary-400" />
                                    <span className="font-semibold text-white">500+</span>
                                    <span>Active Users</span>
                                </div>
                                <div className="hidden sm:block w-1 h-1 bg-dark-600 rounded-full"></div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    <span className="font-semibold text-white">50K+</span>
                                    <span>Leads Found</span>
                                </div>
                                <div className="hidden sm:block w-1 h-1 bg-dark-600 rounded-full"></div>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    <span className="ml-1 font-semibold text-white">4.9</span>
                                </div>
                            </div>
                        </div>

                        {/* Right - Dashboard Mockup */}
                        <div className="relative animate-scale-reveal hidden lg:block" style={{ animationDelay: '300ms' }}>
                            <div className="relative animate-float-slow">
                                <img
                                    src="/images/hero_dashboard_mockup.png"
                                    alt="Stachbit AI Lead Generator Dashboard"
                                    className="w-full rounded-2xl mockup-shadow hover-tilt"
                                />
                                {/* Floating Feature Badges */}
                                <div className="absolute -top-4 -left-4 glass rounded-xl px-4 py-2 animate-float-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-white font-medium">Live Lead Discovery</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -right-4 glass rounded-xl px-4 py-2 animate-float-fast">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-primary-400" />
                                        <span className="text-sm text-white font-medium">Auto Email Outreach</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Counter Section */}
            <section className="py-16 bg-dark-900 relative overflow-hidden">
                <div className="absolute inset-0 grid-pattern opacity-20"></div>
                <div className="container-custom relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '500+', label: 'Active Users', color: 'from-primary-400 to-primary-600' },
                            { value: '50K+', label: 'Leads Found', color: 'from-green-400 to-green-600' },
                            { value: '25K+', label: 'Emails Sent', color: 'from-blue-400 to-blue-600' },
                            { value: '98%', label: 'Satisfaction', color: 'from-accent-400 to-accent-600' },
                        ].map((stat, index) => (
                            <div key={index} className="text-center group">
                                <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform`}>
                                    {stat.value}
                                </div>
                                <div className="text-dark-400 text-sm md:text-base">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integrations Section */}
            <section className="py-12 bg-dark-950">
                <div className="container-custom">
                    <div className="text-center mb-8">
                        <p className="text-dark-500 text-sm uppercase tracking-wider">Works with your favorite tools</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                        {[
                            { name: 'Gmail', icon: '📧' },
                            { name: 'Zoho', icon: '📮' },
                            { name: 'WhatsApp', icon: '💬' },
                            { name: 'SendGrid', icon: '📨' },
                            { name: 'CSV Export', icon: '📊' },
                            { name: 'Google Maps', icon: '🗺️' },
                        ].map((tool, index) => (
                            <div key={index} className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors group">
                                <span className="text-2xl group-hover:scale-110 transition-transform">{tool.icon}</span>
                                <span className="font-medium">{tool.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="section bg-dark-950">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <span className="badge-primary mb-4">Features</span>
                        <h2 className="section-title">Everything You Need to Find Clients</h2>
                        <p className="section-subtitle">
                            Powerful tools to discover, analyze, and reach out to businesses that need your services.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <FeatureCard key={feature.title} {...feature} />
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="section bg-dark-900">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <span className="badge-accent mb-4">How It Works</span>
                        <h2 className="section-title">Three Simple Steps</h2>
                        <p className="section-subtitle">
                            Start finding clients in minutes with our easy-to-use platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step) => (
                            <StepCard key={step.number} {...step} />
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/register" className="btn-primary btn-lg">
                            Get Started Now
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="section bg-dark-950">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <span className="badge-primary mb-4">Testimonials</span>
                        <h2 className="section-title">Loved by Developers</h2>
                        <p className="section-subtitle">
                            See what our users have to say about finding clients with Stachbit.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial) => (
                            <TestimonialCard key={testimonial.name} {...testimonial} />
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="section bg-dark-900">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <span className="badge-accent mb-4">FAQ</span>
                        <h2 className="section-title">Frequently Asked Questions</h2>
                        <p className="section-subtitle">
                            Got questions? We've got answers.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, index) => (
                            <FAQItem
                                key={index}
                                {...faq}
                                isOpen={openFAQ === index}
                                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-gradient-to-br from-primary-900/50 to-accent-900/50 relative overflow-hidden">
                <div className="absolute inset-0 mesh-gradient"></div>
                <div className="container-custom relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Ready to Find Your Next Client?
                    </h2>
                    <p className="text-lg text-dark-200 mb-8 max-w-2xl mx-auto">
                        Join hundreds of businesses who use Stachbit to automate lead generation and grow their client base.
                    </p>
                    <Link to="/register" className="btn-primary btn-lg">
                        Start Your Free Trial
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <p className="text-dark-400 text-sm mt-4">
                        No credit card required • 7 days free • Cancel anytime
                    </p>
                </div>
            </section>
        </div>
    );
}
