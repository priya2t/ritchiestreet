import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from './userStore';
import { sendOTP, verifyOTP } from './wordpress';
import Layout from './Layout';

const LoginNew = () => {
  const navigate = useNavigate();
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

  // Redirect if already logged in and return to checkout if that was the intended destination
  React.useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/my-account';
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
      console.log('Verifying OTP for phone:', formData.phone);

      const response = await verifyOTP(formData.phone.trim(), formData.otp.trim());
      
      console.log('Verify OTP response:', response);

      const { token, user_id, user_email, user_display_name, phone } = response;
      
      // Store token and user data
      localStorage.setItem('jwt_token', token);
      
      const userData = {
        email: user_email,
        name: user_display_name,
        token: token,
        id: user_id,
        phone: phone
      };
      
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      
      setSuccess(true);
      setError('');
      
      // Redirect to my-account after successful login
      setTimeout(() => {
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/my-account';
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      }, 1000);
      
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
    <Layout title="Login | Ritchie Street" description="Login to your Ritchie Street account to continue checkout.">
      <main className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <h1 className="auth-title">Login with OTP</h1>
            
            {error && <div className="auth-error">{error}</div>}
            {success && !otpSent && <div className="auth-success">Login successful! Redirecting...</div>}
            {otpSentMessage && <div className="auth-success">{otpSentMessage}</div>}
            
            <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="auth-form">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your 10-digit phone number"
                  className="auth-input"
                  maxLength="10"
                  disabled={loading}
                  required
                />
              </div>
              
              {otpSent && (
                <div className="form-group">
                  <label htmlFor="otp">OTP</label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter 6-digit OTP"
                    className="auth-input"
                    maxLength="6"
                    disabled={loading}
                    required
                  />
                </div>
              )}
              
              <button 
                type="submit" 
                className="auth-button primary-button login-button"
                disabled={loading}
              >
                {loading ? (otpSent ? 'Verifying...' : 'Sending OTP...') : (otpSent ? 'Verify OTP' : 'Send OTP')}
              </button>
              
              {otpSent && (
                <button
                  type="button"
                  className="auth-button secondary-button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpSentMessage('');
                    setFormData({ ...formData, otp: '' });
                    setError('');
                  }}
                  disabled={loading}
                  style={{ marginTop: '10px' }}
                >
                  Resend OTP
                </button>
              )}
            </form>
            
            <div className="auth-divider">
              <span>OR</span>
            </div>
            
            <div className="new-customer-section">
              <p className="new-customer-text">New Customer?</p>
              <Link to="/register" className="auth-button secondary-button">
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default LoginNew;
