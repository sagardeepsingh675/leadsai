import { useEffect, useState } from 'react';
import {
    FileText,
    Plus,
    Trash2,
    Copy,
    Eye,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getEmailTemplates, createEmailTemplate } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import type { EmailTemplate } from '../lib/database.types';

export default function EmailTemplates() {
    const { profile } = useAuth();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

    const [newTemplate, setNewTemplate] = useState({
        name: '',
        subject: '',
        body_html: '',
    });

    useEffect(() => {
        loadTemplates();
    }, [profile]);

    async function loadTemplates() {
        if (!profile) return;
        const { data } = await getEmailTemplates(profile.id);
        if (data) setTemplates(data);
        setLoading(false);
    }

    const handleCreate = async () => {
        if (!profile || !newTemplate.name || !newTemplate.subject) return;

        const { error } = await createEmailTemplate({
            user_id: profile.id,
            name: newTemplate.name,
            subject: newTemplate.subject,
            body_html: newTemplate.body_html || '<p>Hello {{business_name}},</p><p>Your message here...</p>',
        });

        if (!error) {
            await loadTemplates();
            setShowCreateModal(false);
            setNewTemplate({ name: '', subject: '', body_html: '' });
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('email_templates')
            .delete()
            .eq('id', id);

        if (!error) {
            setTemplates((prev) => prev.filter((t) => t.id !== id));
        }
    };

    const handleDuplicate = async (template: EmailTemplate) => {
        if (!profile) return;

        const { error } = await createEmailTemplate({
            user_id: profile.id,
            name: `${template.name} (Copy)`,
            subject: template.subject,
            body_html: template.body_html,
        });

        if (!error) {
            await loadTemplates();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Email Templates</h1>
                    <p className="text-dark-400">Create reusable templates for your campaigns</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                    <Plus className="w-4 h-4" />
                    New Template
                </button>
            </div>

            {/* Available Variables */}
            <div className="card p-4">
                <p className="text-dark-300 text-sm">
                    <strong className="text-white">Available variables:</strong>{' '}
                    <code className="bg-dark-800 px-2 py-1 rounded text-primary-400">{'{{business_name}}'}</code>{' '}
                    <code className="bg-dark-800 px-2 py-1 rounded text-primary-400">{'{{owner_name}}'}</code>{' '}
                    <code className="bg-dark-800 px-2 py-1 rounded text-primary-400">{'{{email}}'}</code>{' '}
                    <code className="bg-dark-800 px-2 py-1 rounded text-primary-400">{'{{website_url}}'}</code>{' '}
                    <code className="bg-dark-800 px-2 py-1 rounded text-primary-400">{'{{city}}'}</code>
                </p>
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-6">
                            <div className="skeleton h-6 w-1/2 mb-4 rounded" />
                            <div className="skeleton h-4 w-3/4 mb-2 rounded" />
                            <div className="skeleton h-20 w-full mb-4 rounded" />
                        </div>
                    ))}
                </div>
            ) : templates.length === 0 ? (
                <div className="card p-12 text-center">
                    <FileText className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No templates yet</h3>
                    <p className="text-dark-400 mb-6">Create your first email template to start sending campaigns.</p>
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                        <Plus className="w-4 h-4" />
                        Create Template
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div key={template.id} className="card p-6 group">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                                    {template.is_default && (
                                        <span className="badge-primary text-xs">Default</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setPreviewTemplate(template)}
                                        className="p-2 hover:bg-dark-700 rounded-lg"
                                        title="Preview"
                                    >
                                        <Eye className="w-4 h-4 text-dark-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDuplicate(template)}
                                        className="p-2 hover:bg-dark-700 rounded-lg"
                                        title="Duplicate"
                                    >
                                        <Copy className="w-4 h-4 text-dark-400" />
                                    </button>
                                    {!template.is_default && template.user_id && (
                                        <button
                                            onClick={() => handleDelete(template.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <p className="text-dark-300 text-sm mb-3 font-medium">
                                Subject: {template.subject}
                            </p>

                            <div
                                className="text-dark-400 text-sm line-clamp-4 bg-dark-800/50 p-3 rounded-lg"
                                dangerouslySetInnerHTML={{ __html: template.body_html.slice(0, 200) }}
                            />

                            <div className="mt-4 pt-4 border-t border-dark-700 flex items-center justify-between text-sm text-dark-500">
                                <span>Used {template.use_count} times</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-dark-700">
                            <h2 className="text-xl font-bold text-white">Create New Template</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="label">Template Name</label>
                                <input
                                    type="text"
                                    value={newTemplate.name}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                    className="input"
                                    placeholder="e.g., Website Offer"
                                />
                            </div>
                            <div>
                                <label className="label">Email Subject</label>
                                <input
                                    type="text"
                                    value={newTemplate.subject}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                                    className="input"
                                    placeholder="e.g., Transform Your Business with a Modern Website"
                                />
                            </div>
                            <div>
                                <label className="label">Email Body (HTML)</label>
                                <textarea
                                    value={newTemplate.body_html}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, body_html: e.target.value })}
                                    className="input min-h-[200px] font-mono text-sm"
                                    placeholder="<p>Hello {{business_name}},</p><p>I noticed that...</p>"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-dark-700 flex justify-end gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleCreate} className="btn-primary">
                                Create Template
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewTemplate && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-dark-700 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{previewTemplate.name}</h2>
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="p-2 hover:bg-dark-700 rounded-lg"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-dark-400 text-sm">Subject:</p>
                                <p className="text-white">{previewTemplate.subject}</p>
                            </div>
                            <div className="bg-white text-dark-900 p-6 rounded-lg">
                                <div dangerouslySetInnerHTML={{ __html: previewTemplate.body_html }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
