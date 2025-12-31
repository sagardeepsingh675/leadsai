import { useEffect, useState } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Setting {
    id: string;
    key: string;
    value: string | null;
    type: string;
    description: string | null;
    is_public: boolean;
}

export default function SiteSettings() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [editedValues, setEditedValues] = useState<Record<string, string>>({});

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        const { data } = await supabase
            .from('site_settings')
            .select('*')
            .order('key');

        if (data) {
            setSettings(data);
            const values: Record<string, string> = {};
            data.forEach((s) => {
                values[s.key] = s.value || '';
            });
            setEditedValues(values);
        }
        setLoading(false);
    }

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);

        for (const setting of settings) {
            if (editedValues[setting.key] !== setting.value) {
                await supabase
                    .from('site_settings')
                    .update({ value: editedValues[setting.key] })
                    .eq('key', setting.key);
            }
        }

        await loadSettings();
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const renderInput = (setting: Setting) => {
        const value = editedValues[setting.key] || '';

        if (setting.type === 'boolean') {
            return (
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={value === 'true'}
                        onChange={(e) => setEditedValues({ ...editedValues, [setting.key]: e.target.checked ? 'true' : 'false' })}
                        className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-dark-300">{value === 'true' ? 'Enabled' : 'Disabled'}</span>
                </label>
            );
        }

        if (setting.type === 'number') {
            return (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => setEditedValues({ ...editedValues, [setting.key]: e.target.value })}
                    className="input"
                />
            );
        }

        return (
            <input
                type="text"
                value={value}
                onChange={(e) => setEditedValues({ ...editedValues, [setting.key]: e.target.value })}
                className="input"
            />
        );
    };

    const formatKey = (key: string) => {
        return key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="spinner text-primary-400 mx-auto mb-4" />
                    <p className="text-dark-400">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Site Settings</h1>
                    <p className="text-dark-400">Configure global platform settings</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved ? (
                        <CheckCircle className="w-4 h-4" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Settings Groups */}
            <div className="space-y-6">
                {/* Branding */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Branding</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {settings
                            .filter((s) => ['site_name', 'site_tagline', 'site_logo', 'site_favicon'].includes(s.key))
                            .map((setting) => (
                                <div key={setting.key}>
                                    <label className="label">{formatKey(setting.key)}</label>
                                    {renderInput(setting)}
                                    {setting.description && (
                                        <p className="text-dark-500 text-xs mt-1">{setting.description}</p>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>

                {/* Contact */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Contact</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {settings
                            .filter((s) => s.key === 'contact_email')
                            .map((setting) => (
                                <div key={setting.key}>
                                    <label className="label">{formatKey(setting.key)}</label>
                                    {renderInput(setting)}
                                </div>
                            ))}
                    </div>
                </div>

                {/* Platform */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Platform Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {settings
                            .filter((s) => ['maintenance_mode', 'allow_registrations', 'default_trial_days', 'max_leads_per_search'].includes(s.key))
                            .map((setting) => (
                                <div key={setting.key}>
                                    <label className="label">{formatKey(setting.key)}</label>
                                    {renderInput(setting)}
                                    {setting.description && (
                                        <p className="text-dark-500 text-xs mt-1">{setting.description}</p>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>

                {/* Maintenance Warning */}
                {editedValues['maintenance_mode'] === 'true' && (
                    <div className="card p-4 border-yellow-500/30 bg-yellow-500/10 flex items-center gap-4">
                        <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                        <div>
                            <p className="text-white font-medium">Maintenance Mode Enabled</p>
                            <p className="text-dark-400 text-sm">
                                Users will see a maintenance message when trying to access the platform.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
