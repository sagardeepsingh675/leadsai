import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Mail,
    Plus,
    Play,
    Pause,
    Trash2,
    BarChart3,
    Users,
    Clock,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getEmailCampaigns, getSmtpConfigs } from '../lib/supabase';
import { formatRelativeTime } from '../lib/utils';
import type { EmailCampaign, CampaignStatus } from '../lib/database.types';

function StatusBadge({ status }: { status: CampaignStatus }) {
    const styles: Record<CampaignStatus, string> = {
        draft: 'badge-primary',
        scheduled: 'badge-warning',
        sending: 'badge-accent',
        completed: 'badge-success',
        paused: 'badge-danger',
    };

    return <span className={styles[status]}>{status}</span>;
}

export default function EmailCampaigns() {
    const { profile } = useAuth();
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasSmtpConfig, setHasSmtpConfig] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!profile) return;

            // Load campaigns
            const { data: campaignData } = await getEmailCampaigns(profile.id);
            if (campaignData) setCampaigns(campaignData);

            // Check if SMTP is configured
            const { data: smtpData } = await getSmtpConfigs(profile.id);
            setHasSmtpConfig(!!(smtpData && smtpData.length > 0));

            setLoading(false);
        }
        loadData();
    }, [profile]);

    const stats = {
        total: campaigns.length,
        active: campaigns.filter((c) => c.status === 'sending').length,
        completed: campaigns.filter((c) => c.status === 'completed').length,
        totalSent: campaigns.reduce((sum, c) => sum + c.sent_count, 0),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Email Campaigns</h1>
                    <p className="text-dark-400">Manage your email outreach campaigns</p>
                </div>
                <Link to="/templates" className="btn-primary">
                    <Plus className="w-4 h-4" />
                    New Campaign
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                            <p className="text-dark-400 text-sm">Total Campaigns</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center">
                            <Play className="w-5 h-5 text-accent-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.active}</p>
                            <p className="text-dark-400 text-sm">Active</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.completed}</p>
                            <p className="text-dark-400 text-sm">Completed</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.totalSent}</p>
                            <p className="text-dark-400 text-sm">Emails Sent</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SMTP Warning - Only show if not configured */}
            {!hasSmtpConfig && (
                <div className="card p-4 border-yellow-500/30 bg-yellow-500/5 flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-white font-medium">Configure SMTP First</p>
                        <p className="text-dark-400 text-sm">
                            Before sending campaigns, make sure to{' '}
                            <Link to="/smtp" className="text-primary-400 hover:underline">
                                configure your SMTP settings
                            </Link>{' '}
                            with your Zoho credentials.
                        </p>
                    </div>
                </div>
            )}

            {/* Campaigns List */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="spinner text-primary-400 mx-auto mb-4" />
                        <p className="text-dark-400">Loading campaigns...</p>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="p-12 text-center">
                        <Mail className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No campaigns yet</h3>
                        <p className="text-dark-400 mb-6">
                            Create your first email campaign to reach out to potential clients.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <Link to="/leads" className="btn-secondary">
                                <Users className="w-4 h-4" />
                                Select Leads
                            </Link>
                            <Link to="/templates" className="btn-primary">
                                <Plus className="w-4 h-4" />
                                Create Template
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {campaigns.map((campaign) => (
                            <div key={campaign.id} className="p-6 hover:bg-dark-800/50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                                            <StatusBadge status={campaign.status} />
                                        </div>
                                        <p className="text-dark-400 text-sm mb-2 line-clamp-1">
                                            {campaign.subject}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-dark-500">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {campaign.total_recipients} recipients
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-4 h-4" />
                                                {campaign.sent_count} sent
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {formatRelativeTime(campaign.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    {campaign.total_recipients > 0 && (
                                        <div className="w-full md:w-48">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-dark-400">Progress</span>
                                                <span className="text-white">
                                                    {Math.round((campaign.sent_count / campaign.total_recipients) * 100)}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                                                    style={{
                                                        width: `${(campaign.sent_count / campaign.total_recipients) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {campaign.status === 'draft' && (
                                            <button className="btn-primary btn-sm">
                                                <Play className="w-4 h-4" />
                                                Start
                                            </button>
                                        )}
                                        {campaign.status === 'sending' && (
                                            <button className="btn-secondary btn-sm">
                                                <Pause className="w-4 h-4" />
                                                Pause
                                            </button>
                                        )}
                                        <button className="btn-ghost btn-sm text-red-400 hover:bg-red-500/10">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
