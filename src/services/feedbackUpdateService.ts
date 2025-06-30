import { supabase } from '../lib/supabase';
import { SentimentService } from './sentimentService';

export interface FeedbackUpdateData {
  id: string;
  comment?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  categories?: string[];
  rating?: number;
  notes?: string;
  isVisible?: boolean;
  metadata?: Record<string, any>;
}

export interface FeedbackUpdateResult {
  success: boolean;
  data?: any;
  error?: string;
  validationErrors?: string[];
  timestamp: string;
  version?: number;
}

export interface FeedbackValidationRules {
  comment?: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
  rating?: {
    min?: number;
    max?: number;
    required?: boolean;
  };
  categories?: {
    maxCount?: number;
    allowedCategories?: string[];
  };
  notes?: {
    maxLength?: number;
  };
}

export class FeedbackUpdateService {
  private static readonly DEFAULT_VALIDATION_RULES: FeedbackValidationRules = {
    comment: {
      minLength: 1,
      maxLength: 5000,
      required: false
    },
    rating: {
      min: 1,
      max: 10,
      required: false
    },
    categories: {
      maxCount: 10,
      allowedCategories: [
        'User Experience', 'Performance', 'Customer Service', 'Product Quality',
        'Pricing', 'Technical Issues', 'Delivery/Shipping', 'Communication',
        'Accessibility', 'Security', 'Feature Request', 'Bug Report'
      ]
    },
    notes: {
      maxLength: 2000
    }
  };

  private static readonly RETRY_ATTEMPTS = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Main function to update feedback data with comprehensive validation and error handling
   */
  static async updateFeedback(
    updateData: FeedbackUpdateData,
    validationRules: FeedbackValidationRules = this.DEFAULT_VALIDATION_RULES
  ): Promise<FeedbackUpdateResult> {
    const timestamp = new Date().toISOString();
    
    try {
      // Step 1: Validate input data
      const validationResult = this.validateFeedbackData(updateData, validationRules);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: validationResult.errors,
          timestamp
        };
      }

      // Step 2: Check user authentication and permissions
      const authResult = await this.validateUserPermissions(updateData.id);
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error || 'Authentication failed',
          timestamp
        };
      }

      // Step 3: Get current feedback data for optimistic locking
      const currentData = await this.getCurrentFeedbackData(updateData.id);
      if (!currentData.success) {
        return {
          success: false,
          error: currentData.error || 'Failed to retrieve current feedback data',
          timestamp
        };
      }

      // Step 4: Prepare update payload with enhanced metadata
      const updatePayload = await this.prepareUpdatePayload(
        updateData, 
        currentData.data,
        authResult.userId!
      );

      // Step 5: Perform database update with retry logic
      const dbResult = await this.updateFeedbackInDatabase(
        updateData.id, 
        updatePayload,
        currentData.data.version
      );

      if (!dbResult.success) {
        return {
          success: false,
          error: dbResult.error || 'Database update failed',
          timestamp
        };
      }

      // Step 6: Invalidate related caches and trigger updates
      await this.invalidateRelatedCaches(updateData.id);

      // Step 7: Return success result with updated data
      return {
        success: true,
        data: {
          ...updateData,
          ...dbResult.data,
          lastModified: timestamp,
          version: dbResult.data.version
        },
        timestamp,
        version: dbResult.data.version
      };

    } catch (error) {
      console.error('Unexpected error in updateFeedback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        timestamp
      };
    }
  }

  /**
   * Delete feedback with proper validation and error handling
   */
  static async deleteFeedback(feedbackId: string): Promise<FeedbackUpdateResult> {
    const timestamp = new Date().toISOString();
    
    try {
      // Step 1: Validate feedback ID
      if (!feedbackId || typeof feedbackId !== 'string' || !this.isValidUUID(feedbackId)) {
        return {
          success: false,
          error: 'Invalid feedback ID format',
          timestamp
        };
      }

      // Step 2: Check user authentication and permissions
      const authResult = await this.validateUserPermissions(feedbackId);
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error || 'Authentication failed',
          timestamp
        };
      }

      // Step 3: Verify feedback exists
      const currentData = await this.getCurrentFeedbackData(feedbackId);
      if (!currentData.success) {
        return {
          success: false,
          error: 'Feedback not found or already deleted',
          timestamp
        };
      }

      // Step 4: Perform deletion with retry logic
      const deleteResult = await this.deleteFeedbackFromDatabase(feedbackId);
      if (!deleteResult.success) {
        return {
          success: false,
          error: deleteResult.error || 'Failed to delete feedback',
          timestamp
        };
      }

      // Step 5: Invalidate related caches
      await this.invalidateRelatedCaches(feedbackId);

      return {
        success: true,
        data: { id: feedbackId, deleted: true },
        timestamp
      };

    } catch (error) {
      console.error('Unexpected error in deleteFeedback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        timestamp
      };
    }
  }

  /**
   * Delete feedback from database with retry logic
   */
  private static async deleteFeedbackFromDatabase(feedbackId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.RETRY_ATTEMPTS; attempt++) {
      try {
        // Delete the feedback (cascade will handle related records)
        const { error: deleteError } = await supabase
          .from('form_responses')
          .delete()
          .eq('id', feedbackId);

        if (deleteError) {
          throw new Error(`Database deletion failed: ${deleteError.message}`);
        }

        return { success: true };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.RETRY_ATTEMPTS) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
        }
      }
    }

    return {
      success: false,
      error: `Failed after ${this.RETRY_ATTEMPTS} attempts: ${lastError?.message}`
    };
  }

  /**
   * Validate feedback data against provided rules
   */
  private static validateFeedbackData(
    data: FeedbackUpdateData, 
    rules: FeedbackValidationRules
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate ID
    if (!data.id || typeof data.id !== 'string' || !this.isValidUUID(data.id)) {
      errors.push('Invalid feedback ID format');
    }

    // Validate comment
    if (data.comment !== undefined) {
      if (rules.comment?.required && (!data.comment || data.comment.trim().length === 0)) {
        errors.push('Comment is required');
      }
      if (data.comment && rules.comment?.minLength && data.comment.length < rules.comment.minLength) {
        errors.push(`Comment must be at least ${rules.comment.minLength} characters long`);
      }
      if (data.comment && rules.comment?.maxLength && data.comment.length > rules.comment.maxLength) {
        errors.push(`Comment must not exceed ${rules.comment.maxLength} characters`);
      }
    }

    // Validate rating
    if (data.rating !== undefined) {
      if (rules.rating?.required && (data.rating === null || data.rating === undefined)) {
        errors.push('Rating is required');
      }
      if (data.rating !== null && data.rating !== undefined) {
        if (rules.rating?.min && data.rating < rules.rating.min) {
          errors.push(`Rating must be at least ${rules.rating.min}`);
        }
        if (rules.rating?.max && data.rating > rules.rating.max) {
          errors.push(`Rating must not exceed ${rules.rating.max}`);
        }
        if (!Number.isInteger(data.rating)) {
          errors.push('Rating must be a whole number');
        }
      }
    }

    // Validate sentiment
    if (data.sentiment !== undefined) {
      const validSentiments = ['positive', 'neutral', 'negative'];
      if (!validSentiments.includes(data.sentiment)) {
        errors.push('Invalid sentiment value');
      }
    }

    // Validate urgency
    if (data.urgency !== undefined) {
      const validUrgencies = ['low', 'medium', 'high', 'critical'];
      if (!validUrgencies.includes(data.urgency)) {
        errors.push('Invalid urgency value');
      }
    }

    // Validate categories
    if (data.categories !== undefined) {
      if (!Array.isArray(data.categories)) {
        errors.push('Categories must be an array');
      } else {
        if (rules.categories?.maxCount && data.categories.length > rules.categories.maxCount) {
          errors.push(`Cannot have more than ${rules.categories.maxCount} categories`);
        }
        
        // Check for invalid categories
        if (rules.categories?.allowedCategories) {
          const invalidCategories = data.categories.filter(
            cat => !rules.categories!.allowedCategories!.includes(cat)
          );
          if (invalidCategories.length > 0) {
            errors.push(`Invalid categories: ${invalidCategories.join(', ')}`);
          }
        }

        // Check for duplicates
        const uniqueCategories = new Set(data.categories);
        if (uniqueCategories.size !== data.categories.length) {
          errors.push('Duplicate categories are not allowed');
        }
      }
    }

    // Validate notes
    if (data.notes !== undefined && rules.notes?.maxLength) {
      if (data.notes.length > rules.notes.maxLength) {
        errors.push(`Notes must not exceed ${rules.notes.maxLength} characters`);
      }
    }

    // Validate visibility
    if (data.isVisible !== undefined && typeof data.isVisible !== 'boolean') {
      errors.push('Visibility must be a boolean value');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate user permissions for updating feedback
   */
  private static async validateUserPermissions(feedbackId: string): Promise<{
    success: boolean;
    error?: string;
    userId?: string;
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      // Check if the feedback belongs to a form owned by the current user
      const { data: feedback, error: feedbackError } = await supabase
        .from('form_responses')
        .select(`
          id,
          form_id,
          forms!inner(user_id)
        `)
        .eq('id', feedbackId)
        .single();

      if (feedbackError || !feedback) {
        return {
          success: false,
          error: 'Feedback not found'
        };
      }

      if (feedback.forms.user_id !== user.id) {
        return {
          success: false,
          error: 'Insufficient permissions to update this feedback'
        };
      }

      return {
        success: true,
        userId: user.id
      };

    } catch (error) {
      return {
        success: false,
        error: 'Permission validation failed'
      };
    }
  }

  /**
   * Get current feedback data for optimistic locking
   */
  private static async getCurrentFeedbackData(feedbackId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const { data: feedback, error } = await supabase
        .from('form_responses')
        .select(`
          *,
          form_response_data (*)
        `)
        .eq('id', feedbackId)
        .single();

      if (error || !feedback) {
        return {
          success: false,
          error: 'Failed to retrieve current feedback data'
        };
      }

      // Add version for optimistic locking (using updated_at timestamp)
      const version = new Date(feedback.submitted_at).getTime();

      return {
        success: true,
        data: {
          ...feedback,
          version
        }
      };

    } catch (error) {
      return {
        success: false,
        error: 'Database query failed'
      };
    }
  }

  /**
   * Prepare update payload with enhanced metadata
   */
  private static async prepareUpdatePayload(
    updateData: FeedbackUpdateData,
    currentData: any,
    userId: string
  ): Promise<any> {
    const timestamp = new Date().toISOString();
    
    // Merge existing metadata with new data
    const existingMetadata = currentData.metadata || {};
    const newMetadata = {
      ...existingMetadata,
      ...updateData.metadata,
      lastModified: timestamp,
      modifiedBy: userId,
      modificationHistory: [
        ...(existingMetadata.modificationHistory || []),
        {
          timestamp,
          userId,
          changes: this.getChangedFields(updateData, currentData)
        }
      ].slice(-10) // Keep only last 10 modifications
    };

    // Re-analyze sentiment if comment was changed
    if (updateData.comment && updateData.comment !== currentData.comment) {
      const sentimentAnalysis = SentimentService.analyzeSentiment(updateData.comment);
      newMetadata.sentimentAnalysis = sentimentAnalysis;
      
      // Update sentiment if not explicitly provided
      if (updateData.sentiment === undefined) {
        updateData.sentiment = sentimentAnalysis.sentiment;
      }
    }

    // Add categories to metadata
    if (updateData.categories) {
      newMetadata.categories = updateData.categories;
    }

    // Add urgency and notes to metadata
    if (updateData.urgency) {
      newMetadata.urgency = updateData.urgency;
    }
    if (updateData.notes !== undefined) {
      newMetadata.notes = updateData.notes;
    }
    if (updateData.isVisible !== undefined) {
      newMetadata.isVisible = updateData.isVisible;
    }

    return {
      ...(updateData.sentiment && { sentiment: updateData.sentiment }),
      ...(updateData.rating && { overall_rating: updateData.rating }),
      metadata: newMetadata
    };
  }

  /**
   * Update feedback in database with retry logic and optimistic locking
   */
  private static async updateFeedbackInDatabase(
    feedbackId: string,
    updatePayload: any,
    expectedVersion: number
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.RETRY_ATTEMPTS; attempt++) {
      try {
        // Check version for optimistic locking
        const { data: currentFeedback, error: versionError } = await supabase
          .from('form_responses')
          .select('submitted_at')
          .eq('id', feedbackId)
          .single();

        if (versionError || !currentFeedback) {
          return {
            success: false,
            error: 'Feedback not found or has been deleted'
          };
        }

        const currentVersion = new Date(currentFeedback.submitted_at).getTime();
        if (currentVersion !== expectedVersion) {
          return {
            success: false,
            error: 'Feedback has been modified by another user. Please refresh and try again.'
          };
        }

        // Perform the update
        const { data: updatedFeedback, error: updateError } = await supabase
          .from('form_responses')
          .update(updatePayload)
          .eq('id', feedbackId)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Database update failed: ${updateError.message}`);
        }

        return {
          success: true,
          data: {
            ...updatedFeedback,
            version: new Date(updatedFeedback.submitted_at).getTime()
          }
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.RETRY_ATTEMPTS) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
        }
      }
    }

    return {
      success: false,
      error: `Failed after ${this.RETRY_ATTEMPTS} attempts: ${lastError?.message}`
    };
  }

  /**
   * Invalidate related caches and trigger updates
   */
  private static async invalidateRelatedCaches(feedbackId: string): Promise<void> {
    try {
      // In a real application, you would invalidate caches here
      // For now, we'll just log the action
      console.log(`Invalidating caches for feedback: ${feedbackId}`);
      
      // You could also trigger real-time updates to other connected clients
      // using Supabase real-time subscriptions or WebSocket connections
      
    } catch (error) {
      console.warn('Failed to invalidate caches:', error);
      // Don't fail the entire operation for cache invalidation errors
    }
  }

  /**
   * Get changed fields for audit trail
   */
  private static getChangedFields(updateData: FeedbackUpdateData, currentData: any): Record<string, { from: any; to: any }> {
    const changes: Record<string, { from: any; to: any }> = {};

    if (updateData.comment !== undefined && updateData.comment !== currentData.comment) {
      changes.comment = { from: currentData.comment, to: updateData.comment };
    }
    if (updateData.sentiment !== undefined && updateData.sentiment !== currentData.sentiment) {
      changes.sentiment = { from: currentData.sentiment, to: updateData.sentiment };
    }
    if (updateData.rating !== undefined && updateData.rating !== currentData.overall_rating) {
      changes.rating = { from: currentData.overall_rating, to: updateData.rating };
    }
    if (updateData.urgency !== undefined && updateData.urgency !== currentData.metadata?.urgency) {
      changes.urgency = { from: currentData.metadata?.urgency, to: updateData.urgency };
    }
    if (updateData.categories !== undefined) {
      const currentCategories = currentData.metadata?.categories || [];
      if (JSON.stringify(currentCategories) !== JSON.stringify(updateData.categories)) {
        changes.categories = { from: currentCategories, to: updateData.categories };
      }
    }
    if (updateData.notes !== undefined && updateData.notes !== currentData.metadata?.notes) {
      changes.notes = { from: currentData.metadata?.notes, to: updateData.notes };
    }
    if (updateData.isVisible !== undefined && updateData.isVisible !== currentData.metadata?.isVisible) {
      changes.isVisible = { from: currentData.metadata?.isVisible, to: updateData.isVisible };
    }

    return changes;
  }

  /**
   * Validate UUID format
   */
  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Batch update multiple feedback items
   */
  static async batchUpdateFeedback(
    updates: FeedbackUpdateData[],
    validationRules?: FeedbackValidationRules
  ): Promise<{ success: boolean; results: FeedbackUpdateResult[]; summary: { successful: number; failed: number } }> {
    const results: FeedbackUpdateResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const updateData of updates) {
      const result = await this.updateFeedback(updateData, validationRules);
      results.push(result);
      
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    }

    return {
      success: failed === 0,
      results,
      summary: { successful, failed }
    };
  }
}