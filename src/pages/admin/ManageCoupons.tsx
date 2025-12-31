import { useState, useEffect } from 'react';
import {
    Ticket,
    Plus,
    Search,
    Trash2,
    Edit2,
    X,
    Check,
    Percent,
    DollarSign,
    Calendar,
    Users,
    ToggleLeft,
    ToggleRight,
    Copy,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Coupon {
    id: string;
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_purchase: number;
    max_uses: number | null;
    used_count: number;
    valid_from: string;
    expires_at: string | null;
    is_active: boolean;
    applicable_plans: string[];
    created_at: string;
}

export default function ManageCoupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'percentage' as 'percentage' | 'fixed',
        discount_value: 10,
        min_purchase: 0,
        max_uses: '',
        expires_at: '',
        is_active: true,
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setCoupons(data);
        }
        setLoading(false);
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, code });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const couponData = {
            code: formData.code.toUpperCase(),
            description: formData.description || null,
            discount_type: formData.discount_type,
            discount_value: formData.discount_value,
            min_purchase: formData.min_purchase,
            max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
            expires_at: formData.expires_at || null,
            is_active: formData.is_active,
        };

        if (editingCoupon) {
            await supabase
                .from('coupons')
                .update(couponData)
                .eq('id', editingCoupon.id);
        } else {
            await supabase
                .from('coupons')
                .insert(couponData);
        }

        setShowModal(false);
        setEditingCoupon(null);
        resetForm();
        fetchCoupons();
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discount_type: 'percentage',
            discount_value: 10,
            min_purchase: 0,
            max_uses: '',
            expires_at: '',
            is_active: true,
        });
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description || '',
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_purchase: coupon.min_purchase,
            max_uses: coupon.max_uses?.toString() || '',
            expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
            is_active: coupon.is_active,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this coupon?')) {
            await supabase.from('coupons').delete().eq('id', id);
            fetchCoupons();
        }
    };

    const toggleActive = async (coupon: Coupon) => {
        await supabase
            .from('coupons')
            .update({ is_active: !coupon.is_active })
            .eq('id', coupon.id);
        fetchCoupons();
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Ticket className="w-7 h-7 text-primary-400" />
                        Manage Coupons
                    </h1>
                    <p className="text-dark-400 mt-1">Create and manage discount codes</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Create Coupon
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                    type="text"
                    placeholder="Search coupons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-12 w-full max-w-md"
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/20 rounded-lg">
                            <Ticket className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Total Coupons</p>
                            <p className="text-xl font-bold text-white">{coupons.length}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Check className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Active</p>
                            <p className="text-xl font-bold text-white">{coupons.filter(c => c.is_active).length}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Total Uses</p>
                            <p className="text-xl font-bold text-white">{coupons.reduce((sum, c) => sum + c.used_count, 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coupons Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-700">
                                <th className="text-left p-4 text-dark-400 font-medium">Code</th>
                                <th className="text-left p-4 text-dark-400 font-medium">Discount</th>
                                <th className="text-left p-4 text-dark-400 font-medium">Usage</th>
                                <th className="text-left p-4 text-dark-400 font-medium">Expires</th>
                                <th className="text-left p-4 text-dark-400 font-medium">Status</th>
                                <th className="text-right p-4 text-dark-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-dark-400">Loading...</td>
                                </tr>
                            ) : filteredCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-dark-400">No coupons found</td>
                                </tr>
                            ) : (
                                filteredCoupons.map((coupon) => (
                                    <tr key={coupon.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <code className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded font-mono text-sm">
                                                    {coupon.code}
                                                </code>
                                                <button
                                                    onClick={() => copyCode(coupon.code)}
                                                    className="p-1 hover:bg-dark-700 rounded text-dark-400 hover:text-white"
                                                    title="Copy code"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {coupon.description && (
                                                <p className="text-dark-500 text-xs mt-1">{coupon.description}</p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1">
                                                {coupon.discount_type === 'percentage' ? (
                                                    <>
                                                        <Percent className="w-4 h-4 text-green-400" />
                                                        <span className="text-white font-medium">{coupon.discount_value}%</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <DollarSign className="w-4 h-4 text-green-400" />
                                                        <span className="text-white font-medium">₹{coupon.discount_value}</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-white">{coupon.used_count}</span>
                                            <span className="text-dark-500">
                                                {coupon.max_uses ? ` / ${coupon.max_uses}` : ' / ∞'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {coupon.expires_at ? (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="w-4 h-4 text-dark-500" />
                                                    <span className={new Date(coupon.expires_at) < new Date() ? 'text-red-400' : 'text-dark-300'}>
                                                        {new Date(coupon.expires_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-dark-500">Never</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => toggleActive(coupon)}
                                                className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${coupon.is_active
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-dark-700 text-dark-400'
                                                    }`}
                                            >
                                                {coupon.is_active ? (
                                                    <><ToggleRight className="w-4 h-4" /> Active</>
                                                ) : (
                                                    <><ToggleLeft className="w-4 h-4" /> Inactive</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(coupon)}
                                                    className="p-2 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-white"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg text-dark-400 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-dark-700">
                            <h2 className="text-xl font-bold text-white">
                                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                            </h2>
                            <button
                                onClick={() => { setShowModal(false); setEditingCoupon(null); }}
                                className="p-2 hover:bg-dark-700 rounded-lg"
                            >
                                <X className="w-5 h-5 text-dark-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Coupon Code */}
                            <div>
                                <label className="label">Coupon Code *</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="input flex-1 font-mono"
                                        placeholder="SUMMER2024"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={generateCode}
                                        className="btn-secondary"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="label">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input"
                                    placeholder="Summer sale discount"
                                />
                            </div>

                            {/* Discount Type & Value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Discount Type</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                                        className="select"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Discount Value *</label>
                                    <input
                                        type="number"
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                                        className="input"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Min Purchase & Max Uses */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Min. Purchase (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.min_purchase}
                                        onChange={(e) => setFormData({ ...formData, min_purchase: parseFloat(e.target.value) })}
                                        className="input"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="label">Max Uses</label>
                                    <input
                                        type="number"
                                        value={formData.max_uses}
                                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                        className="input"
                                        placeholder="Unlimited"
                                        min="1"
                                    />
                                </div>
                            </div>

                            {/* Expiry Date */}
                            <div>
                                <label className="label">Expires At</label>
                                <input
                                    type="date"
                                    value={formData.expires_at}
                                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                    className="input"
                                />
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${formData.is_active ? 'bg-primary-500' : 'bg-dark-600'
                                        }`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_active ? 'left-7' : 'left-1'
                                        }`} />
                                </button>
                                <label className="text-white">Active</label>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingCoupon(null); }}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
