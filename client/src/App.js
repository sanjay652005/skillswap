import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Exchanges from './pages/Exchanges';
import ExchangeWorkspace from './pages/ExchangeWorkspace';
import Projects from './pages/Projects';
import ProjectWorkspace from './pages/ProjectWorkspace';
import AIChatbot from './pages/AIChatbot';
import AIMatches from './pages/AIMatches';
import Messages from './pages/Messages';
import LearningPath from './pages/LearningPath';
import ProgressTracker from './pages/ProgressTracker';
import Landing from './pages/Landing';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ background: '#0a0a0f' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-violet-400 font-display text-lg">Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/app/dashboard" /> : children;
};

const ProfileRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/app/profile/${id}`} replace />;
};

const LandingRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/app/dashboard" /> : <Landing />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingRoute />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
          <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:id" element={<Profile />} />
            <Route path="explore" element={<Explore />} />
            <Route path="exchanges" element={<Exchanges />} />
            <Route path="exchanges/workspace/:id" element={<ExchangeWorkspace />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/workspace/:id" element={<ProjectWorkspace />} />
            <Route path="ai" element={<AIChatbot />} />
            <Route path="ai-matches" element={<AIMatches />} />
            <Route path="messages" element={<Messages />} />
            <Route path="messages/:userId" element={<Messages />} />
            <Route path="learning-path" element={<LearningPath />} />
            <Route path="progress" element={<ProgressTracker />} />
          </Route>
          {/* Redirect old paths */}
          <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/app/dashboard" /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Navigate to="/app/explore" /></ProtectedRoute>} />
          <Route path="/exchanges/*" element={<ProtectedRoute><Navigate to="/app/exchanges" /></ProtectedRoute>} />
          <Route path="/messages/*" element={<ProtectedRoute><Navigate to="/app/messages" /></ProtectedRoute>} />
          <Route path="/projects/*" element={<ProtectedRoute><Navigate to="/app/projects" /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><Navigate to="/app/ai" /></ProtectedRoute>} />
          <Route path="/ai-matches" element={<ProtectedRoute><Navigate to="/app/ai-matches" /></ProtectedRoute>} />
          <Route path="/learning-path" element={<ProtectedRoute><Navigate to="/app/learning-path" /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Navigate to="/app/progress" /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Navigate to="/app/profile" /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><ProfileRedirect /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}