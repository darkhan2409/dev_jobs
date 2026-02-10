import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ScrollRestoration } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
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

// Guide pages (lazy loaded — isolated educational section)
const GuideLayout = lazy(() => import('./pages/guide/GuideLayout'));
const GuidePipelinePage = lazy(() => import('./pages/guide/GuidePipelinePage'));
const GuideStageDetailPage = lazy(() => import('./pages/guide/GuideStageDetailPage'));
const GuideRoleProfilePage = lazy(() => import('./pages/guide/GuideRoleProfilePage'));
const GuideArtifactPage = lazy(() => import('./pages/guide/GuideArtifactPage'));

// Dynamic TitleUpdater component
const TitleUpdater = () => {
  const location = useLocation();

  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/') document.title = 'GitJob — IT‑вакансии в Казахстане';
    else if (path === '/jobs') document.title = 'Каталог вакансий | GitJob';
    else if (path === '/about') document.title = 'О нас | GitJob';
    else if (path === '/privacy') document.title = 'Политика конфиденциальности | GitJob';
    else if (path === '/post-job') document.title = 'Работодателям | GitJob';
    else if (path === '/companies') document.title = 'Компании | GitJob';
    else if (path === '/career') document.title = 'Карьерный тест | GitJob';
    else if (path === '/security') document.title = 'Безопасность | GitJob';
    else if (path === '/forgot-password') document.title = 'Восстановление пароля | GitJob';
    else if (path === '/reset-password') document.title = 'Сброс пароля | GitJob';
    else if (path.startsWith('/guide')) document.title = 'Как создаются IT-продукты | GitJob';
  }, [location]);

  return null;
};

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  React.useEffect(() => {
    // Small delay to let users see the content change before scrolling
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, search]);

  return null;
};

// Redirect component for legacy /vacancies/:id URLs
const VacancyRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/jobs/${id}`} replace />;
};

// Loading fallback for guide pages
const GuideLoadingFallback = () => (
  <div className="min-h-screen bg-[#020617] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
  </div>
);

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
        {/* Guide — educational section within main layout */}
        <Route
          path="/guide/*"
          element={
            <Suspense fallback={<GuideLoadingFallback />}>
              <Routes>
                <Route element={<GuideLayout />}>
                  <Route index element={<GuidePipelinePage />} />
                  <Route path=":stageId" element={<GuideStageDetailPage />} />
                  <Route path="role/:roleId" element={<GuideRoleProfilePage />} />
                  <Route path="artifact/:artifactId" element={<GuideArtifactPage />} />
                </Route>
              </Routes>
            </Suspense>
          }
        />
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
