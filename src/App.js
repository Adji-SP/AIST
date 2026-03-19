import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import { AuthProvider, ProtectedRoute, AdminRoute } from './auth/AuthContext';
import Login from './auth/Login';
import Register from './auth/Register';

// Pages
import Landing from './pages/Landing';

// Dashboard pages
import Overview from './components/dashboard/Overview';
import DataPage from './components/dashboard/Data';
import FinanceAnalytics from './components/dashboard/Finance';
import Articles from './components/dashboard/Forecast';
import Maintenance from './components/dashboard/Maintenance';
import TeamProfile from './components/dashboard/TeamProfile';
import LandingEditor from './components/dashboard/LandingEditor';

// Admin TailAdmin-themed Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DeviceRegistry from './pages/admin/DeviceRegistry';
import DeviceManagement from './pages/DeviceManagement';

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() { return { hasError: true }; }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-6 bg-white rounded-lg shadow-md border border-red-200 max-w-lg">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">The application encountered an unexpected error.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
                <pre className="text-xs text-red-600 mt-2 overflow-auto max-h-32">
                  {this.state.error && this.state.error.toString()}
                  {'\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Legacy redirects */}
              <Route path="/nipis" element={<Navigate to="/overview" replace />} />
              <Route path="/kasturi" element={<Navigate to="/overview" replace />} />

              {/* Protected dashboard routes */}
              <Route path="/overview" element={<ProtectedRoute><ErrorBoundary><Overview /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/data" element={<ProtectedRoute><DataPage /></ProtectedRoute>} />
              <Route path="/finance-analytics" element={<ProtectedRoute><FinanceAnalytics /></ProtectedRoute>} />
              <Route path="/articles" element={<ProtectedRoute><Articles /></ProtectedRoute>} />
              <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
              <Route path="/devices" element={<ProtectedRoute><DeviceManagement /></ProtectedRoute>} />
              <Route path="/team-profile" element={<ProtectedRoute><TeamProfile /></ProtectedRoute>} />
              <Route path="/landing-editor" element={<AdminRoute><LandingEditor /></AdminRoute>} />

              {/* New TailAdmin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
              <Route path="/admin/devices" element={<AdminRoute><DeviceRegistry /></AdminRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;