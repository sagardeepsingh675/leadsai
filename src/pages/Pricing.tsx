import { Link } from 'react-router-dom';
import { Check, X, Zap, Crown, ArrowRight } from 'lucide-react';

interface PricingTier {
    name: string;
    tier: string;
    price: number;
    period: string;
    description: string;
    features: { name: string; included: boolean }[];
    popular?: boolean;
    cta: string;
}

const pricingTiers: PricingTier[] = [
    {
        name: 'Free Trial',
        tier: 'free_trial',
        price: 0,
        period: '7 days',
        description: 'Try all features free for 7 days',
        features: [
            { name: '25 leads per month', included: true },
            { name: '10 emails per month', included: true },
            { name: '1 email template', included: true },
            { name: 'Website analysis', included: true },
            { name: 'CSV export', included: false },
            { name: 'Priority support', included: false },
        ],
        cta: 'Start Free Trial',
    },
    {
        name: 'Basic',
        tier: 'basic',
        price: 499,
        period: 'per month',
        description: 'Perfect for freelancers just starting out',
        features: [
            { name: '100 leads per month', included: true },
            { name: '50 emails per month', included: true },
            { name: '3 email templates', included: true },
            { name: 'Website analysis', included: true },
            { name: 'CSV export', included: true },
            { name: 'Priority support', included: false },
        ],
        cta: 'Get Started',
    },
    {
        name: 'Pro',
        tier: 'pro',
        price: 1499,
        period: 'per month',
        description: 'For growing agencies and teams',
        features: [
            { name: '500 leads per month', included: true },
            { name: '300 emails per month', included: true },
            { name: '10 email templates', included: true },
            { name: 'Website analysis', included: true },
            { name: 'CSV export', included: true },
            { name: 'Priority support', included: true },
        ],
        popular: true,
        cta: 'Get Started',
    },
    {
        name: 'Ultra Pro',
        tier: 'ultra_pro',
        price: 3999,
        period: 'per month',
        description: 'Unlimited power for large agencies',
        features: [
            { name: 'Unlimited leads', included: true },
            { name: '1000 emails per month', included: true },
            { name: 'Unlimited templates', included: true },
            { name: 'Website analysis', included: true },
            { name: 'CSV export', included: true },
            { name: 'Priority support', included: true },
        ],
        cta: 'Contact Sales',
    },
];

function PricingCard({ tier }: { tier: PricingTier }) {
    return (
        <div
            className={`relative card p-8 flex flex-col ${tier.popular
                    ? 'border-2 border-primary-500 shadow-lg shadow-primary-500/20'
                    : ''
                }`}
        >
            {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="badge-primary flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Most Popular
                    </span>
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-dark-400 text-sm">{tier.description}</p>
            </div>

            <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                    {tier.price === 0 ? 'Free' : `₹${tier.price.toLocaleString()}`}
                </span>
                {tier.price > 0 && (
                    <span className="text-dark-400 ml-2">/{tier.period}</span>
                )}
                {tier.price === 0 && (
                    <span className="text-dark-400 ml-2">{tier.period}</span>
                )}
            </div>

            <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-3">
                        {feature.included ? (
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        ) : (
                            <X className="w-5 h-5 text-dark-600 flex-shrink-0" />
                        )}
                        <span className={feature.included ? 'text-dark-300' : 'text-dark-600'}>
                            {feature.name}
                        </span>
                    </li>
                ))}
            </ul>

            <Link
                to="/register"
                className={`${tier.popular ? 'btn-primary' : 'btn-secondary'} w-full`}
            >
                {tier.cta}
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}

export default function Pricing() {
    return (
        <div className="pt-24 pb-20">
            {/* Header */}
            <section className="container-custom text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
                    <Zap className="w-4 h-4 text-primary-400" />
                    <span className="text-sm text-dark-200">Simple, Transparent Pricing</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Choose Your Plan
                </h1>
                <p className="text-lg text-dark-400 max-w-2xl mx-auto">
                    Start with a free trial and upgrade as you grow. All plans include our core features.
                </p>
            </section>

            {/* Pricing Cards */}
            <section className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pricingTiers.map((tier) => (
                        <PricingCard key={tier.tier} tier={tier} />
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="container-custom mt-20">
                <h2 className="text-2xl font-bold text-white text-center mb-8">
                    Frequently Asked Questions
                </h2>
                <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card p-6">
                        <h3 className="text-white font-semibold mb-2">Can I cancel anytime?</h3>
                        <p className="text-dark-400 text-sm">
                            Yes, you can cancel your subscription at any time. Your access continues until the end of your billing period.
                        </p>
                    </div>
                    <div className="card p-6">
                        <h3 className="text-white font-semibold mb-2">What payment methods do you accept?</h3>
                        <p className="text-dark-400 text-sm">
                            We accept all major credit cards, UPI, and net banking through our secure payment partner.
                        </p>
                    </div>
                    <div className="card p-6">
                        <h3 className="text-white font-semibold mb-2">Do unused leads roll over?</h3>
                        <p className="text-dark-400 text-sm">
                            No, leads and email quotas reset at the start of each billing cycle.
                        </p>
                    </div>
                    <div className="card p-6">
                        <h3 className="text-white font-semibold mb-2">Can I upgrade or downgrade?</h3>
                        <p className="text-dark-400 text-sm">
                            Yes, you can change your plan at any time. Changes take effect on your next billing date.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="container-custom mt-20 text-center">
                <div className="card p-12 bg-gradient-to-br from-primary-900/30 to-accent-900/30">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to find your next client?
                    </h2>
                    <p className="text-dark-300 mb-8 max-w-xl mx-auto">
                        Start your free trial today. No credit card required.
                    </p>
                    <Link to="/register" className="btn-primary btn-lg">
                        Start Free Trial
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
