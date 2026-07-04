import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Layout from './Layout';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [orderSummary, setOrderSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(true);

  useEffect(() => {
    try {
      // Check for order data passed from MyAccount navigation
      const orderFromState = location.state?.order;
      if (orderFromState) {
        const items = orderFromState.line_items?.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          total: parseFloat(item.total) || 0
        })) || [];
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const grandTotal = parseFloat(orderFromState.total) || 0;
        setOrderSummary({
          orderId: orderFromState.id,
          status: orderFromState.status,
          items,
          subtotal,
          gst: 0,
          shipping: 0,
          grandTotal,
          hasExactBreakdown: false,
          isFromHistory: true
        });
        return;
      }

      const stored = sessionStorage.getItem('lastOrderSummary');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only use stored summary if it matches the current orderId
        if (!parsed.orderId || parsed.orderId.toString() === orderId) {
          setOrderSummary({ ...parsed, hasExactBreakdown: true });
        }
      }
    } catch (err) {
      console.error('Failed to read order summary from sessionStorage:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId, location.state]);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing': return 'status-blue';
      case 'completed': return 'status-green';
      case 'cancelled': return 'status-red';
      case 'pending':
      default: return 'status-orange';
    }
  };

  const formatPrice = (price) => {
    const value = parseFloat(price);
    return Number.isNaN(value) ? '₹0.00' : `₹${value.toFixed(2)}`;
  };

  const subtotal = orderSummary ? parseFloat(orderSummary.subtotal) : 0;
  const gst = orderSummary ? parseFloat(orderSummary.gst) : 0;
  const shipping = orderSummary ? parseFloat(orderSummary.shipping) : 0;
  const grandTotal = orderSummary ? parseFloat(orderSummary.grandTotal) : 0;

  const confettiColors = ['#ff6b00', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const confettiPieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${2.5 + Math.random() * 1.5}s`,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    size: `${6 + Math.random() * 8}px`
  }));

  return (
    <Layout title="Order Success | Ritchie Street" description="Your order has been placed successfully.">
      <main className="order-success-page">
        <div className="confetti-container" aria-hidden="true">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="confetti-piece"
              style={{
                left: piece.left,
                backgroundColor: piece.color,
                width: piece.size,
                height: piece.size,
                animationDelay: piece.delay,
                animationDuration: piece.duration
              }}
            />
          ))}
        </div>

        <div className="order-success-container">
          <div className="success-hero">
            <div className="success-icon-wrapper">
              <div className="success-circle">
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 28L22 38L40 18" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="success-glow" />
            </div>
            <h1>{orderSummary?.isFromHistory ? 'Order Details' : 'Order Placed Successfully!'}</h1>
            <p className="success-subtitle">
              {orderSummary?.isFromHistory
                ? 'Here are the details of your order.'
                : 'Thank you for your purchase. Your order has been received and is being processed.'}
            </p>
          </div>

          <div className="order-info-cards">
            <div className="order-info-card order-number-card">
              <div className="info-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <div className="info-card-content">
                <span className="info-card-label">Order Number</span>
                <span className="info-card-value">#{orderId}</span>
              </div>
            </div>

            <div className="order-info-card order-status-card">
              <div className="info-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="info-card-content">
                <span className="info-card-label">Order Status</span>
                <span className={`status-badge ${getStatusClass(orderSummary?.status)}`}>
                  {orderSummary?.status ? orderSummary.status.replace(/-/g, ' ') : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div className="whats-next-card">
            <div className="whats-next-content">
              <h2>What's Next?</h2>
              <ul className="whats-next-list">
                <li>Order confirmation email sent</li>
                <li>Order will be processed within 1-2 business days</li>
                <li>Track your order from My Account</li>
                <li>Keep payment ready for Cash on Delivery orders</li>
              </ul>
            </div>
            <div className="whats-next-illustration">
              <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="40" width="140" height="100" rx="12" fill="#ff6b00" opacity="0.1"/>
                <rect x="40" y="60" width="100" height="70" rx="8" fill="white" stroke="#ff6b00" strokeWidth="2"/>
                <circle cx="90" cy="95" r="20" fill="#22c55e" opacity="0.15"/>
                <path d="M80 95L87 102L102 87" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="150" y="80" width="40" height="50" rx="6" fill="#111827" opacity="0.1"/>
                <circle cx="170" cy="105" r="12" fill="#22c55e" opacity="0.2"/>
                <path d="M160 30L165 40L180 20" stroke="#ff6b00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="success-action-buttons">
            <Link to="/" className="success-btn btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Continue Shopping
            </Link>
            <Link to="/my-account" className="success-btn btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              View My Account
            </Link>
          </div>

          <div className="trust-badges">
            <div className="trust-badge">
              <span className="trust-icon">🔒</span>
              <div className="trust-text">
                <span className="trust-title">Secure Checkout</span>
                <span className="trust-desc">100% Protected</span>
              </div>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">✓</span>
              <div className="trust-text">
                <span className="trust-title">Genuine Products</span>
                <span className="trust-desc">Original & Brand New</span>
              </div>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">🚚</span>
              <div className="trust-text">
                <span className="trust-title">Fast Delivery</span>
                <span className="trust-desc">Across Chennai</span>
              </div>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">🎧</span>
              <div className="trust-text">
                <span className="trust-title">Dedicated Support</span>
                <span className="trust-desc">We're Here to Help</span>
              </div>
            </div>
          </div>

          <div className="order-summary-section">
            <button
              type="button"
              className="order-summary-toggle"
              onClick={() => setShowSummary(!showSummary)}
              aria-expanded={showSummary}
            >
              <span>Order Summary</span>
              <span className="toggle-icon">{showSummary ? '−' : '+'}</span>
            </button>
            {showSummary && (
              <div className="order-summary-content">
                {loading ? (
                  <div className="summary-loading">
                    <div className="summary-spinner" />
                    <span>Loading order details...</span>
                  </div>
                ) : orderSummary ? (
                  <>
                    <div className="summary-items">
                      {orderSummary.items?.map((item) => (
                        <div key={item.id} className="summary-item">
                          <span className="summary-item-name">{item.name} × {item.quantity}</span>
                          <span className="summary-item-price">{formatPrice(item.total)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="summary-divider" />
                    <div className="summary-totals">
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      {orderSummary?.hasExactBreakdown !== false && (
                        <>
                          <div className="summary-row">
                            <span>GST (18%)</span>
                            <span>{formatPrice(gst)}</span>
                          </div>
                          <div className="summary-row">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                          </div>
                        </>
                      )}
                      <div className="summary-row summary-grand-total">
                        <span>Grand Total</span>
                        <span>{formatPrice(grandTotal)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="summary-unavailable">Order summary unavailable.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default OrderSuccess;
