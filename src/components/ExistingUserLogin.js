import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../api/userStore';
import { sendOTP, verifyOTP } from '../api/wordpress';
import { getCustomer } from '../api/woocommerce';

const ExistingUserLogin = () => {
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useUserStore();
  const [step, setStep] = useState(1); // 1: Mobile input, 2: OTP verification, 3: Success
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if already logged in (guard for users who visit /login while already authenticated)
  const hasNavigatedRef = useRef(false);
  useEffect(() => {
    if (isAuthenticated && step !== 3) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/my-account';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate, step]);

  // Resend timer countdown
  useEffect(() => {
    if (step !== 2 || resendTimer <= 0) return;
    const timeout = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(timeout);
  }, [step, resendTimer]);

  // Auto-focus first OTP box when entering step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendOTP(phone.trim());
      setStep(2);
      setResendTimer(30);
      setAttempts(0);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0 || loading) return;
    setLoading(true);
    setError('');
    try {
      await sendOTP(phone.trim());
      setResendTimer(30);
      setAttempts(0);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend OTP.';
      setError(msg);
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
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    if (attempts >= 5) {
      setError('Maximum attempts reached. Please request a new OTP.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await verifyOTP(phone.trim(), otpValue);
      const { token, user_id, user_email, user_display_name, phone: userPhone, is_new_user } = response;

      localStorage.setItem('jwt_token', token);

      let customerData = null;
      try {
        customerData = await getCustomer(user_id);
      } catch (_) {}

      const userData = {
        id: user_id,
        email: customerData?.email || user_email || '',
        first_name: customerData?.first_name || user_display_name || 'Guest',
        last_name: customerData?.last_name || '',
        name: user_display_name || 'Guest',
        phone: userPhone || phone,
        billing_first_name: customerData?.billing?.first_name || '',
        billing_last_name: customerData?.billing?.last_name || '',
        billing_company: customerData?.billing?.company || '',
        billing_address_1: customerData?.billing?.address_1 || '',
        billing_address_2: customerData?.billing?.address_2 || '',
        billing_city: customerData?.billing?.city || '',
        billing_state: customerData?.billing?.state || '',
        billing_postcode: customerData?.billing?.postcode || '',
        billing_country: customerData?.billing?.country || 'IN',
        billing_phone: customerData?.billing?.phone || userPhone || phone,
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

      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/my-account';
      sessionStorage.removeItem('redirectAfterLogin');
      setIsNewUser(!!is_new_user);
      setStep(3);
      setUser(userData);

      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);
    } catch (err) {
      setAttempts((p) => p + 1);
      const msg = err.response?.data?.message || err.message || 'Invalid OTP. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setError('');
  };

  const canSubmitOtp = otp.join('').length === 6 && !loading;
  const canSendOtp = phone.length === 10 && !loading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');

        @keyframes auth-fade-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes auth-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes auth-pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        @keyframes auth-circuit {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes auth-success-pop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes auth-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes auth-dot-glow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.25); }
        }

        .auth-page {
          min-height: 100vh;
          display: flex;
          flex-direction: row;
          align-items: stretch;
          justify-content: center;
          background: #F8FAFC;
          padding: 24px 16px;
          font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 1080px;
          margin: 0 auto;
        }
        .auth-card {
          display: flex;
          flex: 1;
          border-radius: 0 24px 24px 0;
          overflow: hidden;
          background: #FFFFFF;
          box-shadow: 0 20px 60px rgba(49, 46, 129, 0.12), 0 8px 24px rgba(0, 0, 0, 0.06);
          animation: auth-fade-in 0.5s ease both;
        }

        /* LEFT PANEL */
        .auth-left {
          position: relative;
          width: 380px;
          min-width: 360px;
          flex-shrink: 0;
          border-radius: 24px 0 0 24px;
          background: linear-gradient(165deg, #312E81 0%, #4338CA 55%, #4F46E5 100%);
          color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px 42px;
          overflow: hidden;
        }
        .auth-left::before,
        .auth-left::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .auth-left::before {
          background: radial-gradient(circle at 20% 30%, rgba(79, 70, 229, 0.45) 0%, transparent 40%),
                      radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.35) 0%, transparent 35%);
          animation: auth-pulse 8s ease-in-out infinite alternate;
        }
        .auth-left::after {
          opacity: 0.08;
          background-image:
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .auth-circuit {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.10;
        }
        .auth-circuit path {
          stroke: rgba(255,255,255,0.65);
          stroke-width: 1.5;
          stroke-dasharray: 12 6;
          animation: auth-circuit 24s linear infinite;
        }
        .auth-glow-dot {
          position: absolute;
          border-radius: 50%;
          background: #818CF8;
          filter: blur(4px);
          animation: auth-dot-glow 4s ease-in-out infinite;
        }
        .auth-left-logo {
          position: relative;
          z-index: 2;
          align-self: flex-start;
        }
        .auth-left-logo img {
          height: 46px;
          object-fit: contain;
          filter: brightness(0) sepia(1) saturate(5) hue-rotate(-15deg);
        }
        .auth-left-content {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-bottom: 40px;
        }
        .auth-left-heading {
          font-size: 42px;
          font-weight: 800;
          line-height: 1.15;
          margin: 0 0 20px;
          letter-spacing: -0.5px;
        }
        .auth-left-desc {
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255,255,255,0.85);
          max-width: 320px;
          margin: 0;
        }
        .auth-illustration {
          position: relative;
          z-index: 2;
          width: 100%;
          margin-top: auto;
          animation: auth-float 6s ease-in-out infinite;
        }
        .auth-illustration svg {
          width: 100%;
          height: auto;
          max-height: 240px;
          display: block;
        }

        /* RIGHT PANEL */
        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 44px 48px;
          background: #FFFFFF;
          overflow-y: auto;
          height: 100%;
        }
        .auth-form-wrap {
          width: 100%;
          max-width: 400px;
          animation: auth-fade-in 0.5s ease 0.1s both;
        }
        .auth-right-logo {
          margin-bottom: 28px;
          text-align: left;
        }
        .auth-right-logo img {
          height: 42px;
          object-fit: contain;
        }
        .auth-title {
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 8px;
          line-height: 1.2;
        }
        .auth-subtitle {
          font-size: 16px;
          color: #6B7280;
          margin: 0 0 32px;
          line-height: 1.55;
        }
        .auth-input-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }
        .auth-phone-field {
          display: flex;
          align-items: center;
          height: 58px;
          border: 1.5px solid #FF6B00;
          border-radius: 16px;
          overflow: hidden;
          background: #FFFFFF;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .auth-phone-field:focus-within {
          border-color: #FF6B00;
          box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.12), 0 8px 20px rgba(255, 107, 0, 0.10);
          transform: translateY(-1px);
        }
        .auth-country {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 100%;
          padding: 0 16px;
          background: #FFF7F0;
          border-right: 1px solid rgba(255, 107, 0, 0.2);
          font-size: 15px;
          font-weight: 600;
          color: #374151;
          white-space: nowrap;
          user-select: none;
        }
        .auth-phone-input {
          flex: 1;
          height: 100%;
          border: none;
          background: transparent;
          padding: 0 16px;
          font-size: 17px;
          font-weight: 600;
          color: #111827;
          letter-spacing: 1px;
          outline: none;
          font-family: inherit;
          width: 100%;
        }
        .auth-phone-input::placeholder {
          font-weight: 400;
          letter-spacing: 0;
          color: #9CA3AF;
          font-size: 15px;
        }
        .auth-btn {
          width: 100%;
          height: 58px;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.25s, box-shadow 0.25s, filter 0.25s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: inherit;
        }
        .auth-btn-primary {
          background: linear-gradient(135deg, #FF7A18 0%, #FF5A1F 100%);
          color: #FFFFFF;
          box-shadow: 0 8px 24px rgba(255, 107, 0, 0.28);
          margin-top: 24px;
        }
        .auth-btn-primary:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(255, 107, 0, 0.38);
          filter: brightness(1.06);
        }
        .auth-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
          filter: none;
        }
        .auth-info {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #FFF7F0;
          border: 1px solid #FFE4CC;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13px;
          color: #7C3A10;
          margin-bottom: 24px;
        }
        .auth-otp-row {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 8px;
        }
        .auth-otp-box {
          width: 50px;
          height: 58px;
          border: 1.5px solid #E5E7EB;
          border-radius: 14px;
          font-size: 22px;
          font-weight: 700;
          text-align: center;
          background: #FAFAFA;
          color: #111827;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          caret-color: #FF6B00;
          font-family: inherit;
        }
        .auth-otp-box:focus {
          border-color: #FF6B00;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.12);
        }
        .auth-otp-box.filled {
          border-color: #FF6B00;
          background: #FFF7F0;
        }
        .auth-attempts {
          font-size: 12px;
          color: #9CA3AF;
          text-align: center;
          margin-top: 8px;
        }
        .auth-resend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 18px;
          font-size: 14px;
          color: #6B7280;
        }
        .auth-resend-btn {
          background: none;
          border: none;
          color: #FF6B00;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          transition: opacity 0.2s;
          font-family: inherit;
        }
        .auth-resend-btn:disabled {
          color: #9CA3AF;
          cursor: not-allowed;
        }
        .auth-resend-timer {
          font-weight: 700;
          color: #FF6B00;
          font-variant-numeric: tabular-nums;
        }
        .auth-change-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 22px;
          font-size: 14px;
          color: #6B7280;
        }
        .auth-change-btn {
          background: #FFFFFF;
          border: 1px solid #FFD4BF;
          color: #FF6B00;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 10px;
          border-radius: 6px;
          transition: background 0.2s;
          font-family: inherit;
        }
        .auth-change-btn:hover { background: #FFF7F0; }
        .auth-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #B91C1C;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 13px;
          text-align: center;
          margin-bottom: 18px;
        }
        .auth-terms {
          font-size: 12px;
          color: #9CA3AF;
          text-align: center;
          margin-top: 24px;
          line-height: 1.6;
        }
        .auth-terms a {
          color: #FF6B00;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        .auth-terms a:hover { color: #E05A00; }
        .auth-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          padding: 24px 0;
          text-align: center;
        }
        .auth-success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #FF7A18, #FF5A1F);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: auth-success-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
          box-shadow: 0 12px 28px rgba(255, 107, 0, 0.28);
        }
        .auth-spinner {
          width: 22px;
          height: 22px;
          border: 2.5px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: auth-spin 0.7s linear infinite;
          display: inline-block;
        }

        /* RESPONSIVE */
        @media (max-width: 991px) {
          .auth-left { width: 30%; min-width: 240px; padding: 34px 28px; }
          .auth-left-heading { font-size: 30px; }
          .auth-left-desc { font-size: 15px; }
          .auth-illustration svg { max-height: 180px; }
          .auth-right { padding: 36px 32px; }
        }
        @media (max-width: 767px) {
          .auth-card {
            max-width: 440px;
            min-height: auto;
            box-shadow: none;
            border-radius: 0;
            background: transparent;
          }
          .auth-left { display: none; }
          .auth-right {
            padding: 24px 0;
            background: transparent;
          }
          .auth-form-wrap {
            background: #FFFFFF;
            border-radius: 20px;
            padding: 28px 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          }
        }
        @media (max-width: 480px) {
          .auth-form-wrap { padding: 24px 20px; }
          .auth-title { font-size: 24px; }
          .auth-subtitle { font-size: 14px; }
          .auth-otp-box { width: 44px; height: 52px; font-size: 20px; }
          .auth-country { padding: 0 12px; font-size: 14px; }
          .auth-phone-input { padding: 0 12px; font-size: 16px; }
        }

        /* ACCESSIBILITY */
        .auth-phone-input:focus,
        .auth-otp-box:focus,
        .auth-btn:focus,
        .auth-change-btn:focus,
        .auth-resend-btn:focus {
          outline: 2px solid rgba(255, 107, 0, 0.5);
          outline-offset: 2px;
        }
        .auth-phone-field:focus-within .auth-phone-input:focus,
        .auth-otp-box:focus {
          outline: none;
        }
      `}</style>

      <div className="auth-page">
                {/* LEFT PROMOTIONAL PANEL */}
          <div className="auth-left" aria-hidden="true">
            <div className="auth-circuit">
              <svg width="100%" height="100%" preserveAspectRatio="none">
                <path d="M0,120 Q160,120 200,240 T360,360 T200,520 T0,600" fill="none" />
                <path d="M0,220 Q180,180 240,320 T420,420 T240,560 T0,620" fill="none" />
                <path d="M0,40 Q120,80 180,160 T320,240 T180,360 T0,440" fill="none" />
              </svg>
            </div>
            <div className="auth-glow-dot" style={{ width: 8, height: 8, top: '18%', left: '22%', animationDelay: '0s' }} />
            <div className="auth-glow-dot" style={{ width: 6, height: 6, top: '38%', left: '72%', animationDelay: '1.2s' }} />
            <div className="auth-glow-dot" style={{ width: 10, height: 10, top: '62%', left: '14%', animationDelay: '2.4s' }} />
            <div className="auth-glow-dot" style={{ width: 5, height: 5, top: '78%', left: '66%', animationDelay: '0.8s' }} />
            <div className="auth-glow-dot" style={{ width: 7, height: 7, top: '30%', left: '45%', animationDelay: '1.8s' }} />

            

            <div className="auth-left-content">
              <h2 className="auth-left-heading">Sign In / Sign Up</h2>
              <p className="auth-left-desc">
                Access your orders, wishlist, repair bookings, and personalised recommendations.
              </p>
            </div>

            <div className="auth-illustration">
              <svg viewBox="0 0 360 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Desk surface */}
                <rect x="20" y="190" width="320" height="12" rx="4" fill="#1E1B4B" fillOpacity="0.6" />
                <rect x="20" y="190" width="320" height="12" rx="4" fill="url(#deskGlow)" />
                {/* PC cabinet */}
                <rect x="230" y="60" width="80" height="130" rx="8" fill="#1E1B4B" stroke="#6366F1" strokeWidth="2" />
                <rect x="240" y="72" width="60" height="60" rx="4" fill="#0F0E2E" stroke="#4338CA" strokeWidth="1" />
                <circle cx="270" cy="102" r="14" fill="url(#fanGradient)" />
                <circle cx="270" cy="102" r="6" fill="#312E81" />
                <rect x="245" y="150" width="50" height="8" rx="2" fill="#6366F1" fillOpacity="0.5" />
                <rect x="245" y="164" width="50" height="8" rx="2" fill="#6366F1" fillOpacity="0.5" />
                <rect x="245" y="178" width="50" height="8" rx="2" fill="#6366F1" fillOpacity="0.5" />
                {/* Monitor */}
                <rect x="60" y="60" width="120" height="80" rx="6" fill="#1E1B4B" stroke="#6366F1" strokeWidth="2" />
                <rect x="68" y="68" width="104" height="64" rx="3" fill="#0F0E2E" />
                <rect x="75" y="76" width="80" height="8" rx="2" fill="#4F46E5" fillOpacity="0.6" />
                <rect x="75" y="90" width="55" height="6" rx="2" fill="#818CF8" fillOpacity="0.5" />
                <rect x="75" y="102" width="70" height="6" rx="2" fill="#818CF8" fillOpacity="0.5" />
                <rect x="110" y="140" width="20" height="18" rx="2" fill="#4338CA" />
                <rect x="90" y="156" width="60" height="6" rx="2" fill="#312E81" />
                {/* Keyboard */}
                <rect x="55" y="175" width="100" height="12" rx="3" fill="#4338CA" />
                <rect x="60" y="178" width="8" height="6" rx="1" fill="#818CF8" />
                <rect x="72" y="178" width="8" height="6" rx="1" fill="#818CF8" />
                <rect x="84" y="178" width="8" height="6" rx="1" fill="#818CF8" />
                <rect x="96" y="178" width="8" height="6" rx="1" fill="#818CF8" />
                <rect x="108" y="178" width="8" height="6" rx="1" fill="#818CF8" />
                <rect x="120" y="178" width="8" height="6" rx="1" fill="#818CF8" />
                <rect x="132" y="178" width="8" height="6" rx="1" fill="#818CF8" />
                <rect x="144" y="178" width="8" height="6" rx="1" fill="#818CF8" />
                {/* Mouse */}
                <ellipse cx="170" cy="179" rx="10" ry="7" fill="#6366F1" />
                <rect x="170" y="176" width="1" height="5" stroke="#A5B4FC" strokeWidth="1" />
                {/* Headset */}
                <path d="M250 60 C250 40 280 40 280 60" stroke="#818CF8" strokeWidth="3" fill="none" />
                <rect x="244" y="56" width="8" height="14" rx="2" fill="#4F46E5" />
                <rect x="278" y="56" width="8" height="14" rx="2" fill="#4F46E5" />
                {/* Plant */}
                <circle cx="40" cy="172" r="12" fill="#312E81" />
                <path d="M40 172 Q28 150 34 140" stroke="#34D399" strokeWidth="3" fill="none" />
                <path d="M40 172 Q52 150 46 138" stroke="#34D399" strokeWidth="3" fill="none" />
                <circle cx="34" cy="140" r="4" fill="#34D399" />
                <circle cx="46" cy="138" r="4" fill="#34D399" />
                <circle cx="40" cy="134" r="4" fill="#34D399" />
                {/* Ambient glows */}
                <defs>
                  <radialGradient id="deskGlow" cx="50%" cy="0%" r="100%">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="fanGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#4338CA" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        <div className="auth-card">

  

          {/* RIGHT AUTHENTICATION PANEL */}
          <div className="auth-right">
            <div className="auth-form-wrap">

              <div className="auth-right-logo">
                <img src="/images/logo.png" alt="RitchieStreet" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>

              {/* Step 1 — Mobile Number */}
              {step === 1 && (
                <>
                  <h2 className="auth-title">Sign In / Sign Up</h2>
                  <p className="auth-subtitle">Enter your mobile number to continue.<br />We'll send you a secure one-time password.</p>

                  {error && <div className="auth-error">{error}</div>}

                  <form onSubmit={handleSendOTP}>
                    <label className="auth-input-label" htmlFor="auth-phone">Mobile Number</label>
                    <div className="auth-phone-field">
                      <div className="auth-country">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        id="auth-phone"
                        type="tel"
                        className="auth-phone-input"
                        placeholder="Enter 10-digit number"
                        value={phone}
                        maxLength="10"
                        autoFocus
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                          setError('');
                        }}
                        disabled={loading}
                        inputMode="numeric"
                      />
                    </div>

                    <button type="submit" className="auth-btn auth-btn-primary" disabled={!canSendOtp}>
                      {loading ? <span className="auth-spinner" /> : null}
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  </form>

                  <p className="auth-terms">
                    By continuing, you agree to our{' '}
                    <Link to="/terms">Terms of Use</Link> and{' '}
                    <Link to="/terms">Privacy Policy</Link>.
                  </p>
                </>
              )}

              {/* Step 2 — OTP Verification */}
              {step === 2 && (
                <>
                  <h2 className="auth-title">Enter OTP</h2>
                  <p className="auth-subtitle">We've sent a 6-digit code to your mobile number.</p>

                  <div className="auth-info">
                    <span>📱</span>
                    <span>OTP sent to <strong>+91 {phone}</strong></span>
                  </div>

                  <div className="auth-change-row">
                    <span>Wrong number?</span>
                    <button className="auth-change-btn" onClick={handleBack} disabled={loading}>
                      Change
                    </button>
                  </div>

                  {error && <div className="auth-error">{error}</div>}

                  <form onSubmit={handleVerifyOTP}>
                    <div className="auth-otp-row" onPaste={handleOTPPaste}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          className={`auth-otp-box${digit ? ' filled' : ''}`}
                          value={digit}
                          maxLength="1"
                          onChange={(e) => handleOTPChange(index, e.target.value)}
                          onKeyDown={(e) => handleOTPKeyDown(index, e)}
                          onFocus={(e) => e.target.select()}
                          disabled={loading}
                          aria-label={`OTP digit ${index + 1}`}
                        />
                      ))}
                    </div>

                    {attempts > 0 && attempts < 5 && (
                      <p className="auth-attempts">{5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining</p>
                    )}

                    <button type="submit" className="auth-btn auth-btn-primary" disabled={!canSubmitOtp}>
                      {loading ? <span className="auth-spinner" /> : null}
                      {loading ? 'Verifying...' : 'Continue'}
                    </button>

                    <div className="auth-resend">
                      <span>Didn't receive it?</span>
                      {resendTimer > 0 ? (
                        <span className="auth-resend-timer">Resend in {resendTimer}s</span>
                      ) : (
                        <button type="button" className="auth-resend-btn" onClick={handleResendOTP} disabled={loading}>
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </form>
                </>
              )}

              {/* Step 3 — Success */}
              {step === 3 && (
                <div className="auth-success">
                  <div className="auth-success-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h2 className="auth-title" style={{ margin: 0 }}>
                    {isNewUser ? 'Account Created!' : 'Welcome Back!'}
                  </h2>
                  <p className="auth-subtitle" style={{ margin: 0 }}>
                    {isNewUser
                      ? 'Your account has been created successfully.'
                      : 'You have been signed in successfully.'}
                    <br />Redirecting...
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
      </>
  );
};

export default ExistingUserLogin;
