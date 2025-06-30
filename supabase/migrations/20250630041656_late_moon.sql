/*
  # Add form_invitations table

  1. New Tables
    - `form_invitations`
      - `id` (uuid, primary key)
      - `form_id` (uuid, foreign key to forms table)
      - `recipient_identifier` (text, nullable - email, phone, etc.)
      - `invitation_type` (text, enum: email, sms, public_link, qr_code, email_signature)
      - `sent_at` (timestamp with timezone, default now())
      - `status` (text, default 'sent')
      - `metadata` (jsonb, default '{}')

  2. Security
    - Enable RLS on `form_invitations` table
    - Add policy for form owners to manage invitations of their own forms

  3. Indexes
    - Index on form_id for efficient queries
    - Index on invitation_type for filtering
*/

CREATE TABLE IF NOT EXISTS form_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE,
  recipient_identifier text,
  invitation_type text NOT NULL CHECK (invitation_type = ANY (ARRAY['email'::text, 'sms'::text, 'public_link'::text, 'qr_code'::text, 'email_signature'::text])),
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'sent',
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE form_invitations ENABLE ROW LEVEL SECURITY;

-- Create policy for form owners to manage invitations
CREATE POLICY "Users can manage invitations of their own forms"
  ON form_invitations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_invitations.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_form_invitations_form_id ON form_invitations(form_id);
CREATE INDEX IF NOT EXISTS idx_form_invitations_type ON form_invitations(invitation_type);
CREATE INDEX IF NOT EXISTS idx_form_invitations_status ON form_invitations(status);