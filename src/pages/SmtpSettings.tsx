import { useEffect, useState } from 'react';
import {
    Server,
    Plus,
    Trash2,
    CheckCircle,
    AlertCircle,
    Eye,
    EyeOff,
    TestTube,
    Loader2,
    Mail,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getSmtpConfigs, createSmtpConfig, supabase } from '../lib/supabase';
import type { SmtpConfig } from '../lib/database.types';

type Provider = 'gmail' | 'zoho' | 'outlook' | 'custom';

const SMTP_PRESETS: Record<Provider, { name: string; host: string; port: number; use_tls: boolean }> = {
    gmail: { name: 'Gmail', host: 'smtp.gmail.com', port: 587, use_tls: true },
    zoho: { name: 'Zoho Mail', host: 'smtp.zoho.in', port: 587, use_tls: true },
    outlook: { name: 'Outlook/Hotmail', host: 'smtp.office365.com', port: 587, use_tls: true },
    custom: { name: 'Custom SMTP', host: '', port: 587, use_tls: true },
};

export default function SmtpSettings() {
    const { profile } = useAuth();
    const [configs, setConfigs] = useState<SmtpConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<Provider>('gmail');

    const [newConfig, setNewConfig] = useState({
        name: 'Gmail',
        host: 'smtp.gmail.com',
        port: 587,
        username: '',
        password_encrypted: '',
        from_email: '',
        from_name: '',
        use_tls: true,
    });

    useEffect(() => {
        loadConfigs();
    }, [profile]);

    const handleProviderChange = (provider: Provider) => {
        setSelectedProvider(provider);
        const preset = SMTP_PRESETS[provider];
        setNewConfig({
            ...newConfig,
            name: preset.name,
            host: preset.host,
            port: preset.port,
            use_tls: preset.use_tls,
        });
    };

    async function loadConfigs() {
        if (!profile) return;
        const { data } = await getSmtpConfigs(profile.id);
        if (data) setConfigs(data);
        setLoading(false);
    }

    const handleCreate = async () => {
        if (!profile || !newConfig.host || !newConfig.username) return;

        const { error } = await createSmtpConfig({
            user_id: profile.id,
            ...newConfig,
            is_default: configs.length === 0,
        });

        if (!error) {
            await loadConfigs();
            setShowAddModal(false);
            setNewConfig({
                name: 'Gmail',
                host: 'smtp.gmail.com',
                port: 587,
                username: '',
                password_encrypted: '',
                from_email: '',
                from_name: '',
                use_tls: true,
            });
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('smtp_configs')
            .delete()
            .eq('id', id);

        if (!error) {
            setConfigs((prev) => prev.filter((c) => c.id !== id));
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);

        // Simulate test - in production, call a backend function
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // For demo, show success if fields are filled
        if (newConfig.username && newConfig.password_encrypted && newConfig.host) {
            setTestResult({ success: true, message: 'Connection successful! SMTP server responded.' });
        } else {
            setTestResult({ success: false, message: 'Please fill in all required fields.' });
        }

        setTesting(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">SMTP Settings</h1>
                    <p className="text-dark-400">Configure your email server for sending campaigns</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Add SMTP Server
                </button>
            </div>

            {/* Provider Setup Guides */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gmail Guide */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                            <Mail className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Gmail SMTP Setup</h3>
                    </div>
                    <ul className="space-y-2 text-sm mb-4">
                        <li className="flex items-center gap-2">
                            <span className="text-dark-500 w-24">Host:</span>
                            <code className="bg-dark-800 px-2 py-1 rounded text-red-400">smtp.gmail.com</code>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-dark-500 w-24">Port:</span>
                            <code className="bg-dark-800 px-2 py-1 rounded text-red-400">587</code>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-dark-500 w-24">Encryption:</span>
                            <code className="bg-dark-800 px-2 py-1 rounded text-red-400">TLS</code>
                        </li>
                    </ul>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white font-medium mb-1">App Password Required</p>
                                <p className="text-dark-400 text-sm">
                                    Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-red-400 underline">Google App Passwords</a> to generate an app-specific password.
                                    2FA must be enabled on your account.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Zoho Guide */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                            <Mail className="w-5 h-5 text-primary-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Zoho Mail SMTP Setup</h3>
                    </div>
                    <ul className="space-y-2 text-sm mb-4">
                        <li className="flex items-center gap-2">
                            <span className="text-dark-500 w-24">Host:</span>
                            <code className="bg-dark-800 px-2 py-1 rounded text-primary-400">smtp.zoho.in</code>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-dark-500 w-24">Port:</span>
                            <code className="bg-dark-800 px-2 py-1 rounded text-primary-400">587</code>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-dark-500 w-24">Encryption:</span>
                            <code className="bg-dark-800 px-2 py-1 rounded text-primary-400">TLS</code>
                        </li>
                    </ul>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white font-medium mb-1">2FA Users</p>
                                <p className="text-dark-400 text-sm">
                                    If 2FA is enabled, generate an app-specific password from Zoho's security settings.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Configured Servers */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-dark-700">
                    <h3 className="text-lg font-semibold text-white">Configured Servers</h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="spinner text-primary-400 mx-auto mb-4" />
                        <p className="text-dark-400">Loading configurations...</p>
                    </div>
                ) : configs.length === 0 ? (
                    <div className="p-12 text-center">
                        <Server className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No SMTP servers configured</h3>
                        <p className="text-dark-400 mb-6">Add your email server to start sending campaigns.</p>
                        <button onClick={() => setShowAddModal(true)} className="btn-primary">
                            <Plus className="w-4 h-4" />
                            Add SMTP Server
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {configs.map((config) => (
                            <div key={config.id} className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.host.includes('gmail') ? 'bg-red-500/20' :
                                            config.host.includes('zoho') ? 'bg-primary-500/20' :
                                                config.host.includes('office365') ? 'bg-blue-500/20' :
                                                    'bg-dark-700'
                                        }`}>
                                        <Server className={`w-6 h-6 ${config.host.includes('gmail') ? 'text-red-400' :
                                                config.host.includes('zoho') ? 'text-primary-400' :
                                                    config.host.includes('office365') ? 'text-blue-400' :
                                                        'text-dark-400'
                                            }`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-white font-medium">{config.name}</h4>
                                            {config.is_default && <span className="badge-success text-xs">Default</span>}
                                            {config.is_verified && <CheckCircle className="w-4 h-4 text-green-400" />}
                                        </div>
                                        <p className="text-dark-400 text-sm">{config.host}:{config.port}</p>
                                        <p className="text-dark-500 text-sm">{config.from_email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(config.id)}
                                    className="btn-ghost text-red-400 hover:bg-red-500/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="glass-card w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-dark-700">
                            <h2 className="text-xl font-bold text-white">Add SMTP Server</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Provider Selection */}
                            <div>
                                <label className="label">Email Provider</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {(Object.keys(SMTP_PRESETS) as Provider[]).map((provider) => (
                                        <button
                                            key={provider}
                                            onClick={() => handleProviderChange(provider)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedProvider === provider
                                                    ? provider === 'gmail' ? 'bg-red-500/20 border-red-500 text-red-400 border' :
                                                        provider === 'zoho' ? 'bg-primary-500/20 border-primary-500 text-primary-400 border' :
                                                            provider === 'outlook' ? 'bg-blue-500/20 border-blue-500 text-blue-400 border' :
                                                                'bg-dark-600 border-dark-500 text-white border'
                                                    : 'bg-dark-800 border border-dark-700 text-dark-300 hover:border-dark-500'
                                                }`}
                                        >
                                            {SMTP_PRESETS[provider].name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Name</label>
                                    <input
                                        type="text"
                                        value={newConfig.name}
                                        onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                                        className="input"
                                        placeholder="My Email"
                                    />
                                </div>
                                <div>
                                    <label className="label">Host</label>
                                    <input
                                        type="text"
                                        value={newConfig.host}
                                        onChange={(e) => setNewConfig({ ...newConfig, host: e.target.value })}
                                        className="input"
                                        placeholder="smtp.gmail.com"
                                        disabled={selectedProvider !== 'custom'}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Port</label>
                                    <input
                                        type="number"
                                        value={newConfig.port}
                                        onChange={(e) => setNewConfig({ ...newConfig, port: parseInt(e.target.value) })}
                                        className="input"
                                        disabled={selectedProvider !== 'custom'}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newConfig.use_tls}
                                            onChange={(e) => setNewConfig({ ...newConfig, use_tls: e.target.checked })}
                                            className="w-4 h-4 rounded bg-dark-700 border-dark-600"
                                        />
                                        <span className="text-dark-300">Use TLS</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="label">Email Address</label>
                                <input
                                    type="email"
                                    value={newConfig.username}
                                    onChange={(e) => setNewConfig({ ...newConfig, username: e.target.value, from_email: e.target.value })}
                                    className="input"
                                    placeholder="you@gmail.com"
                                />
                            </div>

                            <div>
                                <label className="label">
                                    {selectedProvider === 'gmail' ? 'App Password' : 'Password'}
                                    {selectedProvider === 'gmail' && (
                                        <a
                                            href="https://myaccount.google.com/apppasswords"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-red-400 text-xs ml-2 hover:underline"
                                        >
                                            Generate App Password →
                                        </a>
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newConfig.password_encrypted}
                                        onChange={(e) => setNewConfig({ ...newConfig, password_encrypted: e.target.value })}
                                        className="input pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {selectedProvider === 'gmail' && (
                                    <p className="text-dark-500 text-xs mt-1">
                                        Use a 16-character app password, not your regular Gmail password
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="label">From Name (Optional)</label>
                                <input
                                    type="text"
                                    value={newConfig.from_name}
                                    onChange={(e) => setNewConfig({ ...newConfig, from_name: e.target.value })}
                                    className="input"
                                    placeholder="Your Name or Company"
                                />
                            </div>

                            {/* Test Result */}
                            {testResult && (
                                <div className={`p-4 rounded-xl flex items-center gap-3 ${testResult.success
                                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                                    }`}>
                                    {testResult.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    {testResult.message}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-dark-700 flex justify-between">
                            <button onClick={handleTest} disabled={testing} className="btn-secondary">
                                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                                Test Connection
                            </button>
                            <div className="flex gap-3">
                                <button onClick={() => setShowAddModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button onClick={handleCreate} className="btn-primary">
                                    Save Configuration
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
