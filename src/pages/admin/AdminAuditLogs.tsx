import { useState, useEffect } from 'react';
import {
    History,
    User,
    Search,
    Calendar,
    Filter,
    RefreshCw,
    ChevronDown,
    LogIn,
    LogOut,
    Settings,
    CreditCard,
    UserPlus,
    Trash2,
    Edit,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRelativeTime } from '../../lib/utils';

interface AuditLog {
    id: string;
    user_id: string;
    user_email: string;
    action: string;
    details: string;
    ip_address: string;
    created_at: string;
}

const ACTION_ICONS: Record<string, any> = {
    'login': LogIn,
    'logout': LogOut,
    'signup': UserPlus,
    'settings_update': Settings,
    'subscription_change': CreditCard,
    'lead_save': Search,
    'lead_delete': Trash2,
    'profile_update': Edit,
};

const ACTION_COLORS: Record<string, string> = {
    'login': 'text-green-400 bg-green-500/20',
    'logout': 'text-orange-400 bg-orange-500/20',
    'signup': 'text-blue-400 bg-blue-500/20',
    'settings_update': 'text-purple-400 bg-purple-500/20',
    'subscription_change': 'text-yellow-400 bg-yellow-500/20',
    'lead_save': 'text-cyan-400 bg-cyan-500/20',
    'lead_delete': 'text-red-400 bg-red-500/20',
    'profile_update': 'text-pink-400 bg-pink-500/20',
};

// Sample data for demo
const SAMPLE_LOGS: AuditLog[] = [
    { id: '1', user_id: '1', user_email: 'admin@example.com', action: 'login', details: 'Admin logged in', ip_address: '192.168.1.1', created_at: new Date().toISOString() },
    { id: '2', user_id: '2', user_email: 'user@example.com', action: 'signup', details: 'New user registration', ip_address: '10.0.0.1', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', user_id: '3', user_email: 'john@example.com', action: 'lead_save', details: 'Saved 15 leads from search', ip_address: '172.16.0.1', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: '4', user_id: '4', user_email: 'jane@example.com', action: 'subscription_change', details: 'Upgraded to Pro plan', ip_address: '192.168.1.50', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: '5', user_id: '1', user_email: 'admin@example.com', action: 'settings_update', details: 'Updated site settings', ip_address: '192.168.1.1', created_at: new Date(Date.now() - 172800000).toISOString() },
];

export default function AdminAuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>(SAMPLE_LOGS);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLogs = logs.filter(log => {
        if (filter !== 'all' && log.action !== filter) return false;
        if (searchQuery && !log.user_email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const actionTypes = [
        { value: 'all', label: 'All Actions' },
        { value: 'login', label: 'Login' },
        { value: 'logout', label: 'Logout' },
        { value: 'signup', label: 'Signup' },
        { value: 'lead_save', label: 'Lead Save' },
        { value: 'subscription_change', label: 'Subscription' },
        { value: 'settings_update', label: 'Settings' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
                    <p className="text-dark-400">Track user and admin activities</p>
                </div>
                <button
                    onClick={() => setLoading(true)}
                    className="btn-secondary"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by email..."
                            className="input pl-10"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="select w-full md:w-48"
                    >
                        {actionTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Logs List */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-700">
                                <th className="text-left p-4 text-dark-400 font-medium">User</th>
                                <th className="text-left p-4 text-dark-400 font-medium">Action</th>
                                <th className="text-left p-4 text-dark-400 font-medium">Details</th>
                                <th className="text-left p-4 text-dark-400 font-medium">IP Address</th>
                                <th className="text-left p-4 text-dark-400 font-medium">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => {
                                const Icon = ACTION_ICONS[log.action] || History;
                                const colorClass = ACTION_COLORS[log.action] || 'text-gray-400 bg-gray-500/20';
                                return (
                                    <tr key={log.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-dark-400" />
                                                </div>
                                                <span className="text-white">{log.user_email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${colorClass}`}>
                                                <Icon className="w-4 h-4" />
                                                {log.action.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-dark-300">{log.details}</td>
                                        <td className="p-4 text-dark-400 font-mono text-sm">{log.ip_address}</td>
                                        <td className="p-4 text-dark-400">{formatRelativeTime(log.created_at)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredLogs.length === 0 && (
                    <div className="text-center py-12">
                        <History className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                        <p className="text-dark-400">No logs found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
