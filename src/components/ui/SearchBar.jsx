import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  const searchableContent = [
    { title: 'Sales Growth', content: 'Track sales performance and growth metrics', url: '#stat1' },
    { title: 'Total Revenue', content: 'Monitor total revenue and financial performance', url: '#stat2' },
    { title: 'Customer Satisfaction', content: 'Customer satisfaction scores and feedback', url: '#stat3' },
    { title: 'Active Users', content: 'Number of active users on the platform', url: '#stat4' },
    { title: 'Data Analytics', content: 'Historical data and analytics dashboard', url: '/historical-data' },
    { title: 'Finance Analytics', content: 'Financial reports and analytics', url: '/finance-analytics' },
    { title: 'Articles', content: 'Knowledge base and article section', url: '/articles' },
    { title: 'Team Profile', content: 'Team member profiles and information', url: '/team-profile' },
    { title: 'Performance Metrics', content: 'System performance charts and metrics', url: '#lineChart' },
    { title: 'Cache Performance', content: 'Cache hit and miss rates', url: '#barChart' },
    { title: 'Daily Visits', content: 'Daily visitor distribution', url: '#pieChart' },
    { title: 'Browser Performance', content: 'Performance across browsers', url: '#pentagonalChart' },
    { title: 'System Health', content: 'Overall system health score', url: '#gaugeChart' }
  ];

  const handleSearch = (value) => {
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setShowResults(false);
      return;
    }

    const filtered = searchableContent.filter(item =>
      item.title.toLowerCase().includes(value.toLowerCase()) ||
      item.content.toLowerCase().includes(value.toLowerCase())
    );

    setSearchResults(filtered);
    setShowResults(true);
  };

  const handleResultClick = (url) => {
    setShowResults(false);
    setSearchTerm('');
    
    if (url.startsWith('#')) {
      const element = document.querySelector(url);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (url.startsWith('/')) {
      navigate(url);
    } else {
      window.location.href = url;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="search-container position-relative" ref={searchContainerRef}>
      <input
        type="text"
        className="form-control search-input"
        placeholder="Search..."
        aria-label="Search"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {showResults && (
        <div 
          className="search-results position-absolute w-100 mt-1"
          style={{
            display: 'block',
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1001,
            textAlign: 'left'
          }}
        >
          {searchResults.length > 0 ? (
            searchResults.map((item, index) => (
              <div
                key={index}
                className="search-result-item p-1 border-bottom"
                style={{ cursor: 'pointer', color: '#333' }}
                onClick={() => handleResultClick(item.url)}
              >
                <div className="fw-bold">{item.title}</div>
                <div className="small text-secondary">{item.content}</div>
              </div>
            ))
          ) : (
            <div className="p-3 text-secondary">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;