import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NipisOverview from './components/dashboard/NipisOverview';
import KasturiOverview from './components/dashboard/KasturiOverview'; 
import DataPage from './components/dashboard/Data';
import FinanceAnalytics from './components/dashboard/Finance';
import Articles from './components/dashboard/Forecast';
import Maintenance from './components/dashboard/Maintenance';
import TeamProfile from './components/dashboard/TeamProfile';
import { useFirestore } from './hook/useFirestoreClean';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-6 bg-white rounded-lg shadow-md border border-red-200 max-w-lg">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 15.5c-.77.833.192 2.5 1.732 2.5z"/>
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
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
                <pre className="text-xs text-red-600 mt-2 overflow-auto max-h-32">
                  {this.state.error && this.state.error.toString()}
                  <br />
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

// Component to determine which overview to show based on sample_id
const DynamicOverview = () => {
  // Get latest sensor data to determine sample_id
  const sensorsData = useFirestore('sensors', {
    orderBy: { field: 'timestamp', direction: 'desc' },
    limit: 1
  });

  // Determine which component to show based on cached or loaded data
  const determineComponent = () => {
    if (sensorsData.data && sensorsData.data.length > 0) {
      const latestSample = sensorsData.data[0];
      const sampleId = latestSample.sample_id || '';
      return sampleId.toLowerCase().includes('nipis') ? <NipisOverview /> : <KasturiOverview />;
    }
    return <NipisOverview />; // Default
  };

  const [overviewComponent, setOverviewComponent] = useState(determineComponent);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔍 DynamicOverview: sensorsData state:', {
      loading: sensorsData.loading,
      error: sensorsData.error,
      dataLength: sensorsData.data?.length || 0,
      data: sensorsData.data?.[0],
      hasCache: sensorsData.data?.length > 0 && !sensorsData.loading
    });

    if (sensorsData.error) {
      console.error('❌ DynamicOverview: Firestore error:', sensorsData.error);
      setError(sensorsData.error);
      setOverviewComponent(<NipisOverview />);
      return;
    }

    if (sensorsData.data && sensorsData.data.length > 0) {
      const latestSample = sensorsData.data[0];
      const sampleId = latestSample.sample_id || '';

      console.log('📊 DynamicOverview: Found sample_id:', sampleId);

      // Check if sample_id contains 'nipis' - case insensitive
      if (sampleId.toLowerCase().includes('nipis')) {
        console.log('🍋 DynamicOverview: Routing to NipisOverview');
        setOverviewComponent(<NipisOverview />);
      } else {
        console.log('🟢 DynamicOverview: Routing to KasturiOverview');
        setOverviewComponent(<KasturiOverview />);
      }
    } else if (!sensorsData.loading) {
      // If no data found and not loading, default to Nipis
      console.log('📝 DynamicOverview: No data found, defaulting to NipisOverview');
      setOverviewComponent(<NipisOverview />);
    }
  }, [sensorsData.data, sensorsData.loading, sensorsData.error]);

  // Only show loading if Firestore is loading AND we don't have a component yet
  if (sensorsData.loading && !overviewComponent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
          <p className="text-xs text-gray-400 mt-2">Connecting to Firestore...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md border border-red-200">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Connection Error</h3>
          <p className="text-gray-600 mb-4">Failed to connect to database. Loading default dashboard...</p>
          <p className="text-xs text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }
  
  return overviewComponent || <NipisOverview />;
};

function App() {
  console.log('🚀 App component rendering...');
  
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={
              <ErrorBoundary>
                <DynamicOverview />
              </ErrorBoundary>
            } />
            <Route path="/nipis" element={
              <ErrorBoundary>
                <NipisOverview />
              </ErrorBoundary>
            } />
            <Route path="/kasturi" element={
              <ErrorBoundary>
                <KasturiOverview />
              </ErrorBoundary>
            } />
            {/* Add other routes as you create the components */}
            <Route path="/data" element={<DataPage />} />
            <Route path="/finance-analytics" element={<FinanceAnalytics />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/team-profile" element={<TeamProfile />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;