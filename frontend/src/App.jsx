import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ScrollRestoration } from 'react-router-dom';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import ProfilePage from './pages/ProfilePage';
import PostJobPage from './pages/PostJobPage';
import NotFoundPage from './pages/NotFoundPage';
import CareerPage from './pages/CareerPage';
import SecuritySettingsPage from './pages/SecuritySettingsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ErrorBoundary from './components/ErrorBoundary';
import AppHeader from './components/AppHeader';
import AppFooter from './components/AppFooter';
import BackgroundEffect from './components/BackgroundEffect';
import { AuthProvider } from './context/AuthContext';

// Dynamic TitleUpdater component
const TitleUpdater = () => {
  const location = useLocation();

  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/') document.title = 'DevJobs — IT‑вакансии в Казахстане';
    else if (path === '/jobs') document.title = 'Каталог вакансий | DevJobs';
    else if (path === '/about') document.title = 'О нас | DevJobs';
    else if (path === '/privacy') document.title = 'Политика конфиденциальности | DevJobs';
    else if (path === '/post-job') document.title = 'Работодателям | DevJobs';
    else if (path === '/companies') document.title = 'Компании | DevJobs';
    else if (path === '/career') document.title = 'Карьерный тест | DevJobs';
    else if (path === '/security') document.title = 'Безопасность | DevJobs';
    else if (path === '/forgot-password') document.title = 'Восстановление пароля | DevJobs';
    else if (path === '/reset-password') document.title = 'Сброс пароля | DevJobs';
    // Note: Detail page title updates will happen in the page itself once data is loaded
  }, [location]);

  return null;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

import React from 'react';

// Redirect component for legacy /vacancies/:id URLs
const VacancyRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/jobs/${id}`} replace />;
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:companyName" element={<CompanyProfilePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/career" element={<CareerPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/post-job" element={<PostJobPage />} />
        {/* Legacy redirect: /vacancies/:id → /jobs/:id */}
        <Route path="/vacancies/:id" element={<VacancyRedirect />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/security" element={<SecuritySettingsPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <TitleUpdater />
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col text-slate-200 relative">
            <BackgroundEffect />
            <AppHeader />
            <div className="flex-1">
              <AnimatedRoutes />
            </div>
            <AppFooter />
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;
