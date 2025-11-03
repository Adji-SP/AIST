import { useState, useEffect } from 'react';
import Sidebar from '../layout/sidebar';
import NumericDisplay from '../ui/NumericDisplay';
import DigitalClock from '../ui/DigitalClock';
import SearchBar from '../ui/SearchBar';
import { BarChart, LineChart, PieChart, PentagonalChart, GaugeChart } from '../charts/chartSetup';
import '../../styles/main.css';
// import { useElectronAPI, useRealTimeData } from '../../hook/useElectronApi';

// SVG Icon for Sidebar Toggle (Hamburger Menu) - Enlarged to 32x32
const HamburgerIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="hamburger-icon"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.46447 20.5355C4.92893 22 7.28595 22 12 22C16.714 22 19.0711 22 20.5355 20.5355C22 19.0711 22 16.714 22 12C22 7.28595 22 4.92893 20.5355 3.46447C19.0711 2 16.714 2 12 2C7.28595 2 4.92893 2 3.46447 3.46447C2 4.92893 2 7.28595 2 12C2 16.714 2 19.0711 3.46447 20.5355ZM18.75 16C18.75 16.4142 18.4142 16.75 18 16.75H6C5.58579 16.75 5.25 16.4142 5.25 16C5.25 15.5858 5.58579 15.25 6 15.25H18C18.4142 15.25 18.75 15.5858 18.75 16ZM18 12.75C18.4142 12.75 18.75 12.4142 18.75 12C18.75 11.5858 18.4142 11.25 18 11.25H6C5.58579 11.25 5.25 11.5858 5.25 12C5.25 12.4142 5.58579 12.75 6 12.75H18ZM18.75 8C18.75 8.41421 18.4142 8.75 18 8.75H6C5.58579 8.75 5.25 8.41421 5.25 8C5.25 7.58579 5.58579 7.25 6 7.25H18C18.4142 7.25 18.75 7.58579 18.75 8Z"
      fill="currentColor"
    />
  </svg>
);

// SVG Icon for Search Button
const SearchIcon = () => (
  <svg
    width="20"
    height="45"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="search-icon"
  >
    <path
      d="M15.5 14H14.71L14.43 13.73C15.63 12.33 16.25 10.42 15.91 8.39C15.44 5.61 13.12 3.39 10.32 3.05C6.09 2.53 2.53 6.09 3.05 10.32C3.39 13.12 5.61 15.44 8.39 15.91C10.42 16.25 12.33 15.63 13.73 14.43L14 14.71V15.5L18.25 19.75C18.66 20.16 19.33 20.16 19.74 19.75C20.15 19.34 20.15 18.67 19.74 18.26L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
      fill="currentColor"
    />
  </svg>
);

// SVG Icon for Clock Button
const ClockIcon = () => (
  <svg
    width="0"
    height="0"
    viewBox="0 0 0 0"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="clock-icon"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM15.07 11.25L14.17 12.17C13.45 12.89 13 13.5 13 15H11V14.5C11 13.39 11.45 12.39 12.17 11.67L13.41 10.41C13.78 10.05 14 9.55 14 9C14 7.89 13.1 7 12 7C10.9 7 10 7.89 10 9H8C8 6.79 9.79 5 12 5C14.21 5 16 6.79 16 9C16 9.88 15.64 10.68 15.07 11.25Z"
      fill="currentColor"
    />
  </svg>
);

// Header component
const Header = ({ children, onToggleSidebar, sidebarOpen }) => {
  return (
    <header className={`header d-flex justify-content-between align-items-center ${sidebarOpen ? '' : 'expanded'}`}>
      <div className="d-flex align-items-center gap-3">
        <button className="desktop-toggle" onClick={onToggleSidebar}>
          <HamburgerIcon />
        </button>
        {children}
      </div>
      <div className="d-flex align-items-center gap-3">
        <div className="search-button">
          <SearchIcon />
          <SearchBar />
        </div>
        <div className="clock-button">
          <ClockIcon />
          <DigitalClock />
        </div>
      </div>
    </header>
  );
};

const Overview = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile); // Open sidebar on desktop, close on mobile
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Sample data for charts
  const cachePerformanceData = {
    labels: ['HTML', 'CSS', 'JavaScript', 'Images', 'Fonts', 'API'],
    datasets: [
      {
        label: 'Cache Hit',
        data: [85, 92, 78, 95, 88, 72],
        backgroundColor: '#3b82f6',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Cache Miss',
        data: [10, 6, 15, 3, 8, 20],
        backgroundColor: '#f97316',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'No Cache',
        data: [5, 2, 7, 2, 4, 8],
        backgroundColor: '#6b7280',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const performanceMetricsData = {
    labels: ['Aug 01', 'Aug 02', 'Aug 03', 'Aug 04', 'Aug 05', 'Aug 06'],
    datasets: [
      {
        label: 'CPU Usage',
        data: [65, 70, 68, 72, 75, 73],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: 'Memory Usage',
        data: [55, 60, 58, 62, 65, 63],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  const dailyVisitsData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    datasets: [
      {
        data: [1234, 2234, 3234, 4234],
        backgroundColor: [
          'rgba(117,169,255,0.6)',
          'rgba(148,223,215,0.6)',
          'rgba(208,129,222,0.6)',
          'rgba(247,127,167,0.6)',
        ],
      },
    ],
  };

  const browserPerformanceData = {
    labels: ['Load Time', 'First Paint', 'DOM Loaded', 'Cache Efficiency', 'JS Execution'],
    datasets: [
      {
        label: 'Chrome',
        data: [75, 80, 85, 85, 78],
        borderColor: '#ffffff',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: '#3b82f6',
      },
      {
        label: 'Firefox',
        data: [68, 75, 80, 78, 72],
        borderColor: '#ffffff',
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: '#f97316',
      },
      {
        label: 'Safari',
        data: [82, 85, 78, 92, 76],
        borderColor: '#ffffff',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: '#10b981',
      },
      {
        label: 'IE',
        data: [55, 60, 52, 65, 58],
        borderColor: '#ffffff',
        backgroundColor: 'rgba(107, 114, 128, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: '#6b7280',
      },
    ],
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleNavClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <div>
      {isMobile && (
        <button className="mobile-toggle" onClick={toggleSidebar}>
          <HamburgerIcon />
        </button>
      )}

      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay show" onClick={closeSidebar}></div>
      )}

      <Sidebar isOpen={sidebarOpen} onNavClick={handleNavClick} />

      <main className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
        <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen}>
          <h1 id="pageTitle" className="h3 text-dark mb-0">
            <strong>Overview</strong>
          </h1>
        </Header>

        <div className="content p-4">
          {/* First row: Report Summary and System Health Gauge */}
          <div className="row mb-4">
            <div className="col-lg-6 col-md-12 mb-4">
              <div className="report-summary h-100 position-relative">
                <h3>Report Summary</h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
                  irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
                <a href="Report.html" className="btn btn-generate-report mt-3">
                  Generate Report
                </a>
              </div>
            </div>
            <div className="col-lg-6 col-md-12 mb-4">
              <div className="chart-container h-100">
                <h3>System Health</h3>
                <GaugeChart 
                  value={75}
                  maxValue={100}
                  unit="%"
                  height={250}
                  colors={{
                    primary: '#3b82f6',
                    secondary: '#6b7280',
                    text: '#000000',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Second row: Numeric Displays */}
          <div className="row mb-4">
            <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
              <NumericDisplay 
                id="stat1"
                value={85}
                label="Lorem Ipsum"
                iconClass="fas fa-chart-line"
                isPercentage={true}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
              <NumericDisplay 
                id="stat2"
                value={120}
                label="Dolor Sit"
                iconClass="fas fa-dollar-sign"
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
              <NumericDisplay 
                id="stat3"
                value={95}
                label="Amet Consectetur"
                iconClass="fas fa-smile"
                isPercentage={true}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
              <NumericDisplay 
                id="stat4"
                value={45}
                label="Adipiscing Elit"
                iconClass="fas fa-users"
              />
            </div>
          </div>

          {/* Charts row 1 */}
          <div className="row mb-4">
            <div className="col-lg-6 col-md-12 mb-4">
              <div className="chart-container">
                <h3>Cache Performance</h3>
                <BarChart 
                  data={cachePerformanceData}
                  height={300}
                  colors={{
                    primary: '#3b82f6',
                    secondary: '#f97316',
                    tertiary: '#6b7280',
                    text: '#000000',
                  }}
                />
              </div>
            </div>
            <div className="col-lg-6 col-md-12 mb-4">
              <div className="chart-container">
                <h3>Performance Metrics</h3>
                <LineChart 
                  data={performanceMetricsData}
                  height={300}
                  colors={{
                    primary: '#3b82f6',
                    secondary: '#f97316',
                    text: '#000000',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Charts row 2 */}
          <div className="row mb-4">
            <div className="col-lg-6 col-md-12 mb-4">
              <div className="chart-container">
                <h3>Daily Visits</h3>
                <PieChart 
                  data={dailyVisitsData}
                  height={300}
                  colors={{
                    text: '#000000',
                  }}
                  showLegend={true}
                />
              </div>
            </div>
            <div className="col-lg-6 col-md-12 mb-4">
              <div className="chart-container">
                <h3>Browser Performance</h3>
                <PentagonalChart 
                  data={browserPerformanceData}
                  height={300}
                  colors={{
                    primary: '#3b82f6',
                    secondary: '#f97316',
                    tertiary: '#10b981',
                    quaternary: '#6b7280',
                    text: '#000000',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Overview;