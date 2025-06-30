import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag, useDrop } from 'react-dnd';
import { 
  Plus, 
  Type, 
  Star, 
  List, 
  Mail, 
  Phone, 
  MessageSquare,
  Trash2,
  Eye,
  Settings,
  Save,
  QrCode,
  Link as LinkIcon,
  Palette,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Edit,
  Copy,
  ExternalLink,
  Calendar,
  Users,
  X,
  Download,
  Code
} from 'lucide-react';
import { useFeedback, FormField, FeedbackForm } from '../context/FeedbackContext';
import { FormService } from '../services/formService';
import QRCodeGenerator from './QRCodeGenerator';
import ThemeCustomizer from './ThemeCustomizer';
import FormPreview from './FormPreview';

const fieldTypes = [
  { type: 'text', icon: Type, label: 'Text Input' },
  { type: 'textarea', icon: MessageSquare, label: 'Text Area' },
  { type: 'rating', icon: Star, label: 'Rating Scale' },
  { type: 'multiple-choice', icon: List, label: 'Multiple Choice' },
  { type: 'email', icon: Mail, label: 'Email' },
  { type: 'phone', icon: Phone, label: 'Phone' }
];

const DraggableField: React.FC<{ fieldType: any; index: number }> = ({ fieldType, index }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'field',
    item: { type: fieldType.type, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  return (
    <div
      ref={drag}
      className={`p-4 bg-white border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <fieldType.icon className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">{fieldType.label}</span>
      </div>
    </div>
  );
};

const FormBuilderField: React.FC<{ 
  field: FormField; 
  onUpdate: (field: FormField) => void; 
  onDelete: () => void;
  index: number;
  moveField: (dragIndex: number, hoverIndex: number) => void;
}> = ({ field, onUpdate, onDelete, index, moveField }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'form-field',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: 'form-field',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveField(item.index, index);
        item.index = index;
      }
    }
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`p-4 bg-white border border-gray-200 rounded-lg ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdate({ ...field, label: e.target.value })}
            className="w-full text-sm font-medium text-gray-900 bg-transparent border-none outline-none"
            placeholder="Field label"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onUpdate({ ...field, required: e.target.checked })}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-xs text-gray-600">Required</span>
          </label>
          <button
            onClick={onDelete}
            className="p-1 text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {field.type === 'text' || field.type === 'email' || field.type === 'phone' ? (
        <input
          type="text"
          value={field.placeholder || ''}
          onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded text-sm"
          placeholder="Placeholder text"
        />
      ) : field.type === 'textarea' ? (
        <textarea
          value={field.placeholder || ''}
          onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded text-sm"
          placeholder="Placeholder text"
          rows={3}
        />
      ) : field.type === 'rating' ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Max rating:</span>
          <input
            type="number"
            value={field.maxRating || 5}
            onChange={(e) => onUpdate({ ...field, maxRating: parseInt(e.target.value) })}
            className="w-16 p-1 border border-gray-300 rounded text-sm"
            min="1"
            max="10"
          />
        </div>
      ) : field.type === 'multiple-choice' ? (
        <div className="space-y-2">
          {(field.options || []).map((option, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...(field.options || [])];
                  newOptions[idx] = e.target.value;
                  onUpdate({ ...field, options: newOptions });
                }}
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                placeholder={`Option ${idx + 1}`}
              />
              <button
                onClick={() => {
                  const newOptions = (field.options || []).filter((_, i) => i !== idx);
                  onUpdate({ ...field, options: newOptions });
                }}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newOptions = [...(field.options || []), ''];
              onUpdate({ ...field, options: newOptions });
            }}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            + Add option
          </button>
        </div>
      ) : null}
    </div>
  );
};

const CopyLinkModal: React.FC<{ 
  formId: string; 
  formTitle: string; 
  onClose: () => void; 
}> = ({ formId, formTitle, onClose }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const formUrl = `${window.location.origin}/form/${formId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopyStatus('copied');
      
      // Record invitation when link is copied
      await FormService.recordInvitation(formId, 'public_link', 'copied_link');
      
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

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
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Share Form Link</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">{formTitle}</h4>
            <p className="text-sm text-gray-600">Share this link to collect feedback</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form URL
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={formUrl}
                readOnly
                className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  copyStatus === 'copied'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copyStatus === 'copied' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-1">Direct Link</h5>
              <p className="text-sm text-blue-700">
                Share this URL directly with your audience via email, social media, or messaging apps.
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <h5 className="font-medium text-purple-900 mb-1">Embed Options</h5>
              <p className="text-sm text-purple-700">
                You can also embed this form on your website using an iframe or widget.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const EmailSignatureModal: React.FC<{ 
  formId: string; 
  formTitle: string; 
  onClose: () => void; 
}> = ({ formId, formTitle, onClose }) => {
  const [template, setTemplate] = useState('simple');
  const [customText, setCustomText] = useState('Please share your feedback');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  
  const formUrl = `${window.location.origin}/form/${formId}`;

  const templates = {
    simple: {
      name: 'Simple',
      html: `<div style="margin: 20px 0; padding: 15px; border-left: 4px solid #3B82F6; background-color: #F8FAFC;">
  <p style="margin: 0 0 10px 0; color: #1F2937; font-size: 14px;">${customText}</p>
  <a href="${formUrl}" style="display: inline-block; padding: 8px 16px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">Share Feedback</a>
</div>`,
      text: `${customText}\n\nShare your feedback: ${formUrl}`
    },
    professional: {
      name: 'Professional',
      html: `<table style="border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px; background-color: #FFFFFF;">
      <h3 style="margin: 0 0 10px 0; color: #1F2937; font-size: 16px;">${formTitle}</h3>
      <p style="margin: 0 0 15px 0; color: #6B7280; font-size: 14px;">${customText}</p>
      <a href="${formUrl}" style="display: inline-block; padding: 10px 20px; background-color: #059669; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">Provide Feedback</a>
    </td>
  </tr>
</table>`,
      text: `${formTitle}\n\n${customText}\n\nProvide feedback: ${formUrl}`
    },
    minimal: {
      name: 'Minimal',
      html: `<p style="margin: 20px 0; color: #374151; font-size: 14px;">
  ${customText} <a href="${formUrl}" style="color: #7C3AED; text-decoration: none; font-weight: 500;">Share your thoughts →</a>
</p>`,
      text: `${customText} - ${formUrl}`
    }
  };

  const currentTemplate = templates[template as keyof typeof templates];

  const copySignature = async (type: 'html' | 'text') => {
    try {
      const content = type === 'html' ? currentTemplate.html : currentTemplate.text;
      await navigator.clipboard.writeText(content);
      setCopyStatus('copied');
      
      // Record invitation when signature is copied
      await FormService.recordInvitation(formId, 'email_signature', `${type}_template`);
      
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

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
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Email Signature Generator</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{formTitle}</h4>
            <p className="text-sm text-gray-600">Create an email signature to collect feedback</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Message
            </label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your custom message"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Template Style
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(templates).map(([key, tmpl]) => (
                <button
                  key={key}
                  onClick={() => setTemplate(key)}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                    template === key
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div dangerouslySetInnerHTML={{ __html: currentTemplate.html }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML Version
              </label>
              <div className="relative">
                <textarea
                  value={currentTemplate.html}
                  readOnly
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg bg-white text-xs font-mono resize-none"
                />
                <button
                  onClick={() => copySignature('html')}
                  className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    copyStatus === 'copied'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copyStatus === 'copied' ? 'Copied!' : 'Copy HTML'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plain Text Version
              </label>
              <div className="relative">
                <textarea
                  value={currentTemplate.text}
                  readOnly
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg bg-white text-xs font-mono resize-none"
                />
                <button
                  onClick={() => copySignature('text')}
                  className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    copyStatus === 'copied'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {copyStatus === 'copied' ? 'Copied!' : 'Copy Text'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">How to Use</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Copy the HTML version for rich email clients (Gmail, Outlook)</li>
              <li>• Copy the text version for plain text emails</li>
              <li>• Paste into your email signature settings</li>
              <li>• Test by sending yourself an email</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const FormsList: React.FC<{ 
  forms: FeedbackForm[]; 
  onCreateNew: () => void; 
  onEditForm: (form: FeedbackForm) => void;
  onDeleteForm: (formId: string) => void;
}> = ({ forms, onCreateNew, onEditForm, onDeleteForm }) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showCopyLink, setShowCopyLink] = useState<string | null>(null);
  const [showEmailSignature, setShowEmailSignature] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const copyFormUrl = (formId: string) => {
    setShowCopyLink(formId);
  };

  const openEmailSignature = (formId: string) => {
    setShowEmailSignature(formId);
  };

  const handleDeleteForm = async (formId: string) => {
    try {
      setIsDeleting(formId);
      await FormService.deleteForm(formId);
      onDeleteForm(formId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete form:', error);
      alert('Failed to delete form. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forms</h1>
          <p className="text-gray-600 mt-2">Manage your feedback forms</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Form</span>
        </button>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No forms yet</h3>
          <p className="text-gray-600 mb-6">Create your first feedback form to get started</p>
          <button
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Form</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form, index) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                      {form.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {form.description}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    form.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{form.responses} responses</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(form.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditForm(form)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit form"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyFormUrl(form.id)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Copy form URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEmailSignature(form.id)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Email signature"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <a
                      href={`/form/${form.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Open form"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  
                  <div className="relative">
                    {deleteConfirm === form.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                          disabled={isDeleting === form.id}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteForm(form.id)}
                          disabled={isDeleting === form.id}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            isDeleting === form.id
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {isDeleting === form.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(form.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete form"
                        disabled={isDeleting === form.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Copy Link Modal */}
      <AnimatePresence>
        {showCopyLink && (
          <CopyLinkModal
            formId={showCopyLink}
            formTitle={forms.find(f => f.id === showCopyLink)?.title || 'Form'}
            onClose={() => setShowCopyLink(null)}
          />
        )}
      </AnimatePresence>

      {/* Email Signature Modal */}
      <AnimatePresence>
        {showEmailSignature && (
          <EmailSignatureModal
            formId={showEmailSignature}
            formTitle={forms.find(f => f.id === showEmailSignature)?.title || 'Form'}
            onClose={() => setShowEmailSignature(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const FormBuilder: React.FC = () => {
  const { state, dispatch } = useFeedback();
  const [view, setView] = useState<'list' | 'builder'>('list');
  const [currentForm, setCurrentForm] = useState<FeedbackForm>({
    id: Date.now().toString(),
    title: 'New Feedback Form',
    description: 'Please share your feedback with us',
    fields: [],
    theme: {
      primaryColor: '#3B82F6',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      borderRadius: '8px',
      backgroundType: 'color',
      gradientDirection: 'to-br',
      gradientColors: ['#3B82F6', '#8B5CF6'],
      logoPosition: 'top-center',
      logoSize: 'medium',
      footer: {
        enabled: false,
        text: '© 2024 Your Company. All rights reserved.',
        links: []
      },
      layout: 'centered',
      fontFamily: 'Inter',
      spacing: 'normal',
      animation: 'fade'
    },
    isActive: true,
    createdAt: new Date(),
    responses: 0
  });
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [showCopyLink, setShowCopyLink] = useState(false);
  const [showEmailSignature, setShowEmailSignature] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  const [, drop] = useDrop({
    accept: 'field',
    drop: (item: { type: string }) => {
      const newField: FormField = {
        id: Date.now().toString(),
        type: item.type as any,
        label: `New ${item.type} field`,
        required: false,
        ...(item.type === 'rating' && { maxRating: 5 }),
        ...(item.type === 'multiple-choice' && { options: ['Option 1', 'Option 2'] })
      };
      setCurrentForm(prev => ({
        ...prev,
        fields: [...prev.fields, newField]
      }));
    }
  });

  // Load forms on component mount
  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const forms = await FormService.getForms();
      dispatch({ type: 'SET_FORMS', payload: forms });
    } catch (error) {
      console.error('Failed to load forms:', error);
    }
  };

  const updateField = (index: number, updatedField: FormField) => {
    setCurrentForm(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => i === index ? updatedField : field)
    }));
  };

  const deleteField = (index: number) => {
    setCurrentForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const moveField = (dragIndex: number, hoverIndex: number) => {
    const draggedField = currentForm.fields[dragIndex];
    const newFields = [...currentForm.fields];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, draggedField);
    
    setCurrentForm(prev => ({
      ...prev,
      fields: newFields
    }));
  };

  const saveForm = async () => {
    if (!currentForm.title.trim()) {
      setSaveStatus('error');
      setSaveMessage('Please enter a form title');
      return;
    }

    if (currentForm.fields.length === 0) {
      setSaveStatus('error');
      setSaveMessage('Please add at least one field to your form');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      let savedForm;
      
      if (isEditMode) {
        // Update existing form
        savedForm = await FormService.updateForm(currentForm.id, {
          title: currentForm.title,
          description: currentForm.description,
          fields: currentForm.fields,
          theme: currentForm.theme,
          isActive: currentForm.isActive
        });
        
        // Update form in local state
        const updatedForm: FeedbackForm = {
          ...currentForm,
          id: savedForm.id,
          createdAt: new Date(savedForm.createdAt),
          responses: savedForm.responseCount
        };
        
        dispatch({ type: 'UPDATE_FORM', payload: updatedForm });
        setSaveMessage('Form updated successfully!');
      } else {
        // Create new form
        savedForm = await FormService.saveForm({
          title: currentForm.title,
          description: currentForm.description,
          fields: currentForm.fields,
          theme: currentForm.theme,
          isActive: currentForm.isActive
        });

        // Add to local state
        const newForm: FeedbackForm = {
          id: savedForm.id,
          title: savedForm.title,
          description: savedForm.description,
          fields: currentForm.fields,
          theme: currentForm.theme,
          isActive: savedForm.isActive,
          createdAt: new Date(savedForm.createdAt),
          responses: savedForm.responseCount
        };

        dispatch({ type: 'ADD_FORM', payload: newForm });
        setSaveMessage(`Form saved successfully! Public URL: ${savedForm.publicUrl}`);
      }

      setSaveStatus('success');

      // Reset form after successful save
      setTimeout(() => {
        resetForm();
        setView('list');
        setSaveStatus('idle');
        setSaveMessage('');
        setIsEditMode(false);
      }, 2000);

    } catch (error) {
      setSaveStatus('error');
      setSaveMessage(error instanceof Error ? error.message : 'Failed to save form');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setCurrentForm({
      id: Date.now().toString(),
      title: 'New Feedback Form',
      description: 'Please share your feedback with us',
      fields: [],
      theme: {
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        borderRadius: '8px',
        backgroundType: 'color',
        gradientDirection: 'to-br',
        gradientColors: ['#3B82F6', '#8B5CF6'],
        logoPosition: 'top-center',
        logoSize: 'medium',
        footer: {
          enabled: false,
          text: '© 2024 Your Company. All rights reserved.',
          links: []
        },
        layout: 'centered',
        fontFamily: 'Inter',
        spacing: 'normal',
        animation: 'fade'
      },
      isActive: true,
      createdAt: new Date(),
      responses: 0
    });
  };

  const handleCreateNew = () => {
    resetForm();
    setIsEditMode(false);
    setView('builder');
  };

  const handleEditForm = (form: FeedbackForm) => {
    setCurrentForm(form);
    setIsEditMode(true);
    setView('builder');
  };

  const handleDeleteForm = (formId: string) => {
    dispatch({ type: 'DELETE_FORM', payload: formId });
  };

  const handleBackToList = () => {
    setView('list');
    resetForm();
    setSaveStatus('idle');
    setSaveMessage('');
    setIsEditMode(false);
  };

  const handleThemeChange = (newTheme: any) => {
    setCurrentForm(prev => ({
      ...prev,
      theme: newTheme
    }));
  };

  if (view === 'list') {
    return (
      <FormsList 
        forms={state.forms}
        onCreateNew={handleCreateNew}
        onEditForm={handleEditForm}
        onDeleteForm={handleDeleteForm}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToList}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Form' : 'Form Builder'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditMode ? 'Update your feedback form' : 'Create and customize your feedback forms'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCopyLink(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <LinkIcon className="w-4 h-4" />
            <span>Copy Link</span>
          </button>
          <button
            onClick={() => setShowEmailSignature(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>Email Signature</span>
          </button>
          <button
            onClick={() => setShowQRCode(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code</span>
          </button>
          <button
            onClick={() => setShowThemeEditor(!showThemeEditor)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Palette className="w-4 h-4" />
            <span>Theme</span>
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <button
            onClick={saveForm}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              isSaving 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : saveStatus === 'success'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isEditMode ? 'Updating...' : 'Saving...'}</span>
              </>
            ) : saveStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>{isEditMode ? 'Updated!' : 'Saved!'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditMode ? 'Update Form' : 'Save Form'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Status Message */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg flex items-center space-x-2 ${
              saveStatus === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {saveStatus === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{saveMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Field Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Field Types</h3>
          <div className="space-y-3">
            {fieldTypes.map((fieldType, index) => (
              <DraggableField key={fieldType.type} fieldType={fieldType} index={index} />
            ))}
          </div>
        </div>

        {/* Form Builder */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-6">
              <input
                type="text"
                value={currentForm.title}
                onChange={(e) => setCurrentForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full text-2xl font-bold text-gray-900 bg-transparent border-none outline-none mb-2"
                placeholder="Form title"
              />
              <textarea
                value={currentForm.description}
                onChange={(e) => setCurrentForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full text-gray-600 bg-transparent border-none outline-none resize-none"
                placeholder="Form description"
                rows={2}
              />
            </div>

            <div
              ref={drop}
              className="min-h-64 space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg"
            >
              {currentForm.fields.length === 0 ? (
                <div className="text-center py-12">
                  <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Drag field types here to build your form</p>
                </div>
              ) : (
                currentForm.fields.map((field, index) => (
                  <FormBuilderField
                    key={field.id}
                    field={field}
                    index={index}
                    onUpdate={(updatedField) => updateField(index, updatedField)}
                    onDelete={() => deleteField(index)}
                    moveField={moveField}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Form Status</h4>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={currentForm.isActive}
                onChange={(e) => setCurrentForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Share Options</h4>
            <div className="space-y-2">
              <button 
                onClick={() => setShowCopyLink(true)}
                className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2"
              >
                <LinkIcon className="w-4 h-4" />
                <span>Copy Link</span>
              </button>
              <button 
                onClick={() => setShowEmailSignature(true)}
                className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Email Signature</span>
              </button>
              <button 
                onClick={() => setShowQRCode(true)}
                className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Copy Link Modal */}
      <AnimatePresence>
        {showCopyLink && (
          <CopyLinkModal
            formId={currentForm.id}
            formTitle={currentForm.title}
            onClose={() => setShowCopyLink(false)}
          />
        )}
      </AnimatePresence>

      {/* Email Signature Modal */}
      <AnimatePresence>
        {showEmailSignature && (
          <EmailSignatureModal
            formId={currentForm.id}
            formTitle={currentForm.title}
            onClose={() => setShowEmailSignature(false)}
          />
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRCode && (
          <QRCodeGenerator
            formId={currentForm.id}
            formTitle={currentForm.title}
            onClose={() => setShowQRCode(false)}
          />
        )}
      </AnimatePresence>

      {/* Theme Customizer */}
      <AnimatePresence>
        {showThemeEditor && (
          <ThemeCustomizer
            theme={currentForm.theme}
            onThemeChange={handleThemeChange}
            onClose={() => setShowThemeEditor(false)}
            form={currentForm}
          />
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
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
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Form Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <FormPreview form={currentForm} theme={currentForm.theme} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormBuilder;