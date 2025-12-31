-- =====================================================
-- STACHBIT LEAD GENERATION PLATFORM - DATABASE SCHEMA
-- =====================================================
-- Upload this file to Supabase SQL Editor and run it
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE subscription_tier AS ENUM ('free_trial', 'basic', 'pro', 'ultra_pro');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'responded', 'converted', 'rejected');
CREATE TYPE email_status AS ENUM ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'completed', 'paused');
CREATE TYPE website_score AS ENUM ('good', 'average', 'poor', 'no_website');

-- =====================================================
-- SUBSCRIPTION PLANS TABLE
-- =====================================================

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    tier subscription_tier NOT NULL UNIQUE,
    price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10, 2),
    leads_per_month INTEGER NOT NULL DEFAULT 25,
    emails_per_month INTEGER NOT NULL DEFAULT 10,
    templates_limit INTEGER NOT NULL DEFAULT 1,
    can_export_csv BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    trial_days INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, tier, price_monthly, price_yearly, leads_per_month, emails_per_month, templates_limit, can_export_csv, priority_support, trial_days, features) VALUES
('Free Trial', 'free_trial', 0, 0, 25, 10, 1, FALSE, FALSE, 7, '["Basic lead search", "Website analysis", "1 email template"]'),
('Basic', 'basic', 499, 4990, 100, 50, 3, TRUE, FALSE, 0, '["100 leads/month", "50 emails/month", "3 templates", "CSV export"]'),
('Pro', 'pro', 1499, 14990, 500, 300, 10, TRUE, TRUE, 0, '["500 leads/month", "300 emails/month", "10 templates", "Priority support"]'),
('Ultra Pro', 'ultra_pro', 3999, 39990, 999999, 1000, 999999, TRUE, TRUE, 0, '["Unlimited leads", "1000 emails/month", "Unlimited templates", "Priority support", "API access"]');

-- =====================================================
-- USER PROFILES TABLE (Extends Supabase auth.users)
-- =====================================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    company_name VARCHAR(255),
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    subscription_tier subscription_tier DEFAULT 'free_trial',
    subscription_status subscription_status DEFAULT 'active',
    subscription_start_date TIMESTAMPTZ DEFAULT NOW(),
    subscription_end_date TIMESTAMPTZ,
    leads_used_this_month INTEGER DEFAULT 0,
    emails_sent_this_month INTEGER DEFAULT 0,
    usage_reset_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER SUBSCRIPTIONS HISTORY
-- =====================================================

CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    tier subscription_tier NOT NULL,
    status subscription_status DEFAULT 'active',
    amount_paid DECIMAL(10, 2),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SMTP CONFIGURATIONS
-- =====================================================

CREATE TABLE smtp_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'Default',
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 587,
    username VARCHAR(255) NOT NULL,
    password_encrypted TEXT NOT NULL, -- Store encrypted
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255),
    use_tls BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LEAD SEARCHES
-- =====================================================

CREATE TABLE lead_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    search_name VARCHAR(255),
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100),
    area VARCHAR(255),
    business_type VARCHAR(100) NOT NULL,
    client_need VARCHAR(100), -- 'needs_website', 'bad_website', 'outdated_website'
    radius_km INTEGER DEFAULT 10,
    search_query JSONB, -- Store the full query parameters
    results_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LEADS TABLE
-- =====================================================

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    search_id UUID REFERENCES lead_searches(id) ON DELETE SET NULL,
    
    -- Business Information
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    description TEXT,
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(50),
    owner_name VARCHAR(255),
    
    -- Location
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Website Analysis
    website_url TEXT,
    has_website BOOLEAN DEFAULT FALSE,
    website_score website_score DEFAULT 'no_website',
    is_mobile_responsive BOOLEAN,
    has_ssl BOOLEAN,
    page_speed_score INTEGER, -- 0-100
    design_age_score INTEGER, -- 0-100 (100 = modern)
    analysis_notes TEXT,
    last_analyzed_at TIMESTAMPTZ,
    
    -- Lead Status
    status lead_status DEFAULT 'new',
    notes TEXT,
    tags TEXT[], -- Array of tags
    
    -- Source Information
    source VARCHAR(100) DEFAULT 'openstreetmap',
    source_id VARCHAR(255), -- External ID from source
    raw_data JSONB, -- Store original data
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMAIL TEMPLATES
-- =====================================================

CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables TEXT[] DEFAULT ARRAY['{{business_name}}', '{{owner_name}}', '{{email}}', '{{website_url}}'],
    is_default BOOLEAN DEFAULT FALSE,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default email templates
INSERT INTO email_templates (user_id, name, subject, body_html, body_text, is_default) VALUES
(NULL, 'Website Offer', 'Transform Your Business with a Modern Website - {{business_name}}', 
'<h2>Hello {{owner_name}},</h2>
<p>I noticed that <strong>{{business_name}}</strong> could benefit from a modern, professional website.</p>
<p>In today''s digital world, having an online presence is crucial for attracting new customers. I specialize in creating beautiful, fast, and mobile-friendly websites for businesses like yours.</p>
<h3>What I can offer:</h3>
<ul>
<li>Modern, responsive design</li>
<li>Fast loading speeds</li>
<li>SEO optimization</li>
<li>Easy to update content</li>
</ul>
<p>Would you be interested in a free consultation to discuss how we can help grow your business online?</p>
<p>Best regards,<br>Your Name</p>',
'Hello {{owner_name}},

I noticed that {{business_name}} could benefit from a modern, professional website.

In today''s digital world, having an online presence is crucial for attracting new customers. I specialize in creating beautiful, fast, and mobile-friendly websites for businesses like yours.

What I can offer:
- Modern, responsive design
- Fast loading speeds
- SEO optimization
- Easy to update content

Would you be interested in a free consultation to discuss how we can help grow your business online?

Best regards,
Your Name',
TRUE);

-- =====================================================
-- EMAIL CAMPAIGNS
-- =====================================================

CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    smtp_config_id UUID REFERENCES smtp_configs(id) ON DELETE SET NULL,
    
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    
    status campaign_status DEFAULT 'draft',
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CAMPAIGN LEADS (Junction Table)
-- =====================================================

CREATE TABLE campaign_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    personalized_subject VARCHAR(500),
    personalized_body TEXT,
    status email_status DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, lead_id)
);

-- =====================================================
-- EMAIL LOGS
-- =====================================================

CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    
    to_email VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    status email_status DEFAULT 'pending',
    
    smtp_response TEXT,
    message_id VARCHAR(255),
    error_message TEXT,
    
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SITE SETTINGS (Admin Configuration)
-- =====================================================

CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Can be accessed without auth
    updated_by UUID REFERENCES user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO site_settings (key, value, type, description, is_public) VALUES
('site_name', 'Stachbit Lead Generator', 'string', 'Website name', TRUE),
('site_tagline', 'Find Your Next Client Automatically', 'string', 'Website tagline', TRUE),
('site_logo', '/logo.png', 'string', 'Logo URL', TRUE),
('site_favicon', '/favicon.ico', 'string', 'Favicon URL', TRUE),
('contact_email', 'support@stachbit.in', 'string', 'Support email', TRUE),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', TRUE),
('allow_registrations', 'true', 'boolean', 'Allow new user registrations', FALSE),
('default_trial_days', '7', 'number', 'Default trial period in days', FALSE),
('max_leads_per_search', '100', 'number', 'Maximum leads returned per search', FALSE);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_subscription ON user_profiles(subscription_tier, subscription_status);

CREATE INDEX idx_leads_user ON leads(user_id);
CREATE INDEX idx_leads_search ON leads(search_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_location ON leads(country, state, city);
CREATE INDEX idx_leads_business_type ON leads(business_type);
CREATE INDEX idx_leads_website_score ON leads(website_score);

CREATE INDEX idx_lead_searches_user ON lead_searches(user_id);
CREATE INDEX idx_email_campaigns_user ON email_campaigns(user_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_logs_user ON email_logs(user_id);
CREATE INDEX idx_email_logs_campaign ON email_logs(campaign_id);

-- Unique index for leads to prevent duplicates (using COALESCE for nullable fields)
CREATE UNIQUE INDEX idx_leads_unique_business ON leads(user_id, business_name, COALESCE(email, ''), COALESCE(phone, ''));

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE smtp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Subscription Plans: Anyone can read, only admin can modify
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage subscription plans" ON subscription_plans
    FOR ALL USING (is_admin());

-- User Profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (is_admin());

-- User Subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can manage subscriptions" ON user_subscriptions
    FOR ALL USING (is_admin());

-- SMTP Configs
CREATE POLICY "Users can manage own SMTP configs" ON smtp_configs
    FOR ALL USING (auth.uid() = user_id);

-- Lead Searches
CREATE POLICY "Users can manage own searches" ON lead_searches
    FOR ALL USING (auth.uid() = user_id);

-- Leads
CREATE POLICY "Users can manage own leads" ON leads
    FOR ALL USING (auth.uid() = user_id);

-- Email Templates
CREATE POLICY "Users can view own and default templates" ON email_templates
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage own templates" ON email_templates
    FOR ALL USING (auth.uid() = user_id);

-- Email Campaigns
CREATE POLICY "Users can manage own campaigns" ON email_campaigns
    FOR ALL USING (auth.uid() = user_id);

-- Campaign Leads
CREATE POLICY "Users can view campaign leads" ON campaign_leads
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM email_campaigns WHERE id = campaign_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can manage campaign leads" ON campaign_leads
    FOR ALL USING (
        EXISTS (SELECT 1 FROM email_campaigns WHERE id = campaign_id AND user_id = auth.uid())
    );

-- Email Logs
CREATE POLICY "Users can view own email logs" ON email_logs
    FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- Site Settings
CREATE POLICY "Anyone can view public settings" ON site_settings
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Admins can manage settings" ON site_settings
    FOR ALL USING (is_admin());

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name, subscription_end_date)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NOW() + INTERVAL '7 days' -- Trial period
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_email_campaigns_updated_at
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_smtp_configs_updated_at
    BEFORE UPDATE ON smtp_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET 
        leads_used_this_month = 0,
        emails_sent_this_month = 0,
        usage_reset_date = CURRENT_DATE
    WHERE usage_reset_date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_lead_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_tier subscription_tier;
    current_usage INTEGER;
    tier_limit INTEGER;
BEGIN
    -- Get user's tier and current usage
    SELECT subscription_tier, leads_used_this_month 
    INTO user_tier, current_usage
    FROM user_profiles WHERE id = NEW.user_id;
    
    -- Get tier limit
    SELECT leads_per_month INTO tier_limit
    FROM subscription_plans WHERE tier = user_tier;
    
    -- Check if limit exceeded
    IF current_usage >= tier_limit THEN
        RAISE EXCEPTION 'Lead limit exceeded for your subscription tier';
    END IF;
    
    -- Increment usage
    UPDATE user_profiles 
    SET leads_used_this_month = leads_used_this_month + 1
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_lead_limit_trigger
    BEFORE INSERT ON leads
    FOR EACH ROW EXECUTE FUNCTION check_lead_limit();

-- =====================================================
-- CREATE ADMIN USER (Run after first signup)
-- =====================================================
-- To make a user admin, run this query with the user's email:
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'admin@stachbit.in';

-- =====================================================
-- DONE! Your database is ready.
-- =====================================================
