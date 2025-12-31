import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    MapPin,
    Building2,
    Target,
    ArrowRight,
    Loader2,
    AlertCircle,
    Info,
    Check,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { searchLeads } from '../lib/supabase';
import { BUSINESS_TYPES, COUNTRIES, getStatesByCountry } from '../lib/utils';

// Extended filter options
const FILTER_OPTIONS = [
    { value: 'no_website', label: 'No Website', description: 'Businesses without any website' },
    { value: 'poor_website', label: 'Poor/Outdated Website', description: 'Old design, not updated' },
    { value: 'not_mobile', label: 'Not Mobile Friendly', description: 'Website not optimized for mobile' },
    { value: 'no_ssl', label: 'No SSL Certificate', description: 'Website not secure (no HTTPS)' },
    { value: 'slow_loading', label: 'Slow Loading Website', description: 'Takes too long to load' },
    { value: 'no_seo', label: 'Poor SEO', description: 'Not optimized for search engines' },
    { value: 'no_social', label: 'No Social Media', description: 'No Facebook/Instagram presence' },
    { value: 'low_reviews', label: 'Low Google Reviews', description: 'Less than 10 reviews' },
    { value: 'no_gmb', label: 'Unclaimed Google Business', description: 'Google listing not claimed' },
];

export default function LeadSearch() {
    const { profile } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        country: 'IN',
        state: '',
        city: '',
        businessType: '',
        clientNeeds: ['no_website'] as string[],
        radius: 10,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.businessType) {
            setError('Please select a business type');
            return;
        }

        if (!formData.state && !formData.city) {
            setError('Please enter a state or city');
            return;
        }

        setLoading(true);

        try {
            // Create search record in background, navigate immediately
            const { data, error: searchError } = await searchLeads(profile!.id, {
                country: formData.country,
                state: formData.state,
                city: formData.city,
                businessType: formData.businessType,
                radius: formData.radius,
            });

            if (searchError) throw searchError;

            // Navigate to results page with search ID
            if (data?.id) {
                navigate(`/search/${data.id}`);
            }
        } catch (err) {
            console.error('Search error:', err);
            // Navigate anyway with query params as fallback
            const params = new URLSearchParams({
                country: formData.country,
                state: formData.state || '',
                city: formData.city || '',
                type: formData.businessType,
            });
            navigate(`/search/demo?${params.toString()}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Search for Leads</h1>
                <p className="text-dark-400">
                    Find businesses in your target location that might need a website.
                </p>
            </div>

            {/* Info Banner */}
            <div className="card p-4 mb-8 flex items-start gap-4 border-primary-500/30 bg-primary-500/5">
                <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-dark-300 text-sm">
                        <strong className="text-white">How it works:</strong> We search OpenStreetMap for businesses
                        in your target area, then analyze their websites to find those who need your services.
                    </p>
                </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="card p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Country */}
                    <div>
                        <label className="label flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Country
                        </label>
                        <select
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value, state: '' })}
                            className="select"
                        >
                            {COUNTRIES.map((country) => (
                                <option key={country.value} value={country.value}>
                                    {country.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* State/Region */}
                    <div>
                        <label className="label flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            State / Region
                        </label>
                        {(() => {
                            const states = getStatesByCountry(formData.country);
                            if (states.length > 0) {
                                return (
                                    <select
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="select"
                                    >
                                        <option value="">Select state/region</option>
                                        {states.map((state) => (
                                            <option key={state} value={state}>
                                                {state}
                                            </option>
                                        ))}
                                    </select>
                                );
                            }
                            return (
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="input"
                                    placeholder="Enter state or region"
                                />
                            );
                        })()}
                    </div>

                    {/* City */}
                    <div>
                        <label className="label flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            City (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="input"
                            placeholder="Enter city name"
                        />
                        <p className="text-dark-500 text-xs mt-1">Leave empty to search entire state</p>
                    </div>

                    {/* Business Type */}
                    <div>
                        <label className="label flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Business Type *
                        </label>
                        <select
                            value={formData.businessType}
                            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                            className="select"
                            required
                        >
                            <option value="">Select business type</option>
                            {BUSINESS_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Client Needs - Multi-select */}
                    <div className="md:col-span-2">
                        <label className="label flex items-center gap-2 mb-3">
                            <Target className="w-4 h-4" />
                            What they need (select multiple)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {FILTER_OPTIONS.map((option) => {
                                const isSelected = formData.clientNeeds.includes(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            const newNeeds = isSelected
                                                ? formData.clientNeeds.filter(n => n !== option.value)
                                                : [...formData.clientNeeds, option.value];
                                            setFormData({ ...formData, clientNeeds: newNeeds });
                                        }}
                                        className={`p-3 rounded-lg border text-left transition-all ${isSelected
                                            ? 'bg-primary-500/20 border-primary-500 text-white'
                                            : 'bg-dark-800 border-dark-600 text-dark-300 hover:border-dark-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-primary-500 border-primary-500' : 'border-dark-500'
                                                }`}>
                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className="font-medium text-sm">{option.label}</span>
                                        </div>
                                        <p className="text-xs text-dark-500 mt-1 ml-6">{option.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Radius */}
                    <div>
                        <label className="label flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Search Radius
                        </label>
                        <select
                            value={formData.radius}
                            onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                            className="select"
                        >
                            <option value={5}>5 km</option>
                            <option value={10}>10 km</option>
                            <option value={25}>25 km</option>
                            <option value={50}>50 km</option>
                            <option value={100}>100 km</option>
                        </select>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary btn-lg w-full md:w-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Searching...
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                Search Leads
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Usage Info */}
            <div className="mt-8 text-center">
                <p className="text-dark-500 text-sm">
                    {profile?.subscription_tier === 'ultra_pro' ? (
                        'Unlimited searches available'
                    ) : (
                        `${Math.max(0, (profile?.subscription_tier === 'pro' ? 500 : profile?.subscription_tier === 'basic' ? 100 : 25) - (profile?.leads_used_this_month || 0))} leads remaining this month`
                    )}
                </p>
            </div>
        </div>
    );
}
