import { useState, useEffect } from 'react';
import {
    Key,
    Save,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Globe,
    Zap,
    Shield,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ApiSettings {
    google_maps_api_key: string;
    search_limit_per_day: number;
    results_per_search: number;
    enable_website_analysis: boolean;
}

export default function AdminApiSettings() {
    const [settings, setSettings] = useState<ApiSettings>({
        google_maps_api_key: '',
        search_limit_per_day: 100,
        results_per_search: 20,
        enable_website_analysis: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('site_settings')
                .select('*')
                .eq('key', 'api_settings')
                .single();

            if (data?.value) {
                setSettings(data.value as ApiSettings);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'api_settings',
                    value: settings,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Settings saved successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    const testApiKey = async () => {
        setTestStatus('testing');
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=test&key=${settings.google_maps_api_key}`
            );
            const data = await response.json();

            if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
                setTestStatus('success');
            } else {
                setTestStatus('error');
            }
        } catch {
            setTestStatus('error');
        }

        setTimeout(() => setTestStatus('idle'), 3000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">API Settings</h1>
                    <p className="text-dark-400">Configure external API integrations</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                >
                    {saving ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    Save Changes
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    {message.text}
                </div>
            )}

            {/* Google Maps API */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Google Maps API</h3>
                        <p className="text-dark-400 text-sm">Used for business search and geocoding</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="label">API Key</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    value={settings.google_maps_api_key}
                                    onChange={(e) => setSettings({ ...settings, google_maps_api_key: e.target.value })}
                                    className="input pr-12"
                                    placeholder="Enter your Google Maps API key"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                                >
                                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <button
                                onClick={testApiKey}
                                disabled={!settings.google_maps_api_key || testStatus === 'testing'}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${testStatus === 'success'
                                        ? 'bg-green-500/20 text-green-400'
                                        : testStatus === 'error'
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-dark-700 text-white hover:bg-dark-600'
                                    }`}
                            >
                                {testStatus === 'testing' ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : testStatus === 'success' ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : testStatus === 'error' ? (
                                    <AlertCircle className="w-5 h-5" />
                                ) : (
                                    'Test'
                                )}
                            </button>
                        </div>
                        <p className="text-dark-500 text-xs mt-1">
                            Get your API key from <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">Google Cloud Console</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Settings */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Search Settings</h3>
                        <p className="text-dark-400 text-sm">Configure search limits and behavior</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="label">Daily Search Limit (per user)</label>
                        <input
                            type="number"
                            value={settings.search_limit_per_day}
                            onChange={(e) => setSettings({ ...settings, search_limit_per_day: parseInt(e.target.value) || 0 })}
                            className="input"
                            min="1"
                            max="1000"
                        />
                    </div>
                    <div>
                        <label className="label">Results per Search</label>
                        <input
                            type="number"
                            value={settings.results_per_search}
                            onChange={(e) => setSettings({ ...settings, results_per_search: parseInt(e.target.value) || 0 })}
                            className="input"
                            min="5"
                            max="50"
                        />
                    </div>
                </div>
            </div>

            {/* Feature Toggles */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Feature Toggles</h3>
                        <p className="text-dark-400 text-sm">Enable or disable platform features</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl cursor-pointer">
                        <div>
                            <p className="text-white font-medium">Website Analysis</p>
                            <p className="text-dark-400 text-sm">Check SSL and website status for each lead</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.enable_website_analysis}
                            onChange={(e) => setSettings({ ...settings, enable_website_analysis: e.target.checked })}
                            className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
