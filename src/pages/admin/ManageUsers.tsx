import { useEffect, useState } from 'react';
import {
    Users,
    Search,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Crown,
    Ban,
    CheckCircle,
} from 'lucide-react';
import { getAllUsers, updateUserAsAdmin } from '../../lib/supabase';
import { formatDate, getInitials } from '../../lib/utils';
import type { UserProfile, SubscriptionTier } from '../../lib/database.types';

const USERS_PER_PAGE = 10;

export default function ManageUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, [currentPage]);

    async function loadUsers() {
        setLoading(true);
        const { data, count } = await getAllUsers({
            limit: USERS_PER_PAGE,
            offset: (currentPage - 1) * USERS_PER_PAGE,
        });

        if (data) setUsers(data);
        if (count !== null) setTotalCount(count);
        setLoading(false);
    }

    const filteredUsers = users.filter((user) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(totalCount / USERS_PER_PAGE);

    const handleUpdateTier = async (userId: string, tier: SubscriptionTier) => {
        await updateUserAsAdmin(userId, { subscription_tier: tier });
        await loadUsers();
        setActionMenuId(null);
    };

    const handleToggleActive = async (userId: string, isActive: boolean) => {
        await updateUserAsAdmin(userId, { is_active: !isActive });
        await loadUsers();
        setActionMenuId(null);
    };

    const handleMakeAdmin = async (userId: string) => {
        await updateUserAsAdmin(userId, { role: 'admin' });
        await loadUsers();
        setActionMenuId(null);
    };

    const tierColors: Record<string, string> = {
        free_trial: 'badge-primary',
        basic: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        pro: 'badge-accent',
        ultra_pro: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Manage Users</h1>
                    <p className="text-dark-400">{totalCount} total registered users</p>
                </div>
            </div>

            {/* Search */}
            <div className="card p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or email..."
                        className="input pl-12"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="spinner text-primary-400 mx-auto mb-4" />
                        <p className="text-dark-400">Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
                        <p className="text-dark-400">Try a different search query</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Subscription</th>
                                    <th>Usage</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {user.full_name ? getInitials(user.full_name) : '?'}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{user.full_name || 'No Name'}</p>
                                                    <p className="text-dark-500 text-sm">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {user.role === 'admin' ? (
                                                <span className="badge-accent flex items-center gap-1 w-fit">
                                                    <Crown className="w-3 h-3" />
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="text-dark-400">User</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${tierColors[user.subscription_tier]}`}>
                                                {user.subscription_tier.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="text-dark-400 text-sm">
                                            <div>
                                                {user.leads_used_this_month} leads
                                            </div>
                                            <div>
                                                {user.emails_sent_this_month} emails
                                            </div>
                                        </td>
                                        <td>
                                            {user.is_active ? (
                                                <span className="badge-success flex items-center gap-1 w-fit">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="badge-danger flex items-center gap-1 w-fit">
                                                    <Ban className="w-3 h-3" />
                                                    Suspended
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-dark-400 text-sm">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActionMenuId(actionMenuId === user.id ? null : user.id)}
                                                    className="p-2 hover:bg-dark-700 rounded-lg"
                                                >
                                                    <MoreHorizontal className="w-4 h-4 text-dark-400" />
                                                </button>
                                                {actionMenuId === user.id && (
                                                    <div className="absolute right-0 mt-1 w-48 glass-card p-2 z-10 animate-slide-down">
                                                        <p className="px-3 py-1 text-xs text-dark-500 uppercase">Change Tier</p>
                                                        {(['free_trial', 'basic', 'pro', 'ultra_pro'] as SubscriptionTier[]).map((tier) => (
                                                            <button
                                                                key={tier}
                                                                onClick={() => handleUpdateTier(user.id, tier)}
                                                                className={`w-full px-3 py-2 text-left text-sm rounded-lg ${user.subscription_tier === tier
                                                                    ? 'bg-primary-500/20 text-primary-400'
                                                                    : 'text-dark-300 hover:bg-dark-700'
                                                                    }`}
                                                            >
                                                                {tier.replace('_', ' ')}
                                                            </button>
                                                        ))}
                                                        <hr className="my-2 border-dark-700" />
                                                        {user.role !== 'admin' && (
                                                            <button
                                                                onClick={() => handleMakeAdmin(user.id)}
                                                                className="w-full px-3 py-2 text-left text-sm text-accent-400 hover:bg-accent-500/10 rounded-lg flex items-center gap-2"
                                                            >
                                                                <Crown className="w-4 h-4" />
                                                                Make Admin
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleToggleActive(user.id, user.is_active)}
                                                            className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 ${user.is_active
                                                                ? 'text-red-400 hover:bg-red-500/10'
                                                                : 'text-green-400 hover:bg-green-500/10'
                                                                }`}
                                                        >
                                                            {user.is_active ? (
                                                                <>
                                                                    <Ban className="w-4 h-4" />
                                                                    Suspend User
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Activate User
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-dark-700 flex items-center justify-between">
                        <p className="text-dark-400 text-sm">
                            Showing {(currentPage - 1) * USERS_PER_PAGE + 1} to{' '}
                            {Math.min(currentPage * USERS_PER_PAGE, totalCount)} of {totalCount}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="btn-ghost btn-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-white px-3">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="btn-ghost btn-sm"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
