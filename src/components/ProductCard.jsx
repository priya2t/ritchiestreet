import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../api/cartStore';
import Toast from './Toast';
import '../api/Home.css';

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f8fafc'/%3E%3Crect x='50' y='60' width='100' height='80' rx='8' fill='%23e2e8f0'/%3E%3Ctext x='100' y='170' text-anchor='middle' font-family='Arial' font-size='12' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

const generateRating = (productId) => {
  const seed = productId % 10;
  const rating = 3.8 + (seed * 0.15);
  const reviews = 50 + (seed * 37);
  return { rating: Math.min(rating, 5).toFixed(1), reviews };
};

const StarRating = ({ rating }) => {
  const stars = [];
  const numRating = parseFloat(rating);
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(numRating)) {
      stars.push(<span key={i} className="fp-star filled">★</span>);
    } else if (i === Math.ceil(numRating) && numRating % 1 !== 0) {
      stars.push(<span key={i} className="fp-star half">★</span>);
    } else {
      stars.push(<span key={i} className="fp-star empty">★</span>);
    }
  }
  return <>{stars}</>;
};

const ProductCard = ({ product, compact = false }) => {
  const { addToCart } = useCartStore();
  const [showToast, setShowToast] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const prices = product.prices || {};
  const currencyMinorUnit = prices.currency_minor_unit || 2;
  const divisor = Math.pow(10, currencyMinorUnit);
  const regularPrice = (parseFloat(prices.regular_price || 0) / divisor) || 0;
  const price = (parseFloat(prices.price || 0) / divisor) || 0;
  const hasDiscount = regularPrice > 0 && price > 0 && regularPrice > price;
  const discount = hasDiscount ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;
  const savings = hasDiscount ? (regularPrice - price) : 0;

  const { rating, reviews } = generateRating(product.id);

  const imageUrl = (product.images && product.images.length > 0 && product.images[0].src) || PLACEHOLDER_IMG;

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [imageUrl]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (price <= 0) return;
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

  if (compact) {
    return (
      <div className="fd-card">
        {discount > 0 && <div className="fd-badge">-{discount}%</div>}
        <Link to={`/product/${product.id}`} className="fd-img-wrap">
          <img
            src={imgError ? PLACEHOLDER_IMG : imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
          />
        </Link>
        <div className="fd-card-body">
          <Link to={`/product/${product.id}`} className="fd-card-name">
            {product.name}
          </Link>
          <div className="fd-card-pricing">
            <span className="fd-card-price">₹{price > 0 ? price.toLocaleString('en-IN') : '—'}</span>
            {hasDiscount && (
              <span className="fd-card-original">₹{regularPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          <button
            className="fd-card-btn"
            onClick={handleAddToCart}
            disabled={price <= 0}
          >
            Add
          </button>
        </div>
        {showToast && (
          <Toast message="Added to cart" duration={1500} onClose={() => setShowToast(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="fp-card">
      {discount > 0 && (
        <div className="fp-badge">-{discount}%</div>
      )}

      <Link to={`/product/${product.id}`} className="fp-image-wrap">
        <img
          src={imgError ? PLACEHOLDER_IMG : imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
      </Link>

      <div className="fp-body">
        <Link to={`/product/${product.id}`} className="fp-title">
          {product.name}
        </Link>

        <div className="fp-rating">
          <div className="fp-stars">
            <StarRating rating={rating} />
          </div>
          <span className="fp-rating-num">{rating}</span>
          <span className="fp-reviews">({reviews})</span>
        </div>

        <div className="fp-price-block">
          <div className="fp-pricing">
            <span className="fp-price">₹{price > 0 ? price.toLocaleString('en-IN') : '—'}</span>
            {hasDiscount && (
              <span className="fp-original">₹{regularPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          <div className="fp-savings">
            {hasDiscount ? `Save ₹${savings.toLocaleString('en-IN')}` : ''}
          </div>
        </div>

        <button
          className="fp-cart-btn"
          onClick={handleAddToCart}
          disabled={price <= 0}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Add to Cart
        </button>
      </div>

      {showToast && (
        <Toast
          message="Product added to the cart"
          duration={1500}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ProductCard;
