import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Send, CheckCircle } from 'lucide-react';
import { FeedbackForm as FeedbackFormType } from '../context/FeedbackContext';
import { FormService } from '../services/formService';
import { useForm } from 'react-hook-form';

const FeedbackForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<FeedbackFormType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

  useEffect(() => {
    if (id) {
      loadForm(id);
    }
  }, [id]);

  const loadForm = async (formId: string) => {
    try {
      setIsLoading(true);
      const formData = await FormService.getFormById(formId);
      setForm(formData);
    } catch (error) {
      console.error('Failed to load form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!form) return;

    try {
      setIsSubmitting(true);
      await FormService.submitResponse(form.id, data, 'web');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingField: React.FC<{ field: any; fieldName: string; theme: any }> = ({ field, fieldName, theme }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    const handleRatingClick = (value: number) => {
      setRating(value);
      setValue(fieldName, value);
    };

    const maxRating = field.maxRating || 5;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-1">
          {Array.from({ length: maxRating }).map((_, i) => {
            const starValue = i + 1;
            const isActive = starValue <= (hoverRating || rating);
            
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleRatingClick(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                className={`transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full p-1 ${
                  isActive ? 'focus:ring-yellow-500' : 'focus:ring-gray-300'
                }`}
                style={{
                  color: isActive ? '#F59E0B' : '#D1D5DB'
                }}
              >
                <Star
                  className={`w-8 h-8 transition-all duration-200 ${
                    isActive 
                      ? 'fill-current text-yellow-400 drop-shadow-sm' 
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                />
              </button>
            );
          })}
        </div>
        
        {/* Fixed Rating Labels - Always positioned correctly */}
        <div className="relative">
          <div className="flex justify-between items-center px-1">
            {/* Poor - Always under first star */}
            <div className="flex flex-col items-center" style={{ width: '32px' }}>
              <span className="text-xs text-gray-500 text-center" style={{ fontFamily: theme.fontFamily }}>
                Poor
              </span>
            </div>
            
            {/* Average - Always under middle star (3rd for 5-star, proportional for others) */}
            {maxRating >= 3 && (
              <div className="flex flex-col items-center" style={{ width: '32px' }}>
                <span className="text-xs text-gray-500 text-center" style={{ fontFamily: theme.fontFamily }}>
                  Average
                </span>
              </div>
            )}
            
            {/* Excellent - Always under last star */}
            <div className="flex flex-col items-center" style={{ width: '32px' }}>
              <span className="text-xs text-gray-500 text-center" style={{ fontFamily: theme.fontFamily }}>
                Excellent
              </span>
            </div>
          </div>
        </div>
        
        {/* Selected Rating Display */}
        {rating > 0 && (
          <div className="text-sm text-center">
            <span 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
              style={{ fontFamily: theme.fontFamily }}
            >
              <Star className="w-4 h-4 mr-1 fill-current" />
              {rating} out of {maxRating}
            </span>
          </div>
        )}
        
        {/* Hidden input for form submission */}
        <input
          type="hidden"
          {...register(fieldName, { required: field.required })}
          value={rating}
        />
      </div>
    );
  };

  // Convert Tailwind gradient directions to CSS linear-gradient directions
  const convertTailwindDirection = (tailwindDirection: string): string => {
    const directionMap: Record<string, string> = {
      'to-r': 'to right',
      'to-l': 'to left',
      'to-b': 'to bottom',
      'to-t': 'to top',
      'to-br': 'to bottom right',
      'to-bl': 'to bottom left',
      'to-tr': 'to top right',
      'to-tl': 'to top left'
    };
    
    return directionMap[tailwindDirection] || 'to bottom right';
  };

  const getBackgroundStyle = () => {
    if (!form) return {};
    
    if (form.theme.backgroundType === 'gradient') {
      const cssDirection = convertTailwindDirection(form.theme.gradientDirection || 'to-br');
      const colors = form.theme.gradientColors || ['#3B82F6', '#8B5CF6'];
      
      return {
        background: `linear-gradient(${cssDirection}, ${colors.join(', ')})`
      };
    } else if (form.theme.backgroundType === 'image' && form.theme.backgroundImage) {
      return {
        backgroundImage: `url(${form.theme.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    } else {
      return {
        backgroundColor: form.theme.backgroundColor || '#FFFFFF'
      };
    }
  };

  const getLayoutClasses = () => {
    if (!form) return 'max-w-2xl mx-auto';
    
    switch (form.theme.layout) {
      case 'left-aligned':
        return 'max-w-4xl mr-auto ml-8';
      case 'full-width':
        return 'w-full';
      case 'card':
        return 'max-w-lg mx-auto shadow-2xl';
      case 'minimal':
        return 'max-w-xl mx-auto';
      default:
        return 'max-w-2xl mx-auto';
    }
  };

  const getSpacingClasses = () => {
    if (!form) return 'space-y-6';
    
    switch (form.theme.spacing) {
      case 'compact':
        return 'space-y-3';
      case 'relaxed':
        return 'space-y-8';
      default:
        return 'space-y-6';
    }
  };

  const getAnimationClasses = () => {
    if (!form) return '';
    
    switch (form.theme.animation) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide':
        return 'animate-slide-up';
      case 'bounce':
        return 'animate-bounce-in';
      default:
        return '';
    }
  };

  const getLogoPositionClasses = () => {
    if (!form) return 'justify-center';
    
    switch (form.theme.logoPosition) {
      case 'top-left':
        return 'justify-start';
      case 'top-right':
        return 'justify-end';
      default:
        return 'justify-center';
    }
  };

  const getLogoSizeClasses = () => {
    if (!form) return 'h-12';
    
    switch (form.theme.logoSize) {
      case 'small':
        return 'h-8';
      case 'large':
        return 'h-20';
      default:
        return 'h-12';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600">The feedback form you're looking for doesn't exist or is no longer active.</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We appreciate your time and input.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Another Response
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-12 px-4"
      style={getBackgroundStyle()}
    >
      <div className={`${getLayoutClasses()} ${getAnimationClasses()}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            form.theme.layout === 'card' 
              ? 'bg-white rounded-xl shadow-2xl overflow-hidden' 
              : form.theme.layout === 'minimal'
              ? ''
              : 'bg-white rounded-xl shadow-lg overflow-hidden'
          }`}
          style={{
            backgroundColor: form.theme.layout === 'minimal' ? 'transparent' : form.theme.backgroundColor,
            fontFamily: form.theme.fontFamily,
            borderRadius: form.theme.borderRadius
          }}
        >
          {/* Logo */}
          {form.theme.logo && (
            <div className={`flex ${getLogoPositionClasses()} p-6 pb-0`}>
              <img 
                src={form.theme.logo} 
                alt="Logo" 
                className={`${getLogoSizeClasses()} object-contain`}
              />
            </div>
          )}

          <div className="p-8">
            <div className="mb-8">
              <h1 
                className="text-3xl font-bold mb-4"
                style={{ 
                  color: form.theme.textColor,
                  fontFamily: form.theme.fontFamily 
                }}
              >
                {form.title}
              </h1>
              <p 
                className="text-lg opacity-80"
                style={{ 
                  color: form.theme.textColor,
                  fontFamily: form.theme.fontFamily 
                }}
              >
                {form.description}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={getSpacingClasses()}>
              {form.fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <label 
                    className="block text-sm font-medium"
                    style={{ 
                      color: form.theme.textColor,
                      fontFamily: form.theme.fontFamily 
                    }}
                  >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.type === 'text' || field.type === 'email' || field.type === 'phone' ? (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      {...register(field.id, { required: field.required })}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      style={{ 
                        borderRadius: form.theme.borderRadius,
                        fontFamily: form.theme.fontFamily 
                      }}
                    />
                  ) : field.type === 'textarea' ? (
                    <textarea
                      placeholder={field.placeholder}
                      rows={4}
                      {...register(field.id, { required: field.required })}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      style={{ 
                        borderRadius: form.theme.borderRadius,
                        fontFamily: form.theme.fontFamily 
                      }}
                    />
                  ) : field.type === 'rating' ? (
                    <RatingField field={field} fieldName={field.id} theme={form.theme} />
                  ) : field.type === 'multiple-choice' ? (
                    <div className="space-y-3">
                      {field.options?.map((option, i) => (
                        <label key={i} className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="radio"
                            value={option}
                            {...register(field.id, { required: field.required })}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span 
                            className="group-hover:text-blue-600 transition-colors"
                            style={{ 
                              color: form.theme.textColor,
                              fontFamily: form.theme.fontFamily 
                            }}
                          >
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : null}

                  {errors[field.id] && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm flex items-center space-x-1"
                    >
                      <span>⚠️</span>
                      <span>This field is required</span>
                    </motion.p>
                  )}
                </motion.div>
              ))}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: form.fields.length * 0.1 + 0.2 }}
                className={`w-full py-4 text-white font-medium rounded-lg transition-all flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
                style={{ 
                  backgroundColor: form.theme.primaryColor,
                  borderRadius: form.theme.borderRadius,
                  fontFamily: form.theme.fontFamily 
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Footer */}
          {form.theme.footer?.enabled && (
            <div 
              className="px-8 py-6 border-t border-gray-200"
              style={{ 
                backgroundColor: form.theme.layout === 'minimal' ? 'rgba(255, 255, 255, 0.9)' : undefined 
              }}
            >
              <div className="text-center">
                {form.theme.footer.text && (
                  <p 
                    className="text-sm mb-3"
                    style={{ 
                      color: form.theme.textColor,
                      fontFamily: form.theme.fontFamily 
                    }}
                  >
                    {form.theme.footer.text}
                  </p>
                )}
                {form.theme.footer.links && form.theme.footer.links.length > 0 && (
                  <div className="flex justify-center space-x-6">
                    {form.theme.footer.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline transition-colors"
                        style={{ 
                          color: form.theme.primaryColor,
                          fontFamily: form.theme.fontFamily 
                        }}
                      >
                        {link.text}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FeedbackForm;