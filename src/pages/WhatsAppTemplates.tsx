import { useEffect, useState } from 'react';
import {
    MessageCircle,
    Plus,
    Trash2,
    Edit3,
    X,
    Save,
    Loader2,
    Eye,
    Copy,
    CheckCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
    getWhatsAppTemplates,
    createWhatsAppTemplate,
    updateWhatsAppTemplate,
    deleteWhatsAppTemplate,
} from '../lib/supabase';
import type { WhatsAppTemplate } from '../lib/database.types';

const TEMPLATE_VARIABLES = [
    { label: 'Business Name', value: '{{business_name}}' },
    { label: 'City', value: '{{city}}' },
    { label: 'Business Type', value: '{{business_type}}' },
    { label: 'Owner Name', value: '{{owner_name}}' },
    { label: 'State', value: '{{state}}' },
];

export default function WhatsAppTemplates() {
    const { profile } = useAuth();
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
    const [saving, setSaving] = useState(false);
    const [previewLead] = useState({
        business_name: 'Acme Corp',
        city: 'Mumbai',
        business_type: 'Restaurant',
        owner_name: 'John',
        state: 'Maharashtra',
    });
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        message: '',
        is_default: false,
    });

    useEffect(() => {
        if (profile) loadTemplates();
    }, [profile]);

    async function loadTemplates() {
        if (!profile) return;
        const { data } = await getWhatsAppTemplates(profile.id);
        if (data) setTemplates(data);
        setLoading(false);
    }

    const replaceVariables = (message: string, lead: typeof previewLead) => {
        return message
            .replace(/{{business_name}}/g, lead.business_name || '')
            .replace(/{{city}}/g, lead.city || '')
            .replace(/{{business_type}}/g, lead.business_type || '')
            .replace(/{{owner_name}}/g, lead.owner_name || '')
            .replace(/{{state}}/g, lead.state || '');
    };

    const handleOpenModal = (template?: WhatsAppTemplate) => {
        if (template) {
            setEditingTemplate(template);
            setFormData({
                name: template.name,
                message: template.message,
                is_default: template.is_default,
            });
        } else {
            setEditingTemplate(null);
            setFormData({ name: '', message: '', is_default: false });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!profile || !formData.name || !formData.message) return;
        setSaving(true);

        if (editingTemplate) {
            const { error } = await updateWhatsAppTemplate(editingTemplate.id, formData);
            if (!error) await loadTemplates();
        } else {
            const { error } = await createWhatsAppTemplate({
                user_id: profile.id,
                ...formData,
            });
            if (!error) await loadTemplates();
        }

        setSaving(false);
        setShowModal(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        const { error } = await deleteWhatsAppTemplate(id);
        if (!error) {
            setTemplates((prev) => prev.filter((t) => t.id !== id));
        }
    };

    const handleInsertVariable = (variable: string) => {
        setFormData({
            ...formData,
            message: formData.message + variable,
        });
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <MessageCircle className="w-7 h-7 text-green-500" />
                        WhatsApp Templates
                    </h1>
                    <p className="text-dark-400">Create message templates for quick outreach</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4" />
                    New Template
                </button>
            </div>

            {/* Info Box */}
            <div className="card p-4 border-green-500/30 bg-green-500/5">
                <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-white font-medium">How it works</p>
                        <p className="text-dark-400 text-sm">
                            Create templates with variables like <code className="bg-dark-700 px-1 rounded">{'{{business_name}}'}</code>.
                            When you message a lead, these will be replaced with actual data.
                        </p>
                    </div>
                </div>
            </div>

            {/* Templates List */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="spinner text-green-400 mx-auto mb-4" />
                        <p className="text-dark-400">Loading templates...</p>
                    </div>
                ) : templates.length === 0 ? (
                    <div className="p-12 text-center">
                        <MessageCircle className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No templates yet</h3>
                        <p className="text-dark-400 mb-6">Create your first WhatsApp message template</p>
                        <button onClick={() => handleOpenModal()} className="btn-primary bg-green-600 hover:bg-green-700">
                            <Plus className="w-4 h-4" />
                            Create Template
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {templates.map((template) => (
                            <div key={template.id} className="p-6 hover:bg-dark-800/50">
                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                                            {template.is_default && (
                                                <span className="badge bg-green-500/20 text-green-400 border border-green-500/30">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-dark-300 text-sm whitespace-pre-wrap mb-3">
                                            {template.message}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-dark-500" />
                                            <span className="text-dark-500 text-sm">Preview:</span>
                                            <span className="text-dark-300 text-sm">
                                                {replaceVariables(template.message, previewLead).substring(0, 100)}...
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => copyToClipboard(template.message, template.id)}
                                            className="btn-ghost btn-sm"
                                            title="Copy message"
                                        >
                                            {copiedId === template.id ? (
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(template)}
                                            className="btn-ghost btn-sm"
                                            title="Edit"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template.id)}
                                            className="btn-ghost btn-sm text-red-400 hover:bg-red-500/10"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingTemplate ? 'Edit Template' : 'New Template'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-dark-700 rounded">
                                <X className="w-5 h-5 text-dark-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Template Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    placeholder="e.g., Website Pitch"
                                />
                            </div>

                            <div>
                                <label className="label">Available Variables</label>
                                <div className="flex flex-wrap gap-2">
                                    {TEMPLATE_VARIABLES.map((v) => (
                                        <button
                                            key={v.value}
                                            type="button"
                                            onClick={() => handleInsertVariable(v.value)}
                                            className="px-2 py-1 bg-dark-700 hover:bg-dark-600 text-dark-300 rounded text-sm"
                                        >
                                            {v.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label">Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="input min-h-[150px]"
                                    placeholder="Hi {{business_name}}, I noticed your business in {{city}}..."
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_default"
                                    checked={formData.is_default}
                                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                    className="w-4 h-4 rounded bg-dark-700 border-dark-600 text-green-500 focus:ring-green-500"
                                />
                                <label htmlFor="is_default" className="text-dark-300">Set as default template</label>
                            </div>

                            {/* Preview */}
                            <div className="bg-dark-800/50 rounded-xl p-4">
                                <p className="text-dark-400 text-sm mb-2 flex items-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    Live Preview
                                </p>
                                <p className="text-white whitespace-pre-wrap">
                                    {replaceVariables(formData.message, previewLead) || 'Your message preview will appear here...'}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !formData.name || !formData.message}
                                    className="btn-primary bg-green-600 hover:bg-green-700 flex-1"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingTemplate ? 'Update Template' : 'Create Template'}
                                </button>
                                <button onClick={() => setShowModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
