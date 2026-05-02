import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SalesChat from './pages/SalesChat';
import Sandbox from './pages/Sandbox';
import Settings from './pages/Settings';
import Help from './pages/Help';
import MetricsPage from './pages/Metrics';
import Plans from './pages/Plans';
import Success from './pages/Success';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/plans" element={<Plans />} />
      <Route path="/success" element={<Success />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<SalesChat />} />
        <Route path="/sandbox" element={<Sandbox />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
        <Route path="/metrics" element={<MetricsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
