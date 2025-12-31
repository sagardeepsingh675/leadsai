import { useEffect, useState } from 'react';
import { Pencil, Save, X, Loader2 } from 'lucide-react';
import { supabase, getSubscriptionPlans } from '../../lib/supabase';
import { formatCurrency } from '../../lib/utils';
import type { SubscriptionPlan } from '../../lib/database.types';

export default function ManageSubscriptions() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadPlans();
    }, []);

    async function loadPlans() {
        const { data } = await getSubscriptionPlans();
        if (data) setPlans(data);
        setLoading(false);
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
                                        <button onClick={handleSave} disabled={saving} className="btn-primary btn-sm flex-1">
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save
                                        </button>
                                        <button onClick={handleCancel} className="btn-ghost btn-sm">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-white">{tierLabels[plan.tier]}</h3>
                                        <button onClick={() => handleEdit(plan)} className="p-2 hover:bg-dark-700 rounded-lg">
                                            <Pencil className="w-4 h-4 text-dark-400" />
                                        </button>
                                    </div>

                                    <div className="mb-6">
                                        <span className="text-3xl font-bold text-white">
                                            {plan.price_monthly === 0 ? 'Free' : formatCurrency(plan.price_monthly)}
                                        </span>
                                        {plan.price_monthly > 0 && <span className="text-dark-400">/mo</span>}
                                    </div>

                                    <ul className="space-y-2 text-sm text-dark-300">
                                        <li className="flex justify-between">
                                            <span>Leads/month</span>
                                            <span className="text-white">
                                                {plan.leads_per_month >= 999999 ? '∞' : plan.leads_per_month}
                                            </span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Emails/month</span>
                                            <span className="text-white">{plan.emails_per_month}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Templates</span>
                                            <span className="text-white">
                                                {plan.templates_limit >= 999999 ? '∞' : plan.templates_limit}
                                            </span>
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

            {/* Usage Stats */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Subscription Distribution</h2>
                <p className="text-dark-400 text-center py-8">
                    Charts and analytics coming soon...
                </p>
            </div>
        </div>
    );
}
