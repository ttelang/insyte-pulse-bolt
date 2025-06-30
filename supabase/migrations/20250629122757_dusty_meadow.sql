/*
  # Feedback Collection System Database Schema

  1. New Tables
    - `forms` - Main form details and metadata
    - `form_fields` - Individual form fields with their configurations
    - `form_themes` - Theme customization settings for forms
    - `form_links` - Generated links for form sharing
    - `form_qr_codes` - QR code data and settings
    - `form_email_signatures` - Email signature configurations
    - `form_responses` - User responses to forms
    - `form_response_data` - Individual field responses

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own forms
    - Add policies for public access to active forms for responses

  3. Features
    - Support for multiple form types and field configurations
    - Theme customization with color schemes and styling
    - Multiple sharing methods (links, QR codes, email signatures)
    - Response tracking and analytics
    - Form versioning and status management
*/

-- Forms table - Main form information
CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  response_count integer DEFAULT 0,
  settings jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}'
);

-- Form fields table - Individual form fields
CREATE TABLE IF NOT EXISTS form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE,
  field_type text NOT NULL CHECK (field_type IN ('text', 'textarea', 'rating', 'multiple-choice', 'email', 'phone')),
  label text NOT NULL DEFAULT '',
  placeholder text DEFAULT '',
  is_required boolean DEFAULT false,
  field_order integer NOT NULL DEFAULT 0,
  options jsonb DEFAULT '[]',
  validation_rules jsonb DEFAULT '{}',
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Form themes table - Theme customization
CREATE TABLE IF NOT EXISTS form_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE UNIQUE,
  primary_color text DEFAULT '#3B82F6',
  background_color text DEFAULT '#FFFFFF',
  text_color text DEFAULT '#1F2937',
  border_radius text DEFAULT '8px',
  font_family text DEFAULT 'Inter',
  custom_css text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Form links table - Shareable links
CREATE TABLE IF NOT EXISTS form_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE,
  link_type text NOT NULL CHECK (link_type IN ('public', 'private', 'embedded')),
  slug text UNIQUE,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  click_count integer DEFAULT 0,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Form QR codes table - QR code configurations
CREATE TABLE IF NOT EXISTS form_qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE,
  qr_data text NOT NULL,
  size integer DEFAULT 256,
  format text DEFAULT 'png',
  foreground_color text DEFAULT '#1F2937',
  background_color text DEFAULT '#FFFFFF',
  logo_url text,
  scan_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Form email signatures table - Email signature configurations
CREATE TABLE IF NOT EXISTS form_email_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE,
  template_name text NOT NULL DEFAULT 'default',
  html_content text NOT NULL DEFAULT '',
  text_content text DEFAULT '',
  is_active boolean DEFAULT true,
  click_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Form responses table - User responses
CREATE TABLE IF NOT EXISTS form_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE,
  response_source text DEFAULT 'web' CHECK (response_source IN ('web', 'email', 'qr', 'sms', 'social', 'embedded')),
  user_agent text,
  ip_address inet,
  location_data jsonb DEFAULT '{}',
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  overall_rating numeric(3,2),
  is_complete boolean DEFAULT false,
  submitted_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Form response data table - Individual field responses
CREATE TABLE IF NOT EXISTS form_response_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid REFERENCES form_responses(id) ON DELETE CASCADE,
  field_id uuid REFERENCES form_fields(id) ON DELETE CASCADE,
  field_value text,
  field_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_is_active ON forms(is_active);
CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_order ON form_fields(form_id, field_order);
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted_at ON form_responses(submitted_at);
CREATE INDEX IF NOT EXISTS idx_form_response_data_response_id ON form_response_data(response_id);
CREATE INDEX IF NOT EXISTS idx_form_links_slug ON form_links(slug);

-- Enable Row Level Security
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_email_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_response_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forms
CREATE POLICY "Users can view their own forms"
  ON forms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own forms"
  ON forms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms"
  ON forms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms"
  ON forms
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for form_fields
CREATE POLICY "Users can manage fields of their own forms"
  ON form_fields
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_fields.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- RLS Policies for form_themes
CREATE POLICY "Users can manage themes of their own forms"
  ON form_themes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_themes.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- RLS Policies for form_links
CREATE POLICY "Users can manage links of their own forms"
  ON form_links
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_links.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- RLS Policies for form_qr_codes
CREATE POLICY "Users can manage QR codes of their own forms"
  ON form_qr_codes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_qr_codes.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- RLS Policies for form_email_signatures
CREATE POLICY "Users can manage email signatures of their own forms"
  ON form_email_signatures
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_email_signatures.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- RLS Policies for form_responses (public can submit, owners can view)
CREATE POLICY "Anyone can submit responses to active forms"
  ON form_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_responses.form_id 
      AND forms.is_active = true
    )
  );

CREATE POLICY "Form owners can view responses"
  ON form_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_responses.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- RLS Policies for form_response_data
CREATE POLICY "Anyone can submit response data"
  ON form_response_data
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM form_responses fr
      JOIN forms f ON f.id = fr.form_id
      WHERE fr.id = form_response_data.response_id 
      AND f.is_active = true
    )
  );

CREATE POLICY "Form owners can view response data"
  ON form_response_data
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM form_responses fr
      JOIN forms f ON f.id = fr.form_id
      WHERE fr.id = form_response_data.response_id 
      AND f.user_id = auth.uid()
    )
  );

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_forms_updated_at 
  BEFORE UPDATE ON forms 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_themes_updated_at 
  BEFORE UPDATE ON form_themes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_email_signatures_updated_at 
  BEFORE UPDATE ON form_email_signatures 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment response count
CREATE OR REPLACE FUNCTION increment_form_response_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forms 
  SET response_count = response_count + 1 
  WHERE id = NEW.form_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to increment response count
CREATE TRIGGER increment_response_count_trigger
  AFTER INSERT ON form_responses
  FOR EACH ROW EXECUTE FUNCTION increment_form_response_count();