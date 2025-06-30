import { useState, useCallback } from 'react';
import { FeedbackUpdateService, FeedbackUpdateData, FeedbackUpdateResult } from '../services/feedbackUpdateService';

export interface UseFeedbackUpdateOptions {
  onSuccess?: (result: FeedbackUpdateResult) => void;
  onError?: (error: string) => void;
  optimisticUpdate?: boolean;
}

export interface UseFeedbackUpdateReturn {
  updateFeedback: (data: FeedbackUpdateData) => Promise<FeedbackUpdateResult>;
  deleteFeedback: (feedbackId: string) => Promise<FeedbackUpdateResult>;
  isUpdating: boolean;
  isDeleting: boolean;
  lastResult: FeedbackUpdateResult | null;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for updating and deleting feedback with optimistic updates and error handling
 */
export const useFeedbackUpdate = (options: UseFeedbackUpdateOptions = {}): UseFeedbackUpdateReturn => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastResult, setLastResult] = useState<FeedbackUpdateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateFeedback = useCallback(async (data: FeedbackUpdateData): Promise<FeedbackUpdateResult> => {
    setIsUpdating(true);
    setError(null);

    try {
      // Perform optimistic update if enabled
      if (options.optimisticUpdate && options.onSuccess) {
        const optimisticResult: FeedbackUpdateResult = {
          success: true,
          data,
          timestamp: new Date().toISOString()
        };
        options.onSuccess(optimisticResult);
      }

      // Perform actual update
      const result = await FeedbackUpdateService.updateFeedback(data);
      setLastResult(result);

      if (result.success) {
        if (options.onSuccess && !options.optimisticUpdate) {
          options.onSuccess(result);
        }
      } else {
        const errorMessage = result.error || 'Update failed';
        setError(errorMessage);
        if (options.onError) {
          options.onError(errorMessage);
        }
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      setLastResult({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      if (options.onError) {
        options.onError(errorMessage);
      }

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      };

    } finally {
      setIsUpdating(false);
    }
  }, [options]);

  const deleteFeedback = useCallback(async (feedbackId: string): Promise<FeedbackUpdateResult> => {
    setIsDeleting(true);
    setError(null);

    try {
      // Perform actual deletion
      const result = await FeedbackUpdateService.deleteFeedback(feedbackId);
      setLastResult(result);

      if (result.success) {
        if (options.onSuccess) {
          options.onSuccess(result);
        }
      } else {
        const errorMessage = result.error || 'Delete failed';
        setError(errorMessage);
        if (options.onError) {
          options.onError(errorMessage);
        }
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      setLastResult({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      if (options.onError) {
        options.onError(errorMessage);
      }

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      };

    } finally {
      setIsDeleting(false);
    }
  }, [options]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateFeedback,
    deleteFeedback,
    isUpdating,
    isDeleting,
    lastResult,
    error,
    clearError
  };
};