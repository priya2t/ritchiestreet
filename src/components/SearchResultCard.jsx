import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../api/cartStore';
import Toast from './Toast';

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f8fafc'/%3E%3Crect x='100' y='120' width='200' height='160' rx='12' fill='%23e2e8f0'/%3E%3Ccircle cx='160' cy='180' r='20' fill='%23cbd5e1'/%3E%3Cpolygon points='140,260 200,190 240,230 280,200 300,260' fill='%23cbd5e1'/%3E%3Ctext x='200' y='330' text-anchor='middle' font-family='Arial' font-size='16' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

const SearchResultCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const [showToast, setShowToast] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Robust image URL extraction
  const imageUrl = 
    product.image ||
    product.featured_image ||
    product.thumbnail ||
    (product.images && product.images[0] && (product.images[0].src || product.images[0])) ||
    product.product_image ||
    PLACEHOLDER_IMAGE;

  // Safe price extraction
  const salePrice = Number(product.price || product.sale_price || 0);
  const regularPrice = Number(product.regular_price || 0);
  const displayPrice = salePrice > 0 ? salePrice : regularPrice;
  const hasDiscount = regularPrice > 0 && salePrice > 0 && regularPrice > salePrice;
  const discountPercent = hasDiscount ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;

  // Stock status
  const stockStatus = product.stock_status || 'instock';
  const inStock = stockStatus === 'instock';
  const lowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: displayPrice,
      images: imageUrl !== PLACEHOLDER_IMAGE ? [{ src: imageUrl, alt: product.name }] : [],
      slug: product.slug
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
    <div className="sr-card">
      {/* Stock Badge */}
      <div className={`sr-card-badge ${inStock ? (lowStock ? 'low-stock' : 'in-stock') : 'out-of-stock'}`}>
        {inStock ? (lowStock ? '⚠ Low Stock' : '✓ In Stock') : '✗ Out of Stock'}
      </div>

      {/* Discount Badge */}
      {hasDiscount && (
        <div className="sr-card-discount">{discountPercent}% OFF</div>
      )}

      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="sr-card-image-wrap">
        <img
          src={imgError ? PLACEHOLDER_IMAGE : imageUrl}
          alt={product.name}
          loading="lazy"
          onError={handleImageError}
        />
      </Link>

      {/* Product Info */}
      <div className="sr-card-body">
        <h3 className="sr-card-title">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        <div className="sr-card-pricing">
          {displayPrice > 0 ? (
            <>
              <span className="sr-card-price">₹{displayPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              {hasDiscount && (
                <>
                  <span className="sr-card-original-price">₹{regularPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="sr-card-discount-tag">{discountPercent}% off</span>
                </>
              )}
            </>
          ) : (
            <span className="sr-card-price-na">Price not available</span>
          )}
        </div>

        <div className="sr-card-actions">
          <button
            className="sr-btn-cart"
            onClick={handleAddToCart}
            disabled={!inStock || displayPrice <= 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Add to Cart
          </button>
          <Link to={`/product/${product.id}`} className="sr-btn-view">
            View Product
          </Link>
        </div>
      </div>

      {showToast && (
        <Toast
          message="Product added to cart"
          duration={2000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default SearchResultCard;
