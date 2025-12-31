-- =====================================================
-- ENHANCED BUSINESS INFORMATION MIGRATION
-- Run this in Supabase SQL Editor to add new fields
-- =====================================================

-- Add additional contact fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Add business details fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS google_rating DECIMAL(2, 1);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS employee_count VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS year_established INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS business_subcategory VARCHAR(100);

-- Create indexes for new searchable fields
CREATE INDEX IF NOT EXISTS idx_leads_google_rating ON leads(google_rating);
CREATE INDEX IF NOT EXISTS idx_leads_subcategory ON leads(business_subcategory);
CREATE INDEX IF NOT EXISTS idx_leads_has_contact ON leads(email, phone, whatsapp_number);

-- Add popular business subcategories as reference
COMMENT ON COLUMN leads.business_subcategory IS 'More specific category like "Italian Restaurant", "Hair Salon", "Dental Clinic"';
COMMENT ON COLUMN leads.business_hours IS 'JSON format: {"monday": "9:00-18:00", "tuesday": "9:00-18:00", ...}';
COMMENT ON COLUMN leads.employee_count IS 'Ranges like "1-10", "11-50", "51-200", "200+"';
