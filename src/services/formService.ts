import { supabase } from '../lib/supabase';
import { FeedbackForm, FormField, FeedbackTheme, DEFAULT_THEME } from '../context/FeedbackContext';
import { SentimentService } from './sentimentService';

export interface SaveFormData {
  title: string;
  description: string;
  fields: FormField[];
  theme: FeedbackTheme;
  isActive: boolean;
}

export interface SavedForm {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  responseCount: number;
  publicUrl: string;
  qrCodeUrl?: string;
}

export interface DashboardStats {
  totalResponses: number;
  totalInvitations: number;
  avgSatisfaction: number;
  activeFormsCount: number;
  responseRate: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentForms: Array<{
    id: string;
    title: string;
    responses: number;
    isActive: boolean;
    createdAt: Date;
  }>;
  monthlyTrend: {
    responsesChange: number;
    satisfactionChange: number;
  };
}

export interface EnrichedFormResponse {
  id: string;
  form_id: string;
  response_source: string;
  user_agent: string | null;
  ip_address: string | null;
  location_data: any;
  sentiment: string | null;
  overall_rating: number | null;
  is_complete: boolean;
  submitted_at: string;
  metadata: any;
  form_response_data: Array<{
    id: string;
    response_id: string;
    field_id: string;
    field_value: string | null;
    field_data: any;
    created_at: string;
    field_label?: string;
    field_type?: string;
  }>;
}

export interface FeedbackUpdateData {
  sentiment?: 'positive' | 'neutral' | 'negative';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  categories?: string[];
  notes?: string;
  isVisible?: boolean;
}

export class FormService {
  // Helper method to validate UUID format
  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Helper method to convert theme to database format
  private static themeToDatabase(theme: FeedbackTheme) {
    return {
      primary_color: theme.primaryColor,
      background_color: theme.backgroundColor,
      text_color: theme.textColor,
      border_radius: theme.borderRadius,
      font_family: theme.fontFamily,
      background_type: theme.backgroundType,
      background_image: theme.backgroundImage || null,
      gradient_direction: theme.gradientDirection,
      gradient_colors: theme.gradientColors,
      logo_url: theme.logo || null,
      logo_position: theme.logoPosition,
      logo_size: theme.logoSize,
      footer_enabled: theme.footer.enabled,
      footer_text: theme.footer.text,
      footer_links: theme.footer.links,
      layout_style: theme.layout,
      spacing: theme.spacing,
      animation: theme.animation,
      custom_css: ''
    };
  }

  // Helper method to convert database format to theme
  private static databaseToTheme(dbTheme: any): FeedbackTheme {
    return {
      primaryColor: dbTheme.primary_color || DEFAULT_THEME.primaryColor,
      backgroundColor: dbTheme.background_color || DEFAULT_THEME.backgroundColor,
      textColor: dbTheme.text_color || DEFAULT_THEME.textColor,
      borderRadius: dbTheme.border_radius || DEFAULT_THEME.borderRadius,
      fontFamily: dbTheme.font_family || DEFAULT_THEME.fontFamily,
      backgroundType: dbTheme.background_type || DEFAULT_THEME.backgroundType,
      backgroundImage: dbTheme.background_image || undefined,
      gradientDirection: dbTheme.gradient_direction || DEFAULT_THEME.gradientDirection,
      gradientColors: dbTheme.gradient_colors || DEFAULT_THEME.gradientColors,
      logo: dbTheme.logo_url || undefined,
      logoPosition: dbTheme.logo_position || DEFAULT_THEME.logoPosition,
      logoSize: dbTheme.logo_size || DEFAULT_THEME.logoSize,
      footer: {
        enabled: dbTheme.footer_enabled || DEFAULT_THEME.footer.enabled,
        text: dbTheme.footer_text || DEFAULT_THEME.footer.text,
        links: dbTheme.footer_links || DEFAULT_THEME.footer.links
      },
      layout: dbTheme.layout_style || DEFAULT_THEME.layout,
      spacing: dbTheme.spacing || DEFAULT_THEME.spacing,
      animation: dbTheme.animation || DEFAULT_THEME.animation
    };
  }

  static async saveForm(formData: SaveFormData): Promise<SavedForm> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('User not authenticated. Please sign in to save forms.');
      }

      // Start a transaction by saving the form first
      const { data: formResult, error: formError } = await supabase
        .from('forms')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          is_active: formData.isActive,
          settings: {},
          metadata: {}
        })
        .select()
        .single();

      if (formError) {
        throw new Error(`Failed to save form: ${formError.message}`);
      }

      const formId = formResult.id;

      // Save form fields
      if (formData.fields.length > 0) {
        const fieldsToInsert = formData.fields.map((field, index) => ({
          form_id: formId,
          field_type: field.type,
          label: field.label,
          placeholder: field.placeholder || null,
          is_required: field.required,
          field_order: index,
          options: field.options || [],
          validation_rules: {},
          settings: {
            maxRating: field.maxRating
          }
        }));

        const { error: fieldsError } = await supabase
          .from('form_fields')
          .insert(fieldsToInsert);

        if (fieldsError) {
          // Cleanup: delete the form if fields failed to save
          await supabase.from('forms').delete().eq('id', formId);
          throw new Error(`Failed to save form fields: ${fieldsError.message}`);
        }
      }

      // Save form theme with all customization settings
      const themeData = this.themeToDatabase(formData.theme);
      const { error: themeError } = await supabase
        .from('form_themes')
        .insert({
          form_id: formId,
          ...themeData
        });

      if (themeError) {
        console.warn('Failed to save theme:', themeError.message);
        // Don't fail the entire operation for theme errors
      }

      // Create a public link
      const slug = `form-${formId.slice(0, 8)}-${Date.now()}`;
      const { error: linkError } = await supabase
        .from('form_links')
        .insert({
          form_id: formId,
          link_type: 'public',
          slug: slug,
          is_active: true,
          settings: {}
        });

      if (linkError) {
        console.warn('Failed to create public link:', linkError.message);
      }

      // Create QR code entry
      const formUrl = `${window.location.origin}/form/${formId}`;
      const { error: qrError } = await supabase
        .from('form_qr_codes')
        .insert({
          form_id: formId,
          qr_data: formUrl,
          size: 256,
          format: 'png',
          foreground_color: '#1F2937',
          background_color: '#FFFFFF',
          is_active: true
        });

      if (qrError) {
        console.warn('Failed to create QR code entry:', qrError.message);
      }

      // Return the saved form data
      return {
        id: formId,
        title: formData.title,
        description: formData.description,
        isActive: formData.isActive,
        createdAt: formResult.created_at,
        responseCount: 0,
        publicUrl: `${window.location.origin}/form/${formId}`,
        qrCodeUrl: `${window.location.origin}/qr/${formId}`
      };

    } catch (error) {
      console.error('Error saving form:', error);
      throw error;
    }
  }

  static async updateForm(formId: string, formData: SaveFormData): Promise<SavedForm> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('User not authenticated. Please sign in to update forms.');
      }

      // Validate UUID format
      if (!this.isValidUUID(formId)) {
        throw new Error('Invalid form ID format');
      }

      // Verify the form belongs to the current user
      const { data: existingForm, error: formCheckError } = await supabase
        .from('forms')
        .select('id, user_id, created_at, response_count')
        .eq('id', formId)
        .eq('user_id', user.id)
        .single();

      if (formCheckError || !existingForm) {
        throw new Error('Form not found or you do not have permission to edit it');
      }

      // Update the form
      const { data: formResult, error: formError } = await supabase
        .from('forms')
        .update({
          title: formData.title,
          description: formData.description,
          is_active: formData.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', formId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (formError) {
        throw new Error(`Failed to update form: ${formError.message}`);
      }

      // Delete existing fields and insert new ones
      const { error: deleteFieldsError } = await supabase
        .from('form_fields')
        .delete()
        .eq('form_id', formId);

      if (deleteFieldsError) {
        throw new Error(`Failed to update form fields: ${deleteFieldsError.message}`);
      }

      // Insert new fields
      if (formData.fields.length > 0) {
        const fieldsToInsert = formData.fields.map((field, index) => ({
          form_id: formId,
          field_type: field.type,
          label: field.label,
          placeholder: field.placeholder || null,
          is_required: field.required,
          field_order: index,
          options: field.options || [],
          validation_rules: {},
          settings: {
            maxRating: field.maxRating
          }
        }));

        const { error: fieldsError } = await supabase
          .from('form_fields')
          .insert(fieldsToInsert);

        if (fieldsError) {
          throw new Error(`Failed to save form fields: ${fieldsError.message}`);
        }
      }

      // Update or insert theme with all customization settings
      const themeData = this.themeToDatabase(formData.theme);
      const { data: existingTheme, error: themeCheckError } = await supabase
        .from('form_themes')
        .select('id')
        .eq('form_id', formId)
        .single();

      if (existingTheme) {
        // Update existing theme
        const { error: themeError } = await supabase
          .from('form_themes')
          .update({
            ...themeData,
            updated_at: new Date().toISOString()
          })
          .eq('form_id', formId);

        if (themeError) {
          console.warn('Failed to update theme:', themeError.message);
        }
      } else {
        // Insert new theme
        const { error: themeError } = await supabase
          .from('form_themes')
          .insert({
            form_id: formId,
            ...themeData
          });

        if (themeError) {
          console.warn('Failed to save theme:', themeError.message);
        }
      }

      // Return the updated form data
      return {
        id: formId,
        title: formData.title,
        description: formData.description,
        isActive: formData.isActive,
        createdAt: existingForm.created_at,
        responseCount: existingForm.response_count,
        publicUrl: `${window.location.origin}/form/${formId}`,
        qrCodeUrl: `${window.location.origin}/qr/${formId}`
      };

    } catch (error) {
      console.error('Error updating form:', error);
      throw error;
    }
  }

  static async getForms(): Promise<FeedbackForm[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('User not authenticated. Please sign in to view forms.');
      }

      const { data: forms, error: formsError } = await supabase
        .from('forms')
        .select(`
          *,
          form_fields (*),
          form_themes (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (formsError) {
        throw new Error(`Failed to fetch forms: ${formsError.message}`);
      }

      return forms.map(form => ({
        id: form.id,
        title: form.title,
        description: form.description || '',
        fields: form.form_fields
          .sort((a: any, b: any) => a.field_order - b.field_order)
          .map((field: any) => ({
            id: field.id,
            type: field.field_type,
            label: field.label,
            required: field.is_required,
            placeholder: field.placeholder,
            options: field.options,
            maxRating: field.settings?.maxRating
          })),
        theme: form.form_themes?.[0] 
          ? this.databaseToTheme(form.form_themes[0])
          : DEFAULT_THEME,
        isActive: form.is_active,
        createdAt: new Date(form.created_at),
        responses: form.response_count
      }));

    } catch (error) {
      console.error('Error fetching forms:', error);
      throw error;
    }
  }

  static async getFormById(formId: string): Promise<FeedbackForm | null> {
    try {
      // Validate UUID format before making the database query
      if (!this.isValidUUID(formId)) {
        console.warn(`Invalid UUID format provided: ${formId}`);
        return null;
      }

      const { data: form, error: formError } = await supabase
        .from('forms')
        .select(`
          *,
          form_fields (*),
          form_themes (*)
        `)
        .eq('id', formId)
        .eq('is_active', true)
        .single();

      if (formError || !form) {
        return null;
      }

      return {
        id: form.id,
        title: form.title,
        description: form.description || '',
        fields: form.form_fields
          .sort((a: any, b: any) => a.field_order - b.field_order)
          .map((field: any) => ({
            id: field.id,
            type: field.field_type,
            label: field.label,
            required: field.is_required,
            placeholder: field.placeholder,
            options: field.options,
            maxRating: field.settings?.maxRating
          })),
        theme: form.form_themes?.[0] 
          ? this.databaseToTheme(form.form_themes[0])
          : DEFAULT_THEME,
        isActive: form.is_active,
        createdAt: new Date(form.created_at),
        responses: form.response_count
      };

    } catch (error) {
      console.error('Error fetching form:', error);
      return null;
    }
  }

  static async deleteForm(formId: string): Promise<void> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('User not authenticated. Please sign in to delete forms.');
      }

      // Validate UUID format
      if (!this.isValidUUID(formId)) {
        throw new Error('Invalid form ID format');
      }

      // Verify the form belongs to the current user before deleting
      const { data: form, error: formCheckError } = await supabase
        .from('forms')
        .select('id, user_id')
        .eq('id', formId)
        .eq('user_id', user.id)
        .single();

      if (formCheckError || !form) {
        throw new Error('Form not found or you do not have permission to delete it');
      }

      // Delete the form (cascade will handle related records)
      const { error: deleteError } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId)
        .eq('user_id', user.id);

      if (deleteError) {
        throw new Error(`Failed to delete form: ${deleteError.message}`);
      }

    } catch (error) {
      console.error('Error deleting form:', error);
      throw error;
    }
  }

  static async recordInvitation(
    formId: string, 
    invitationType: 'email' | 'sms' | 'public_link' | 'qr_code' | 'email_signature',
    recipientIdentifier?: string
  ): Promise<void> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('User not authenticated.');
      }

      // Validate UUID format
      if (!this.isValidUUID(formId)) {
        throw new Error('Invalid form ID format');
      }

      // Verify the form belongs to the current user
      const { data: form, error: formCheckError } = await supabase
        .from('forms')
        .select('id, user_id')
        .eq('id', formId)
        .eq('user_id', user.id)
        .single();

      if (formCheckError || !form) {
        throw new Error('Form not found or access denied');
      }

      // Record the invitation
      const { error: invitationError } = await supabase
        .from('form_invitations')
        .insert({
          form_id: formId,
          invitation_type: invitationType,
          recipient_identifier: recipientIdentifier || null,
          status: 'sent',
          metadata: {
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        });

      if (invitationError) {
        throw new Error(`Failed to record invitation: ${invitationError.message}`);
      }

    } catch (error) {
      console.error('Error recording invitation:', error);
      // Don't throw error to avoid breaking user flow
    }
  }

  static async submitResponse(formId: string, responseData: Record<string, any>, source: string = 'web') {
    try {
      // Combine all text responses for sentiment analysis
      const textResponses = Object.values(responseData)
        .filter(value => typeof value === 'string' && value.length > 10)
        .join(' ');

      // Perform sentiment analysis if there's enough text
      let sentimentAnalysis = null;
      let categorization = null;
      let overallRating = null;

      if (textResponses.length > 10) {
        sentimentAnalysis = SentimentService.analyzeSentiment(textResponses);
        categorization = SentimentService.categorizeFeedback(textResponses, sentimentAnalysis);
      }

      // Extract overall rating from rating fields
      const ratingValues = Object.values(responseData).filter(value => 
        typeof value === 'number' && value >= 1 && value <= 10
      );
      
      if (ratingValues.length > 0) {
        overallRating = ratingValues.reduce((sum, rating) => sum + Number(rating), 0) / ratingValues.length;
      }

      // Create the response record with sentiment analysis
      const { data: response, error: responseError } = await supabase
        .from('form_responses')
        .insert({
          form_id: formId,
          response_source: source,
          user_agent: navigator.userAgent,
          sentiment: sentimentAnalysis?.sentiment || null,
          overall_rating: overallRating,
          is_complete: true,
          metadata: {
            sentimentAnalysis,
            categorization,
            categories: categorization?.primaryCategory ? [categorization.primaryCategory, ...categorization.secondaryCategories] : [],
            urgency: categorization?.urgency || 'low',
            actionRequired: categorization?.actionRequired || false,
            suggestedActions: categorization?.suggestedActions || [],
            keywords: sentimentAnalysis?.keywords || [],
            emotions: sentimentAnalysis?.emotions || {}
          }
        })
        .select()
        .single();

      if (responseError) {
        throw new Error(`Failed to save response: ${responseError.message}`);
      }

      // Get form fields to map the response data
      const { data: fields, error: fieldsError } = await supabase
        .from('form_fields')
        .select('id, field_type')
        .eq('form_id', formId);

      if (fieldsError) {
        throw new Error(`Failed to fetch form fields: ${fieldsError.message}`);
      }

      // Save individual field responses
      const responseDataEntries = Object.entries(responseData).map(([fieldId, value]) => {
        const field = fields.find(f => f.id === fieldId);
        return {
          response_id: response.id,
          field_id: fieldId,
          field_value: typeof value === 'string' ? value : JSON.stringify(value),
          field_data: {
            field_type: field?.field_type,
            raw_value: value
          }
        };
      });

      if (responseDataEntries.length > 0) {
        const { error: dataError } = await supabase
          .from('form_response_data')
          .insert(responseDataEntries);

        if (dataError) {
          throw new Error(`Failed to save response data: ${dataError.message}`);
        }
      }

      return response.id;

    } catch (error) {
      console.error('Error submitting response:', error);
      throw error;
    }
  }

  static async getFormResponses(formId: string): Promise<EnrichedFormResponse[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('User not authenticated.');
      }

      // Verify form ownership
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('id, user_id')
        .eq('id', formId)
        .eq('user_id', user.id)
        .single();

      if (formError || !form) {
        throw new Error('Form not found or access denied');
      }

      // Get form fields to enrich response data
      const { data: formFields, error: fieldsError } = await supabase
        .from('form_fields')
        .select('id, label, field_type')
        .eq('form_id', formId);

      if (fieldsError) {
        throw new Error(`Failed to fetch form fields: ${fieldsError.message}`);
      }

      // Create a map for quick field lookup
      const fieldMap = new Map(formFields.map(field => [field.id, { label: field.label, type: field.field_type }]));

      // Get responses with analysis data - ONLY fetch non-deleted responses
      const { data: responses, error: responsesError } = await supabase
        .from('form_responses')
        .select(`
          *,
          form_response_data (*)
        `)
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false });

      if (responsesError) {
        throw new Error(`Failed to fetch responses: ${responsesError.message}`);
      }

      // Filter out responses that are marked as deleted in metadata
      const activeResponses = responses.filter(response => {
        // Check if the response is marked as deleted in metadata
        const isDeleted = response.metadata?.deleted === true;
        const isVisible = response.metadata?.isVisible !== false; // Default to visible if not specified
        
        return !isDeleted && isVisible;
      });

      // Enrich response data with field labels and types
      return activeResponses.map(response => ({
        ...response,
        form_response_data: response.form_response_data.map((data: any) => {
          const fieldInfo = fieldMap.get(data.field_id);
          return {
            ...data,
            field_label: fieldInfo?.label || 'Unknown Field',
            field_type: fieldInfo?.type || 'unknown'
          };
        })
      }));

    } catch (error) {
      console.error('Error fetching form responses:', error);
      throw error;
    }
  }

  static async updateFeedbackResponse(responseId: string, updateData: FeedbackUpdateData): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('User not authenticated.');
      }

      // Validate UUID format
      if (!this.isValidUUID(responseId)) {
        throw new Error('Invalid response ID format');
      }

      // Verify the response belongs to a form owned by the current user
      const { data: response, error: responseCheckError } = await supabase
        .from('form_responses')
        .select(`
          id,
          form_id,
          metadata,
          forms!inner(user_id)
        `)
        .eq('id', responseId)
        .single();

      if (responseCheckError || !response || response.forms.user_id !== user.id) {
        throw new Error('Response not found or access denied');
      }

      // Update the response metadata
      const updatedMetadata = {
        ...response.metadata,
        ...(updateData.urgency && { urgency: updateData.urgency }),
        ...(updateData.categories && { categories: updateData.categories }),
        ...(updateData.notes && { notes: updateData.notes }),
        ...(updateData.isVisible !== undefined && { isVisible: updateData.isVisible }),
        lastModified: new Date().toISOString(),
        modifiedBy: user.id
      };

      const { error: updateError } = await supabase
        .from('form_responses')
        .update({
          ...(updateData.sentiment && { sentiment: updateData.sentiment }),
          metadata: updatedMetadata
        })
        .eq('id', responseId);

      if (updateError) {
        throw new Error(`Failed to update response: ${updateError.message}`);
      }

    } catch (error) {
      console.error('Error updating feedback response:', error);
      throw error;
    }
  }

  static async deleteFeedbackResponse(responseId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('User not authenticated.');
      }

      // Validate UUID format
      if (!this.isValidUUID(responseId)) {
        throw new Error('Invalid response ID format');
      }

      // Verify the response belongs to a form owned by the current user
      const { data: response, error: responseCheckError } = await supabase
        .from('form_responses')
        .select(`
          id,
          form_id,
          forms!inner(user_id)
        `)
        .eq('id', responseId)
        .single();

      if (responseCheckError || !response || response.forms.user_id !== user.id) {
        throw new Error('Response not found or access denied');
      }

      // HARD DELETE: Actually remove the response from the database
      // This will cascade and delete related form_response_data records
      const { error: deleteError } = await supabase
        .from('form_responses')
        .delete()
        .eq('id', responseId);

      if (deleteError) {
        throw new Error(`Failed to delete response: ${deleteError.message}`);
      }

      // Also update the form's response count
      const { error: updateCountError } = await supabase.rpc('decrement_form_response_count', {
        form_id: response.form_id
      });

      if (updateCountError) {
        console.warn('Failed to update form response count:', updateCountError.message);
        // Don't fail the entire operation for this
      }

    } catch (error) {
      console.error('Error deleting feedback response:', error);
      throw error;
    }
  }

  static async getFormAnalytics(formId: string) {
    try {
      const responses = await this.getFormResponses(formId);
      return SentimentService.generateInsights(responses);
    } catch (error) {
      console.error('Error generating form analytics:', error);
      throw error;
    }
  }

  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('User not authenticated. Please sign in to view dashboard.');
      }

      // Get all forms for the user
      const { data: forms, error: formsError } = await supabase
        .from('forms')
        .select('id, title, is_active, response_count, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (formsError) {
        throw new Error(`Failed to fetch forms: ${formsError.message}`);
      }

      const formIds = forms.map(form => form.id);
      
      // Get all responses for user's forms
      let allResponses: any[] = [];
      let totalResponses = 0;
      let totalInvitations = 0;
      let avgSatisfaction = 0;
      let sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 };

      // Get invitation count from form_invitations table
      if (formIds.length > 0) {
        const { data: invitations, error: invitationsError } = await supabase
          .from('form_invitations')
          .select('id')
          .in('form_id', formIds);

        if (!invitationsError && invitations) {
          totalInvitations = invitations.length;
        }

        // Get only non-deleted responses
        const { data: responses, error: responsesError } = await supabase
          .from('form_responses')
          .select('*')
          .in('form_id', formIds)
          .order('submitted_at', { ascending: false });

        if (responsesError) {
          console.warn('Failed to fetch responses:', responsesError.message);
        } else {
          // Filter out deleted responses
          allResponses = (responses || []).filter(response => {
            const isDeleted = response.metadata?.deleted === true;
            const isVisible = response.metadata?.isVisible !== false;
            return !isDeleted && isVisible;
          });
          
          totalResponses = allResponses.length;

          // Calculate average satisfaction from overall_rating
          const ratingsWithValues = allResponses.filter(r => r.overall_rating !== null);
          if (ratingsWithValues.length > 0) {
            avgSatisfaction = ratingsWithValues.reduce((sum, r) => sum + r.overall_rating, 0) / ratingsWithValues.length;
          }

          // Calculate sentiment breakdown
          const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
          allResponses.forEach(response => {
            if (response.sentiment && sentimentCounts.hasOwnProperty(response.sentiment)) {
              sentimentCounts[response.sentiment as keyof typeof sentimentCounts]++;
            }
          });

          if (totalResponses > 0) {
            sentimentBreakdown = {
              positive: Math.round((sentimentCounts.positive / totalResponses) * 100),
              neutral: Math.round((sentimentCounts.neutral / totalResponses) * 100),
              negative: Math.round((sentimentCounts.negative / totalResponses) * 100)
            };
          }
        }
      }

      // Calculate active forms count
      const activeFormsCount = forms.filter(form => form.is_active).length;

      // Calculate response rate based on total invitations
      let responseRate = 0;
      if (totalInvitations > 0) {
        responseRate = Math.round((totalResponses / totalInvitations) * 100);
      } else if (totalResponses > 0) {
        // Fallback calculation if no invitations recorded yet
        responseRate = Math.min(100, Math.round((totalResponses / Math.max(forms.length * 10, 1)) * 100));
      }

      // Get recent forms for display
      const recentForms = forms.slice(0, 5).map(form => ({
        id: form.id,
        title: form.title,
        responses: form.response_count || 0,
        isActive: form.is_active,
        createdAt: new Date(form.created_at)
      }));

      // Calculate monthly trends (simplified - would need historical data)
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      
      const recentResponses = allResponses.filter(r => new Date(r.submitted_at) > lastMonth);
      const olderResponses = allResponses.filter(r => new Date(r.submitted_at) <= lastMonth);

      let responsesChange = 0;
      let satisfactionChange = 0;

      if (olderResponses.length > 0) {
        responsesChange = Math.round(((recentResponses.length - olderResponses.length) / olderResponses.length) * 100);
        
        const recentAvgSatisfaction = recentResponses
          .filter(r => r.overall_rating !== null)
          .reduce((sum, r, _, arr) => sum + r.overall_rating / arr.length, 0);
        
        const olderAvgSatisfaction = olderResponses
          .filter(r => r.overall_rating !== null)
          .reduce((sum, r, _, arr) => sum + r.overall_rating / arr.length, 0);

        if (olderAvgSatisfaction > 0) {
          satisfactionChange = Number(((recentAvgSatisfaction - olderAvgSatisfaction) / olderAvgSatisfaction * 100).toFixed(1));
        }
      } else if (recentResponses.length > 0) {
        responsesChange = 100; // All responses are new
      }

      return {
        totalResponses,
        totalInvitations,
        avgSatisfaction: Number(avgSatisfaction.toFixed(1)),
        activeFormsCount,
        responseRate,
        sentimentBreakdown,
        recentForms,
        monthlyTrend: {
          responsesChange,
          satisfactionChange
        }
      };

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values on error
      return {
        totalResponses: 0,
        totalInvitations: 0,
        avgSatisfaction: 0,
        activeFormsCount: 0,
        responseRate: 0,
        sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
        recentForms: [],
        monthlyTrend: {
          responsesChange: 0,
          satisfactionChange: 0
        }
      };
    }
  }
}