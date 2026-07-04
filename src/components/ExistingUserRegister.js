import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../api/userStore';
import { requestRegistrationOTP, verifyRegistrationOTP } from '../api/wordpress';
import Layout from '../api/Layout';

const ExistingUserRegister = () => {
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useUserStore();
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Resend timer countdown
  useEffect(() => {
    let interval;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const validateIdentifier = (value) => {
    if (!value.trim()) {
      setError('Email or mobile number is required');
      return false;
    }
    
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    const isPhone = /^[0-9]{10}$/.test(value.trim());
    
    if (!isEmail && !isPhone) {
      setError('Please enter a valid email or 10-digit mobile number');
      return false;
    }
    
    return true;
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!validateIdentifier(identifier)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Requesting Registration OTP for identifier:', identifier);

      const response = await requestRegistrationOTP(identifier.trim());
      
      console.log('Registration OTP sent response:', response);
      
      // If user already exists, show error and stop registration
      if (response.user_exists) {
        setError('This mobile number is already registered. Please login.');
        setLoading(false);
        return;
      }
      
      setStep(2);
      setOtpSentMessage(`OTP sent successfully! Your OTP is: ${response.otp} (For testing)`);
      setResendTimer(30);
      
    } catch (err) {
      console.error('Request Registration OTP error:', err);
      
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

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    setError('');

    try {
      console.log('Resending Registration OTP for identifier:', identifier);

      const response = await requestRegistrationOTP(identifier.trim());
      
      console.log('Registration OTP resent response:', response);
      
      // If user already exists, show error and stop registration
      if (response.user_exists) {
        setError('This mobile number is already registered. Please login.');
        setLoading(false);
        return;
      }
      
      setOtpSentMessage('OTP resent successfully! Please check your mobile.');
      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);
      
    } catch (err) {
      console.error('Resend Registration OTP error:', err);
      
      let errorMessage = 'Failed to resend OTP. Please try again.';
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

  const handleOTPChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto focus next box
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    // Auto move backward on delete
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOTPFocus = (index) => {
    // Select all text when focusing
    inputRefs.current[index].select();
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Verifying Registration OTP for identifier:', identifier);

      const response = await verifyRegistrationOTP(identifier.trim(), otpValue);
      
      console.log('Verify Registration OTP response:', response);

      const { token, user, is_new_user } = response;
      setIsNewUser(is_new_user);
      
      // Store token and user data
      localStorage.setItem('jwt_token', token);
      
      const userData = {
        email: user.email,
        name: user.name,
        token: token,
        id: user.id,
        phone: user.phone
      };
      
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      
      // Show success toast
      setShowToast(true);
      const toastMessage = is_new_user ? 'Account created successfully' : 'Account verified successfully';
      setTimeout(() => setShowToast(false), 3000);
      
      // Redirect to home page
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (err) {
      console.error('Verify Registration OTP error:', err);
      
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

  const handleBackToRegister = () => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setOtpSentMessage('');
    setError('');
    setIdentifier('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout title="Sign Up | RitchieStreet" description="Create your RitchieStreet account.">
      <div style={styles.container}>
        <div style={styles.card}>
          {/* Logo */}
          <div style={styles.logo}>
            <h1 style={styles.logoText}>Register</h1>
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {otpSentMessage && <div style={styles.success}>{otpSentMessage}</div>}

          {step === 1 ? (
            // Step 1: Email/Phone Input
            <form onSubmit={handleRequestOTP} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Enter Email/Mobile Number</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError('');
                  }}
                  placeholder=" "
                  style={styles.input}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                style={{
                  ...styles.button,
                  backgroundColor: '#f15b29',
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Request OTP'}
              </button>

              <div style={styles.termsText}>
                By continuing, you agree to RitchieStreet's{' '}
                <Link to="/terms" style={styles.link}>Terms of Use</Link>
                {' '}and{' '}
                <Link to="/privacy" style={styles.link}>Privacy Policy</Link>.
              </div>

              <div style={styles.signupText}>
                Already have an account? <Link to="/login" style={styles.link}>Login</Link>
              </div>
            </form>
          ) : (
            // Step 2: OTP Verification
            <form onSubmit={handleVerifyOTP} style={styles.form}>
              <div style={styles.otpHeader}>
                <span style={styles.otpHeaderText}>Please enter the OTP sent to</span>
                <span style={styles.identifierText}>{identifier}</span>
                <button
                  type="button"
                  onClick={handleBackToRegister}
                  style={styles.changeButton}
                  disabled={loading}
                >
                  Change
                </button>
              </div>

              <div style={styles.otpBoxes} className="otp-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    onFocus={() => handleOTPFocus(index)}
                    maxLength="1"
                    style={styles.otpBox}
                    className="otp-input"
                    disabled={loading}
                  />
                ))}
              </div>

              <button
                type="submit"
                style={{
                  ...styles.button,
                  backgroundColor: '#2F6FED',
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>

              <div style={styles.resendSection}>
                <span style={styles.resendText}>Not received your code?</span>
                {resendTimer > 0 ? (
                  <span style={styles.timer}>{formatTime(resendTimer)}</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    style={styles.resendButton}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Toast Notification */}
          {showToast && (
            <div style={styles.toast}>
              {isNewUser ? 'Account created successfully' : 'Account verified successfully'}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '500px',
    padding: '40px',
    position: 'relative'
  },
  logo: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  logoText: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#f15b29',
    margin: '0'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '14px',
    color: '#374151',
    marginBottom: '8px',
    fontWeight: '500',
    textAlign: 'left'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#333',
    background: '#f8fafc',
    outline: 'none',
    transition: 'all 0.3s',
    boxSizing: 'border-box'
  },
  button: {
    background: 'linear-gradient(135deg, #f15b29 0%, #f15b29 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(241, 91, 41, 0.3)',
    marginTop: '10px',
    width: '100%',
    boxSizing: 'border-box'
  },
  termsText: {
    fontSize: '12px',
    color: '#666',
    textAlign: 'center',
    marginTop: '10px'
  },
  link: {
    color: '#f15b29',
    textDecoration: 'none',
    fontWeight: '500'
  },
  signupText: {
    fontSize: '14px',
    color: '#333',
    textAlign: 'center',
    marginTop: '10px'
  },
  otpHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '8px'
  },
  otpHeaderText: {
    fontSize: '14px',
    color: '#666'
  },
  identifierText: {
    fontSize: '16px',
    color: '#333',
    fontWeight: '500'
  },
  changeButton: {
    background: 'none',
    border: 'none',
    color: '#f15b29',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  otpBoxes: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  otpBox: {
    width: '45px',
    height: '50px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '24px',
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 0.3s',
    background: '#f8fafc',
    boxSizing: 'border-box'
  },
  otpBoxFocus: {
    borderColor: '#f15b29'
  },
  resendSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    marginTop: '10px'
  },
  resendText: {
    fontSize: '14px',
    color: '#666'
  },
  timer: {
    fontSize: '16px',
    color: '#f15b29',
    fontWeight: '600'
  },
  resendButton: {
    background: 'none',
    border: 'none',
    color: '#f15b29',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #fcc'
  },
  success: {
    backgroundColor: '#efe',
    color: '#3c3',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #cfc'
  },
  toast: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#f15b29',
    color: 'white',
    padding: '16px 24px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    fontSize: '16px',
    fontWeight: '500'
  }
};

export default ExistingUserRegister;
// end
