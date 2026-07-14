import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategories, getProductsByCategory } from './woocommerce';
import Layout from './Layout';
import CategoryProductCard from '../components/CategoryProductCard';
import './CategoryProducts.css';

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const categoryCache = new Map();
const allCategoriesCache = { data: null, timestamp: 0 };

const isCacheEntryValid = (entry) =>
  Boolean(entry) && Boolean(entry.timestamp) && Date.now() - entry.timestamp < CACHE_TTL;

const isListCacheValid = () =>
  Boolean(allCategoriesCache.data) &&
  Boolean(allCategoriesCache.timestamp) &&
  Date.now() - allCategoriesCache.timestamp < CACHE_TTL;

const getCategoryDisplayName = (slug) => {
  if (!slug) return 'Category';
  return decodeURIComponent(slug)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const CategoryProducts = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let fadeInTimer = null;

    const scheduleFadeIn = () => {
      if (fadeInTimer) clearTimeout(fadeInTimer);
      fadeInTimer = setTimeout(() => {
        if (!isCancelled) setFadeIn(true);
      }, 50);
    };

    const loadCategoryData = async () => {
      const cached = categoryCache.get(slug);
      if (isCacheEntryValid(cached)) {
        if (!isCancelled) {
          setCategory(cached.category);
          setProducts(cached.products);
          setIsLoading(false);
          setError('');
          setFadeIn(false);
          scheduleFadeIn();
        }
      } else {
        if (!isCancelled) {
          setCategory(null);
          setProducts([]);
          setIsLoading(true);
          setError('');
          setFadeIn(false);
          if (fadeInTimer) clearTimeout(fadeInTimer);
        }
      }

      if (!isCancelled) {
        setIsFetching(true);
      }

      try {
        let categories = await getCategories({ slug, per_page: 1 });
        let matchedCategory = categories.find((cat) => cat.slug === slug);

        if (!matchedCategory) {
          if (isListCacheValid()) {
            categories = allCategoriesCache.data;
          } else {
            categories = await getCategories({ per_page: 100 });
            allCategoriesCache.data = categories;
            allCategoriesCache.timestamp = Date.now();
          }
          matchedCategory = categories.find((cat) => cat.slug === slug);
        }

        if (!matchedCategory) {
          if (!isCancelled) {
            setError('Category not found');
            setCategory(null);
            setProducts([]);
            setIsLoading(false);
            setFadeIn(false);
            if (fadeInTimer) clearTimeout(fadeInTimer);
          }
          return;
        }

        const productsData = await getProductsByCategory(matchedCategory.id);

        if (!isCancelled) {
          setCategory(matchedCategory);
          setProducts(productsData);
          categoryCache.set(slug, {
            category: matchedCategory,
            products: productsData,
            timestamp: Date.now(),
          });
          setIsLoading(false);
          setError('');
          setFadeIn(false);
          scheduleFadeIn();
        }
      } catch (err) {
        console.error('Error fetching category products:', err);
        if (!isCancelled) {
          const cached = categoryCache.get(slug);
          if (isCacheEntryValid(cached)) {
            // Keep cached data; do not overwrite with error on a background refresh.
            setCategory(cached.category);
            setProducts(cached.products);
            setIsLoading(false);
            setError('');
            setFadeIn(false);
            scheduleFadeIn();
          } else {
            setError('Failed to load products. Please try again later.');
            setCategory(null);
            setProducts([]);
            setIsLoading(false);
            setFadeIn(false);
            if (fadeInTimer) clearTimeout(fadeInTimer);
          }
        }
      } finally {
        if (!isCancelled) {
          setIsFetching(false);
        }
      }
    };

    loadCategoryData();

    return () => {
      isCancelled = true;
      if (fadeInTimer) clearTimeout(fadeInTimer);
    };
  }, [slug]);

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

  const categoryName = category?.name || getCategoryDisplayName(slug);
  const showProductCount = category && products.length > 0 && !isLoading;

  // Skeleton loader
  const renderSkeleton = () => (
    <div className="cp-grid cp-grid--loading" key={`${slug}-skeleton`}>
      {[...Array(12)].map((_, i) => (
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
      title={`${categoryName} - Ritchie Street`}
      description={category ? `Shop ${category.name} at Ritchie Street - Best electronics hub in Chennai` : 'Browse categories at Ritchie Street'}
    >
      <main className="cp-page">
        <div className="cp-container">
          {/* Breadcrumb */}
          <nav className="cp-breadcrumb">
            <Link to="/">Home</Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            <span>{categoryName}</span>
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
                <h1>{categoryName}</h1>
                <p>
                  {isLoading || (isFetching && products.length === 0)
                    ? 'Loading products...'
                    : showProductCount
                    ? `Showing ${sortedProducts.length} Product${sortedProducts.length !== 1 ? 's' : ''}`
                    : ' '}
                </p>
              </div>
            </div>

            {/* Sort Dropdown */}
            {!error && (
              <div className="cp-sort">
                <label htmlFor="cp-sort-select">Sort By:</label>
                <select
                  id="cp-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  disabled={isLoading || products.length === 0}
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
          {isLoading && !error && renderSkeleton()}

          {/* Error State */}
          {!isLoading && error && (
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
          {!isLoading && !error && category && products.length === 0 && (
            <div className="cp-empty">
              <div className="cp-empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h2>Products are not available for this category</h2>
              <p>There are no products in the "{categoryName}" category yet.</p>
              <Link to="/" className="cp-back-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Browse All Products
              </Link>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && !error && sortedProducts.length > 0 && (
            <div className={`cp-grid ${fadeIn ? 'cp-fade-in' : ''}`} key={slug}>
              {sortedProducts.map((product) => (
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
