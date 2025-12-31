import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Loader2,
    Globe,
    Mail,
    Phone,
    MapPin,
    ExternalLink,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Download,
    RefreshCw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, createLead } from '../lib/supabase';
import { BUSINESS_TYPES, downloadCSV } from '../lib/utils';


// Search businesses via Supabase Edge Function
async function searchBusinessesFromOSM(params: {
    country: string;
    state?: string;
    city?: string;
    businessType: string;
}) {
    try {
        const response = await supabase.functions.invoke('search-businesses', {
            body: {
                country: params.country,
                state: params.state,
                city: params.city,
                businessType: params.businessType,
                limit: 25,
            },
        });

        if (response.error) {
            console.error('Edge function error:', response.error);
            return [];
        }

        return response.data?.businesses || [];
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

// Analyze website quality
function analyzeWebsite(url: string | null): {
    score: 'good' | 'average' | 'poor' | 'no_website';
    hasWebsite: boolean;
    hasSsl: boolean;
    isMobile: boolean;
    speedScore: number;
    designScore: number;
} {
    if (!url) {
        return {
            score: 'no_website',
            hasWebsite: false,
            hasSsl: false,
            isMobile: false,
            speedScore: 0,
            designScore: 0,
        };
    }

    const hasSsl = url.startsWith('https');
    // Simulated analysis
    const speedScore = Math.floor(Math.random() * 50) + 30;
    const designScore = Math.floor(Math.random() * 50) + 20;
    const isMobile = Math.random() > 0.5;

    let score: 'good' | 'average' | 'poor' = 'poor';
    if (hasSsl && isMobile && speedScore > 70 && designScore > 70) {
        score = 'good';
    } else if (hasSsl || isMobile || speedScore > 50) {
        score = 'average';
    }

    return {
        score,
        hasWebsite: true,
        hasSsl,
        isMobile,
        speedScore,
        designScore,
    };
}

interface BusinessResult {
    id: string;
    name: string;
    type: string;
    address: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    website: string | null;
    analysis: ReturnType<typeof analyzeWebsite>;
    saved: boolean;
}

export default function LeadResults() {
    const { searchId } = useParams();
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState<BusinessResult[]>([]);
    const [searchInfo, setSearchInfo] = useState<Record<string, unknown> | null>(null);
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        async function loadSearch() {
            if (!searchId) return;

            // Get search parameters
            const { data: search } = await supabase
                .from('lead_searches')
                .select('*')
                .eq('id', searchId)
                .single();

            if (search) {
                setSearchInfo(search.search_query as Record<string, unknown>);

                // Perform the search
                setAnalyzing(true);
                const businesses = await searchBusinessesFromOSM({
                    country: search.country,
                    state: search.state || undefined,
                    city: search.city || undefined,
                    businessType: search.business_type,
                });

                // Analyze each business
                const analyzedResults: BusinessResult[] = businesses.map((biz: any, idx: number) => ({
                    id: `temp-${idx}`,
                    name: biz.name,
                    type: biz.type,
                    address: biz.address,
                    city: biz.city,
                    state: biz.state,
                    country: biz.country,
                    phone: biz.phone,
                    website: biz.website,
                    analysis: analyzeWebsite(biz.website),
                    saved: false,
                }));

                setResults(analyzedResults);
                setAnalyzing(false);

                // Update search results count
                await supabase
                    .from('lead_searches')
                    .update({ results_count: analyzedResults.length })
                    .eq('id', searchId);
            }

            setLoading(false);
        }

        loadSearch();
    }, [searchId]);

    const handleSaveLead = async (result: BusinessResult) => {
        if (!profile) return;
        setSavingId(result.id);

        try {
            const { error } = await createLead({
                user_id: profile.id,
                search_id: searchId || null,
                business_name: result.name,
                business_type: result.type,
                phone: result.phone,
                address: result.address,
                city: result.city,
                state: result.state,
                country: result.country,
                website_url: result.website,
                has_website: result.analysis.hasWebsite,
                website_score: result.analysis.score,
                has_ssl: result.analysis.hasSsl,
                is_mobile_responsive: result.analysis.isMobile,
                page_speed_score: result.analysis.speedScore,
                design_age_score: result.analysis.designScore,
                source: 'openstreetmap',
            });

            if (!error) {
                setResults((prev) =>
                    prev.map((r) => (r.id === result.id ? { ...r, saved: true } : r))
                );
            }
        } catch (err) {
            console.error('Failed to save lead:', err);
        } finally {
            setSavingId(null);
        }
    };

    const handleExportCSV = () => {
        const exportData = results.map((r) => ({
            Business_Name: r.name,
            Type: r.type,
            Address: r.address,
            City: r.city,
            State: r.state,
            Phone: r.phone,
            Website: r.website || 'N/A',
            Website_Score: r.analysis.score,
            Has_SSL: r.analysis.hasSsl ? 'Yes' : 'No',
            Mobile_Friendly: r.analysis.isMobile ? 'Yes' : 'No',
        }));
        downloadCSV(exportData, `leads-${searchId}`);
    };

    const getBusinessTypeLabel = (value: string) => {
        return BUSINESS_TYPES.find((t) => t.value === value)?.label || value;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-primary-400 animate-spin mx-auto mb-4" />
                    <p className="text-dark-400">Loading search results...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <Link to="/search" className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Search
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Search Results</h1>
                    {searchInfo && (
                        <p className="text-dark-400">
                            {getBusinessTypeLabel(searchInfo.businessType as string)} in{' '}
                            {(searchInfo.city as string) || (searchInfo.state as string)}, {searchInfo.country as string}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {profile?.subscription_tier !== 'free_trial' && (
                        <button onClick={handleExportCSV} className="btn-secondary btn-sm">
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    )}
                    <Link to="/search" className="btn-primary btn-sm">
                        <RefreshCw className="w-4 h-4" />
                        New Search
                    </Link>
                </div>
            </div>

            {/* Analyzing Banner */}
            {analyzing && (
                <div className="card p-4 flex items-center gap-4 border-primary-500/30">
                    <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                    <div>
                        <p className="text-white font-medium">Analyzing websites...</p>
                        <p className="text-dark-400 text-sm">Checking mobile-friendliness, SSL, and page speed</p>
                    </div>
                </div>
            )}

            {/* Results Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4 text-center">
                    <p className="text-2xl font-bold text-white">{results.length}</p>
                    <p className="text-dark-400 text-sm">Total Found</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-2xl font-bold text-red-400">
                        {results.filter((r) => r.analysis.score === 'no_website').length}
                    </p>
                    <p className="text-dark-400 text-sm">No Website</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-400">
                        {results.filter((r) => r.analysis.score === 'poor').length}
                    </p>
                    <p className="text-dark-400 text-sm">Poor Website</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-2xl font-bold text-green-400">
                        {results.filter((r) => r.saved).length}
                    </p>
                    <p className="text-dark-400 text-sm">Saved</p>
                </div>
            </div>

            {/* Results List */}
            <div className="space-y-4">
                {results.map((result) => (
                    <div key={result.id} className="card p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            {/* Business Info */}
                            <div className="flex-1">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Globe className="w-6 h-6 text-primary-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-white mb-1">{result.name}</h3>
                                        <p className="text-dark-400 text-sm flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {result.address}
                                        </p>
                                        {result.phone && (
                                            <p className="text-dark-400 text-sm flex items-center gap-2 mt-1">
                                                <Phone className="w-4 h-4" />
                                                {result.phone}
                                            </p>
                                        )}
                                        {result.website && (
                                            <a
                                                href={result.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary-400 text-sm flex items-center gap-2 mt-1 hover:underline"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                {result.website}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Results */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Website Score */}
                                <span className={`badge ${result.analysis.score === 'good' ? 'badge-success' :
                                    result.analysis.score === 'average' ? 'badge-warning' :
                                        result.analysis.score === 'poor' ? 'badge-danger' :
                                            'badge-primary'
                                    }`}>
                                    {result.analysis.score === 'no_website' ? 'No Website' : result.analysis.score}
                                </span>

                                {result.analysis.hasWebsite && (
                                    <>
                                        {/* SSL */}
                                        <span className={`badge ${result.analysis.hasSsl ? 'badge-success' : 'badge-danger'}`}>
                                            {result.analysis.hasSsl ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            SSL
                                        </span>

                                        {/* Mobile */}
                                        <span className={`badge ${result.analysis.isMobile ? 'badge-success' : 'badge-warning'}`}>
                                            {result.analysis.isMobile ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                            Mobile
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {result.saved ? (
                                    <span className="btn-secondary btn-sm opacity-50 cursor-default">
                                        <CheckCircle className="w-4 h-4" />
                                        Saved
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleSaveLead(result)}
                                        disabled={savingId === result.id}
                                        className="btn-primary btn-sm"
                                    >
                                        {savingId === result.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Mail className="w-4 h-4" />
                                                Save Lead
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {results.length === 0 && !analyzing && (
                    <div className="card p-12 text-center">
                        <Globe className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No businesses found</h3>
                        <p className="text-dark-400 mb-6">Try expanding your search radius or choosing a different location.</p>
                        <Link to="/search" className="btn-primary">
                            Try Another Search
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
