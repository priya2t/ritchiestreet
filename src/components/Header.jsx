import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CartIcon from './CartIcon';
import { useUserStore } from '../api/userStore';
import { searchSuggestions } from '../api/wordpress';
import '../api/SearchResults.css';

// Simple debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useUserStore();
  const dropdownRef = useRef(null);
  const headerRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 350);

  // Sync search term with URL query on search page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    if (location.pathname === '/search') {
      setSearchTerm(q);
    }
  }, [location.pathname, location.search]);

  // Fetch live suggestions when debounced search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      setLoadingSuggestions(true);
      try {
        const data = await searchSuggestions(debouncedSearchTerm);
        if (data.success) {
          setSuggestions(data.products || []);
          setShowSuggestions((data.products || []).length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLockClick = () => {
    if (isAuthenticated) {
      setAccountDropdownOpen(!accountDropdownOpen);
    } else {
      const currentPath = window.location.pathname + window.location.search;
      const basePath = window.location.pathname.replace(/\/$/, '');
      const isHomePage = basePath === '' || basePath === '/';
      if (!isHomePage) {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      } else {
        sessionStorage.removeItem('redirectAfterLogin');
      }
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    setAccountDropdownOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = searchTerm.trim();
    if (keyword.length < 2) {
      return;
    }
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const handleSuggestionClick = (product) => {
    setSearchTerm(product.name);
    setShowSuggestions(false);
    navigate(`/product/${product.id}`);
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim().length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  return (
    <header ref={headerRef} className={`premium-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="premium-announcement">
        <span>Sales and Services are only within Chennai</span>
      </div>

      <div className="premium-main-header">
        <div className="premium-container">
          <div className="premium-header-left">
            <div className="premium-logo">
              <Link to="/">
                <img src="/images/logo.png" alt="Ritchie Street" />
              </Link>
            </div>
          </div>

          <div className="premium-header-center" ref={searchRef}>
            <form className="premium-search" onSubmit={handleSearch}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products, brands and categories..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                onFocus={() => {
                  if (searchTerm.trim().length >= 2 && suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                aria-label="Search products"
                autoComplete="off"
              />
              <button type="submit" aria-label="Search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
              {showSuggestions && (
                <div className="search-suggestions-dropdown">
                  {loadingSuggestions && suggestions.length === 0 && (
                    <div className="search-suggestions-loading">
                      <div className="spinner-sm"></div>
                      <span>Searching...</span>
                    </div>
                  )}
                  {!loadingSuggestions && suggestions.length === 0 && (
                    <div className="search-suggestions-empty">No products found</div>
                  )}
                  {suggestions.length > 0 && (
                    <ul className="search-suggestions-list">
                      {suggestions.map(product => (
                        <li
                          key={product.id}
                          className="search-suggestion-item"
                          onClick={() => handleSuggestionClick(product)}
                        >
                          <div className="search-suggestion-thumb">
                            <img src={product.image} alt={product.name} loading="lazy" />
                          </div>
                          <div className="search-suggestion-info">
                            <span className="search-suggestion-name">{product.name}</span>
                            <span className="search-suggestion-price">
                              {parseFloat(product.price || 0) > 0
                                ? `₹${parseFloat(product.price).toFixed(2)}`
                                : 'Price not available'}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </form>
          </div>

          <div className="premium-header-right">
            <div className="premium-contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <div className="premium-contact-text">
                <span className="premium-contact-label">Email</span>
                <a href="mailto:info@ritchiestreet.co.in">info@ritchiestreet.co.in</a>
              </div>
            </div>

            <div className="premium-contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <div className="premium-contact-text">
                <span className="premium-contact-label">Phone</span>
                <a href="tel:+918667507040">+91 86675 07040</a>
              </div>
            </div>

            <div className="premium-action-item">
              <Link to="/my-account" className="premium-action-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <div className="premium-action-text">
                  <span className="premium-action-label">Account</span>
                  <span className="premium-action-value">{isAuthenticated ? 'My Account' : 'Sign In'}</span>
                </div>
              </Link>
            </div>

            <div className="premium-action-item">
              <CartIcon />
            </div>

            <button 
              className="premium-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12"></path>
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18"></path>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <nav className={`premium-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="premium-nav-inner">
          <Link to="/" className="premium-nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/about" className="premium-nav-link" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
          <Link to="/services" className="premium-nav-link" onClick={() => setMobileMenuOpen(false)}>Services</Link>
          <Link to="/contact" className="premium-nav-link" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
          <Link to="/terms" className="premium-nav-link" onClick={() => setMobileMenuOpen(false)}>Terms & Conditions</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
