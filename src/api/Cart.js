import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from './cartStore';
import { useUserStore } from './userStore';
import Layout from './Layout';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount, getGstAmount, getShippingCharge, getGrandTotal } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map(item => item.id));
    }
  };

  const handleBulkDelete = () => {
    selectedItems.forEach(itemId => removeFromCart(itemId));
    setSelectedItems([]);
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      // Store the intended redirect path
      console.log('=== CART: PROCEED TO CHECKOUT - USER NOT AUTHENTICATED ===');
      console.log('Saving redirectAfterLogin: /checkout');
      sessionStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login');
    } else {
      console.log('=== CART: PROCEED TO CHECKOUT - USER AUTHENTICATED ===');
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <Layout title="Cart | Ritchie Street" description="Review your selected Ritchie Street products before checkout.">
        <main className="cart-page">
          <div className="cart-empty-state">
            <h2>Your cart is empty</h2>
            <Link to="/" className="continue-shopping-btn">Continue Shopping</Link>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout title="Cart | Ritchie Street" description="Review your selected Ritchie Street products before checkout.">
      <main className="cart-page">
        <div className="cart-page-container">
          {/* Left Column - Shopping Cart */}
          <div className="cart-items-section">
            <h1 className="cart-page-title">Shopping Cart ({getCartCount()} items)</h1>
            
            {/* Cart Items Table */}
            <div className="cart-items-table">
              {/* Table Header */}
              <div className="cart-table-header">
                <div className="cart-header-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.length === cart.length && cart.length > 0}
                    onChange={handleSelectAll}
                  />
                </div>
                <div className="cart-header-product">Product</div>
                <div className="cart-header-price">Price</div>
                <div className="cart-header-quantity">Quantity</div>
                <div className="cart-header-subtotal">Subtotal</div>
              </div>

              {/* Cart Items */}
              {cart.map(item => (
                <div key={item.id} className="cart-table-row">
                  <div className="cart-row-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                  </div>
                  
                  <div className="cart-row-product">
                    <div className="cart-product-image">
                      {item.images && item.images.length > 0 && (
                        <img src={item.images[0].src} alt={item.name} />
                      )}
                    </div>
                    <div className="cart-product-info">
                      <h3 className="cart-product-name">
                        <Link to={`/product/${item.id}`}>{item.name}</Link>
                      </h3>
                      <button 
                        className="cart-remove-icon"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0411 18.4142 21.4162C18.0391 21.7913 17.5304 22 17 22H7C6.46957 22 5.96086 21.7913 5.58579 21.4162C5.21071 21.0411 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="cart-row-price">
                    <span className="cart-price-value">₹{(Number(item.price) || 0).toFixed(2)}</span>
                  </div>

                  <div className="cart-row-quantity">
                    <div className="cart-quantity-control">
                      <button 
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-row-subtotal">
                    <span className="cart-subtotal-value">₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bulk Action Section */}
            <div className="cart-bulk-action">
              <div className="bulk-action-info">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 16H12V12H8V10H12V6H14V10H18V12H14V16H13ZM12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" fill="currentColor"/>
                </svg>
                <span>Select items using checkboxes to delete them in bulk</span>
              </div>
              <button 
                className="bulk-delete-btn"
                onClick={handleBulkDelete}
                disabled={selectedItems.length === 0}
              >
                Delete Items
              </button>
            </div>

            {/* Continue Shopping Button */}
            <Link to="/" className="continue-shopping-btn-full">
              Continue Shopping
            </Link>
          </div>

          {/* Right Column - Order Summary */}
          <div className="cart-summary-section">
            <div className="cart-totals-card">
              <h2 className="cart-totals-title">Cart Totals</h2>
              
              <div className="cart-totals-row">
                <span className="totals-label">Subtotal</span>
                <span className="totals-value">₹{getCartTotal().toFixed(2)}</span>
              </div>
              
              <div className="cart-totals-row">
                <span className="totals-label">GST (18%)</span>
                <span className="totals-value">₹{getGstAmount().toFixed(2)}</span>
              </div>
              
              <div className="cart-totals-row">
                <span className="totals-label">Shipping</span>
                <span className="totals-value">{getShippingCharge() === 0 ? 'Free' : `₹${getShippingCharge().toFixed(2)}`}</span>
              </div>

              <div className="cart-totals-row grand-total">
                <span className="totals-label grand-total-label">Grand Total</span>
                <span className="totals-value grand-total-value">₹{getGrandTotal().toFixed(2)}</span>
              </div>

              <button onClick={handleProceedToCheckout} className="checkout-btn-full">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Cart;
