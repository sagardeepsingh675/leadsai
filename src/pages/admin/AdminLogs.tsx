import { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Filter,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Info,
    AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LogEntry {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    action: string;
    user_email: string | null;
    details: string;
    created_at: string;
}

const typeIcons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
};

const typeColors = {
    info: 'text-blue-400 bg-blue-500/20',
    success: 'text-green-400 bg-green-500/20',
    warning: 'text-yellow-400 bg-yellow-500/20',
    error: 'text-red-400 bg-red-500/20',
};

export default function AdminLogs() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        const logsList: LogEntry[] = [];

        // Fetch recent users (as registration events)
        const { data: recentUsers } = await supabase
            .from('user_profiles')
            .select('id, full_name, email, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        if (recentUsers) {
            recentUsers.forEach(user => {
                logsList.push({
                    id: `user-${user.id}`,
                    type: 'success',
                    action: 'User Registration',
                    user_email: user.email,
                    details: `${user.full_name || 'New user'} registered successfully`,
                    created_at: user.created_at,
                });
            });
        }

        // Fetch recent leads (as lead creation events)
        const { data: recentLeads } = await supabase
            .from('leads')
            .select('id, business_name, city, state, user_id, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        if (recentLeads) {
            recentLeads.forEach(lead => {
                logsList.push({
                    id: `lead-${lead.id}`,
                    type: 'info',
                    action: 'Lead Saved',
                    user_email: null,
                    details: `${lead.business_name} - ${[lead.city, lead.state].filter(Boolean).join(', ')}`,
                    created_at: lead.created_at,
                });
            });
        }

        // Fetch recent searches
        const { data: recentSearches } = await supabase
            .from('lead_searches')
            .select('id, business_type, city, state, country, results_count, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        if (recentSearches) {
            recentSearches.forEach(search => {
                logsList.push({
                    id: `search-${search.id}`,
                    type: 'info',
                    action: 'Lead Search',
                    user_email: null,
                    details: `Searched for ${search.business_type || 'businesses'} in ${[search.city, search.state, search.country].filter(Boolean).join(', ')} - ${search.results_count || 0} results`,
                    created_at: search.created_at,
                });
            });
        }

        // Fetch email logs if available
        const { data: emailLogs } = await supabase
            .from('email_logs')
            .select('id, recipient_email, subject, status, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        if (emailLogs) {
            emailLogs.forEach(email => {
                logsList.push({
                    id: `email-${email.id}`,
                    type: email.status === 'sent' ? 'success' : email.status === 'failed' ? 'error' : 'info',
                    action: 'Email Sent',
                    user_email: email.recipient_email,
                    details: email.subject || 'Email sent',
                    created_at: email.created_at,
                });
            });
        }

        // Sort all logs by time
        logsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setLogs(logsList);
        setLoading(false);
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || log.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const formatTime = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-7 h-7 text-primary-400" />
                        System Logs
                    </h1>
                    <p className="text-dark-400 mt-1">Monitor system activity and events</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="btn-secondary flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-12 w-full"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-dark-500" />
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="select"
                    >
                        <option value="all">All Types</option>
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(['info', 'success', 'warning', 'error'] as const).map((type) => {
                    const count = logs.filter(l => l.type === type).length;
                    const Icon = typeIcons[type];
                    return (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
                            className={`card p-4 flex items-center gap-3 transition-all ${typeFilter === type ? 'ring-2 ring-primary-500' : ''
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${typeColors[type]}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-dark-400 text-xs capitalize">{type}</p>
                                <p className="text-white font-bold text-lg">{count}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Logs Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-700">
                                <th className="text-left p-4 text-dark-400 font-medium">Type</th>
                                <th className="text-left p-4 text-dark-400 font-medium">Action</th>
                                <th className="text-left p-4 text-dark-400 font-medium">User</th>
                                <th className="text-left p-4 text-dark-400 font-medium">Details</th>
                                <th className="text-right p-4 text-dark-400 font-medium">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-dark-400">Loading...</td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-dark-400">No logs found</td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => {
                                    const Icon = typeIcons[log.type];
                                    return (
                                        <tr key={log.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                                            <td className="p-4">
                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${typeColors[log.type]}`}>
                                                    <Icon className="w-3 h-3" />
                                                    {log.type}
                                                </div>
                                            </td>
                                            <td className="p-4 text-white font-medium">{log.action}</td>
                                            <td className="p-4 text-dark-300">{log.user_email || '-'}</td>
                                            <td className="p-4 text-dark-400 max-w-xs truncate">{log.details}</td>
                                            <td className="p-4 text-right text-dark-500 text-sm">{formatTime(log.created_at)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
