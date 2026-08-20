import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategories, getProductsByCategory } from './woocommerce';
import Layout from './Layout';
import CategoryProductCard from '../components/CategoryProductCard';
import SortDropdown from '../components/SortDropdown';
import FilterToolbar from '../components/FilterToolbar';
import ComingSoonPlaceholder from '../components/ComingSoonPlaceholder';
import Pagination from '../components/Pagination';
import './CategoryProducts.css';

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const allCategoriesCache = { data: null, timestamp: 0 };

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

const CategoryProducts = ({ onPriceCompare }) => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [fadeIn, setFadeIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

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
      if (!isCancelled) {
        setCategory(null);
        setProducts([]);
        setIsLoading(true);
        setError('');
        setFadeIn(false);
        if (fadeInTimer) clearTimeout(fadeInTimer);
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

        const productsData = await getProductsByCategory(matchedCategory.id, { page: currentPage });

        if (!isCancelled) {
          setCategory(matchedCategory);
          setProducts(productsData.products);
          setTotalPages(productsData.totalPages);
          setTotal(productsData.total);
          setIsLoading(false);
          setError('');
          setFadeIn(false);
          scheduleFadeIn();
        }
      } catch (err) {
        console.error('Error fetching category products:', err);
        if (!isCancelled) {
          setError('Failed to load products. Please try again later.');
          setCategory(null);
          setProducts([]);
          setIsLoading(false);
          setFadeIn(false);
          if (fadeInTimer) clearTimeout(fadeInTimer);
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
  }, [slug, currentPage]);

  // Helper to extract price from WooCommerce Store API product
  const getProductPrice = (product) => {
    const prices = product.prices || {};
    const divisor = Math.pow(10, prices.currency_minor_unit || 2);
    return (parseFloat(prices.price || 0) / divisor) || 0;
  };

  // Sort products (only for current page)
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

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    setCurrentPage(1); // Reset to page 1 when sort changes
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    setFadeIn(false);
  }, []);

  const categoryName = category?.name || getCategoryDisplayName(slug);
  const showProductCount = category && total > 0 && !isLoading;
  
  // Check if this is a refurbished or used category page
  const isRefurbishedCategory = slug === 'refurbished' || slug === 'used';
  const showConditionFilter = false; // Condition dropdown removed as requested

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
                    ? `Showing ${total} Product${total !== 1 ? 's' : ''}`
                    : ' '}
                </p>
              </div>
            </div>

            {/* Filter Toolbar */}
            {!error && (
              <FilterToolbar>
                <SortDropdown
                  value={sortBy}
                  onChange={handleSortChange}
                  options={[
                    { value: 'featured', label: 'Default' },
                    { value: 'price-low-high', label: 'Price: Low to High' },
                    { value: 'price-high-low', label: 'Price: High to Low' },
                    { value: 'newest', label: 'Newest' }
                  ]}
                  disabled={isLoading || sortedProducts.length === 0}
                />
              </FilterToolbar>
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
          {!isLoading && !error && category && (!products || products.length === 0) && (
            <ComingSoonPlaceholder />
          )}

          {/* Products Grid */}
          {!isLoading && !error && sortedProducts && sortedProducts.length > 0 && (
            <div className={`cp-grid ${fadeIn ? 'cp-fade-in' : ''}`} key={slug}>
              {sortedProducts.map((product) => (
                <CategoryProductCard key={product.id} product={product} onPriceCompare={onPriceCompare} categorySlug={slug} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </main>
    </Layout>
  );
};

export default CategoryProducts;
