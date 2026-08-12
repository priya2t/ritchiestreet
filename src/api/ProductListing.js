import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProductsByCategory, getCategoryBySlug, getProducts } from './woocommerce';
import Layout from './Layout';
import ProductCard from '../components/ProductCard';
import FilterToolbar from '../components/FilterToolbar';
import SearchInput from '../components/SearchInput';
import SortDropdown from '../components/SortDropdown';
import ConditionDropdown from '../components/ConditionDropdown';
import ComingSoonPlaceholder from '../components/ComingSoonPlaceholder';
import './ProductListing.css';

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const productListingCache = new Map();

const isCacheEntryValid = (entry) =>
  Boolean(entry) && Boolean(entry.timestamp) && Date.now() - entry.timestamp < CACHE_TTL;

const sortOptions = [
  { value: 'featured', label: 'Default' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' }
];

const ProductListing = ({ onPriceCompare, pageType }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [condition, setCondition] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [fadeIn, setFadeIn] = useState(false);
  const [pageInfo, setPageInfo] = useState(null);

  // Page configuration
  const pageConfig = useMemo(() => {
    switch (pageType) {
      case 'refurbished':
        return {
          title: 'Refurbished & Used Products',
          description: 'Shop refurbished and used electronics at Ritchie Street - Best prices on quality refurbished products in Chennai.',
          icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          ),
          showConditionFilter: true,
          searchPlaceholder: 'Search refurbished products...'
        };
      case 'rental':
        return {
          title: 'Rental Products',
          description: 'Rent electronics and equipment at Ritchie Street - Best rental rates on quality products in Chennai.',
          icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          ),
          showConditionFilter: false,
          searchPlaceholder: 'Search rental products...'
        };
      default:
        return {
          title: 'Products',
          description: 'Browse our products',
          icon: null,
          showConditionFilter: false,
          searchPlaceholder: 'Search products...'
        };
    }
  }, [pageType]);

  // Load products based on page type
  useEffect(() => {
    let isCancelled = false;
    let fadeInTimer = null;

    const scheduleFadeIn = () => {
      if (fadeInTimer) clearTimeout(fadeInTimer);
      fadeInTimer = setTimeout(() => {
        if (!isCancelled) setFadeIn(true);
      }, 50);
    };

    const loadProducts = async () => {
      const cacheKey = `${pageType}:${condition}:${sortBy}`;
      const cached = productListingCache.get(cacheKey);
      
      if (isCacheEntryValid(cached)) {
        if (!isCancelled) {
          setProducts(cached.products);
          setPageInfo(cached.pageInfo);
          setIsLoading(false);
          setError('');
          setFadeIn(false);
          scheduleFadeIn();
        }
        return;
      }

      if (!isCancelled) {
        setProducts([]);
        setPageInfo(null);
        setIsLoading(true);
        setError('');
        setFadeIn(false);
        if (fadeInTimer) clearTimeout(fadeInTimer);
      }

      try {
        console.log(`=== PRODUCT LISTING: Loading ${pageType} products ===`);
        let data = [];
        let currentPageInfo = null;

        if (pageType === 'rental') {
          // Load Rental category products
          console.log('Loading rental products...');
          const rentalCategory = await getCategoryBySlug('rental');
          console.log('Rental category:', rentalCategory);
          
          if (!rentalCategory) {
            throw new Error('Rental category not found in WooCommerce');
          }

          currentPageInfo = { category: rentalCategory };
          data = await getProductsByCategory(rentalCategory.id, { per_page: 100 });
          console.log('Rental products loaded:', data.length);
        } 
        else if (pageType === 'refurbished') {
          // Load products using category-based filtering
          console.log('=== REFINISHED PRODUCTS: Loading with Category-based filtering ===');
          console.log('Condition filter:', condition);
          
          try {
            if (condition === 'all') {
              // Load products from both Refurbished and Used categories
              console.log('Loading products from Refurbished AND Used categories');
              
              const refurbishedCategory = await getCategoryBySlug('refurbished');
              const usedCategory = await getCategoryBySlug('used');
              
              let categoryProducts = [];
              
              if (refurbishedCategory) {
                console.log('Fetching Refurbished category products (ID:', refurbishedCategory.id + ')');
                const refProducts = await getProductsByCategory(refurbishedCategory.id, { per_page: 100 });
                console.log('Refurbished products fetched:', refProducts.length);
                categoryProducts = [...categoryProducts, ...refProducts];
              } else {
                console.log('Refurbished category not found');
              }
              
              if (usedCategory) {
                console.log('Fetching Used category products (ID:', usedCategory.id + ')');
                const usedProducts = await getProductsByCategory(usedCategory.id, { per_page: 100 });
                console.log('Used products fetched:', usedProducts.length);
                categoryProducts = [...categoryProducts, ...usedProducts];
              } else {
                console.log('Used category not found');
              }
              
              // Deduplicate products
              const beforeDedup = categoryProducts.length;
              data = categoryProducts.filter((product, index, self) =>
                index === self.findIndex((p) => p.id === product.id)
              );
              console.log('Deduplication: ' + beforeDedup + ' -> ' + data.length + ' products');
              
            } else if (condition === 'refurbished') {
              // Load only Refurbished category products
              console.log('Loading only Refurbished category products');
              const refurbishedCategory = await getCategoryBySlug('refurbished');
              
              if (refurbishedCategory) {
                console.log('Fetching Refurbished category products (ID:', refurbishedCategory.id + ')');
                data = await getProductsByCategory(refurbishedCategory.id, { per_page: 100 });
                console.log('Refurbished products fetched:', data.length);
              } else {
                console.log('Refurbished category not found');
                data = [];
              }
              
            } else if (condition === 'used') {
              // Load only Used category products
              console.log('Loading only Used category products');
              const usedCategory = await getCategoryBySlug('used');
              
              if (usedCategory) {
                console.log('Fetching Used category products (ID:', usedCategory.id + ')');
                data = await getProductsByCategory(usedCategory.id, { per_page: 100 });
                console.log('Used products fetched:', data.length);
              } else {
                console.log('Used category not found');
                data = [];
              }
              
            } else {
              throw new Error(`Invalid condition filter: ${condition}`);
            }
            
            console.log('=== REFINISHED PRODUCTS: Final Results ===');
            console.log('Total products returned:', data.length);
            console.log('Product IDs:', data.map(p => p.id).join(', '));
            
          } catch (catError) {
            console.error('Category-based filtering failed:', catError);
            throw new Error('Could not load refurbished products. Please ensure the "Refurbished" and "Used" categories exist in WooCommerce.');
          }
        } else {
          throw new Error('Invalid page type');
        }

        console.log(`=== PRODUCT LISTING: Products loaded successfully ===`);
        console.log('Total products:', data.length);

        if (!isCancelled) {
          setProducts(data);
          setPageInfo(currentPageInfo);
          productListingCache.set(cacheKey, {
            products: data,
            pageInfo: currentPageInfo,
            timestamp: Date.now(),
          });
          setIsLoading(false);
          setError('');
          setFadeIn(false);
          scheduleFadeIn();
        }
      } catch (err) {
        console.error(`=== PRODUCT LISTING: Error loading ${pageType} products ===`, err);
        console.error('Error details:', err.response?.data || err.message);
        if (!isCancelled) {
          const cached = productListingCache.get(cacheKey);
          if (isCacheEntryValid(cached)) {
            setProducts(cached.products);
            setPageInfo(cached.pageInfo);
            setIsLoading(false);
            setError('');
            setFadeIn(false);
            scheduleFadeIn();
          } else {
            setError(`Failed to load ${pageType} products. Please try again later.`);
            setProducts([]);
            setPageInfo(null);
            setIsLoading(false);
            setFadeIn(false);
            if (fadeInTimer) clearTimeout(fadeInTimer);
          }
        }
      }
    };

    loadProducts();

    return () => {
      isCancelled = true;
      if (fadeInTimer) clearTimeout(fadeInTimer);
    };
  }, [pageType, condition, sortBy]);

  // Filter products by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.short_description?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    const getProductPrice = (product) => {
      const prices = product.prices || {};
      const divisor = Math.pow(10, prices.currency_minor_unit || 2);
      return (parseFloat(prices.price || 0) / divisor) || 0;
    };

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
  }, [filteredProducts, sortBy]);

  const handleConditionChange = useCallback((newCondition) => {
    if (pageType === 'refurbished' && newCondition !== 'all') {
      // Navigate to category-specific pages when condition is selected
      navigate(`/category/${newCondition}`);
    } else {
      setCondition(newCondition);
      setFadeIn(false);
    }
  }, [pageType, navigate]);

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
  }, []);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Skeleton loader
  const renderSkeleton = () => (
    <div className="pl-grid pl-grid--loading">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="pl-skeleton-card">
          <div className="pl-skeleton-image pl-shimmer"></div>
          <div className="pl-skeleton-body">
            <div className="pl-skeleton-line pl-shimmer" style={{ width: '80%' }}></div>
            <div className="pl-skeleton-line pl-shimmer" style={{ width: '50%' }}></div>
            <div className="pl-skeleton-line pl-shimmer" style={{ width: '100%', height: '44px', marginTop: '12px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!pageType || !pageConfig.title) {
    return (
      <Layout title="Page Not Found" description="The requested page was not found.">
        <main className="pl-page">
          <div className="pl-container">
            <div className="pl-error">
              <h2>Page Not Found</h2>
              <p>The requested product listing page was not found.</p>
              <Link to="/" className="pl-back-btn">Back to Home</Link>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout
      title={`${pageConfig.title} | Ritchie Street`}
      description={pageConfig.description}
    >
      <main className="pl-page">
        <div className="pl-container">
          {/* Breadcrumb */}
          <nav className="pl-breadcrumb">
            <Link to="/">Home</Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
            <span>{pageConfig.title}</span>
          </nav>

          {/* Premium Header */}
          <div className="pl-header">
            <div className="pl-header-left">
              {pageConfig.icon && (
                <div className="pl-header-icon">
                  {pageConfig.icon}
                </div>
              )}
              <div className="pl-header-text">
                <h1>{pageConfig.title}</h1>
                <p>
                  {isLoading ? 'Loading products...' : `Showing ${sortedProducts.length} product${sortedProducts.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          {!error && (
            <FilterToolbar>
              {pageConfig.showConditionFilter && (
                <ConditionDropdown
                  value={condition}
                  onChange={handleConditionChange}
                  disabled={isLoading}
                />
              )}
              <SortDropdown
                value={sortBy}
                onChange={handleSortChange}
                options={sortOptions}
                disabled={isLoading || sortedProducts.length === 0}
              />
              <SearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={pageConfig.searchPlaceholder}
                disabled={isLoading || sortedProducts.length === 0}
              />
            </FilterToolbar>
          )}

          {/* Loading Skeleton */}
          {isLoading && !error && renderSkeleton()}

          {/* Error State */}
          {!isLoading && error && (
            <div className="pl-error">
              <div className="pl-error-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h2>{error}</h2>
              <p>Failed to load products. Please try again later.</p>
              <Link to="/" className="pl-back-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Home
              </Link>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && (!sortedProducts || sortedProducts.length === 0) && (
            <ComingSoonPlaceholder />
          )}

          {/* Products Grid */}
          {!isLoading && !error && sortedProducts && sortedProducts.length > 0 && (
            <div className={`pl-grid ${fadeIn ? 'pl-fade-in' : ''}`}>
              {sortedProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onPriceCompare={onPriceCompare} 
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default ProductListing;