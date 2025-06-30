import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      forms: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          response_count: number;
          settings: any;
          metadata: any;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          response_count?: number;
          settings?: any;
          metadata?: any;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          response_count?: number;
          settings?: any;
          metadata?: any;
        };
      };
      form_fields: {
        Row: {
          id: string;
          form_id: string;
          field_type: 'text' | 'textarea' | 'rating' | 'multiple-choice' | 'email' | 'phone';
          label: string;
          placeholder: string | null;
          is_required: boolean;
          field_order: number;
          options: any;
          validation_rules: any;
          settings: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          field_type: 'text' | 'textarea' | 'rating' | 'multiple-choice' | 'email' | 'phone';
          label: string;
          placeholder?: string | null;
          is_required?: boolean;
          field_order?: number;
          options?: any;
          validation_rules?: any;
          settings?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          field_type?: 'text' | 'textarea' | 'rating' | 'multiple-choice' | 'email' | 'phone';
          label?: string;
          placeholder?: string | null;
          is_required?: boolean;
          field_order?: number;
          options?: any;
          validation_rules?: any;
          settings?: any;
          created_at?: string;
        };
      };
      form_invitations: {
        Row: {
          id: string;
          form_id: string;
          recipient_identifier: string | null;
          invitation_type: 'email' | 'sms' | 'public_link' | 'qr_code' | 'email_signature';
          sent_at: string;
          status: string;
          metadata: any;
        };
        Insert: {
          id?: string;
          form_id: string;
          recipient_identifier?: string | null;
          invitation_type: 'email' | 'sms' | 'public_link' | 'qr_code' | 'email_signature';
          sent_at?: string;
          status?: string;
          metadata?: any;
        };
        Update: {
          id?: string;
          form_id?: string;
          recipient_identifier?: string | null;
          invitation_type?: 'email' | 'sms' | 'public_link' | 'qr_code' | 'email_signature';
          sent_at?: string;
          status?: string;
          metadata?: any;
        };
      };
      form_themes: {
        Row: {
          id: string;
          form_id: string;
          primary_color: string;
          background_color: string;
          text_color: string;
          border_radius: string;
          font_family: string;
          custom_css: string;
          background_type: 'color' | 'gradient' | 'image';
          background_image: string | null;
          gradient_direction: string;
          gradient_colors: string[];
          logo_url: string | null;
          logo_position: 'top-left' | 'top-center' | 'top-right';
          logo_size: 'small' | 'medium' | 'large';
          footer_enabled: boolean;
          footer_text: string;
          footer_links: any;
          layout_style: 'centered' | 'left-aligned' | 'full-width' | 'card' | 'minimal';
          spacing: 'compact' | 'normal' | 'relaxed';
          animation: 'none' | 'fade' | 'slide' | 'bounce';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          primary_color?: string;
          background_color?: string;
          text_color?: string;
          border_radius?: string;
          font_family?: string;
          custom_css?: string;
          background_type?: 'color' | 'gradient' | 'image';
          background_image?: string | null;
          gradient_direction?: string;
          gradient_colors?: string[];
          logo_url?: string | null;
          logo_position?: 'top-left' | 'top-center' | 'top-right';
          logo_size?: 'small' | 'medium' | 'large';
          footer_enabled?: boolean;
          footer_text?: string;
          footer_links?: any;
          layout_style?: 'centered' | 'left-aligned' | 'full-width' | 'card' | 'minimal';
          spacing?: 'compact' | 'normal' | 'relaxed';
          animation?: 'none' | 'fade' | 'slide' | 'bounce';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          primary_color?: string;
          background_color?: string;
          text_color?: string;
          border_radius?: string;
          font_family?: string;
          custom_css?: string;
          background_type?: 'color' | 'gradient' | 'image';
          background_image?: string | null;
          gradient_direction?: string;
          gradient_colors?: string[];
          logo_url?: string | null;
          logo_position?: 'top-left' | 'top-center' | 'top-right';
          logo_size?: 'small' | 'medium' | 'large';
          footer_enabled?: boolean;
          footer_text?: string;
          footer_links?: any;
          layout_style?: 'centered' | 'left-aligned' | 'full-width' | 'card' | 'minimal';
          spacing?: 'compact' | 'normal' | 'relaxed';
          animation?: 'none' | 'fade' | 'slide' | 'bounce';
          created_at?: string;
          updated_at?: string;
        };
      };
      form_links: {
        Row: {
          id: string;
          form_id: string;
          link_type: 'public' | 'private' | 'embedded';
          slug: string | null;
          is_active: boolean;
          expires_at: string | null;
          click_count: number;
          settings: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          link_type: 'public' | 'private' | 'embedded';
          slug?: string | null;
          is_active?: boolean;
          expires_at?: string | null;
          click_count?: number;
          settings?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          link_type?: 'public' | 'private' | 'embedded';
          slug?: string | null;
          is_active?: boolean;
          expires_at?: string | null;
          click_count?: number;
          settings?: any;
          created_at?: string;
        };
      };
      form_qr_codes: {
        Row: {
          id: string;
          form_id: string;
          qr_data: string;
          size: number;
          format: string;
          foreground_color: string;
          background_color: string;
          logo_url: string | null;
          scan_count: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          qr_data: string;
          size?: number;
          format?: string;
          foreground_color?: string;
          background_color?: string;
          logo_url?: string | null;
          scan_count?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          qr_data?: string;
          size?: number;
          format?: string;
          foreground_color?: string;
          background_color?: string;
          logo_url?: string | null;
          scan_count?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      form_email_signatures: {
        Row: {
          id: string;
          form_id: string;
          template_name: string;
          html_content: string;
          text_content: string | null;
          is_active: boolean;
          click_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          template_name?: string;
          html_content?: string;
          text_content?: string | null;
          is_active?: boolean;
          click_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          template_name?: string;
          html_content?: string;
          text_content?: string | null;
          is_active?: boolean;
          click_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      form_responses: {
        Row: {
          id: string;
          form_id: string;
          response_source: 'web' | 'email' | 'qr' | 'sms' | 'social' | 'embedded';
          user_agent: string | null;
          ip_address: string | null;
          location_data: any;
          sentiment: 'positive' | 'neutral' | 'negative' | null;
          overall_rating: number | null;
          is_complete: boolean;
          submitted_at: string;
          metadata: any;
        };
        Insert: {
          id?: string;
          form_id: string;
          response_source?: 'web' | 'email' | 'qr' | 'sms' | 'social' | 'embedded';
          user_agent?: string | null;
          ip_address?: string | null;
          location_data?: any;
          sentiment?: 'positive' | 'neutral' | 'negative' | null;
          overall_rating?: number | null;
          is_complete?: boolean;
          submitted_at?: string;
          metadata?: any;
        };
        Update: {
          id?: string;
          form_id?: string;
          response_source?: 'web' | 'email' | 'qr' | 'sms' | 'social' | 'embedded';
          user_agent?: string | null;
          ip_address?: string | null;
          location_data?: any;
          sentiment?: 'positive' | 'neutral' | 'negative' | null;
          overall_rating?: number | null;
          is_complete?: boolean;
          submitted_at?: string;
          metadata?: any;
        };
      };
      form_response_data: {
        Row: {
          id: string;
          response_id: string;
          field_id: string;
          field_value: string | null;
          field_data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          response_id: string;
          field_id: string;
          field_value?: string | null;
          field_data?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          response_id?: string;
          field_id?: string;
          field_value?: string | null;
          field_data?: any;
          created_at?: string;
        };
      };
    };
  };
}