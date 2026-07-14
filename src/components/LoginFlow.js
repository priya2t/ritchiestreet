import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../api/userStore';
import { sendLoginOTP, verifyLoginOTP } from '../api/wordpress';
import Layout from '../api/Layout';

const LoginFlow = () => {
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useUserStore();
  const [step, setStep] = useState(1); // 1: Phone input, 2: OTP verification
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [showToast, setShowToast] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Resend timer countdown
  React.useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validatePhone = (phoneNum) => {
    if (!phoneNum.trim()) {
      setError('Mobile number is required');
      return false;
    }
    if (!/^[0-9]{10}$/.test(phoneNum.trim())) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    return true;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!validatePhone(phone)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Sending Login OTP to:', phone);

      const response = await sendLoginOTP(phone.trim());
      
      console.log('Login OTP sent response:', response);
      
      setStep(2);
      setOtpSentMessage(`OTP sent successfully! Your OTP is: ${response.otp} (For testing)`);
      setResendTimer(30); // Start 30-second timer
      
    } catch (err) {
      console.error('Send Login OTP error:', err);
      
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
      console.log('Resending Login OTP to:', phone);

      const response = await sendLoginOTP(phone.trim());
      
      console.log('Login OTP resent response:', response);
      
      setOtpSentMessage(`OTP resent successfully! Your OTP is: ${response.otp} (For testing)`);
      setResendTimer(30); // Reset timer
      setOtp(''); // Clear OTP field
      
    } catch (err) {
      console.error('Resend Login OTP error:', err);
      
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

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      setError('OTP is required');
      return;
    }
    if (!/^[0-9]{6}$/.test(otp.trim())) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Verifying Login OTP for phone:', phone);

      const response = await verifyLoginOTP(phone.trim(), otp.trim());
      
      console.log('Verify Login OTP response:', response);

      const { token, user } = response;
      
      // Store token and user data
      localStorage.setItem('jwt_token', token);
      
      const userData = {
        email: user.email || '',
        first_name: user.name || 'Guest',
        last_name: '',
        name: user.name || 'Guest',
        token: token,
        id: user.id,
        phone: user.phone
      };
      
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      
      // Show welcome toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Redirect to saved return URL after successful login
      setTimeout(() => {
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
        console.log('=== LOGIN FLOW: REDIRECT AFTER SUCCESSFUL LOGIN ===');
        console.log('Saved redirectAfterLogin:', redirectPath);
        console.log('Redirecting to:', redirectPath);
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      }, 1000);
      
    } catch (err) {
      console.error('Verify Login OTP error:', err);
      
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

  const handleBackToPhone = () => {
    setStep(1);
    setOtp('');
    setOtpSentMessage('');
    setError('');
  };

  return (
    <Layout title="Login | RitchieStreet" description="Login to your RitchieStreet account.">
      <div style={styles.container}>
        <div style={styles.card}>
          {/* Logo */}
          <div style={styles.logo}>
            <h1 style={styles.logoText}>RitchieStreet</h1>
          </div>

          {/* Heading */}
          <h2 style={styles.heading}>Login to RitchieStreet</h2>

          {error && <div style={styles.error}>{error}</div>}
          {otpSentMessage && <div style={styles.success}>{otpSentMessage}</div>}

          {step === 1 ? (
            // Step 1: Phone Input
            <form onSubmit={handleSendOTP} style={styles.form}>
              <div style={styles.inputGroup}>
                <div style={styles.phoneInputWrapper}>
                  <span style={styles.countryCode}>+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setPhone(value);
                      setError('');
                    }}
                    placeholder="Enter Mobile Number"
                    maxLength="10"
                    style={styles.phoneInput}
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  ...styles.button,
                  opacity: phone.length !== 10 || loading ? 0.5 : 1,
                  cursor: phone.length !== 10 || loading ? 'not-allowed' : 'pointer'
                }}
                disabled={phone.length !== 10 || loading}
              >
                {loading ? 'Sending...' : 'CONTINUE'}
              </button>

              <div style={styles.termsText}>
                By continuing, you agree to RitchieStreet's{' '}
                <Link to="/terms" style={styles.link}>Terms of Use</Link>
                {' '}and{' '}
                <Link to="/privacy" style={styles.link}>Privacy Policy</Link>.
              </div>

              <div style={styles.signupText}>
                New User? <Link to="/register" style={styles.link}>Sign Up</Link>
              </div>
            </form>
          ) : (
            // Step 2: OTP Verification
            <form onSubmit={handleVerifyOTP} style={styles.form}>
              <div style={styles.phoneDisplay}>
                <span style={styles.phoneDisplayText}>+91 {phone}</span>
                <button
                  type="button"
                  onClick={handleBackToPhone}
                  style={styles.changeButton}
                  disabled={loading}
                >
                  Change?
                </button>
              </div>

              <div style={styles.otpSentText}>
                OTP sent to Mobile
                <button
                  type="button"
                  onClick={handleResendOTP}
                  style={{
                    ...styles.resendButton,
                    opacity: resendTimer > 0 || loading ? 0.5 : 1,
                    cursor: resendTimer > 0 || loading ? 'not-allowed' : 'pointer'
                  }}
                  disabled={resendTimer > 0 || loading}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend?'}
                </button>
              </div>

              <div style={styles.inputGroup}>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setOtp(value);
                    setError('');
                  }}
                  placeholder="Enter OTP"
                  maxLength="6"
                  style={styles.otpInput}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                style={styles.button}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'LOGIN'}
              </button>
            </form>
          )}

          {/* Toast Notification */}
          {showToast && (
            <div style={styles.toast}>
              Welcome back to RitchieStreet
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
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    position: 'relative'
  },
  logo: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  logoText: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#f15b29',
    margin: 0
  },
  heading: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '30px',
    textAlign: 'center'
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
  phoneInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '2px solid #ddd',
    transition: 'border-color 0.3s'
  },
  countryCode: {
    fontSize: '16px',
    color: '#666',
    marginRight: '10px',
    fontWeight: '500'
  },
  phoneInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    padding: '12px 0',
    color: '#333',
    background: 'transparent'
  },
  otpInput: {
    width: '100%',
    border: 'none',
    borderBottom: '2px solid #ddd',
    outline: 'none',
    fontSize: '20px',
    padding: '12px 0',
    letterSpacing: '4px',
    textAlign: 'center',
    color: '#333',
    background: 'transparent',
    transition: 'border-color 0.3s'
  },
  button: {
    backgroundColor: '#f15b29',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginTop: '10px'
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
  phoneDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  phoneDisplayText: {
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
  otpSentText: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px'
  },
  resendButton: {
    background: 'none',
    border: 'none',
    color: '#f15b29',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  success: {
    backgroundColor: '#efe',
    color: '#3c3',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center'
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

export default LoginFlow;
