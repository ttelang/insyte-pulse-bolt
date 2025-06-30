/*
  # Update form themes table for font customization

  1. Schema Updates
    - Ensure font_family column exists and has proper defaults
    - Add any missing font-related columns

  2. Data Migration
    - Update existing records to have proper font family values
*/

-- Ensure the font_family column exists with proper default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_themes' AND column_name = 'font_family'
  ) THEN
    ALTER TABLE form_themes ADD COLUMN font_family text DEFAULT 'Inter';
  END IF;
END $$;

-- Update any existing records that might have null font_family
UPDATE form_themes 
SET font_family = 'Inter' 
WHERE font_family IS NULL OR font_family = '';

-- Ensure the column has a proper default
ALTER TABLE form_themes ALTER COLUMN font_family SET DEFAULT 'Inter';