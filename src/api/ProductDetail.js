import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, getProductReviews } from './woocommerce';
import { useCartStore } from './cartStore';
import Layout from './Layout';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageZoom, setImageZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [addingToCart, setAddingToCart] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const { addToCart, openCart } = useCartStore();

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (product) {
      setTimeout(() => setFadeIn(true), 50);
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setFadeIn(false);
      const data = await getProduct(id);
      console.log('[ProductDetail] Raw product data:', data);
      console.log('[ProductDetail] Price fields:', {
        price: data.price,
        prices: data.prices,
        regular_price: data.regular_price,
        sale_price: data.sale_price,
        selling_price: data.selling_price,
      });
      console.log('[ProductDetail] Stock fields:', {
        stock_status: data.stock_status,
        stock_quantity: data.stock_quantity,
        is_in_stock: data.is_in_stock,
        in_stock: data.in_stock,
        quantity: data.quantity,
      });
      setProduct(data);
    } catch (err) {
      setError('Failed to load product');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await getProductReviews(id);
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  // === PRICE HELPER: Safely extract price from various API formats ===
  const getPrice = (product) => {
    // WC Store API format: product.prices.price (string, in minor units/cents)
    if (product.prices && product.prices.price) {
      const divisor = Math.pow(10, product.prices.currency_minor_unit || 2);
      return Number(product.prices.price) / divisor;
    }
    // WC REST API v3 format: product.price (string)
    if (product.price !== undefined && product.price !== null && product.price !== '') {
      const parsed = Number(product.price);
      if (!isNaN(parsed)) return parsed;
    }
    // Fallback fields
    if (product.selling_price) {
      const parsed = Number(product.selling_price);
      if (!isNaN(parsed)) return parsed;
    }
    if (product.sale_price) {
      const parsed = Number(product.sale_price);
      if (!isNaN(parsed)) return parsed;
    }
    if (product.regular_price) {
      const parsed = Number(product.regular_price);
      if (!isNaN(parsed)) return parsed;
    }
    return 0;
  };

  const getRegularPrice = (product) => {
    if (product.prices && product.prices.regular_price) {
      const divisor = Math.pow(10, product.prices.currency_minor_unit || 2);
      return Number(product.prices.regular_price) / divisor;
    }
    if (product.regular_price !== undefined && product.regular_price !== null && product.regular_price !== '') {
      const parsed = Number(product.regular_price);
      if (!isNaN(parsed)) return parsed;
    }
    return 0;
  };

  // === STOCK HELPER: Safely determine stock status ===
  const getStockInfo = (product) => {
    // Check explicit boolean fields
    if (product.is_in_stock === true) return { inStock: true, status: 'instock' };
    if (product.is_in_stock === false) return { inStock: false, status: 'outofstock' };
    
    // Check stock_status string field
    if (product.stock_status === 'instock') return { inStock: true, status: 'instock' };
    if (product.stock_status === 'outofstock') return { inStock: false, status: 'outofstock' };
    if (product.stock_status === 'onbackorder') return { inStock: true, status: 'onbackorder' };
    
    // Check in_stock boolean
    if (product.in_stock === true) return { inStock: true, status: 'instock' };
    if (product.in_stock === false) return { inStock: false, status: 'outofstock' };
    
    // Check quantity fields
    const qty = Number(product.stock_quantity || product.quantity || product.stock || 0);
    if (qty > 0) return { inStock: true, status: 'instock', quantity: qty };
    
    // Default: assume in stock if we can't determine
    return { inStock: true, status: 'instock' };
  };

  const getStockQuantity = (product) => {
    return Number(product.stock_quantity || product.quantity || product.stock || 0);
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setTimeout(() => {
      setAddingToCart(false);
      setCartMessage('Product added to the cart');
      setTimeout(() => setCartMessage(''), 3000);
    }, 600);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    navigate('/checkout');
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // === LOADING STATE ===
  if (loading) {
    return (
      <Layout title="Loading Product | Ritchie Street" description="Loading product details from Ritchie Street.">
        <main className="pd-page">
          <div className="pd-loading">
            <div className="pd-loading-spinner"></div>
            <p>Loading product...</p>
          </div>
        </main>
      </Layout>
    );
  }

  // === ERROR STATE ===
  if (error || !product) {
    return (
      <Layout title="Product Not Found | Ritchie Street" description="The requested Ritchie Street product could not be found.">
        <main className="pd-page">
          <div className="pd-error">
            <div className="pd-error-icon">!</div>
            <h2>Product Not Found</h2>
            <p>{error || 'The product you are looking for does not exist.'}</p>
            <Link to="/products" className="pd-back-btn">← Back to Products</Link>
          </div>
        </main>
      </Layout>
    );
  }

  // === COMPUTED VALUES ===
  const price = getPrice(product);
  const regularPrice = getRegularPrice(product);
  const hasDiscount = regularPrice > 0 && regularPrice > price && price > 0;
  const discountPercent = hasDiscount ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;
  const stockInfo = getStockInfo(product);
  const stockQty = getStockQuantity(product);
  const isLowStock = stockInfo.inStock && stockQty > 0 && stockQty <= 5;

  // Get images array
  const images = product.images && product.images.length > 0
    ? product.images
    : [{ src: '', alt: 'No image' }];

  // Average rating
  const avgRating = product.average_rating ? Number(product.average_rating) : (
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0
  );
  const ratingCount = product.rating_count || reviews.length || 0;

  return (
    <Layout title={`${product.name} | Ritchie Street`} description={`Buy ${product.name} from Ritchie Street Best Online Electronics Hub.`}>
      <main className={`pd-page ${fadeIn ? 'pd-fade-in' : ''}`}>
        {/* Cart Success Toast */}
        {cartMessage && (
          <div className="pd-toast">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            {cartMessage}
          </div>
        )}
        <div className="pd-container">
          {/* === PRODUCT GALLERY === */}
          <div className="pd-gallery">
            <div
              className={`pd-main-image-wrapper ${imageZoom ? 'pd-zoomed' : ''}`}
              onMouseEnter={() => setImageZoom(true)}
              onMouseLeave={() => setImageZoom(false)}
              onMouseMove={handleMouseMove}
            >
              {images[selectedImage] && images[selectedImage].src ? (
                <img
                  src={images[selectedImage].src}
                  alt={images[selectedImage].alt || product.name}
                  className="pd-main-image"
                  style={imageZoom ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                  } : {}}
                />
              ) : (
                <div className="pd-no-image">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p>No image available</p>
                </div>
              )}
              {hasDiscount && (
                <span className="pd-discount-badge">-{discountPercent}%</span>
              )}
            </div>

            {images.length > 1 && (
              <div className="pd-thumbnails">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`pd-thumb ${index === selectedImage ? 'pd-thumb-active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img.src} alt={img.alt || `View ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* === PRODUCT INFO === */}
          <div className="pd-info">
            <h1 className="pd-title">{product.name}</h1>

            {/* Rating */}
            {(avgRating > 0 || ratingCount > 0) && (
              <div className="pd-rating">
                <div className="pd-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`pd-star ${star <= Math.round(avgRating) ? 'pd-star-filled' : ''}`}>★</span>
                  ))}
                </div>
                <span className="pd-rating-value">{avgRating.toFixed(1)}</span>
                <span className="pd-rating-count">({ratingCount} {ratingCount === 1 ? 'Review' : 'Reviews'})</span>
              </div>
            )}

            {/* Price */}
            <div className="pd-price-section">
              <span className="pd-price">₹{price.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              {hasDiscount && (
                <>
                  <span className="pd-original-price">₹{regularPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                  <span className="pd-discount-tag">{discountPercent}% OFF</span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="pd-stock">
              {stockInfo.inStock ? (
                isLowStock ? (
                  <span className="pd-stock-badge pd-stock-low">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Only {stockQty} left in stock
                  </span>
                ) : (
                  <span className="pd-stock-badge pd-stock-in">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    In Stock
                  </span>
                )
              ) : (
                <span className="pd-stock-badge pd-stock-out">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Out of Stock
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <div
                className="pd-short-desc"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}

            {/* Quantity Selector */}
            {stockInfo.inStock && (
              <div className="pd-quantity-section">
                <label className="pd-quantity-label">Quantity</label>
                <div className="pd-quantity-control">
                  <button
                    className="pd-qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="pd-qty-value">{quantity}</span>
                  <button
                    className="pd-qty-btn"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pd-actions">
              <button
                className={`pd-add-to-cart-btn ${addingToCart ? 'pd-btn-loading' : ''}`}
                onClick={handleAddToCart}
                disabled={!stockInfo.inStock || addingToCart}
              >
                {addingToCart ? (
                  <span className="pd-btn-spinner"></span>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                    Add to Cart
                  </>
                )}
              </button>

              <button
                className="pd-buy-now-btn"
                onClick={handleBuyNow}
                disabled={!stockInfo.inStock}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pd-trust">
              <div className="pd-trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <span>Secure Checkout</span>
              </div>
              <div className="pd-trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <span>Fast Delivery</span>
              </div>
              <div className="pd-trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                <span>Easy Returns</span>
              </div>
              <div className="pd-trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                <span>Genuine Products</span>
              </div>
            </div>
          </div>
        </div>

        {/* === PRODUCT DESCRIPTION SECTION === */}
        {product.description && (
          <div className="pd-description-section">
            <h2 className="pd-section-title">Product Description</h2>
            <div
              className="pd-description-content"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* === REVIEWS SECTION === */}
        {reviews.length > 0 && (
          <div className="pd-reviews-section">
            <h2 className="pd-section-title">Customer Reviews</h2>
            <div className="pd-reviews-grid">
              {reviews.map(review => (
                <div key={review.id} className="pd-review-card">
                  <div className="pd-review-header">
                    <div className="pd-review-avatar">
                      {review.reviewer ? review.reviewer.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="pd-review-meta">
                      <span className="pd-reviewer-name">{review.reviewer}</span>
                      <span className="pd-review-date">
                        {new Date(review.date_created).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="pd-review-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={`pd-star ${star <= review.rating ? 'pd-star-filled' : ''}`}>★</span>
                    ))}
                  </div>
                  <div className="pd-review-body" dangerouslySetInnerHTML={{ __html: review.review }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default ProductDetail;
