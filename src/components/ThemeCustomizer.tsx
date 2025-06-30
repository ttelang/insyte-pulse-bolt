import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Image, 
  Upload, 
  X, 
  Eye, 
  Layout,
  Type,
  Layers,
  Download,
  RefreshCw,
  Check,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import FormPreview from './FormPreview';

interface Theme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  backgroundImage?: string;
  backgroundType: 'color' | 'gradient' | 'image';
  gradientDirection: string;
  gradientColors: string[];
  logo?: string;
  logoPosition: 'top-left' | 'top-center' | 'top-right';
  logoSize: 'small' | 'medium' | 'large';
  footer: {
    enabled: boolean;
    text: string;
    links: { text: string; url: string }[];
  };
  layout: 'centered' | 'left-aligned' | 'full-width' | 'card' | 'minimal';
  fontFamily: string;
  spacing: 'compact' | 'normal' | 'relaxed';
  animation: 'none' | 'fade' | 'slide' | 'bounce';
}

interface ThemeCustomizerProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onClose: () => void;
  form?: any;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ theme, onThemeChange, onClose, form }) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'background' | 'branding' | 'layout' | 'typography'>('colors');
  const [previewMode, setPreviewMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts on component mount
  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Check if fonts are already loaded
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
          setFontsLoaded(true);
        } else {
          // Fallback for older browsers
          setTimeout(() => setFontsLoaded(true), 1000);
        }
      } catch (error) {
        console.warn('Font loading check failed:', error);
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  const colorPresets = [
    { name: 'Ocean Blue', primary: '#0EA5E9', background: '#F0F9FF', text: '#0C4A6E' },
    { name: 'Forest Green', primary: '#10B981', background: '#ECFDF5', text: '#064E3B' },
    { name: 'Sunset Orange', primary: '#F97316', background: '#FFF7ED', text: '#9A3412' },
    { name: 'Royal Purple', primary: '#8B5CF6', background: '#FAF5FF', text: '#581C87' },
    { name: 'Rose Pink', primary: '#EC4899', background: '#FDF2F8', text: '#831843' },
    { name: 'Slate Gray', primary: '#64748B', background: '#F8FAFC', text: '#1E293B' },
    { name: 'Emerald', primary: '#059669', background: '#ECFDF5', text: '#064E3B' },
    { name: 'Amber', primary: '#D97706', background: '#FFFBEB', text: '#92400E' },
    { name: 'Indigo', primary: '#4F46E5', background: '#EEF2FF', text: '#312E81' },
    { name: 'Teal', primary: '#0D9488', background: '#F0FDFA', text: '#134E4A' }
  ];

  // Lighter gradient presets
  const gradientPresets = [
    { name: 'Ocean Breeze', colors: ['#E0F2FE', '#BAE6FD'], direction: 'to-br' },
    { name: 'Sunset Glow', colors: ['#FEF3C7', '#FED7AA'], direction: 'to-br' },
    { name: 'Forest Mist', colors: ['#ECFDF5', '#D1FAE5'], direction: 'to-br' },
    { name: 'Purple Rain', colors: ['#FAF5FF', '#F3E8FF'], direction: 'to-br' },
    { name: 'Golden Hour', colors: ['#FFFBEB', '#FEF3C7'], direction: 'to-br' },
    { name: 'Arctic Aurora', colors: ['#F0F9FF', '#E0E7FF'], direction: 'to-br' },
    { name: 'Rose Garden', colors: ['#FDF2F8', '#FCE7F3'], direction: 'to-br' },
    { name: 'Mint Fresh', colors: ['#F0FDFA', '#CCFBF1'], direction: 'to-br' },
    { name: 'Lavender Dream', colors: ['#F5F3FF', '#EDE9FE'], direction: 'to-br' },
    { name: 'Peach Blossom', colors: ['#FFF7ED', '#FFEDD5'], direction: 'to-br' }
  ];

  const layoutOptions = [
    { 
      id: 'centered', 
      name: 'Centered', 
      description: 'Classic centered layout with max width',
      preview: 'max-w-2xl mx-auto'
    },
    { 
      id: 'left-aligned', 
      name: 'Left Aligned', 
      description: 'Left-aligned form with sidebar space',
      preview: 'max-w-4xl mr-auto ml-8'
    },
    { 
      id: 'full-width', 
      name: 'Full Width', 
      description: 'Full width layout for maximum space',
      preview: 'w-full'
    },
    { 
      id: 'card', 
      name: 'Card Style', 
      description: 'Elevated card design with shadow',
      preview: 'max-w-lg mx-auto shadow-2xl'
    },
    { 
      id: 'minimal', 
      name: 'Minimal', 
      description: 'Clean minimal design with no borders',
      preview: 'max-w-xl mx-auto'
    }
  ];

  // Distinct, visually different fonts
  const fontOptions = [
    { 
      id: 'Inter', 
      name: 'Inter', 
      class: 'font-inter', 
      category: 'Modern Sans', 
      cssName: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      description: 'Clean, modern, highly readable'
    },
    { 
      id: 'Roboto', 
      name: 'Roboto', 
      class: 'font-roboto', 
      category: 'Geometric Sans', 
      cssName: "'Roboto', Arial, sans-serif",
      description: 'Google\'s signature font, friendly and approachable'
    },
    { 
      id: 'Open Sans', 
      name: 'Open Sans', 
      class: 'font-open-sans', 
      category: 'Humanist Sans', 
      cssName: "'Open Sans', Helvetica, sans-serif",
      description: 'Optimized for legibility across platforms'
    },
    { 
      id: 'Poppins', 
      name: 'Poppins', 
      class: 'font-poppins', 
      category: 'Rounded Sans', 
      cssName: "'Poppins', system-ui, sans-serif",
      description: 'Rounded, playful, and contemporary'
    },
    { 
      id: 'Playfair Display', 
      name: 'Playfair Display', 
      class: 'font-playfair', 
      category: 'Elegant Serif', 
      cssName: "'Playfair Display', Georgia, serif",
      description: 'High contrast, elegant, perfect for headlines'
    },
    { 
      id: 'Merriweather', 
      name: 'Merriweather', 
      class: 'font-merriweather', 
      category: 'Reading Serif', 
      cssName: "'Merriweather', 'Times New Roman', serif",
      description: 'Designed for excellent readability on screens'
    },
    { 
      id: 'Montserrat', 
      name: 'Montserrat', 
      class: 'font-montserrat', 
      category: 'Urban Sans', 
      cssName: "'Montserrat', Verdana, sans-serif",
      description: 'Inspired by urban typography, strong and confident'
    },
    { 
      id: 'Source Sans Pro', 
      name: 'Source Sans Pro', 
      class: 'font-source-sans', 
      category: 'Professional Sans', 
      cssName: "'Source Sans Pro', Tahoma, sans-serif",
      description: 'Adobe\'s first open source font, clean and professional'
    },
    { 
      id: 'Lora', 
      name: 'Lora', 
      class: 'font-lora', 
      category: 'Calligraphic Serif', 
      cssName: "'Lora', 'Book Antiqua', serif",
      description: 'Calligraphic roots, contemporary feel'
    },
    { 
      id: 'Nunito', 
      name: 'Nunito', 
      class: 'font-nunito', 
      category: 'Soft Sans', 
      cssName: "'Nunito', 'Trebuchet MS', sans-serif",
      description: 'Rounded terminals, soft and friendly'
    }
  ];

  const handleColorPresetSelect = (preset: typeof colorPresets[0]) => {
    onThemeChange({
      ...theme,
      primaryColor: preset.primary,
      backgroundColor: preset.background,
      textColor: preset.text,
      backgroundType: 'color'
    });
  };

  const handleGradientPresetSelect = (preset: typeof gradientPresets[0]) => {
    console.log('Applying gradient preset:', preset);
    onThemeChange({
      ...theme,
      backgroundType: 'gradient',
      gradientColors: preset.colors,
      gradientDirection: preset.direction,
      primaryColor: theme.primaryColor // Keep current primary color
    });
  };

  const handleFontChange = (fontFamily: string) => {
    console.log('Changing font to:', fontFamily);
    onThemeChange({ ...theme, fontFamily });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onThemeChange({
          ...theme,
          backgroundType: 'image',
          backgroundImage: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onThemeChange({
          ...theme,
          logo: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getDeviceClasses = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'w-80 h-[600px]';
      case 'tablet':
        return 'w-[768px] h-[600px]';
      default:
        return 'w-full h-[600px]';
    }
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

  const getQuickPreviewStyle = () => {
    if (theme.backgroundType === 'gradient') {
      const cssDirection = convertTailwindDirection(theme.gradientDirection || 'to-br');
      const colors = theme.gradientColors || ['#3B82F6', '#8B5CF6'];
      return {
        background: `linear-gradient(${cssDirection}, ${colors.join(', ')})`
      };
    } else if (theme.backgroundType === 'image' && theme.backgroundImage) {
      return {
        backgroundImage: `url(${theme.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    } else {
      return {
        backgroundColor: theme.backgroundColor
      };
    }
  };

  const renderColorsTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Color Presets</h4>
        <div className="grid grid-cols-2 gap-3">
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleColorPresetSelect(preset)}
              className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: preset.primary }}
                />
                <span className="text-sm font-medium">{preset.name}</span>
              </div>
              <div className="flex space-x-1">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.primary }}
                />
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.background }}
                />
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.text }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Custom Colors</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Primary Color</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => onThemeChange({ ...theme, primaryColor: e.target.value })}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={theme.primaryColor}
                onChange={(e) => onThemeChange({ ...theme, primaryColor: e.target.value })}
                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Text Color</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={theme.textColor}
                onChange={(e) => onThemeChange({ ...theme, textColor: e.target.value })}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={theme.textColor}
                onChange={(e) => onThemeChange({ ...theme, textColor: e.target.value })}
                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackgroundTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Background Type</h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'color', name: 'Solid Color', icon: Palette },
            { id: 'gradient', name: 'Gradient', icon: Layers },
            { id: 'image', name: 'Image', icon: Image }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => onThemeChange({ ...theme, backgroundType: type.id as any })}
              className={`p-4 border rounded-lg transition-colors flex flex-col items-center space-y-2 ${
                theme.backgroundType === type.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <type.icon className="w-6 h-6" />
              <span className="text-sm font-medium">{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      {theme.backgroundType === 'color' && (
        <div>
          <label className="block text-sm text-gray-700 mb-2">Background Color</label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={theme.backgroundColor}
              onChange={(e) => onThemeChange({ ...theme, backgroundColor: e.target.value })}
              className="w-12 h-10 rounded border border-gray-300"
            />
            <input
              type="text"
              value={theme.backgroundColor}
              onChange={(e) => onThemeChange({ ...theme, backgroundColor: e.target.value })}
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm font-mono"
            />
          </div>
        </div>
      )}

      {theme.backgroundType === 'gradient' && (
        <div className="space-y-4">
          <div>
            <h5 className="font-medium text-gray-900 mb-3">Gradient Presets</h5>
            <div className="grid grid-cols-2 gap-3">
              {gradientPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleGradientPresetSelect(preset)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div 
                    className="w-full h-8 rounded mb-2"
                    style={{
                      background: `linear-gradient(${convertTailwindDirection(preset.direction)}, ${preset.colors.join(', ')})`
                    }}
                  />
                  <span className="text-sm font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Custom Gradient</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={theme.gradientColors?.[0] || '#3B82F6'}
                  onChange={(e) => {
                    const newColors = [...(theme.gradientColors || ['#3B82F6', '#8B5CF6'])];
                    newColors[0] = e.target.value;
                    onThemeChange({ ...theme, gradientColors: newColors });
                  }}
                  className="w-10 h-10 rounded border border-gray-300"
                />
                <input
                  type="color"
                  value={theme.gradientColors?.[1] || '#8B5CF6'}
                  onChange={(e) => {
                    const newColors = [...(theme.gradientColors || ['#3B82F6', '#8B5CF6'])];
                    newColors[1] = e.target.value;
                    onThemeChange({ ...theme, gradientColors: newColors });
                  }}
                  className="w-10 h-10 rounded border border-gray-300"
                />
                <select
                  value={theme.gradientDirection || 'to-br'}
                  onChange={(e) => onThemeChange({ ...theme, gradientDirection: e.target.value })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="to-r">Left to Right</option>
                  <option value="to-l">Right to Left</option>
                  <option value="to-b">Top to Bottom</option>
                  <option value="to-t">Bottom to Top</option>
                  <option value="to-br">Top-Left to Bottom-Right</option>
                  <option value="to-bl">Top-Right to Bottom-Left</option>
                  <option value="to-tr">Bottom-Left to Top-Right</option>
                  <option value="to-tl">Bottom-Right to Top-Left</option>
                </select>
              </div>
              
              {/* Live gradient preview */}
              <div className="mt-3">
                <div 
                  className="w-full h-12 rounded border border-gray-300"
                  style={{
                    background: `linear-gradient(${convertTailwindDirection(theme.gradientDirection || 'to-br')}, ${(theme.gradientColors || ['#3B82F6', '#8B5CF6']).join(', ')})`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {theme.backgroundType === 'image' && (
        <div>
          <label className="block text-sm text-gray-700 mb-2">Background Image</label>
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="background-upload"
              />
              <label htmlFor="background-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload background image</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </label>
            </div>
            {theme.backgroundImage && (
              <div className="relative">
                <img 
                  src={theme.backgroundImage} 
                  alt="Background preview" 
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => onThemeChange({ ...theme, backgroundImage: undefined })}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderBrandingTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Logo</h4>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload logo</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG up to 2MB</p>
            </label>
          </div>

          {theme.logo && (
            <div className="space-y-3">
              <div className="relative bg-gray-50 p-4 rounded-lg">
                <img 
                  src={theme.logo} 
                  alt="Logo preview" 
                  className="h-16 object-contain mx-auto"
                />
                <button
                  onClick={() => onThemeChange({ ...theme, logo: undefined })}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Position</label>
                  <select
                    value={theme.logoPosition}
                    onChange={(e) => onThemeChange({ ...theme, logoPosition: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Size</label>
                  <select
                    value={theme.logoSize}
                    onChange={(e) => onThemeChange({ ...theme, logoSize: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Footer</h4>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={theme.footer.enabled}
              onChange={(e) => onThemeChange({
                ...theme,
                footer: { ...theme.footer, enabled: e.target.checked }
              })}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">Enable footer</span>
          </label>

          {theme.footer.enabled && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Footer Text</label>
                <input
                  type="text"
                  value={theme.footer.text}
                  onChange={(e) => onThemeChange({
                    ...theme,
                    footer: { ...theme.footer, text: e.target.value }
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="© 2024 Your Company. All rights reserved."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Footer Links</label>
                <div className="space-y-2">
                  {theme.footer.links.map((link, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={link.text}
                        onChange={(e) => {
                          const newLinks = [...theme.footer.links];
                          newLinks[index] = { ...link, text: e.target.value };
                          onThemeChange({
                            ...theme,
                            footer: { ...theme.footer, links: newLinks }
                          });
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Link text"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...theme.footer.links];
                          newLinks[index] = { ...link, url: e.target.value };
                          onThemeChange({
                            ...theme,
                            footer: { ...theme.footer, links: newLinks }
                          });
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="https://..."
                      />
                      <button
                        onClick={() => {
                          const newLinks = theme.footer.links.filter((_, i) => i !== index);
                          onThemeChange({
                            ...theme,
                            footer: { ...theme.footer, links: newLinks }
                          });
                        }}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newLinks = [...theme.footer.links, { text: '', url: '' }];
                      onThemeChange({
                        ...theme,
                        footer: { ...theme.footer, links: newLinks }
                      });
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Add link
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Layout Style</h4>
        <div className="space-y-3">
          {layoutOptions.map((layout) => (
            <button
              key={layout.id}
              onClick={() => onThemeChange({ ...theme, layout: layout.id as any })}
              className={`w-full p-4 border rounded-lg transition-colors text-left ${
                theme.layout === layout.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{layout.name}</h5>
                {theme.layout === layout.id && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">{layout.description}</p>
              <div className="mt-3 h-8 bg-gray-100 rounded relative overflow-hidden">
                <div className={`h-full bg-blue-200 ${layout.preview}`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Spacing</h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'compact', name: 'Compact' },
            { id: 'normal', name: 'Normal' },
            { id: 'relaxed', name: 'Relaxed' }
          ].map((spacing) => (
            <button
              key={spacing.id}
              onClick={() => onThemeChange({ ...theme, spacing: spacing.id as any })}
              className={`p-3 border rounded-lg transition-colors ${
                theme.spacing === spacing.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-sm font-medium">{spacing.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Border Radius</h4>
        <div className="grid grid-cols-4 gap-3">
          {[
            { value: '0px', name: 'None' },
            { value: '4px', name: 'Small' },
            { value: '8px', name: 'Medium' },
            { value: '16px', name: 'Large' }
          ].map((radius) => (
            <button
              key={radius.value}
              onClick={() => onThemeChange({ ...theme, borderRadius: radius.value })}
              className={`p-3 border rounded-lg transition-colors ${
                theme.borderRadius === radius.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div 
                className="w-6 h-6 bg-blue-200 mx-auto mb-1"
                style={{ borderRadius: radius.value }}
              />
              <span className="text-xs">{radius.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Animation</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'none', name: 'None' },
            { id: 'fade', name: 'Fade In' },
            { id: 'slide', name: 'Slide Up' },
            { id: 'bounce', name: 'Bounce' }
          ].map((animation) => (
            <button
              key={animation.id}
              onClick={() => onThemeChange({ ...theme, animation: animation.id as any })}
              className={`p-3 border rounded-lg transition-colors ${
                theme.animation === animation.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-sm font-medium">{animation.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTypographyTab = () => {
    const getCurrentFont = () => {
      return fontOptions.find(font => font.id === theme.fontFamily) || fontOptions[0];
    };

    return (
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Font Family</h4>
          {!fontsLoaded && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">Loading fonts...</p>
            </div>
          )}
          <div className="space-y-2">
            {fontOptions.map((font) => (
              <button
                key={font.id}
                onClick={() => handleFontChange(font.id)}
                className={`w-full p-4 border rounded-lg transition-colors text-left ${
                  theme.fontFamily === font.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span 
                      className="text-lg font-semibold"
                      style={{ fontFamily: font.cssName }}
                    >
                      {font.name}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {font.category}
                    </span>
                  </div>
                  {theme.fontFamily === font.id && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{font.description}</p>
                <p 
                  className="text-sm text-gray-600"
                  style={{ fontFamily: font.cssName }}
                >
                  The quick brown fox jumps over the lazy dog
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Current Font Preview</h4>
          <div className="bg-gray-50 p-6 rounded-lg border">
            <div className="space-y-4">
              <h1 
                className="text-3xl font-bold"
                style={{ fontFamily: getCurrentFont().cssName }}
              >
                {getCurrentFont().name}
              </h1>
              <p 
                className="text-lg text-gray-600"
                style={{ fontFamily: getCurrentFont().cssName }}
              >
                {getCurrentFont().description}
              </p>
              <p 
                className="text-base"
                style={{ fontFamily: getCurrentFont().cssName }}
              >
                The quick brown fox jumps over the lazy dog. ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 1234567890
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h3 
                    className="font-semibold mb-1"
                    style={{ fontFamily: getCurrentFont().cssName }}
                  >
                    Heading Style
                  </h3>
                  <p 
                    className="text-gray-600"
                    style={{ fontFamily: getCurrentFont().cssName }}
                  >
                    Sample heading text for forms
                  </p>
                </div>
                <div>
                  <h3 
                    className="font-semibold mb-1"
                    style={{ fontFamily: getCurrentFont().cssName }}
                  >
                    Body Text
                  </h3>
                  <p 
                    className="text-gray-600"
                    style={{ fontFamily: getCurrentFont().cssName }}
                  >
                    Regular paragraph text for descriptions
                  </p>
                </div>
                <div>
                  <h3 
                    className="font-semibold mb-1"
                    style={{ fontFamily: getCurrentFont().cssName }}
                  >
                    Button Text
                  </h3>
                  <button 
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                    style={{ fontFamily: getCurrentFont().cssName }}
                  >
                    Submit Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'colors', name: 'Colors', icon: Palette },
    { id: 'background', name: 'Background', icon: Image },
    { id: 'branding', name: 'Branding', icon: Upload },
    { id: 'layout', name: 'Layout', icon: Layout },
    { id: 'typography', name: 'Typography', icon: Type }
  ];

  if (previewMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white z-50 flex flex-col"
      >
        {/* Preview Header */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">Live Preview</h3>
            <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-2 rounded transition-colors ${
                  previewDevice === 'desktop' ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-2 rounded transition-colors ${
                  previewDevice === 'tablet' ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-2 rounded transition-colors ${
                  previewDevice === 'mobile' ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Edit Theme
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center overflow-auto">
          <div className={`${getDeviceClasses()} bg-white rounded-lg shadow-xl overflow-hidden`}>
            <div className="w-full h-full overflow-auto">
              {form && <FormPreview form={form} theme={theme} />}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex"
      >
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Theme Editor</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
            <button
              onClick={() => setPreviewMode(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Full Preview</span>
            </button>
            
            <div className="bg-gray-100 rounded-lg p-3">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Quick Preview</h5>
              <div className="bg-white rounded border p-2">
                <div 
                  className="w-full h-16 rounded mb-2"
                  style={getQuickPreviewStyle()}
                />
                <div className="space-y-1">
                  <div 
                    className="h-2 rounded"
                    style={{ backgroundColor: theme.primaryColor, width: '60%' }}
                  />
                  <div 
                    className="h-1 rounded"
                    style={{ backgroundColor: theme.textColor, opacity: 0.3, width: '80%' }}
                  />
                  <div 
                    className="h-1 rounded"
                    style={{ backgroundColor: theme.textColor, opacity: 0.3, width: '40%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'colors' && renderColorsTab()}
                {activeTab === 'background' && renderBackgroundTab()}
                {activeTab === 'branding' && renderBrandingTab()}
                {activeTab === 'layout' && renderLayoutTab()}
                {activeTab === 'typography' && renderTypographyTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ThemeCustomizer;