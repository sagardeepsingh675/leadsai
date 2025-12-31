import { useState } from 'react';
import { User, Mail, Building2, Phone, Save, Loader2, CheckCircle, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../lib/supabase';
import { formatDate } from '../lib/utils';

export default function Settings() {
    const { profile, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        company_name: profile?.company_name || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setLoading(true);
        setSaved(false);

        const { error } = await updateUserProfile(profile.id, formData);

        if (!error) {
            await refreshProfile();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }

        setLoading(false);
    };

    const tierLabels: Record<string, string> = {
        free_trial: 'Free Trial',
        basic: 'Basic',
        pro: 'Pro',
        ultra_pro: 'Ultra Pro',
    };

    const tierLimits: Record<string, { leads: number; emails: number }> = {
        free_trial: { leads: 25, emails: 10 },
        basic: { leads: 100, emails: 50 },
        pro: { leads: 500, emails: 300 },
        ultra_pro: { leads: 999999, emails: 1000 },
    };

    const currentLimits = tierLimits[profile?.subscription_tier || 'free_trial'];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Account Settings</h1>
                <p className="text-dark-400">Manage your profile and subscription</p>
            </div>

            {/* Profile Settings */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="input"
                                placeholder="Your full name"
                            />
                        </div>

                        <div>
                            <label className="label flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={profile?.email || ''}
                                disabled
                                className="input opacity-50 cursor-not-allowed"
                            />
                            <p className="text-dark-500 text-xs mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <label className="label flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="input"
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <div>
                            <label className="label flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                className="input"
                                placeholder="Your company name"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : saved ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {saved ? 'Saved!' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Subscription */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Subscription</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-dark-800/50 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                                <Crown className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-semibold">{tierLabels[profile?.subscription_tier || 'free_trial']}</p>
                                <p className="text-dark-400 text-sm capitalize">{profile?.subscription_status}</p>
                            </div>
                        </div>

                        {profile?.subscription_end_date && (
                            <p className="text-dark-400 text-sm">
                                {profile.subscription_status === 'active' ? 'Renews' : 'Expires'} on{' '}
                                <span className="text-white">{formatDate(profile.subscription_end_date)}</span>
                            </p>
                        )}
                    </div>

                    <div className="p-4 bg-dark-800/50 rounded-xl">
                        <p className="text-dark-400 text-sm mb-3">Usage This Month</p>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-dark-300">Leads</span>
                                    <span className="text-white">
                                        {profile?.leads_used_this_month || 0} / {currentLimits.leads === 999999 ? '∞' : currentLimits.leads}
                                    </span>
                                </div>
                                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500"
                                        style={{ width: `${Math.min(100, ((profile?.leads_used_this_month || 0) / currentLimits.leads) * 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-dark-300">Emails</span>
                                    <span className="text-white">
                                        {profile?.emails_sent_this_month || 0} / {currentLimits.emails}
                                    </span>
                                </div>
                                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent-500"
                                        style={{ width: `${Math.min(100, ((profile?.emails_sent_this_month || 0) / currentLimits.emails) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-dark-700">
                    <a href="/pricing" className="btn-primary">
                        Upgrade Plan
                    </a>
                </div>
            </div>

            {/* Account Info */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Account Information</h2>

                <div className="space-y-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-dark-800">
                        <span className="text-dark-400">Account Created</span>
                        <span className="text-white">{profile?.created_at ? formatDate(profile.created_at) : '-'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dark-800">
                        <span className="text-dark-400">Last Login</span>
                        <span className="text-white">{profile?.last_login_at ? formatDate(profile.last_login_at) : '-'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-dark-400">Account Status</span>
                        <span className="badge-success">{profile?.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
