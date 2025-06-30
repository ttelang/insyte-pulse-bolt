import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'rating' | 'multiple-choice' | 'email' | 'phone';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  maxRating?: number;
}

export interface FeedbackTheme {
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

export const DEFAULT_THEME: FeedbackTheme = {
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
};

export interface FeedbackForm {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  theme: FeedbackTheme;
  isActive: boolean;
  createdAt: Date;
  responses: number;
}

export interface FeedbackResponse {
  id: string;
  formId: string;
  responses: Record<string, any>;
  sentiment: 'positive' | 'neutral' | 'negative';
  source: 'web' | 'email' | 'qr' | 'sms' | 'social';
  createdAt: Date;
}

interface FeedbackState {
  forms: FeedbackForm[];
  responses: FeedbackResponse[];
  currentForm: FeedbackForm | null;
}

type FeedbackAction =
  | { type: 'SET_FORMS'; payload: FeedbackForm[] }
  | { type: 'ADD_FORM'; payload: FeedbackForm }
  | { type: 'UPDATE_FORM'; payload: FeedbackForm }
  | { type: 'DELETE_FORM'; payload: string }
  | { type: 'SET_CURRENT_FORM'; payload: FeedbackForm | null }
  | { type: 'ADD_RESPONSE'; payload: FeedbackResponse }
  | { type: 'SET_RESPONSES'; payload: FeedbackResponse[] };

const initialState: FeedbackState = {
  forms: [
    {
      id: '1',
      title: 'Customer Satisfaction Survey',
      description: 'Help us improve our service by sharing your feedback',
      fields: [
        {
          id: 'rating',
          type: 'rating',
          label: 'How satisfied are you with our service?',
          required: true,
          maxRating: 5
        },
        {
          id: 'feedback',
          type: 'textarea',
          label: 'What can we improve?',
          required: false,
          placeholder: 'Share your thoughts...'
        }
      ],
      theme: DEFAULT_THEME,
      isActive: true,
      createdAt: new Date(),
      responses: 24
    }
  ],
  responses: [],
  currentForm: null
};

const feedbackReducer = (state: FeedbackState, action: FeedbackAction): FeedbackState => {
  switch (action.type) {
    case 'SET_FORMS':
      return { ...state, forms: action.payload };
    case 'ADD_FORM':
      return { ...state, forms: [...state.forms, action.payload] };
    case 'UPDATE_FORM':
      return {
        ...state,
        forms: state.forms.map(form =>
          form.id === action.payload.id ? action.payload : form
        )
      };
    case 'DELETE_FORM':
      return {
        ...state,
        forms: state.forms.filter(form => form.id !== action.payload)
      };
    case 'SET_CURRENT_FORM':
      return { ...state, currentForm: action.payload };
    case 'ADD_RESPONSE':
      return { ...state, responses: [...state.responses, action.payload] };
    case 'SET_RESPONSES':
      return { ...state, responses: action.payload };
    default:
      return state;
  }
};

const FeedbackContext = createContext<{
  state: FeedbackState;
  dispatch: React.Dispatch<FeedbackAction>;
} | null>(null);

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(feedbackReducer, initialState);

  return (
    <FeedbackContext.Provider value={{ state, dispatch }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};