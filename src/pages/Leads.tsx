import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    Search,
    Download,
    Trash2,
    Mail,
    ExternalLink,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Phone,
    MessageCircle,
    Star,
    Facebook,
    Instagram,
    Linkedin,
    MapPin,
    X,
    Send,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getLeads, deleteLead, updateLead, getWhatsAppTemplates } from '../lib/supabase';
import { formatRelativeTime, downloadCSV, getStatusBadgeClass } from '../lib/utils';
import type { Lead, LeadStatus, WhatsAppTemplate } from '../lib/database.types';

const LEADS_PER_PAGE = 10;

export default function Leads() {
    const { profile } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);

    // WhatsApp Modal State
    const [whatsappModal, setWhatsappModal] = useState<{ open: boolean; lead: Lead | null }>({ open: false, lead: null });
    const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
    const [customMessage, setCustomMessage] = useState('');

    useEffect(() => {
        loadLeads();
    }, [profile, currentPage, statusFilter]);

    async function loadLeads() {
        if (!profile) return;
        setLoading(true);

        const { data, count, error } = await getLeads(profile.id, {
            status: statusFilter !== 'all' ? statusFilter : undefined,
            limit: LEADS_PER_PAGE,
            offset: (currentPage - 1) * LEADS_PER_PAGE,
        });

        if (!error && data) {
            setLeads(data);
            setTotalCount(count || 0);
        }
        setLoading(false);
    }

    // WhatsApp helper functions
    const openWhatsAppModal = async (lead: Lead) => {
        if (!profile) return;
        // Load templates
        const { data } = await getWhatsAppTemplates(profile.id);
        setWhatsappTemplates(data || []);
        // Set default template if available
        const defaultTemplate = data?.find(t => t.is_default) || data?.[0];
        setSelectedTemplate(defaultTemplate || null);
        setCustomMessage(defaultTemplate?.message || '');
        setWhatsappModal({ open: true, lead });
    };

    const replaceTemplateVariables = (message: string, lead: Lead) => {
        return message
            .replace(/{{business_name}}/g, lead.business_name || '')
            .replace(/{{city}}/g, lead.city || '')
            .replace(/{{business_type}}/g, lead.business_type || '')
            .replace(/{{owner_name}}/g, lead.owner_name || '')
            .replace(/{{state}}/g, lead.state || '');
    };

    const handleSendWhatsApp = () => {
        if (!whatsappModal.lead) return;
        const lead = whatsappModal.lead;
        const phone = lead.whatsapp_number || lead.phone;
        if (!phone) return;

        const cleanPhone = phone.replace(/\D/g, '');
        const message = replaceTemplateVariables(customMessage, lead);
        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

        window.open(url, '_blank');
        setWhatsappModal({ open: false, lead: null });
    };

    const filteredLeads = leads.filter((lead) =>
        lead.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.business_type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(totalCount / LEADS_PER_PAGE);

    const handleSelectAll = () => {
        if (selectedLeads.size === filteredLeads.length) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(filteredLeads.map((l) => l.id)));
        }
    };

    const handleSelectLead = (id: string) => {
        const newSelected = new Set(selectedLeads);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedLeads(newSelected);
    };

    const handleDeleteLead = async (id: string) => {
        const { error } = await deleteLead(id);
        if (!error) {
            setLeads((prev) => prev.filter((l) => l.id !== id));
            setTotalCount((prev) => prev - 1);
        }
        setActionMenuId(null);
    };

    const handleUpdateStatus = async (id: string, status: LeadStatus) => {
        const { error } = await updateLead(id, { status });
        if (!error) {
            setLeads((prev) =>
                prev.map((l) => (l.id === id ? { ...l, status } : l))
            );
        }
        setActionMenuId(null);
    };

    const handleExportCSV = () => {
        const exportData = (selectedLeads.size > 0
            ? leads.filter((l) => selectedLeads.has(l.id))
            : filteredLeads
        ).map((l) => ({
            Business_Name: l.business_name,
            Type: l.business_type || '',
            Subcategory: l.business_subcategory || '',
            Email: l.email || '',
            Phone: l.phone || '',
            WhatsApp: l.whatsapp_number || '',
            Alternate_Phone: l.alternate_phone || '',
            Address: l.address || '',
            City: l.city || '',
            State: l.state || '',
            Website: l.website_url || '',
            Website_Score: l.website_score,
            Google_Rating: l.google_rating || '',
            Review_Count: l.review_count || 0,
            Facebook: l.facebook_url || '',
            Instagram: l.instagram_url || '',
            LinkedIn: l.linkedin_url || '',
            Google_Maps: l.google_maps_url || '',
            Status: l.status,
        }));
        downloadCSV(exportData, `leads-export`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Leads</h1>
                    <p className="text-dark-400">{totalCount} total leads in your database</p>
                </div>
                <Link to="/search" className="btn-primary">
                    <Search className="w-4 h-4" />
                    Search New Leads
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="card p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, city, or type..."
                        className="input pl-12"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="select w-auto"
                    >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="responded">Responded</option>
                        <option value="converted">Converted</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    {profile?.subscription_tier !== 'free_trial' && (
                        <button onClick={handleExportCSV} className="btn-secondary btn-sm">
                            <Download className="w-4 h-4" />
                            <span className="hidden md:inline">Export</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Selected Actions */}
            {selectedLeads.size > 0 && (
                <div className="card p-4 flex items-center gap-4 border-primary-500/30">
                    <span className="text-white">{selectedLeads.size} selected</span>
                    <Link
                        to={`/campaigns?leads=${Array.from(selectedLeads).join(',')}`}
                        className="btn-accent btn-sm"
                    >
                        <Mail className="w-4 h-4" />
                        Create Campaign
                    </Link>
                    <button
                        onClick={() => setSelectedLeads(new Set())}
                        className="btn-ghost btn-sm"
                    >
                        Clear
                    </button>
                </div>
            )}

            {/* Leads Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="spinner text-primary-400 mx-auto mb-4" />
                        <p className="text-dark-400">Loading leads...</p>
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No leads found</h3>
                        <p className="text-dark-400 mb-6">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try changing your filters'
                                : 'Start searching to find potential clients'}
                        </p>
                        <Link to="/search" className="btn-primary">
                            Search Leads
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                                        />
                                    </th>
                                    <th>Business</th>
                                    <th>Contact</th>
                                    <th>Location</th>
                                    <th>Website</th>
                                    <th>Status</th>
                                    <th>Added</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map((lead) => (
                                    <tr key={lead.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedLeads.has(lead.id)}
                                                onChange={() => handleSelectLead(lead.id)}
                                                className="w-4 h-4 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                                            />
                                        </td>
                                        <td>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-white font-medium">{lead.business_name}</p>
                                                    {lead.google_rating && lead.google_rating > 0 && (
                                                        <span className="flex items-center gap-0.5 text-yellow-400 text-xs">
                                                            <Star className="w-3 h-3 fill-current" />
                                                            {lead.google_rating.toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-dark-500 text-sm">{lead.business_subcategory || lead.business_type}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                {lead.phone && (
                                                    <a href={`tel:${lead.phone}`} className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-green-400" title={lead.phone}>
                                                        <Phone className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {(lead.whatsapp_number || lead.phone) && (
                                                    <button
                                                        onClick={() => openWhatsAppModal(lead)}
                                                        className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-green-500"
                                                        title="Send WhatsApp Message"
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {lead.email && (
                                                    <a href={`mailto:${lead.email}`} className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-primary-400" title={lead.email}>
                                                        <Mail className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {lead.facebook_url && (
                                                    <a href={lead.facebook_url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-blue-500" title="Facebook">
                                                        <Facebook className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {lead.instagram_url && (
                                                    <a href={lead.instagram_url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-pink-500" title="Instagram">
                                                        <Instagram className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {lead.linkedin_url && (
                                                    <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-blue-400" title="LinkedIn">
                                                        <Linkedin className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {lead.google_maps_url && (
                                                    <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-red-400" title="Google Maps">
                                                        <MapPin className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {!lead.phone && !lead.email && !lead.whatsapp_number && (
                                                    <span className="text-dark-500 text-xs">No contact</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <p className="text-dark-300">{lead.city}</p>
                                            <p className="text-dark-500 text-sm">{lead.state}</p>
                                        </td>
                                        <td>
                                            {lead.website_url ? (
                                                <a
                                                    href={lead.website_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary-400 hover:underline flex items-center gap-1"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    View
                                                </a>
                                            ) : (
                                                <span className="badge-danger">No Website</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={getStatusBadgeClass(lead.status)}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="text-dark-400 text-sm">
                                            {formatRelativeTime(lead.created_at)}
                                        </td>
                                        <td>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActionMenuId(actionMenuId === lead.id ? null : lead.id)}
                                                    className="p-2 hover:bg-dark-700 rounded-lg"
                                                >
                                                    <MoreHorizontal className="w-4 h-4 text-dark-400" />
                                                </button>
                                                {actionMenuId === lead.id && (
                                                    <div className="absolute right-0 mt-1 w-48 glass-card p-2 z-10 animate-slide-down">
                                                        <button
                                                            onClick={() => handleUpdateStatus(lead.id, 'contacted')}
                                                            className="w-full px-3 py-2 text-left text-sm text-dark-300 hover:bg-dark-700 rounded-lg"
                                                        >
                                                            Mark as Contacted
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(lead.id, 'responded')}
                                                            className="w-full px-3 py-2 text-left text-sm text-dark-300 hover:bg-dark-700 rounded-lg"
                                                        >
                                                            Mark as Responded
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(lead.id, 'converted')}
                                                            className="w-full px-3 py-2 text-left text-sm text-dark-300 hover:bg-dark-700 rounded-lg"
                                                        >
                                                            Mark as Converted
                                                        </button>
                                                        <hr className="my-2 border-dark-700" />
                                                        <button
                                                            onClick={() => handleDeleteLead(lead.id)}
                                                            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
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
                            Showing {(currentPage - 1) * LEADS_PER_PAGE + 1} to{' '}
                            {Math.min(currentPage * LEADS_PER_PAGE, totalCount)} of {totalCount}
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

            {/* WhatsApp Message Modal */}
            {whatsappModal.open && whatsappModal.lead && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setWhatsappModal({ open: false, lead: null })}>
                    <div className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-green-500" />
                                Send WhatsApp Message
                            </h2>
                            <button onClick={() => setWhatsappModal({ open: false, lead: null })} className="p-1 hover:bg-dark-700 rounded">
                                <X className="w-5 h-5 text-dark-400" />
                            </button>
                        </div>

                        {/* Lead Info */}
                        <div className="bg-dark-800/50 rounded-lg p-3 mb-4">
                            <p className="text-white font-medium">{whatsappModal.lead.business_name}</p>
                            <p className="text-dark-400 text-sm">{whatsappModal.lead.whatsapp_number || whatsappModal.lead.phone}</p>
                        </div>

                        {/* Template Selection */}
                        {whatsappTemplates.length > 0 ? (
                            <div className="mb-4">
                                <label className="label">Select Template</label>
                                <select
                                    value={selectedTemplate?.id || ''}
                                    onChange={(e) => {
                                        const template = whatsappTemplates.find(t => t.id === e.target.value);
                                        setSelectedTemplate(template || null);
                                        setCustomMessage(template?.message || '');
                                    }}
                                    className="select"
                                >
                                    <option value="">-- Custom Message --</option>
                                    {whatsappTemplates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="mb-4 p-3 bg-dark-800/50 rounded-lg">
                                <p className="text-dark-400 text-sm">
                                    No templates yet.{' '}
                                    <Link to="/whatsapp-templates" className="text-green-400 hover:underline">
                                        Create templates
                                    </Link>{' '}
                                    for quick messaging.
                                </p>
                            </div>
                        )}

                        {/* Message Editor */}
                        <div className="mb-4">
                            <label className="label">Message</label>
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                className="input min-h-[120px]"
                                placeholder="Type your message..."
                            />
                        </div>

                        {/* Preview */}
                        <div className="bg-dark-800/50 rounded-lg p-4 mb-4">
                            <p className="text-dark-400 text-sm mb-2">Preview:</p>
                            <p className="text-white whitespace-pre-wrap text-sm">
                                {replaceTemplateVariables(customMessage, whatsappModal.lead) || 'Your message will appear here...'}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleSendWhatsApp}
                                disabled={!customMessage.trim()}
                                className="btn-primary bg-green-600 hover:bg-green-700 flex-1"
                            >
                                <Send className="w-4 h-4" />
                                Open in WhatsApp
                            </button>
                            <button onClick={() => setWhatsappModal({ open: false, lead: null })} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
