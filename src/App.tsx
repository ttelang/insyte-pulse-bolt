import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Dashboard from './components/Dashboard';
import FormBuilder from './components/FormBuilder';
import FeedbackForm from './components/FeedbackForm';
import Analytics from './components/Analytics';
import Integrations from './components/Integrations';
import Settings from './components/Settings';
import Pricing from './components/Pricing';
import Success from './components/Success';
import Navigation from './components/Navigation';
import Auth from './components/Auth';
import { FeedbackProvider } from './context/FeedbackContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <FeedbackProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="ml-64 p-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/forms" element={<FormBuilder />} />
                <Route path="/form/:id" element={<FeedbackForm />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/success" element={<Success />} />
              </Routes>
            </main>
          </div>
        </Router>
      </FeedbackProvider>
    </DndProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;