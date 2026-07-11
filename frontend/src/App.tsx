import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import CreateTask from './pages/CreateTask';
import TaskExplorer from './pages/TaskExplorer';
import EscrowManager from './pages/EscrowManager';
import PaymentLedger from './pages/PaymentLedger';
import Settings from './pages/Settings';
import Governance from './pages/Governance';
import AppLayout from './components/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import { contractService } from './services/contracts';

function App() {
  // Initialize contract service on app startup
  useEffect(() => {
    contractService.initialize().catch((error) => {
      console.error('Failed to initialize contract service:', error);
    });
  }, []);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={
            <ErrorBoundary fallback={<ErrorFallback title="Dashboard Error" />}>
              <Home />
            </ErrorBoundary>
          }
        />
        <Route
          path="/tasks"
          element={
            <ErrorBoundary fallback={<ErrorFallback title="Explorer Error" />}>
              <TaskExplorer />
            </ErrorBoundary>
          }
        />
        <Route
          path="/create-task"
          element={
            <ErrorBoundary fallback={<ErrorFallback title="Create Task Error" />}>
              <CreateTask />
            </ErrorBoundary>
          }
        />
        <Route
          path="/escrow"
          element={
            <ErrorBoundary fallback={<ErrorFallback title="Escrow Error" />}>
              <EscrowManager />
            </ErrorBoundary>
          }
        />
        <Route
          path="/governance"
          element={
            <ErrorBoundary fallback={<ErrorFallback title="Governance Error" />}>
              <Governance />
            </ErrorBoundary>
          }
        />
        <Route
          path="/history"
          element={
            <ErrorBoundary fallback={<ErrorFallback title="History Error" />}>
              <PaymentLedger />
            </ErrorBoundary>
          }
        />
        <Route
          path="/settings"
          element={
            <ErrorBoundary fallback={<ErrorFallback title="Settings Error" />}>
              <Settings />
            </ErrorBoundary>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
      </Route>
    </Routes>
  );
}

export default App;
