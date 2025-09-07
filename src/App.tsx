import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/common/Header';
import { Dashboard } from './components/admin/Dashboard';
import { EventManagement } from './components/admin/EventManagement';
import { StudentManagement } from './components/admin/StudentManagement';
import { ReportsAnalytics } from './components/admin/ReportsAnalytics';
import { EventBrowser } from './components/student/EventBrowser';
import { MyRegistrations } from './components/student/MyRegistrations';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    user?.role === 'admin' ? 'dashboard' : 'events'
  );

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    if (user?.role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return <Dashboard />;
        case 'events':
          return <EventManagement />;
        case 'students':
          return <StudentManagement />;
        case 'reports':
          return <ReportsAnalytics />;
        default:
          return <Dashboard />;
      }
    } else {
      switch (activeTab) {
        case 'events':
          return <EventBrowser />;
        case 'registrations':
          return <MyRegistrations />;
        default:
          return <EventBrowser />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;