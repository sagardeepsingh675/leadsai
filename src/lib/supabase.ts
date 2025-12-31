import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
    UserProfile,
    Lead,
    LeadSearch,
    EmailTemplate,
    EmailCampaign,
    SmtpConfig,
    SubscriptionPlan
} from './database.types';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL) {
    console.warn('⚠️ Supabase URL not configured. Please add VITE_SUPABASE_URL to your .env file');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase Anon Key not configured. Please add VITE_SUPABASE_ANON_KEY to your .env file');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// Auth helper functions
export const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });
    return { data, error };
};

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
};

export const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
};

// Profile helper functions
export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data: data as UserProfile | null, error };
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    return { data: data as UserProfile | null, error };
};

// Subscription helper functions
export const getSubscriptionPlans = async () => {
    const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });
    return { data: data as SubscriptionPlan[] | null, error };
};

export const checkSubscriptionLimits = async (userId: string) => {
    const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('subscription_tier, leads_used_this_month, emails_sent_this_month, subscription_status, subscription_end_date')
        .eq('id', userId)
        .single();

    if (error || !profile) return { data: null, error };

    const { data: plan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('tier', profile.subscription_tier)
        .single();

    const planData = plan as SubscriptionPlan | null;

    return {
        data: {
            ...profile,
            plan: planData,
            leadsRemaining: planData ? planData.leads_per_month - profile.leads_used_this_month : 0,
            emailsRemaining: planData ? planData.emails_per_month - profile.emails_sent_this_month : 0,
            isExpired: profile.subscription_end_date ? new Date(profile.subscription_end_date) < new Date() : false,
        },
        error: null,
    };
};

// Leads helper functions
export const searchLeads = async (userId: string, searchParams: {
    country: string;
    state?: string;
    city?: string;
    businessType: string;
    radius?: number;
}) => {
    const { data: search, error: searchError } = await supabase
        .from('lead_searches')
        .insert({
            user_id: userId,
            country: searchParams.country,
            state: searchParams.state || null,
            city: searchParams.city || null,
            business_type: searchParams.businessType,
            radius_km: searchParams.radius || 10,
            search_query: searchParams,
        })
        .select()
        .single();

    if (searchError) return { data: null, error: searchError };

    return { data: search as LeadSearch, error: null };
};

export const getLeads = async (userId: string, options?: {
    searchId?: string;
    status?: string;
    limit?: number;
    offset?: number;
}) => {
    let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (options?.searchId) {
        query = query.eq('search_id', options.searchId);
    }
    if (options?.status) {
        query = query.eq('status', options.status);
    }
    if (options?.limit) {
        query = query.limit(options.limit);
    }
    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;
    return { data: data as Lead[] | null, error, count };
};

export const createLead = async (lead: Partial<Lead> & { user_id: string; business_name: string }) => {
    const { data, error } = await supabase
        .from('leads')
        .insert(lead)
        .select()
        .single();
    return { data: data as Lead | null, error };
};

export const updateLead = async (leadId: string, updates: Partial<Lead>) => {
    const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .select()
        .single();
    return { data: data as Lead | null, error };
};

export const deleteLead = async (leadId: string) => {
    const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);
    return { error };
};

// Email templates helper functions
export const getEmailTemplates = async (userId: string) => {
    const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('created_at', { ascending: false });
    return { data: data as EmailTemplate[] | null, error };
};

export const createEmailTemplate = async (template: Partial<EmailTemplate> & { name: string; subject: string; body_html: string }) => {
    const { data, error } = await supabase
        .from('email_templates')
        .insert(template)
        .select()
        .single();
    return { data: data as EmailTemplate | null, error };
};

// SMTP config helper functions
export const getSmtpConfigs = async (userId: string) => {
    const { data, error } = await supabase
        .from('smtp_configs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { data: data as SmtpConfig[] | null, error };
};

export const createSmtpConfig = async (config: Partial<SmtpConfig> & { user_id: string; name: string; host: string; username: string; password_encrypted: string; from_email: string }) => {
    const { data, error } = await supabase
        .from('smtp_configs')
        .insert(config)
        .select()
        .single();
    return { data: data as SmtpConfig | null, error };
};

// Email campaigns helper functions
export const getEmailCampaigns = async (userId: string) => {
    const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { data: data as EmailCampaign[] | null, error };
};

export const createEmailCampaign = async (campaign: Partial<EmailCampaign> & { user_id: string; name: string; subject: string; body_html: string }) => {
    const { data, error } = await supabase
        .from('email_campaigns')
        .insert(campaign)
        .select()
        .single();
    return { data: data as EmailCampaign | null, error };
};

// Site settings helper functions
export const getSiteSettings = async () => {
    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('is_public', true);

    if (error) return { data: null, error };

    const settings: Record<string, string> = {};
    if (data) {
        data.forEach((setting: { key: string; value: string | null }) => {
            settings[setting.key] = setting.value || '';
        });
    }

    return { data: settings, error: null };
};

// Admin helper functions
export const isUserAdmin = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (error) return false;
    return data?.role === 'admin';
};

export const getAllUsers = async (options?: { limit?: number; offset?: number }) => {
    let query = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (options?.limit) {
        query = query.limit(options.limit);
    }
    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;
    return { data: data as UserProfile[] | null, error, count };
};

export const updateUserAsAdmin = async (userId: string, updates: Partial<UserProfile>) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    return { data: data as UserProfile | null, error };
};

export default supabase;
