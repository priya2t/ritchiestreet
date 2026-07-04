import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../api/cartStore';
import Toast from './Toast';

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f8fafc'/%3E%3Crect x='100' y='120' width='200' height='160' rx='12' fill='%23e2e8f0'/%3E%3Ccircle cx='160' cy='180' r='20' fill='%23cbd5e1'/%3E%3Cpolygon points='140,260 200,190 240,230 280,200 300,260' fill='%23cbd5e1'/%3E%3Ctext x='200' y='330' text-anchor='middle' font-family='Arial' font-size='16' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

const CategoryProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const [showToast, setShowToast] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Price extraction — WooCommerce Store API format (prices in minor units)
  const prices = product.prices || {};
  const currencyMinorUnit = prices.currency_minor_unit || 2;
  const divisor = Math.pow(10, currencyMinorUnit);
  const regularPrice = (parseFloat(prices.regular_price || 0) / divisor) || 0;
  const price = (parseFloat(prices.price || 0) / divisor) || 0;
  const hasDiscount = regularPrice > 0 && price > 0 && regularPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - price) / regularPrice) * 100)
    : 0;

  // Image extraction
  const imageUrl =
    (product.images && product.images.length > 0 && product.images[0].src) ||
    product.image ||
    product.featured_image ||
    product.thumbnail ||
    PLACEHOLDER_IMAGE;

  // Stock status
  const isInStock = product.is_in_stock !== false;
  const lowStock = product.low_stock_remaining !== null && product.low_stock_remaining > 0 && product.low_stock_remaining <= 5;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInStock || price <= 0) return;
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: price,
      images: product.images,
      prices: product.prices
    };
    addToCart(productToAdd);
    setShowToast(true);
  };

  const handleImageError = (e) => {
    if (!imgError) {
      setImgError(true);
      e.target.src = PLACEHOLDER_IMAGE;
    }
  };

  return (
    <div className="cp-card">
      {/* Stock Badge */}
      <div className={`cp-card-badge ${isInStock ? (lowStock ? 'low-stock' : 'in-stock') : 'out-of-stock'}`}>
        {isInStock ? (lowStock ? '⚠ Low Stock' : '✓ In Stock') : '✗ Out of Stock'}
      </div>

      {/* Discount Badge */}
      {hasDiscount && (
        <div className="cp-card-discount">-{discountPercent}%</div>
      )}

      {/* Product Image */}
      <div className="cp-card-image-wrap">
        <Link to={`/product/${product.id}`} className="cp-card-image-link">
          <img
            src={imgError ? PLACEHOLDER_IMAGE : imageUrl}
            alt={product.name}
            loading="lazy"
            onError={handleImageError}
          />
        </Link>
        <div className="cp-card-overlay">
          <Link to={`/product/${product.id}`} className="cp-overlay-btn" title="View Product">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </Link>
          <button className="cp-overlay-btn" title="Wishlist (Coming Soon)" onClick={(e) => e.preventDefault()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="cp-card-body">
        <h3 className="cp-card-title">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        <div className="cp-card-pricing">
          {price > 0 ? (
            <>
              <span className="cp-card-price">₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              {hasDiscount && (
                <>
                  <span className="cp-card-original">₹{regularPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="cp-card-off">{discountPercent}% off</span>
                </>
              )}
            </>
          ) : (
            <span className="cp-card-price-na">Price not available</span>
          )}
        </div>

        <button
          className="cp-btn-cart"
          onClick={handleAddToCart}
          disabled={!isInStock || price <= 0}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {isInStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>

      {showToast && (
        <Toast
          message="Product added to the cart"
          duration={2000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default CategoryProductCard;
