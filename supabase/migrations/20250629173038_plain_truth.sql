/*
  # Add comprehensive theme customization fields

  1. New Columns
    - Add all missing theme customization fields to form_themes table
    - Include font_family, background options, layout settings, etc.

  2. Data Migration
    - Set proper defaults for existing records
    - Ensure all new fields have appropriate default values

  3. Constraints
    - Add check constraints for enum-like fields
    - Ensure data integrity
*/

-- Add all missing theme customization columns
DO $$
BEGIN
  -- Font family
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_themes' AND column_name = 'font_family'
  ) THEN
    ALTER TABLE form_themes ADD COLUMN font_family text DEFAULT 'Inter';
  END IF;

  -- Background type and related fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_themes' AND column_name = 'background_type'
  ) THEN
    ALTER TABLE form_themes ADD COLUMN background_type text DEFAULT 'color';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_themes' AND column_name = 'background_image'
  ) THEN
    ALTER TABLE form_themes ADD COLUMN background_image text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_themes' AND column_name = 'gradient_direction'
  ) THEN
    ALTER TABLE form_themes ADD COLUMN gradient_direction text DEFAULT 'to-br';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_themes' AND column_name = 'gradient_colors'
  ) THEN
    ALTER TABLE form_themes ADD COLUMN gradient_colors jsonb DEFAULT '["#3B82F6", "#8B5CF6"]';
  END IF;

  -- Logo settings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_themes' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE form_themes ADD COLUMN logo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_themes' AND column_name = 'logo_position'
  ) THEN
    ALTER TABLE form_themes ADD COLUMN logo_position text DEFAULT 'top-center';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_themes' AND column_name = 'logo_size'
  ) THEN
    ALTER TABLE form_themes ADD COLUMN logo_size text DEFAULT 'medium';
  END IF;

  -- Footer settings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_themes' AND column_name = 'footer_enabled'
  ) THEN
    ALTER TABLE form_themes ADD COLUMN footer_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_themes' AND column_name = 'footer_text'
  ) THEN
    ALTER TABLE form_themes ADD COLUMN footer_text text DEFAULT '© 2024 Your Company. All rights reserved.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_themes' AND column_name = 'footer_links'
  ) THEN
    ALTER TABLE form_themes ADD COLUMN footer_links jsonb DEFAULT '[]';
  END IF;

  -- Layout settings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_themes' AND column_name = 'layout_style'
  ) THEN
    ALTER TABLE form_themes ADD COLUMN layout_style text DEFAULT 'centered';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_themes' AND column_name = 'spacing'
  ) THEN
    ALTER TABLE form_themes ADD COLUMN spacing text DEFAULT 'normal';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_themes' AND column_name = 'animation'
  ) THEN
    ALTER TABLE form_themes ADD COLUMN animation text DEFAULT 'fade';
  END IF;
END $$;

-- Update existing records with proper defaults
UPDATE form_themes 
SET 
  font_family = COALESCE(font_family, 'Inter'),
  background_type = COALESCE(background_type, 'color'),
  gradient_direction = COALESCE(gradient_direction, 'to-br'),
  gradient_colors = COALESCE(gradient_colors, '["#3B82F6", "#8B5CF6"]'::jsonb),
  logo_position = COALESCE(logo_position, 'top-center'),
  logo_size = COALESCE(logo_size, 'medium'),
  footer_enabled = COALESCE(footer_enabled, false),
  footer_text = COALESCE(footer_text, '© 2024 Your Company. All rights reserved.'),
  footer_links = COALESCE(footer_links, '[]'::jsonb),
  layout_style = COALESCE(layout_style, 'centered'),
  spacing = COALESCE(spacing, 'normal'),
  animation = COALESCE(animation, 'fade')
WHERE 
  font_family IS NULL OR font_family = '' OR
  background_type IS NULL OR
  gradient_direction IS NULL OR
  gradient_colors IS NULL OR
  logo_position IS NULL OR
  logo_size IS NULL OR
  footer_enabled IS NULL OR
  footer_text IS NULL OR
  footer_links IS NULL OR
  layout_style IS NULL OR
  spacing IS NULL OR
  animation IS NULL;

-- Add check constraints for enum-like fields
DO $$
BEGIN
  -- Background type constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'form_themes_background_type_check'
  ) THEN
    ALTER TABLE form_themes ADD CONSTRAINT form_themes_background_type_check 
    CHECK (background_type IN ('color', 'gradient', 'image'));
  END IF;

  -- Logo position constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'form_themes_logo_position_check'
  ) THEN
    ALTER TABLE form_themes ADD CONSTRAINT form_themes_logo_position_check 
    CHECK (logo_position IN ('top-left', 'top-center', 'top-right'));
  END IF;

  -- Logo size constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'form_themes_logo_size_check'
  ) THEN
    ALTER TABLE form_themes ADD CONSTRAINT form_themes_logo_size_check 
    CHECK (logo_size IN ('small', 'medium', 'large'));
  END IF;

  -- Layout style constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'form_themes_layout_style_check'
  ) THEN
    ALTER TABLE form_themes ADD CONSTRAINT form_themes_layout_style_check 
    CHECK (layout_style IN ('centered', 'left-aligned', 'full-width', 'card', 'minimal'));
  END IF;

  -- Spacing constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'form_themes_spacing_check'
  ) THEN
    ALTER TABLE form_themes ADD CONSTRAINT form_themes_spacing_check 
    CHECK (spacing IN ('compact', 'normal', 'relaxed'));
  END IF;

  -- Animation constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'form_themes_animation_check'
  ) THEN
    ALTER TABLE form_themes ADD CONSTRAINT form_themes_animation_check 
    CHECK (animation IN ('none', 'fade', 'slide', 'bounce'));
  END IF;
END $$;

-- Ensure all columns have proper defaults
ALTER TABLE form_themes ALTER COLUMN font_family SET DEFAULT 'Inter';
ALTER TABLE form_themes ALTER COLUMN background_type SET DEFAULT 'color';
ALTER TABLE form_themes ALTER COLUMN gradient_direction SET DEFAULT 'to-br';
ALTER TABLE form_themes ALTER COLUMN gradient_colors SET DEFAULT '["#3B82F6", "#8B5CF6"]';
ALTER TABLE form_themes ALTER COLUMN logo_position SET DEFAULT 'top-center';
ALTER TABLE form_themes ALTER COLUMN logo_size SET DEFAULT 'medium';
ALTER TABLE form_themes ALTER COLUMN footer_enabled SET DEFAULT false;
ALTER TABLE form_themes ALTER COLUMN footer_text SET DEFAULT '© 2024 Your Company. All rights reserved.';
ALTER TABLE form_themes ALTER COLUMN footer_links SET DEFAULT '[]';
ALTER TABLE form_themes ALTER COLUMN layout_style SET DEFAULT 'centered';
ALTER TABLE form_themes ALTER COLUMN spacing SET DEFAULT 'normal';
ALTER TABLE form_themes ALTER COLUMN animation SET DEFAULT 'fade';