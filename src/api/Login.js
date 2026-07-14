import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useUserStore } from './userStore';
import { sendOTP, verifyOTP } from './wordpress';
import { getCustomer } from './woocommerce';
import Layout from './Layout';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, isAuthenticated } = useUserStore();
  const [formData, setFormData] = useState({
    phone: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Save current URL on page load if redirectAfterLogin is not already set
  React.useEffect(() => {
    console.log('=== LOGIN: PAGE LOAD ===');
    const existingRedirect = sessionStorage.getItem('redirectAfterLogin');
    console.log('Existing redirectAfterLogin:', existingRedirect);
    
    if (!existingRedirect) {
      // If no redirect is set, check if we came from another page
      const referrer = document.referrer;
      const currentPath = location.pathname + location.search;
      console.log('Referrer:', referrer);
      console.log('Current path:', currentPath);
      
      // If referrer is from the same site, use it as redirect
      if (referrer && referrer.includes(window.location.origin)) {
        const referrerPath = new URL(referrer).pathname + new URL(referrer).search;
        // Don't save if referrer is login page itself
        if (referrerPath !== '/login' && referrerPath !== '/register') {
          sessionStorage.setItem('redirectAfterLogin', referrerPath);
          console.log('Saved referrer as redirectAfterLogin:', referrerPath);
        }
      }
    }
  }, [location]);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      console.log('=== LOGIN: USER ALREADY AUTHENTICATED ===');
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/my-account';
      console.log('Redirecting to:', redirectPath);
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const validateOTP = (otp) => {
    if (!otp.trim()) {
      setError('OTP is required');
      return false;
    }
    if (!/^[0-9]{6}$/.test(otp.trim())) {
      setError('Please enter a valid 6-digit OTP');
      return false;
    }
    return true;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!validatePhone(formData.phone)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Sending OTP to:', formData.phone);

      const response = await sendOTP(formData.phone.trim());
      
      console.log('OTP sent response:', response);
      
      setOtpSent(true);
      setOtpSentMessage(`OTP sent successfully! Your OTP is: ${response.otp} (For testing)`);
      setSuccess(true);
      
    } catch (err) {
      console.error('Send OTP error:', err);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      if (err.response) {
        console.error('Error response:', err.response.data);
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && err.response.data.code) {
          errorMessage = `Error: ${err.response.data.code}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!validatePhone(formData.phone) || !validateOTP(formData.otp)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('=== LOGIN: VERIFY OTP START ===');
      console.log('Verifying OTP for phone:', formData.phone);

      const response = await verifyOTP(formData.phone.trim(), formData.otp.trim());
      
      console.log('Verify OTP response:', response);

      const { token, user_id, user_email, user_display_name, phone } = response;
      
      console.log('User ID from login:', user_id);
      
      // Store token
      localStorage.setItem('jwt_token', token);
      console.log('JWT token stored in localStorage');
      
      // Fetch complete customer data from WooCommerce
      console.log('Fetching complete customer data from WooCommerce...');
      let customerData = null;
      try {
        customerData = await getCustomer(user_id);
        console.log('Customer data from WooCommerce:', JSON.stringify(customerData, null, 2));
      } catch (customerError) {
        console.error('Error fetching customer data from WooCommerce:', customerError);
        console.log('Using basic user data as fallback');
      }
      
      // Build complete user object
      const userData = {
        id: user_id,
        email: user_email || customerData?.billing?.email || '',
        first_name: customerData?.first_name || user_display_name || 'Guest',
        last_name: customerData?.last_name || '',
        name: user_display_name || 'Guest',
        phone: phone,
        // Use WooCommerce data if available, otherwise use basic data
        billing_first_name: customerData?.billing?.first_name || '',
        billing_last_name: customerData?.billing?.last_name || '',
        billing_company: customerData?.billing?.company || '',
        billing_address_1: customerData?.billing?.address_1 || '',
        billing_address_2: customerData?.billing?.address_2 || '',
        billing_city: customerData?.billing?.city || '',
        billing_state: customerData?.billing?.state || '',
        billing_postcode: customerData?.billing?.postcode || '',
        billing_country: customerData?.billing?.country || 'IN',
        billing_phone: customerData?.billing?.phone || phone,
        billing_email: customerData?.billing?.email || user_email || '',
        shipping_first_name: customerData?.shipping?.first_name || '',
        shipping_last_name: customerData?.shipping?.last_name || '',
        shipping_company: customerData?.shipping?.company || '',
        shipping_address_1: customerData?.shipping?.address_1 || '',
        shipping_address_2: customerData?.shipping?.address_2 || '',
        shipping_city: customerData?.shipping?.city || '',
        shipping_state: customerData?.shipping?.state || '',
        shipping_postcode: customerData?.shipping?.postcode || '',
        shipping_country: customerData?.shipping?.country || 'IN'
      };
      
      console.log('Complete user object:', JSON.stringify(userData, null, 2));
      
      // Store user data in localStorage (this will be done by setUser now)
      setUser(userData);
      console.log('User data stored via setUser');
      
      setSuccess(true);
      setError('');
      
      // Redirect to saved return URL after successful login
      setTimeout(() => {
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/my-account';
        console.log('=== LOGIN: REDIRECT AFTER SUCCESSFUL LOGIN ===');
        console.log('Saved redirectAfterLogin:', redirectPath);
        console.log('Redirecting to:', redirectPath);
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      }, 1000);
      
      console.log('=== LOGIN: VERIFY OTP SUCCESS ===');
      
    } catch (err) {
      console.error('Verify OTP error:', err);
      
      let errorMessage = 'Invalid OTP. Please try again.';
      if (err.response) {
        console.error('Error response:', err.response.data);
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && err.response.data.code) {
          errorMessage = `Error: ${err.response.data.code}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Login | Ritchie Street" description="Login to your Ritchie Street customer account.">
      <main className="login-page">
        <div className="login-container">
          {/* Left Side - Branding Section */}
          <div className="login-branding">
            <div className="branding-logo">RitchieStreet</div>
            <h1 className="branding-heading">Welcome to RitchieStreet</h1>
            <p className="branding-subheading">Chennai's Trusted Electronics Marketplace</p>
            
            <div className="trust-points">
              <div className="trust-point">
                <div className="trust-point-icon">✓</div>
                <span>Genuine Products</span>
              </div>
              <div className="trust-point">
                <div className="trust-point-icon">✓</div>
                <span>Fast Delivery</span>
              </div>
              <div className="trust-point">
                <div className="trust-point-icon">✓</div>
                <span>Secure Payments</span>
              </div>
              <div className="trust-point">
                <div className="trust-point-icon">✓</div>
                <span>Expert Support</span>
              </div>
            </div>

            <div className="electronics-illustration">
              <div className="electronics-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <div className="electronics-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </div>
              <div className="electronics-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                  <line x1="6" y1="1" x2="6" y2="4"></line>
                  <line x1="10" y1="1" x2="10" y2="4"></line>
                  <line x1="14" y1="1" x2="14" y2="4"></line>
                </svg>
              </div>
              <div className="electronics-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="login-form-section">
            <div className="login-card">
              <div className="login-card-logo">RitchieStreet</div>
              <h2 className="login-card-heading">Sign In</h2>
              <p className="login-card-subheading">Login with your mobile number or email</p>
              
              {error && <div className="error-message">{error}</div>}
              {success && !otpSent && <div className="success-message">Login successful! Redirecting...</div>}
              {otpSentMessage && <div className="success-message">{otpSentMessage}</div>}
              
              <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="login-form">
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your 10-digit phone number"
                    className="form-input"
                    maxLength="10"
                    disabled={loading}
                    required
                  />
                </div>
                
                {otpSent && (
                  <div className="form-group">
                    <label htmlFor="otp" className="form-label">OTP</label>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter 6-digit OTP"
                      className="form-input"
                      maxLength="6"
                      disabled={loading}
                      required
                    />
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? (otpSent ? 'Verifying...' : 'Sending OTP...') : (otpSent ? 'Verify OTP' : 'Send OTP')}
                </button>
                
                {otpSent && (
                  <button
                    type="button"
                    className="login-button secondary-button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpSentMessage('');
                      setFormData({ ...formData, otp: '' });
                      setError('');
                    }}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </form>

              <div className="trust-badges">
                <div className="trust-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>100% Secure Login</span>
                </div>
                <div className="trust-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Fast OTP Verification</span>
                </div>
                <div className="trust-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <span>Protected Privacy</span>
                </div>
              </div>

              <div className="social-proof">
                <div className="social-proof-stars">★★★★★</div>
                <p className="social-proof-text">Trusted by thousands of customers in Chennai</p>
              </div>
              
              <div className="auth-divider">
                <span>OR</span>
              </div>
              
              <div className="existing-customer-section">
                <p className="existing-customer-text">Don't have an account?</p>
                <Link to="/register" className="login-button secondary-button">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Login;
