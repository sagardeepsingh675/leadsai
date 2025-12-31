-- WhatsApp Message Templates Table
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own templates
CREATE POLICY "Users can view own whatsapp templates" ON whatsapp_templates
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own templates
CREATE POLICY "Users can create whatsapp templates" ON whatsapp_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own templates
CREATE POLICY "Users can update own whatsapp templates" ON whatsapp_templates
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own templates
CREATE POLICY "Users can delete own whatsapp templates" ON whatsapp_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_user_id ON whatsapp_templates(user_id);
