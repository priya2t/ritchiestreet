import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../api/cartStore';
import Toast from './Toast';

const SearchProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const [showToast, setShowToast] = useState(false);
  const prices = product.prices || {};
  const regularPrice = (parseFloat(prices.regular_price || 0) / 100) || 0;
  const price = (parseFloat(prices.price || 0) / 100) || 0;
  const discount = regularPrice > 0 && price > 0 && regularPrice > price
    ? Math.round(((regularPrice - price) / regularPrice) * 100)
    : 0;

  const category = product.categories && product.categories.length > 0
    ? product.categories[0].name
    : '';

  const getStockLabel = () => {
    if (product.stock_status === 'outofstock') return 'Out of Stock';
    if (product.stock_status === 'onbackorder') return 'On Backorder';
    return 'In Stock';
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
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

  return (
    <div className="search-product-card">
      {discount > 0 && <div className="search-discount-badge">-{discount}%</div>}
      <div className="search-product-image">
        <Link to={`/product/${product.id}`}>
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0].src} alt={product.name} loading="lazy" />
          ) : (
            <div className="search-product-no-image">No Image</div>
          )}
        </Link>
      </div>
      <div className="search-product-info">
        {category && <span className="search-product-category">{category}</span>}
        <Link to={`/product/${product.id}`} className="search-product-name">
          {product.name}
        </Link>
        <span className={`search-product-stock ${product.stock_status}`}>
          {getStockLabel()}
        </span>
        <div className="search-product-price">
          {regularPrice > 0 && regularPrice > price && (
            <span className="search-old-price">₹{regularPrice.toFixed(2)}</span>
          )}
          <span className="search-new-price">
            ₹{price > 0 ? price.toFixed(2) : 'Price not available'}
          </span>
        </div>
        <div className="search-product-actions">
          <button
            className="search-add-to-cart"
            onClick={handleAddToCart}
            disabled={price <= 0 || product.stock_status === 'outofstock'}
          >
            Add to Cart
          </button>
          <Link to={`/product/${product.id}`} className="search-view-product">
            View Product
          </Link>
        </div>
      </div>
      {showToast && (
        <Toast
          message="Product added to cart"
          duration={1500}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default SearchProductCard;
