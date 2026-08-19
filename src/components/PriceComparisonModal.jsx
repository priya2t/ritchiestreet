import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePriceComparison } from '../hooks/usePriceComparison';
import { useCartStore } from '../api/cartStore';
import { Link } from 'react-router-dom';
import Toast from './Toast';
import { decodeHTMLEntities } from '../utils/htmlEntityDecoder';
import './PriceComparisonModal.css';

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f8fafc'/%3E%3Crect x='20' y='24' width='40' height='32' rx='4' fill='%23e2e8f0'/%3E%3Ctext x='40' y='68' text-anchor='middle' font-family='Arial' font-size='10' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

const findLowestAndNext = (stores) => {
  if (!stores || stores.length === 0) {
    return { lowest: null, nextLowest: null, savings: 0, isRitchieLowest: false };
  }
  const sorted = [...stores]
    .filter((s) => typeof s.price === 'number' && s.price > 0)
    .sort((a, b) => a.price - b.price);
  const lowest = sorted[0] || null;
  const nextLowest = sorted[1] || null;
  const isRitchieLowest = lowest?.key === 'ritchiestreet';
  const savings = isRitchieLowest && nextLowest ? nextLowest.price - lowest.price : 0;
  return { lowest, nextLowest, savings: Math.max(0, savings), isRitchieLowest };
};

const formatPrice = (price) => {
  return `₹${Number(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Updated today';
  const now = new Date();
  const updated = new Date(timestamp);
  const diffMs = now - updated;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `Updated ${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `Updated ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `Updated ${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return 'Updated recently';
};

const getStoreLogo = (storeKey) => {
  const logos = {
    amazon: { initial: 'A', color: '#FF9900', name: 'Amazon' },
    flipkart: { initial: 'F', color: '#2874F0', name: 'Flipkart' },
    croma: { initial: 'C', color: '#00A651', name: 'Croma' },
    reliance_digital: { initial: 'R', color: '#0077C8', name: 'Reliance Digital' },
    ritchiestreet: { initial: 'R', color: '#10B981', name: 'Ritchiestreet' }
  };
  return logos[storeKey] || { initial: storeKey.charAt(0).toUpperCase(), color: '#64748B', name: storeKey };
};

const LoadingSkeleton = () => (
  <div className="pcm-skeleton">
    <div className="pcm-skeleton-header">
      <div className="pcm-skeleton-image" />
      <div className="pcm-skeleton-info">
        <div className="pcm-skeleton-title" />
        <div className="pcm-skeleton-price" />
      </div>
    </div>
    <div className="pcm-skeleton-list">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="pcm-skeleton-item">
          <div className="pcm-skeleton-logo" />
          <div className="pcm-skeleton-text" />
          <div className="pcm-skeleton-price" />
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = ({ message, onRetry }) => (
  <div className="pcm-empty">
    <div className="pcm-empty-icon">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
    </div>
    <h3 className="pcm-empty-title">No Price Data Available</h3>
    <p className="pcm-empty-message">{message || 'We couldn\'t find price comparison data for this product.'}</p>
    {onRetry && (
      <button className="pcm-retry-btn" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);

const PriceComparisonModal = ({ isOpen, onClose, product, price }) => {
  const { data, loading, error, fetch, reset } = usePriceComparison(product?.id);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  const { addToCart } = useCartStore();
  const [addingToCart, setAddingToCart] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (isOpen && product?.id) {
      fetch();
    } else if (!isOpen) {
      reset();
    }
  }, [isOpen, product?.id, fetch, reset]);

  useEffect(() => {
    if (!isOpen) return;

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;
      const focusable = Array.from(
        modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.disabled && el.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const comparison = useMemo(() => {
    if (!data?.stores) return null;
    return findLowestAndNext(data.stores);
  }, [data]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    addToCart(product);
    setShowToast(true);
    setTimeout(() => {
      setAddingToCart(false);
      onClose();
    }, 500);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  const hasData = data?.has_data && data?.stores?.length > 0;
  const imageUrl = (product.images && product.images.length > 0 && product.images[0].src) || PLACEHOLDER_IMAGE;
  const decodedProductName = decodeHTMLEntities(product.name || '');

  const modalContent = (
    <div className="pcm-overlay" onClick={handleOverlayClick} role="presentation" aria-hidden="true">
      <div
        ref={modalRef}
        className="pcm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pcm-title"
      >
        {/* Header */}
        <div className="pcm-header">
          <div className="pcm-product-info">
            <img
              src={imageUrl}
              alt={decodedProductName}
              className="pcm-product-image"
              onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
            />
            <div className="pcm-product-details">
              <h3 id="pcm-title" className="pcm-product-name">{decodedProductName}</h3>
              <div className="pcm-product-price">
                <span className="pcm-price-current">{formatPrice(price)}</span>
                <span className="pcm-price-label">at Ritchiestreet</span>
              </div>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            className="pcm-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="pcm-body">
          <h2 className="pcm-section-title">Market Price Comparison</h2>

          {loading && <LoadingSkeleton />}
          {!loading && error && (
            <EmptyState message="Unable to load comparison data. Please try again." onRetry={fetch} />
          )}
          {!loading && !error && !hasData && (
            <EmptyState message="Price comparison data is not available for this product." />
          )}
          {!loading && !error && hasData && (
            <>
              {/* Savings Banner */}
              {comparison?.isRitchieLowest && comparison?.savings > 0 && (
                <div className="pcm-savings-banner">
                  <div className="pcm-savings-icon"></div>
                  <div className="pcm-savings-content">
                    <div className="pcm-savings-title">You Save {formatPrice(comparison.savings)}</div>
                    <div className="pcm-savings-subtitle">Compared to the next lowest price</div>
                  </div>
                </div>
              )}

              {/* Comparison Table */}
              <div className="pcm-store-list" role="list" aria-label="Store price comparison">
                {data.stores.map((store) => {
                  const logoInfo = getStoreLogo(store.key);
                  const isLowest = store.key === comparison?.lowest?.key;
                  const isRitchie = store.key === 'ritchiestreet';
                  
                  return (
                    <div
                      key={store.key}
                      className={`pcm-store-item ${isLowest ? 'pcm-store-item--lowest' : ''} ${isRitchie ? 'pcm-store-item--ritchie' : ''}`}
                      role="listitem"
                    >
                      <div className="pcm-store-brand">
                        <div
                          className="pcm-store-logo"
                          style={{ backgroundColor: logoInfo.color }}
                        >
                          {logoInfo.initial}
                        </div>
                        <div className="pcm-store-info">
                          <span className="pcm-store-name">{logoInfo.name}</span>
                          {isLowest && (
                            <span className="pcm-lowest-badge">
                              {isRitchie ? '✓ Best Price' : '🏆 Lowest'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="pcm-store-price-section">
                        <span className="pcm-store-price">{formatPrice(store.price)}</span>
                        {isLowest && !isRitchie && comparison?.savings > 0 && (
                          <span className="pcm-store-savings">+{formatPrice(comparison.savings)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Timestamp */}
              {data.last_updated && (
                <div className="pcm-timestamp">
                  {formatTimestamp(data.last_updated)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pcm-footer">
          <button className="pcm-secondary-btn" onClick={onClose}>
            Continue Shopping
          </button>
          <button
            className="pcm-primary-btn"
            onClick={handleAddToCart}
            disabled={addingToCart || price <= 0}
          >
            {addingToCart ? (
              <span className="pcm-btn-spinner"></span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {createPortal(modalContent, document.body)}
      {showToast && (
        <Toast
          message="Product added to the cart"
          duration={1500}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default PriceComparisonModal;
