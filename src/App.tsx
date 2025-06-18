import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AppointmentsProvider } from './contexts/AppointmentsContext';
import { ServicesProvider } from './contexts/ServicesContext';
import { TreatmentCentresProvider } from './contexts/TreatmentCentresContext';
import { StaffProvider } from './contexts/StaffContext';
import { ScansProvider } from './contexts/ScansContext';
import { VideoProvider } from './contexts/VideoContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Layout } from './components/layout/Layout';
import { PractitionerDashboard } from './pages/PractitionerDashboard';
import { ClientDashboard } from './pages/ClientDashboard';
import { ClientsPage } from './pages/ClientsPage';
import { ClientProfilePage } from './pages/ClientProfilePage';
import { ClientOnboardingPage } from './pages/ClientOnboardingPage';
import { ClientProfileForm } from './pages/ClientProfileForm';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { ServicesPage } from './pages/ServicesPage';
import { CurrencySettingsPage } from './pages/CurrencySettingsPage';
import { TreatmentCentresPage } from './pages/TreatmentCentresPage';
import { StaffPage } from './pages/StaffPage';
import { ScansPage } from './pages/ScansPage';
import { VideosPage } from './pages/VideosPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if client needs to complete onboarding
  if (user.role === 'client' && !user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is not a client or has already completed onboarding, redirect to dashboard
  if (user.role !== 'client' || user.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  
  if (user?.role === 'practitioner') {
    return <PractitionerDashboard />;
  }
  
  return <ClientDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <ServicesProvider>
          <TreatmentCentresProvider>
            <StaffProvider>
              <ScansProvider>
                <VideoProvider>
                  <AppointmentsProvider>
                    <Router>
                      <Routes>
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/register" element={<RegisterForm />} />
                        <Route 
                          path="/onboarding" 
                          element={
                            <OnboardingRoute>
                              <ClientOnboardingPage />
                            </OnboardingRoute>
                          } 
                        />
                        <Route
                          path="/*"
                          element={
                            <ProtectedRoute>
                              <Layout />
                            </ProtectedRoute>
                          }
                        >
                          <Route path="dashboard" element={<DashboardRouter />} />
                          <Route path="clients" element={<ClientsPage />} />
                          <Route path="clients/:clientId" element={<ClientProfilePage />} />
                          <Route path="profile" element={<ClientProfileForm />} />
                          <Route path="appointments" element={<AppointmentsPage />} />
                          <Route path="services" element={<ServicesPage />} />
                          <Route path="centres" element={<TreatmentCentresPage />} />
                          <Route path="staff" element={<StaffPage />} />
                          <Route path="scans" element={<ScansPage />} />
                          <Route path="videos" element={<VideosPage />} />
                          <Route path="currency-settings" element={<CurrencySettingsPage />} />
                          <Route path="" element={<Navigate to="/dashboard" replace />} />
                          {/* Placeholder routes for future pages */}
                          <Route path="wellness-plans" element={<div className="p-6 text-center text-gray-500">Wellness Plans page coming soon...</div>} />
                          <Route path="reports" element={<div className="p-6 text-center text-gray-500">Reports page coming soon...</div>} />
                          <Route path="settings" element={<div className="p-6 text-center text-gray-500">General Settings page coming soon...</div>} />
                          <Route path="goals" element={<div className="p-6 text-center text-gray-500">Goals page coming soon...</div>} />
                          <Route path="wellness-plan" element={<div className="p-6 text-center text-gray-500">Wellness Plan page coming soon...</div>} />
                          <Route path="notifications" element={<div className="p-6 text-center text-gray-500">Notifications page coming soon...</div>} />
                        </Route>
                      </Routes>
                    </Router>
                  </AppointmentsProvider>
                </VideoProvider>
              </ScansProvider>
            </StaffProvider>
          </TreatmentCentresProvider>
        </ServicesProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;