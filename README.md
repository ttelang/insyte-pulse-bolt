# Feedback Collection System with Dynamic Form Builder

A comprehensive, AI-powered feedback collection platform built with React, TypeScript, and Supabase. This system enables businesses to create custom feedback forms, collect responses through multiple channels, and analyze sentiment using advanced AI algorithms.

## 🚀 Features

### Core Functionality
- **Dynamic Form Builder**: Drag-and-drop interface for creating custom feedback forms
- **Multi-Channel Collection**: Web forms, QR codes, email signatures, and embedded widgets
- **AI-Powered Analytics**: Advanced sentiment analysis and automatic categorization
- **Real-time Dashboard**: Live analytics with actionable insights
- **Theme Customization**: Complete visual customization with live preview

### Advanced Features
- **Sentiment Analysis**: AI-powered emotion detection and sentiment scoring
- **Smart Categorization**: Automatic feedback categorization and urgency detection
- **Response Management**: Full CRUD operations with optimistic updates
- **Subscription Management**: Stripe integration for premium features
- **Security**: Row-level security with Supabase authentication
- **Responsive Design**: Mobile-first design with modern UI/UX

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** for form management
- **React DnD** for drag-and-drop functionality
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security (RLS)
- **Supabase Edge Functions** for serverless logic
- **Stripe** for payment processing

### AI & Analytics
- **Custom Sentiment Analysis Engine**
- **Automatic Feedback Categorization**
- **Trend Analysis and Insights**
- **Urgency Detection**

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account (for subscription features)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/feedback-collection-system.git
cd feedback-collection-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
The project includes Supabase migrations in the `supabase/migrations` directory. These will be automatically applied when you connect to Supabase.

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📊 Database Schema

The system uses a comprehensive PostgreSQL schema with the following main tables:

- **forms**: Store form definitions and metadata
- **form_fields**: Individual form field configurations
- **form_themes**: Visual customization settings
- **form_responses**: Collected feedback responses
- **form_response_data**: Individual field response data
- **form_invitations**: Track invitation campaigns
- **stripe_customers**: Customer billing information
- **stripe_subscriptions**: Subscription management

## 🎨 Key Components

### Form Builder (`src/components/FormBuilder.tsx`)
- Drag-and-drop form creation
- Real-time preview
- Field type management
- Theme customization

### Analytics Dashboard (`src/components/Analytics.tsx`)
- AI-powered sentiment analysis
- Response management with CRUD operations
- Trend visualization
- Actionable insights

### Theme Customizer (`src/components/ThemeCustomizer.tsx`)
- Visual form customization
- Live preview across devices
- Font and color management
- Layout options

### Feedback Form (`src/components/FeedbackForm.tsx`)
- Responsive form rendering
- Theme application
- Multi-step support
- Validation and submission

## 🔧 Services

### FormService (`src/services/formService.ts`)
- Form CRUD operations
- Response management
- Analytics data aggregation
- Dashboard statistics

### SentimentService (`src/services/sentimentService.ts`)
- AI-powered sentiment analysis
- Emotion detection
- Category classification
- Trend analysis

### FeedbackUpdateService (`src/services/feedbackUpdateService.ts`)
- Advanced feedback management
- Optimistic updates
- Validation and error handling
- Audit trail

### StripeService (`src/services/stripeService.ts`)
- Subscription management
- Payment processing
- Customer portal integration

## 🔐 Security

- **Row Level Security (RLS)**: All database tables protected with RLS policies
- **Authentication**: Supabase Auth with email/password
- **Data Validation**: Comprehensive input validation and sanitization
- **CORS Protection**: Proper CORS configuration for API endpoints

## 🚀 Deployment

### Frontend Deployment
The application can be deployed to any static hosting service:

```bash
npm run build
```

### Backend Deployment
Supabase Edge Functions are automatically deployed when connected to your Supabase project.

## 📈 Analytics Features

### Sentiment Analysis
- Real-time emotion detection
- Confidence scoring
- Trend analysis
- Category-based insights

### Response Management
- Edit feedback responses
- Update sentiment and urgency
- Add internal notes
- Bulk operations

### Dashboard Insights
- Response rate tracking
- Satisfaction scoring
- Trend analysis
- Actionable recommendations

## 🎯 Form Features

### Field Types
- Text input and textarea
- Rating scales (1-10)
- Multiple choice
- Email and phone validation

### Customization
- Complete theme control
- Font selection
- Color schemes
- Layout options
- Animation effects

### Distribution
- Public URLs
- QR code generation
- Email signature templates
- Embeddable widgets

## 🔄 API Integration

### Supabase Edge Functions
- `stripe-checkout`: Handle subscription creation
- `stripe-webhook`: Process payment events

### Real-time Features
- Live response updates
- Real-time analytics
- Instant notifications

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@yourcompany.com or create an issue in this repository.

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com)
- UI components inspired by modern design systems
- Icons by [Lucide](https://lucide.dev)
- Charts powered by [Recharts](https://recharts.org)

---

**Made with ❤️ for better customer feedback collection**