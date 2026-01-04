import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Inbox,
    Search,
    Filter,
    Eye,
    X,
    Mail,
    Phone,
    Building2,
    Clock,
    Loader2,
    RefreshCw,
    Trash2,
    Save,
} from 'lucide-react';

interface WebsiteInquiry {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    service_interest?: string;
    budget_range?: string;
    message: string;
    status: string;
    admin_notes?: string;
    created_at: string;
    updated_at: string;
}

const statusOptions = [
    { value: 'new', label: 'New', color: 'bg-blue-500' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-purple-500' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500' },
];

const serviceLabels: Record<string, string> = {
    web_dev: 'Website Development',
    saas: 'SaaS Application',
    android: 'Android App',
    custom: 'Custom Solution',
};

export default function AdminInquiries() {
    const [inquiries, setInquiries] = useState<WebsiteInquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedInquiry, setSelectedInquiry] = useState<WebsiteInquiry | null>(null);
    const [editNotes, setEditNotes] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('website_inquiries')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInquiries(data || []);
        } catch (error) {
            console.error('Error fetching inquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const handleViewInquiry = (inquiry: WebsiteInquiry) => {
        setSelectedInquiry(inquiry);
        setEditNotes(inquiry.admin_notes || '');
        setEditStatus(inquiry.status);
    };

    const handleUpdateInquiry = async () => {
        if (!selectedInquiry) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('website_inquiries')
                .update({
                    status: editStatus,
                    admin_notes: editNotes,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', selectedInquiry.id);

            if (error) throw error;

            setInquiries(prev => prev.map(i =>
                i.id === selectedInquiry.id
                    ? { ...i, status: editStatus, admin_notes: editNotes }
                    : i
            ));
            setSelectedInquiry(null);
        } catch (error) {
            console.error('Error updating inquiry:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteInquiry = async (id: string) => {
        if (!confirm('Are you sure you want to delete this inquiry?')) return;

        try {
            const { error } = await supabase
                .from('website_inquiries')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setInquiries(prev => prev.filter(i => i.id !== id));
            if (selectedInquiry?.id === id) setSelectedInquiry(null);
        } catch (error) {
            console.error('Error deleting inquiry:', error);
        }
    };

    const filteredInquiries = inquiries.filter(inquiry => {
        const matchesSearch =
            inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.company?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusOption = statusOptions.find(s => s.value === status);
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusOption?.color || 'bg-gray-500'} text-white`}>
                {statusOption?.label || status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Inbox className="w-7 h-7 text-emerald-400" />
                        Website Inquiries
                    </h1>
                    <p className="text-gray-400 mt-1">Contact form submissions from stachbit.in</p>
                </div>
                <button
                    onClick={fetchInquiries}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                        <option value="all">All Status</option>
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Inquiries List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            ) : filteredInquiries.length === 0 ? (
                <div className="text-center py-20 bg-gray-800/50 rounded-xl">
                    <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No inquiries found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredInquiries.map((inquiry) => (
                        <div
                            key={inquiry.id}
                            className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-white font-medium">{inquiry.name}</h3>
                                        {getStatusBadge(inquiry.status)}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-4 h-4" />
                                            {inquiry.email}
                                        </span>
                                        {inquiry.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-4 h-4" />
                                                {inquiry.phone}
                                            </span>
                                        )}
                                        {inquiry.company && (
                                            <span className="flex items-center gap-1">
                                                <Building2 className="w-4 h-4" />
                                                {inquiry.company}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {formatDate(inquiry.created_at)}
                                        </span>
                                    </div>
                                    {inquiry.service_interest && (
                                        <p className="text-emerald-400 text-sm mt-2">
                                            Interested in: {serviceLabels[inquiry.service_interest] || inquiry.service_interest}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleViewInquiry(inquiry)}
                                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                                        title="View Details"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteInquiry(inquiry.id)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Inquiry Detail Modal */}
            {selectedInquiry && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Inquiry Details</h2>
                            <button
                                onClick={() => setSelectedInquiry(null)}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Contact Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-400 text-sm">Name</label>
                                    <p className="text-white font-medium">{selectedInquiry.name}</p>
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm">Email</label>
                                    <p className="text-white">
                                        <a href={`mailto:${selectedInquiry.email}`} className="text-emerald-400 hover:underline">
                                            {selectedInquiry.email}
                                        </a>
                                    </p>
                                </div>
                                {selectedInquiry.phone && (
                                    <div>
                                        <label className="text-gray-400 text-sm">Phone</label>
                                        <p className="text-white">
                                            <a href={`tel:${selectedInquiry.phone}`} className="text-emerald-400 hover:underline">
                                                {selectedInquiry.phone}
                                            </a>
                                        </p>
                                    </div>
                                )}
                                {selectedInquiry.company && (
                                    <div>
                                        <label className="text-gray-400 text-sm">Company</label>
                                        <p className="text-white">{selectedInquiry.company}</p>
                                    </div>
                                )}
                                {selectedInquiry.service_interest && (
                                    <div>
                                        <label className="text-gray-400 text-sm">Service Interest</label>
                                        <p className="text-white">{serviceLabels[selectedInquiry.service_interest] || selectedInquiry.service_interest}</p>
                                    </div>
                                )}
                                {selectedInquiry.budget_range && (
                                    <div>
                                        <label className="text-gray-400 text-sm">Budget Range</label>
                                        <p className="text-white">{selectedInquiry.budget_range}</p>
                                    </div>
                                )}
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-gray-400 text-sm">Message</label>
                                <div className="mt-2 p-4 bg-gray-800 rounded-lg text-white whitespace-pre-wrap">
                                    {selectedInquiry.message}
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="text-gray-400 text-sm">Status</label>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    className="mt-2 w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Admin Notes */}
                            <div>
                                <label className="text-gray-400 text-sm">Admin Notes</label>
                                <textarea
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    rows={4}
                                    placeholder="Add notes about this inquiry..."
                                    className="mt-2 w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-800">
                                <button
                                    onClick={() => setSelectedInquiry(null)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateInquiry}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
