import { useState } from 'react';
import {
    Mail,
    Save,
    Eye,
    RefreshCw,
} from 'lucide-react';

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
}

const defaultTemplates: EmailTemplate[] = [
    {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to LeadsAI! 🎉',
        body: `<h2>Welcome to LeadsAI!</h2>
<p>Thank you for signing up. We're excited to have you on board!</p>
<p>Get started by searching for leads in your target market.</p>
<p>Best regards,<br>The LeadsAI Team</p>`,
    },
    {
        id: 'password_reset',
        name: 'Password Reset',
        subject: 'Reset Your Password',
        body: `<h2>Reset Your Password</h2>
<p>Click the button below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>`,
    },
    {
        id: 'verify_email',
        name: 'Email Verification',
        subject: 'Verify Your Email',
        body: `<h2>Verify Your Email</h2>
<p>Please verify your email address by clicking the button below:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email</a></p>`,
    },
];

export default function AdminEmails() {
    const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(defaultTemplates[0]);
    const [previewMode, setPreviewMode] = useState(false);

    const handleSave = () => {
        setTemplates(templates.map(t =>
            t.id === selectedTemplate.id ? selectedTemplate : t
        ));
        alert('Template saved! Note: To update Supabase email templates, go to Authentication → Email Templates in your Supabase dashboard.');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Mail className="w-7 h-7 text-primary-400" />
                    Email Templates
                </h1>
                <p className="text-dark-400 mt-1">Customize your email templates</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Template List */}
                <div className="card p-4 space-y-2">
                    <h3 className="text-white font-medium mb-3">Templates</h3>
                    {templates.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => setSelectedTemplate(template)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${selectedTemplate.id === template.id
                                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/50'
                                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                                }`}
                        >
                            {template.name}
                        </button>
                    ))}
                </div>

                {/* Editor */}
                <div className="lg:col-span-3 card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">{selectedTemplate.name}</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPreviewMode(!previewMode)}
                                className={`btn-secondary flex items-center gap-2 ${previewMode ? 'bg-primary-500/20' : ''}`}
                            >
                                <Eye className="w-4 h-4" />
                                {previewMode ? 'Edit' : 'Preview'}
                            </button>
                            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="label">Subject</label>
                        <input
                            type="text"
                            value={selectedTemplate.subject}
                            onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                            className="input"
                            disabled={previewMode}
                        />
                    </div>

                    {/* Body */}
                    <div>
                        <label className="label">Body (HTML)</label>
                        {previewMode ? (
                            <div
                                className="bg-white text-gray-900 p-6 rounded-xl min-h-[300px]"
                                dangerouslySetInnerHTML={{ __html: selectedTemplate.body }}
                            />
                        ) : (
                            <textarea
                                value={selectedTemplate.body}
                                onChange={(e) => setSelectedTemplate({ ...selectedTemplate, body: e.target.value })}
                                className="input min-h-[300px] font-mono text-sm"
                            />
                        )}
                    </div>

                    <div className="p-4 bg-dark-800 rounded-lg">
                        <p className="text-dark-400 text-sm flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            To apply these templates, copy the HTML and paste it in your Supabase Dashboard → Authentication → Email Templates
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
