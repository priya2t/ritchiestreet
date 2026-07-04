import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../api/cartStore';

const CartIcon = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount, getGstAmount, getShippingCharge, getGrandTotal } = useCartStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  return (
    <div className="cart-icon-container" ref={dropdownRef}>
      <button 
        className="cart-icon-btn"
        onMouseEnter={() => setIsDropdownOpen(true)}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <svg 
          className="cart-icon-svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M9 20C9 21.1 8.1 22 7 22C5.9 22 5 21.1 5 20C5 18.9 5.9 18 7 18C8.1 18 9 18.9 9 20ZM20 20C20 21.1 19.1 22 18 22C16.9 22 16 21.1 16 20C16 18.9 16.9 18 18 18C19.1 18 20 18.9 20 20ZM1 1H4L6.68 14.39C6.77144 14.8504 7.02191 15.264 7.38755 15.5583C7.75318 15.8526 8.2107 16.009 8.68 16H19.16C19.6293 16.009 20.0868 15.8526 20.4525 15.5583C20.8181 15.264 21.0686 14.8504 21.16 14.39L23 6H6" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        {getCartCount() > 0 && (
          <span className="cart-badge">{getCartCount()}</span>
        )}
      </button>

      {isDropdownOpen && (
        <div className="mini-cart-dropdown">
          <div className="mini-cart-header">
            <h3>Shopping Cart ({getCartCount()} items)</h3>
          </div>

          {cart.length === 0 ? (
            <div className="mini-cart-empty">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="mini-cart-items">
                {cart.map(item => (
                  <div key={item.id} className="mini-cart-item">
                    <div className="mini-cart-item-image">
                      {item.images && item.images.length > 0 && (
                        <img src={item.images[0].src} alt={item.name} />
                      )}
                    </div>
                    
                    <div className="mini-cart-item-details">
                      <h4 className="mini-cart-item-name">
                        <Link to={`/product/${item.id}`} onClick={() => setIsDropdownOpen(false)}>
                          {item.name}
                        </Link>
                      </h4>
                      <p className="mini-cart-item-price">₹{(Number(item.price) || 0).toFixed(2)}</p>
                      
                      <div className="mini-cart-item-quantity">
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                          +
                        </button>
                      </div>
                    </div>

                    <div className="mini-cart-item-subtotal">
                      <p>₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}</p>
                      <button 
                        className="mini-cart-remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mini-cart-footer">
                <div className="mini-cart-total">
                  <span>Subtotal:</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="mini-cart-total">
                  <span>GST (18%):</span>
                  <span>₹{getGstAmount().toFixed(2)}</span>
                </div>
                <div className="mini-cart-total">
                  <span>Shipping:</span>
                  <span>{getShippingCharge() === 0 ? 'Free' : `₹${getShippingCharge().toFixed(2)}`}</span>
                </div>
                <div className="mini-cart-total mini-cart-grand-total">
                  <span>Grand Total:</span>
                  <span>₹{getGrandTotal().toFixed(2)}</span>
                </div>
                <Link 
                  to="/cart" 
                  className="mini-cart-go-to-cart-btn"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Go To Cart
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CartIcon;
