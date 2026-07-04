import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { searchProducts } from './wordpress';
import Layout from './Layout';
import SearchResultCard from '../components/SearchResultCard';
import './SearchResults.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(query);
  const [sortBy, setSortBy] = useState('featured');
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setSearchInput(query);
    if (query.trim().length >= 2) {
      fetchSearchResults(query);
    } else if (query.trim().length > 0) {
      setProducts([]);
      setError('Please enter at least 2 characters to search.');
    } else {
      setProducts([]);
      setError('');
    }
  }, [query]);

  const fetchSearchResults = async (keyword) => {
    try {
      setLoading(true);
      setError('');
      setFadeIn(false);
      const data = await searchProducts(keyword, 50);
      if (data.success) {
        setProducts(data.products || []);
      } else {
        setError('Failed to load search results. Please try again.');
      }
    } catch (err) {
      setError('Failed to load search results. Please try again.');
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setFadeIn(true), 50);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const keyword = searchInput.trim();
    if (keyword.length < 2) {
      setError('Please enter at least 2 characters to search.');
      return;
    }
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-low-high':
        return sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      case 'price-high-low':
        return sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      case 'newest':
        return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
      case 'featured':
      default:
        return sorted;
    }
  }, [products, sortBy]);

  return (
    <Layout
      title={query ? `Search Results for "${query}" | Ritchie Street` : 'Search Products | Ritchie Street'}
      description={`Search results for ${query} at Ritchie Street - Best Online Electronics Hub in Chennai.`}
    >
      <main className="sr-page">
        <div className="sr-container">
          {/* Breadcrumb */}
          <nav className="sr-breadcrumb">
            <Link to="/">Home</Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            <span>Search Results</span>
          </nav>

          {/* Premium Search Header */}
          <div className="sr-header">
            <div className="sr-header-left">
              <div className="sr-header-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </div>
              <div className="sr-header-text">
                <h1>Search Results</h1>
                {query && (
                  <p>Showing {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} for: <strong>"{query}"</strong></p>
                )}
              </div>
            </div>

            {/* Sort Dropdown */}
            {!loading && products.length > 0 && (
              <div className="sr-sort">
                <label htmlFor="sr-sort-select">Sort By:</label>
                <select
                  id="sr-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="sr-loading">
              <div className="sr-spinner"></div>
              <p>Searching products...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="sr-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              <p>{error}</p>
            </div>
          )}

          {/* Empty query prompt */}
          {!loading && !error && query.trim().length === 0 && (
            <div className="sr-empty-state">
              <div className="sr-empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </div>
              <h2>Search for products</h2>
              <p>Enter a keyword to find products, brands, and categories.</p>
              <form className="sr-search-form" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                />
                <button type="submit">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  Search
                </button>
              </form>
            </div>
          )}

          {/* No Results Found */}
          {!loading && !error && query.trim().length >= 2 && products.length === 0 && (
            <div className="sr-empty-state">
              <div className="sr-empty-icon no-results">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                  <path d="M8 8l6 6"></path>
                  <path d="M14 8l-6 6"></path>
                </svg>
              </div>
              <h2>No products found for "{query}"</h2>
              <p>Try a different keyword or check your spelling.</p>
              <form className="sr-search-form" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search again..."
                  aria-label="Search again"
                />
                <button type="submit">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  Search
                </button>
              </form>
              <Link to="/" className="sr-continue-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Continue Shopping
              </Link>
            </div>
          )}

          {/* Product Grid */}
          {!loading && !error && sortedProducts.length > 0 && (
            <div className={`sr-grid ${fadeIn ? 'sr-fade-in' : ''}`}>
              {sortedProducts.map(product => (
                <SearchResultCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default SearchResults;
