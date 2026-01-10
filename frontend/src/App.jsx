import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import JobDetailsPage from './pages/JobDetailsPage';
import ErrorBoundary from './components/ErrorBoundary';
import AppHeader from './components/AppHeader';
import AppFooter from './components/AppFooter';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col bg-slate-900 text-slate-200">
          <AppHeader />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/vacancies/:id" element={<JobDetailsPage />} />
            </Routes>
          </div>
          <AppFooter />
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
