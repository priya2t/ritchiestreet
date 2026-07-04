import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategories, getProductsByCategory } from './woocommerce';
import Layout from './Layout';
import CategoryProductCard from '../components/CategoryProductCard';
import './CategoryProducts.css';

const CategoryProducts = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [slug]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);
      setError('');
      setFadeIn(false);

      // Fetch all categories to find the one matching the slug
      const categories = await getCategories();
      const matchedCategory = categories.find(cat => cat.slug === slug);

      if (!matchedCategory) {
        setError('Category not found');
        setLoading(false);
        return;
      }

      setCategory(matchedCategory);

      // Fetch products for this category
      const productsData = await getProductsByCategory(matchedCategory.id);
      setProducts(productsData);
    } catch (err) {
      setError('Failed to load products. Please try again later.');
      console.error('Error fetching category products:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setFadeIn(true), 50);
    }
  };

  // Helper to extract price from WooCommerce Store API product
  const getProductPrice = (product) => {
    const prices = product.prices || {};
    const divisor = Math.pow(10, prices.currency_minor_unit || 2);
    return (parseFloat(prices.price || 0) / divisor) || 0;
  };

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-low-high':
        return sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
      case 'price-high-low':
        return sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
      case 'newest':
        return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
      case 'featured':
      default:
        return sorted;
    }
  }, [products, sortBy]);

  // Skeleton loader
  const renderSkeleton = () => (
    <div className="cp-grid">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="cp-skeleton-card">
          <div className="cp-skeleton-image cp-shimmer"></div>
          <div className="cp-skeleton-body">
            <div className="cp-skeleton-line cp-shimmer" style={{ width: '80%' }}></div>
            <div className="cp-skeleton-line cp-shimmer" style={{ width: '50%' }}></div>
            <div className="cp-skeleton-line cp-shimmer" style={{ width: '100%', height: '44px', marginTop: '12px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Layout
      title={category ? `${category.name} - Ritchie Street` : 'Category - Ritchie Street'}
      description={category ? `Shop ${category.name} at Ritchie Street - Best electronics hub in Chennai` : 'Browse categories at Ritchie Street'}
    >
      <main className="cp-page">
        <div className="cp-container">
          {/* Breadcrumb */}
          <nav className="cp-breadcrumb">
            <Link to="/">Home</Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            <span>{category ? category.name : 'Category'}</span>
          </nav>

          {/* Premium Category Header */}
          <div className="cp-header">
            <div className="cp-header-left">
              <div className="cp-header-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <div className="cp-header-text">
                <h1>{category ? category.name : 'Category'}</h1>
                {!loading && !error && (
                  <p>Showing <strong>{sortedProducts.length}</strong> Product{sortedProducts.length !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>

            {/* Sort Dropdown */}
            {!loading && products.length > 0 && (
              <div className="cp-sort">
                <label htmlFor="cp-sort-select">Sort By:</label>
                <select
                  id="cp-sort-select"
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

          {/* Loading Skeleton */}
          {loading && renderSkeleton()}

          {/* Error State */}
          {!loading && error && (
            <div className="cp-error">
              <div className="cp-error-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              </div>
              <h2>{error}</h2>
              <p>The category you're looking for might not exist or there was a server error.</p>
              <Link to="/" className="cp-back-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back to Home
              </Link>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && category && products.length === 0 && (
            <div className="cp-empty">
              <div className="cp-empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h2>No products found</h2>
              <p>There are no products in the "{category.name}" category yet.</p>
              <Link to="/" className="cp-back-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Browse All Products
              </Link>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && sortedProducts.length > 0 && (
            <div className={`cp-grid ${fadeIn ? 'cp-fade-in' : ''}`}>
              {sortedProducts.map(product => (
                <CategoryProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default CategoryProducts;
