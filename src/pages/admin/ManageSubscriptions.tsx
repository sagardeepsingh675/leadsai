import { useEffect, useState } from 'react';
import { Pencil, Save, X, Loader2, Users } from 'lucide-react';
import { supabase, getSubscriptionPlans } from '../../lib/supabase';
import { formatCurrency } from '../../lib/utils';
import type { SubscriptionPlan } from '../../lib/database.types';

interface PlanStats {
    tier: string;
    count: number;
    color: string;
}

export default function ManageSubscriptions() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [planStats, setPlanStats] = useState<PlanStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadPlans();
        loadPlanStats();
    }, []);

    async function loadPlans() {
        const { data } = await getSubscriptionPlans();
        if (data) setPlans(data);
        setLoading(false);
    }

    async function loadPlanStats() {
        const { data: users } = await supabase
            .from('user_profiles')
            .select('subscription_tier');

        const stats: Record<string, number> = {
            free_trial: 0,
            basic: 0,
            pro: 0,
            ultra_pro: 0,
        };

        if (users) {
            users.forEach(user => {
                const tier = user.subscription_tier || 'free_trial';
                if (stats[tier] !== undefined) {
                    stats[tier]++;
                }
            });
        }

        const colors: Record<string, string> = {
            free_trial: 'bg-gray-500',
            basic: 'bg-blue-500',
            pro: 'bg-purple-500',
            ultra_pro: 'bg-amber-500',
        };

        setPlanStats(Object.entries(stats).map(([tier, count]) => ({
            tier,
            count,
            color: colors[tier] || 'bg-gray-500',
        })));
    }

    const handleEdit = (plan: SubscriptionPlan) => {
        setEditingId(plan.id);
        setEditForm({
            price_monthly: plan.price_monthly,
            leads_per_month: plan.leads_per_month,
            emails_per_month: plan.emails_per_month,
            templates_limit: plan.templates_limit,
        });
    };

    const handleSave = async () => {
        if (!editingId) return;
        setSaving(true);

        await supabase
            .from('subscription_plans')
            .update(editForm)
            .eq('id', editingId);

        await loadPlans();
        setEditingId(null);
        setSaving(false);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const tierLabels: Record<string, string> = {
        free_trial: 'Free Trial',
        basic: 'Basic',
        pro: 'Pro',
        ultra_pro: 'Ultra Pro',
    };

    const totalUsers = planStats.reduce((sum, p) => sum + p.count, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Subscription Plans</h1>
                <p className="text-dark-400">Manage pricing and limits for each subscription tier</p>
            </div>

            {/* Plans */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card p-6">
                            <div className="skeleton h-6 w-24 mb-4 rounded" />
                            <div className="skeleton h-10 w-20 mb-4 rounded" />
                            <div className="space-y-2">
                                <div className="skeleton h-4 w-full rounded" />
                                <div className="skeleton h-4 w-full rounded" />
                                <div className="skeleton h-4 w-full rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="card p-6">
                            {editingId === plan.id ? (
                                // Edit Mode
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white">{tierLabels[plan.tier]}</h3>

                                    <div>
                                        <label className="label">Price (₹/month)</label>
                                        <input
                                            type="number"
                                            value={editForm.price_monthly || 0}
                                            onChange={(e) => setEditForm({ ...editForm, price_monthly: parseFloat(e.target.value) })}
                                            className="input"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Leads/month</label>
                                        <input
                                            type="number"
                                            value={editForm.leads_per_month || 0}
                                            onChange={(e) => setEditForm({ ...editForm, leads_per_month: parseInt(e.target.value) })}
                                            className="input"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Emails/month</label>
                                        <input
                                            type="number"
                                            value={editForm.emails_per_month || 0}
                                            onChange={(e) => setEditForm({ ...editForm, emails_per_month: parseInt(e.target.value) })}
                                            className="input"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Templates limit</label>
                                        <input
                                            type="number"
                                            value={editForm.templates_limit || 0}
                                            onChange={(e) => setEditForm({ ...editForm, templates_limit: parseInt(e.target.value) })}
                                            className="input"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={handleCancel} className="btn-secondary flex-1">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-bold text-white">{tierLabels[plan.tier]}</h3>
                                        <button
                                            onClick={() => handleEdit(plan)}
                                            className="p-2 hover:bg-dark-700 rounded-lg"
                                        >
                                            <Pencil className="w-4 h-4 text-dark-400" />
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <span className="text-2xl font-bold text-white">
                                            {plan.price_monthly === 0 ? 'Free' : formatCurrency(plan.price_monthly)}
                                        </span>
                                        {plan.price_monthly > 0 && <span className="text-dark-400">/mo</span>}
                                    </div>

                                    <ul className="space-y-2 text-sm text-dark-300">
                                        <li className="flex justify-between">
                                            <span className="text-primary-400">Leads/month</span>
                                            <span>{plan.leads_per_month === -1 ? '∞' : plan.leads_per_month}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span className="text-primary-400">Emails/month</span>
                                            <span>{plan.emails_per_month === -1 ? '∞' : plan.emails_per_month}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Templates</span>
                                            <span>{plan.templates_limit === -1 ? '∞' : plan.templates_limit}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>CSV Export</span>
                                            <span className={plan.can_export_csv ? 'text-green-400' : 'text-dark-500'}>
                                                {plan.can_export_csv ? 'Yes' : 'No'}
                                            </span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Priority Support</span>
                                            <span className={plan.priority_support ? 'text-green-400' : 'text-dark-500'}>
                                                {plan.priority_support ? 'Yes' : 'No'}
                                            </span>
                                        </li>
                                    </ul>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Subscription Distribution */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-400" />
                    Subscription Distribution
                </h2>
                {totalUsers === 0 ? (
                    <p className="text-dark-400 text-center py-8">No users yet</p>
                ) : (
                    <div className="space-y-4">
                        {/* Progress bars */}
                        {planStats.map((stat) => (
                            <div key={stat.tier} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white font-medium">{tierLabels[stat.tier]}</span>
                                    <span className="text-dark-400">{stat.count} users ({Math.round((stat.count / totalUsers) * 100)}%)</span>
                                </div>
                                <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${stat.color} rounded-full transition-all`}
                                        style={{ width: `${Math.max((stat.count / totalUsers) * 100, 2)}%` }}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Summary */}
                        <div className="pt-4 border-t border-dark-700 flex justify-between">
                            <span className="text-dark-400">Total Users</span>
                            <span className="text-white font-bold">{totalUsers}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
