import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from './cartStore';
import { useUserStore } from './userStore';
import { createOrder } from './woocommerce';
import Layout from './Layout';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, getCartCount, clearCart, getGstAmount, getShippingCharge, getGrandTotal } = useCartStore();
  const { user, isAuthenticated } = useUserStore();
  const [billingForm, setBillingForm] = useState({
    first_name: '',
    last_name: '',
    company: '',
    email: '',
    phone: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'IN'
  });
  const [shippingForm, setShippingForm] = useState({
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'IN'
  });
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Service area validation: Chennai only
  const isChennaiCity = (city) => {
    if (!city || city.trim() === '') return false;
    return city.trim().toLowerCase() === 'chennai';
  };

  const serviceArea = useMemo(() => {
    const billingCity = billingForm.city || '';
    const shippingCity = shipToDifferentAddress ? (shippingForm.city || '') : billingCity;
    const billingValid = isChennaiCity(billingCity);
    const shippingValid = isChennaiCity(shippingCity);
    const billingEntered = billingCity.trim() !== '';
    const shippingEntered = shippingCity.trim() !== '';
    const hasError = (billingEntered && !billingValid) || (shippingEntered && !shippingValid);
    const isAvailable = billingEntered && billingValid && shippingEntered && shippingValid;
    return {
      billingValid,
      shippingValid,
      billingEntered,
      shippingEntered,
      hasError,
      isAvailable,
      message: 'Sorry for the inconvenience. Currently we deliver only within Chennai.'
    };
  }, [billingForm.city, shippingForm.city, shipToDifferentAddress]);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      console.log('=== CHECKOUT: USER NOT AUTHENTICATED ===');
      console.log('Saving redirectAfterLogin: /checkout');
      sessionStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Pre-fill forms if user is logged in
  React.useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Pre-filling forms with user data:', user);
      setBillingForm(prev => ({
        ...prev,
        first_name: user.billing_first_name || user.first_name || '',
        last_name: user.billing_last_name || user.last_name || '',
        company: user.billing_company || '',
        email: user.email || user.billing_email || '',
        phone: user.billing_phone || '',
        address_1: user.billing_address_1 || '',
        address_2: user.billing_address_2 || '',
        city: user.billing_city || '',
        state: user.billing_state || '',
        postcode: user.billing_postcode || '',
        country: user.billing_country || 'IN'
      }));
      setShippingForm(prev => ({
        ...prev,
        first_name: user.shipping_first_name || user.first_name || '',
        last_name: user.shipping_last_name || user.last_name || '',
        company: user.shipping_company || '',
        address_1: user.shipping_address_1 || '',
        address_2: user.shipping_address_2 || '',
        city: user.shipping_city || '',
        state: user.shipping_state || '',
        postcode: user.shipping_postcode || '',
        country: user.shipping_country || 'IN'
      }));
      // Auto-check if shipping address differs from billing
      const shippingDiffers = 
        (user.shipping_first_name && user.shipping_first_name !== user.billing_first_name) ||
        (user.shipping_address_1 && user.shipping_address_1 !== user.billing_address_1);
      setShipToDifferentAddress(shippingDiffers);
    }
  }, [isAuthenticated, user]);

  const handleBillingChange = (e) => {
    setBillingForm({
      ...billingForm,
      [e.target.name]: e.target.value
    });
  };

  const handleShippingChange = (e) => {
    setShippingForm({
      ...shippingForm,
      [e.target.name]: e.target.value
    });
  };

  const handleShipToDifferentChange = (e) => {
    const checked = e.target.checked;
    setShipToDifferentAddress(checked);
    if (!checked) {
      // When unchecked, copy billing to shipping
      setShippingForm({
        ...shippingForm,
        first_name: billingForm.first_name,
        last_name: billingForm.last_name,
        company: billingForm.company,
        address_1: billingForm.address_1,
        address_2: billingForm.address_2,
        city: billingForm.city,
        state: billingForm.state,
        postcode: billingForm.postcode,
        country: billingForm.country
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('=== CHECKOUT SUBMISSION START ===');
      console.log('Billing form:', billingForm);
      console.log('Shipping form:', shippingForm);
      console.log('Ship to different address:', shipToDifferentAddress);
      console.log('Cart items:', cart);
      console.log('Cart total:', getCartTotal());
      console.log('User authenticated:', isAuthenticated);
      console.log('User data:', user);

      // Validate cart is not empty
      if (!cart || cart.length === 0) {
        setError('Your cart is empty. Please add items before checkout.');
        return;
      }

      // Validate required billing fields
      const requiredBillingFields = ['first_name', 'last_name', 'email', 'phone', 'address_1', 'city', 'state', 'postcode'];
      const missingBillingFields = requiredBillingFields.filter(field => !billingForm[field] || billingForm[field].trim() === '');
      
      if (missingBillingFields.length > 0) {
        setError(`Please fill in all required billing fields: ${missingBillingFields.join(', ')}`);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(billingForm.email)) {
        setError('Please enter a valid email address.');
        return;
      }

      // If shipping to different address, validate shipping fields
      if (shipToDifferentAddress) {
        const requiredShippingFields = ['first_name', 'last_name', 'address_1', 'city', 'state', 'postcode'];
        const missingShippingFields = requiredShippingFields.filter(field => !shippingForm[field] || shippingForm[field].trim() === '');
        
        if (missingShippingFields.length > 0) {
          setError(`Please fill in all required shipping fields: ${missingShippingFields.join(', ')}`);
          return;
        }
      }

      // Validate Chennai service area
      if (!isChennaiCity(billingForm.city)) {
        setError(serviceArea.message);
        setLoading(false);
        return;
      }
      if (shipToDifferentAddress && !isChennaiCity(shippingForm.city)) {
        setError(serviceArea.message);
        setLoading(false);
        return;
      }

      // Build order payload
      const orderData = {
        payment_method: 'cod',
        payment_method_title: 'Cash on Delivery',
        set_paid: false,
        billing: {
          first_name: billingForm.first_name,
          last_name: billingForm.last_name,
          company: billingForm.company || '',
          email: billingForm.email,
          phone: billingForm.phone,
          address_1: billingForm.address_1,
          address_2: billingForm.address_2 || '',
          city: billingForm.city,
          state: billingForm.state,
          postcode: billingForm.postcode,
          country: billingForm.country || 'IN'
        },
        shipping: shipToDifferentAddress ? {
          first_name: shippingForm.first_name,
          last_name: shippingForm.last_name,
          company: shippingForm.company || '',
          address_1: shippingForm.address_1,
          address_2: shippingForm.address_2 || '',
          city: shippingForm.city,
          state: shippingForm.state,
          postcode: shippingForm.postcode,
          country: shippingForm.country || 'IN'
        } : {
          first_name: billingForm.first_name,
          last_name: billingForm.last_name,
          company: billingForm.company || '',
          address_1: billingForm.address_1,
          address_2: billingForm.address_2 || '',
          city: billingForm.city,
          state: billingForm.state,
          postcode: billingForm.postcode,
          country: billingForm.country || 'IN'
        },
        ship_to_different_address: shipToDifferentAddress,
        shipping_cost: getShippingCharge(),
        line_items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      // Add customer_id if user is authenticated
      if (isAuthenticated && user && user.id) {
        orderData.customer_id = user.id;
        console.log('Adding customer_id to order:', user.id);
      }

      console.log('Order payload:', JSON.stringify(orderData, null, 2));

      const order = await createOrder(orderData);

      console.log('Order created successfully:', order);

      // Save order summary for the success page before clearing cart
      const orderSummary = {
        orderId: order.order_id,
        status: order.status || 'pending',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price) || 0,
          total: (Number(item.price) || 0) * (Number(item.quantity) || 1)
        })),
        subtotal: getCartTotal(),
        gst: getGstAmount(),
        shipping: getShippingCharge(),
        grandTotal: getGrandTotal()
      };
      sessionStorage.setItem('lastOrderSummary', JSON.stringify(orderSummary));

      // Clear cart and redirect
      clearCart();
      window.location.href = `/demo/order-success/${order.order_id}`;
    } catch (err) {
      console.error('=== ORDER CREATION ERROR ===');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      console.error('Error response headers:', err.response?.headers);
      
      // Extract specific error message
      let errorMessage = 'Failed to create order. Please try again.';
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.status === 401) {
          errorMessage = 'Authentication failed. Please check WooCommerce API keys.';
        } else if (err.response.status === 403) {
          errorMessage = 'Permission denied. API keys may not have write access.';
        } else if (err.response.status === 400) {
          errorMessage = 'Invalid order data. Please check your billing information.';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Layout title="Checkout | Ritchie Street" description="Complete your Ritchie Street electronics order checkout.">
        <main className="checkout">
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <Link to="/" className="continue-shopping">Continue Shopping</Link>
        </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout title="Checkout | Ritchie Street" description="Complete your Ritchie Street electronics order checkout.">
      <main className="checkout">
        <div className="checkout-progress-container">
          <div className="checkout-progress">
            <div className="progress-step completed">
              <span className="step-icon">✓</span>
              <span className="step-label">Cart</span>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step active">
              <span className="step-icon">2</span>
              <span className="step-label">Checkout</span>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step">
              <span className="step-icon">3</span>
              <span className="step-label">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="checkout-container">
          <div className="checkout-main">
            <form onSubmit={handleSubmit}>
              {error && <div className="checkout-error-message">{error}</div>}

              <div className="checkout-card billing-details-card">
                <div className="card-header">
                  <h2>Billing Details</h2>
                </div>
                <div className="card-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="first_name"
                        value={billingForm.first_name}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        name="last_name"
                        value={billingForm.last_name}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      name="company"
                      value={billingForm.company}
                      onChange={handleBillingChange}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={billingForm.email}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={billingForm.phone}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Address *</label>
                    <input
                      type="text"
                      name="address_1"
                      value={billingForm.address_1}
                      onChange={handleBillingChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Apartment, suite, etc. (optional)</label>
                    <input
                      type="text"
                      name="address_2"
                      value={billingForm.address_2}
                      onChange={handleBillingChange}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={billingForm.city}
                        onChange={handleBillingChange}
                        required
                      />
                      {serviceArea.billingEntered && (
                        serviceArea.billingValid ? (
                          <div className="service-area-success">✓ Delivery Available in Chennai</div>
                        ) : (
                          <div className="service-area-error">⚠️ Sorry for the inconvenience. Currently we deliver only within Chennai.</div>
                        )
                      )}
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        name="state"
                        value={billingForm.state}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Postcode / ZIP *</label>
                    <input
                      type="text"
                      name="postcode"
                      value={billingForm.postcode}
                      onChange={handleBillingChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="checkout-card shipping-toggle-card">
                <label className="shipping-toggle">
                  <input
                    type="checkbox"
                    checked={shipToDifferentAddress}
                    onChange={handleShipToDifferentChange}
                  />
                  <span className="checkbox-custom"></span>
                  <span>Ship to a different address?</span>
                </label>
              </div>

              {shipToDifferentAddress && (
                <div className="checkout-card shipping-details-card">
                  <div className="card-header">
                    <h2>Shipping Details</h2>
                  </div>
                  <div className="card-body">
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input
                          type="text"
                          name="first_name"
                          value={shippingForm.first_name}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input
                          type="text"
                          name="last_name"
                          value={shippingForm.last_name}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Company</label>
                      <input
                        type="text"
                        name="company"
                        value={shippingForm.company}
                        onChange={handleShippingChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Address *</label>
                      <input
                        type="text"
                        name="address_1"
                        value={shippingForm.address_1}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Apartment, suite, etc. (optional)</label>
                      <input
                        type="text"
                        name="address_2"
                        value={shippingForm.address_2}
                        onChange={handleShippingChange}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          name="city"
                          value={shippingForm.city}
                          onChange={handleShippingChange}
                          required
                        />
                        {serviceArea.shippingEntered && (
                          serviceArea.shippingValid ? (
                            <div className="service-area-success">✓ Delivery Available in Chennai</div>
                          ) : (
                            <div className="service-area-error">⚠️ Sorry for the inconvenience. Currently we deliver only within Chennai.</div>
                          )
                        )}
                      </div>
                      <div className="form-group">
                        <label>State *</label>
                        <input
                          type="text"
                          name="state"
                          value={shippingForm.state}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Postcode / ZIP *</label>
                      <input
                        type="text"
                        name="postcode"
                        value={shippingForm.postcode}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="checkout-card payment-card">
                <div className="card-header">
                  <h2>Payment Method</h2>
                </div>
                <div className="card-body">
                  <div className="payment-method">
                    <label>
                      <input type="radio" name="payment" value="cod" defaultChecked />
                      <span className="radio-custom"></span>
                      <span>Cash on Delivery</span>
                    </label>
                  </div>
                </div>
              </div>

              {serviceArea.hasError && (
                <div className="service-area-warning-box">
                  <span className="warning-icon">⚠️</span>
                  <span>{serviceArea.message}</span>
                </div>
              )}

              <button type="submit" className="place-order-btn" disabled={loading || !serviceArea.isAvailable}>
                {loading ? 'Processing...' : 'Place Order Securely'}
              </button>
            </form>
          </div>

          <aside className="checkout-sidebar">
            <div className="order-summary-card">
              <div className="card-header">
                <h2>Order Summary</h2>
              </div>
              <div className="card-body">
                <div className="order-items">
                  {cart.map(item => (
                    <div key={item.id} className="order-item">
                      <div className="order-item-info">
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-qty">Qty: {item.quantity}</span>
                      </div>
                      <span className="order-item-price">₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="checkout-divider"></div>

                <div className="order-totals">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>₹{getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>GST (18%)</span>
                    <span>₹{getGstAmount().toFixed(2)}</span>
                  </div>
                  <div className="total-row shipping-row">
                    <span>Shipping</span>
                    <span>{getShippingCharge() === 0 ? 'Free' : `₹${getShippingCharge().toFixed(2)}`}</span>
                  </div>
                </div>

                <div className="checkout-divider"></div>

                <div className="total-row final">
                  <span>Grand Total</span>
                  <span>₹{getGrandTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="security-badges">
              <div className="security-badge">
                <span className="badge-icon">🔒</span>
                <span>Secure Checkout</span>
              </div>
              <div className="security-badge">
                <span className="badge-icon">🛡️</span>
                <span>Safe Payments</span>
              </div>
              <div className="security-badge">
                <span className="badge-icon">✓</span>
                <span>Trusted Store</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </Layout>
  );
};

export default Checkout;
