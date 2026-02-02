import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
    if (path === '/') document.title = 'DevJobs - Find IT Work';
    else if (path === '/jobs') document.title = 'Vacancy Catalog | DevJobs';
    else if (path === '/about') document.title = 'About Us | DevJobs';
    else if (path === '/privacy') document.title = 'Privacy Policy | DevJobs';
    else if (path === '/post-job') document.title = 'For Employers | DevJobs';
    else if (path === '/companies') document.title = 'Companies | DevJobs';
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
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/post-job" element={<PostJobPage />} />
        {/* Legacy support primarily for old links if any */}
        <Route path="/vacancies/:id" element={<JobDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
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
