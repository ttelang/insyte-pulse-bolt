import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react';
import { FeedbackForm, FormField } from '../context/FeedbackContext';

interface FormPreviewProps {
  form: FeedbackForm;
  theme: any;
}

const FormPreview: React.FC<FormPreviewProps> = ({ form, theme }) => {
  // Get the CSS font family name for the selected font with proper fallbacks
  const getFontFamily = () => {
    const fontMap: Record<string, string> = {
      'Inter': "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      'Roboto': "'Roboto', Arial, sans-serif",
      'Open Sans': "'Open Sans', Helvetica, sans-serif",
      'Poppins': "'Poppins', system-ui, sans-serif",
      'Playfair Display': "'Playfair Display', Georgia, serif",
      'Merriweather': "'Merriweather', 'Times New Roman', serif",
      'Montserrat': "'Montserrat', Verdana, sans-serif",
      'Source Sans Pro': "'Source Sans Pro', Tahoma, sans-serif",
      'Lora': "'Lora', 'Book Antiqua', serif",
      'Nunito': "'Nunito', 'Trebuchet MS', sans-serif"
    };
    
    return fontMap[theme.fontFamily] || "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  };

  // Get the CSS class for the selected font
  const getFontClass = () => {
    const fontClassMap: Record<string, string> = {
      'Inter': 'apply-font-inter',
      'Roboto': 'apply-font-roboto',
      'Open Sans': 'apply-font-open-sans',
      'Poppins': 'apply-font-poppins',
      'Playfair Display': 'apply-font-playfair',
      'Merriweather': 'apply-font-merriweather',
      'Montserrat': 'apply-font-montserrat',
      'Source Sans Pro': 'apply-font-source-sans',
      'Lora': 'apply-font-lora',
      'Nunito': 'apply-font-nunito'
    };
    
    return fontClassMap[theme.fontFamily] || 'apply-font-inter';
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
    console.log('Theme background type:', theme.backgroundType);
    console.log('Theme gradient colors:', theme.gradientColors);
    console.log('Theme gradient direction:', theme.gradientDirection);
    
    if (theme.backgroundType === 'gradient') {
      const cssDirection = convertTailwindDirection(theme.gradientDirection || 'to-br');
      const colors = theme.gradientColors || ['#3B82F6', '#8B5CF6'];
      
      const gradientStyle = `linear-gradient(${cssDirection}, ${colors.join(', ')})`;
      console.log('Generated gradient:', gradientStyle);
      
      return {
        background: gradientStyle
      };
    } else if (theme.backgroundType === 'image' && theme.backgroundImage) {
      return {
        backgroundImage: `url(${theme.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    } else {
      return {
        backgroundColor: theme.backgroundColor || '#FFFFFF'
      };
    }
  };

  const getLayoutClasses = () => {
    switch (theme.layout) {
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
    switch (theme.spacing) {
      case 'compact':
        return 'space-y-3';
      case 'relaxed':
        return 'space-y-8';
      default:
        return 'space-y-6';
    }
  };

  const getAnimationClasses = () => {
    switch (theme.animation) {
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
    switch (theme.logoPosition) {
      case 'top-left':
        return 'justify-start';
      case 'top-right':
        return 'justify-end';
      default:
        return 'justify-center';
    }
  };

  const getLogoSizeClasses = () => {
    switch (theme.logoSize) {
      case 'small':
        return 'h-8';
      case 'large':
        return 'h-20';
      default:
        return 'h-12';
    }
  };

  const RatingPreview: React.FC<{ field: FormField }> = ({ field }) => {
    const [previewRating, setPreviewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const maxRating = field.maxRating || 5;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-1">
          {Array.from({ length: maxRating }).map((_, i) => {
            const starValue = i + 1;
            const isActive = starValue <= (hoverRating || previewRating);
            
            return (
              <button
                key={i}
                type="button"
                onClick={() => setPreviewRating(starValue)}
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
              <span className="text-xs text-gray-500 text-center">Poor</span>
            </div>
            
            {/* Average - Always under middle star (3rd for 5-star, proportional for others) */}
            {maxRating >= 3 && (
              <div className="flex flex-col items-center" style={{ width: '32px' }}>
                <span className="text-xs text-gray-500 text-center">Average</span>
              </div>
            )}
            
            {/* Excellent - Always under last star */}
            <div className="flex flex-col items-center" style={{ width: '32px' }}>
              <span className="text-xs text-gray-500 text-center">Excellent</span>
            </div>
          </div>
        </div>
        
        {/* Selected Rating Display */}
        {previewRating > 0 && (
          <div className="text-sm text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <Star className="w-4 h-4 mr-1 fill-current" />
              {previewRating} out of {maxRating}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderField = (field: FormField) => {
    const fieldProps = {
      style: { 
        borderRadius: theme.borderRadius
      },
      className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            {...fieldProps}
          />
        );
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            rows={4}
            {...fieldProps}
            className={`${fieldProps.className} resize-none`}
          />
        );
      case 'rating':
        return <RatingPreview field={field} />;
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <label key={i} className="flex items-center space-x-2 cursor-pointer group">
                <input type="radio" name={field.id} className="w-4 h-4 text-blue-600" />
                <span className="group-hover:text-blue-600 transition-colors" style={{ color: theme.textColor }}>
                  {option}
                </span>
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const backgroundStyle = getBackgroundStyle();
  const fontFamily = getFontFamily();
  const fontClass = getFontClass();

  return (
    <div 
      className={`min-h-screen py-12 px-4 ${fontClass}`}
      style={backgroundStyle}
    >
      <div className={`${getLayoutClasses()} ${getAnimationClasses()}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            theme.layout === 'card' 
              ? 'bg-white rounded-xl shadow-2xl overflow-hidden' 
              : theme.layout === 'minimal'
              ? ''
              : 'bg-white rounded-xl shadow-lg overflow-hidden'
          }`}
          style={{
            backgroundColor: theme.layout === 'minimal' ? 'transparent' : theme.backgroundColor,
            borderRadius: theme.borderRadius
          }}
        >
          {/* Logo */}
          {theme.logo && (
            <div className={`flex ${getLogoPositionClasses()} p-6 pb-0`}>
              <img 
                src={theme.logo} 
                alt="Logo" 
                className={`${getLogoSizeClasses()} object-contain`}
              />
            </div>
          )}

          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 
                className="text-3xl font-bold mb-4"
                style={{ color: theme.textColor }}
              >
                {form.title}
              </h1>
              <p 
                className="text-lg opacity-80"
                style={{ color: theme.textColor }}
              >
                {form.description}
              </p>
            </div>

            {/* Form Fields */}
            <div className={getSpacingClasses()}>
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
                    style={{ color: theme.textColor }}
                  >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                </motion.div>
              ))}
            </div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: form.fields.length * 0.1 + 0.2 }}
              className="mt-8 w-full py-4 text-white font-medium rounded-lg transition-all flex items-center justify-center space-x-2 hover:opacity-90 transform hover:scale-[1.02]"
              style={{ 
                backgroundColor: theme.primaryColor,
                borderRadius: theme.borderRadius
              }}
            >
              <Send className="w-5 h-5" />
              <span>Submit Feedback</span>
            </motion.button>
          </div>

          {/* Footer */}
          {theme.footer?.enabled && (
            <div 
              className="px-8 py-6 border-t border-gray-200"
              style={{ 
                backgroundColor: theme.layout === 'minimal' ? 'rgba(255, 255, 255, 0.9)' : undefined 
              }}
            >
              <div className="text-center">
                {theme.footer.text && (
                  <p 
                    className="text-sm mb-3"
                    style={{ color: theme.textColor }}
                  >
                    {theme.footer.text}
                  </p>
                )}
                {theme.footer.links && theme.footer.links.length > 0 && (
                  <div className="flex justify-center space-x-6">
                    {theme.footer.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline"
                        style={{ color: theme.primaryColor }}
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

export default FormPreview;