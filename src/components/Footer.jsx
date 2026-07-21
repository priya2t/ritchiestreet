import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { submitNewsletter } from '../api/wordpress';

const reviews = [
  { name: 'Kanmani Oviyan', text: 'Good service.... overall satisfied.', date: 'a year ago' },
  { name: 'Sheerin Begum', text: 'Good service when called, attend service give response. Thank you Kamesh!', date: '7 months ago' },
  { name: 'Rajesh Kumar', text: 'Best electronics shop in Chennai. Genuine products at great prices.', date: '3 months ago' },
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [activeReview, setActiveReview] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      setError(true);
      setMessage('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError(false);
    setMessage('');
    try {
      const response = await submitNewsletter(email.trim());
      setError(false);
      setMessage(response.message || 'Thank you for subscribing!');
      setEmail('');
    } catch (err) {
      setError(true);
      setMessage(err.response?.data?.message || err.message || 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="rs-footer">

      {/* Trust Bar — compact single row */}
      {/*<div className="rs-trust-bar">
        <div className="rs-container">
          <div className="rs-trust-grid">
            <div className="rs-trust-item">
              <span className="rs-trust-icon">✓</span>
              <span className="rs-trust-label">Genuine Products</span>
            </div>
            <div className="rs-trust-item">
              <span className="rs-trust-icon">
                <img src="/images/truck.webp" alt="Quick Delivery"/>
              </span>
              <span className="rs-trust-label">Fast Delivery</span>
            </div>
            <div className="rs-trust-item">
              <span className="rs-trust-icon">
                <img src="/images/support.webp" alt="customer support"/>
                </span>
              <span className="rs-trust-label">Expert Support</span>
            </div>
            <div className="rs-trust-item">
              <span className="rs-trust-icon">
                <img src="/images/security1.webp" alt="secure payments"/>
              </span>
              <span className="rs-trust-label">Secure Payments</span>
            </div>
          </div>
        </div>
      </div>*/}

      {/* Main Footer — 4 columns */}
      <div className="rs-footer-main">
        <div className="rs-container">
          <div className="rs-footer-grid">

            {/* Col 1: Brand + Contact + Social */}
            <div className="rs-footer-widget">
              <div className="rs-footer-logo">
                <Link to="/" onClick={scrollToTop}>
                  <img src="/images/logo.png" alt="Ritchie Street" />
                </Link>
              </div>
              {/*<p className="rs-footer-description">
                Premium electronics &amp; repair services in Chennai. Genuine products, expert support, fast delivery.
              </p>*/}
              <div className="rs-footer-contact">
                <p className="rs-contact-item">
                  <span className="rs-contact-icon">
                    <img src="/images/location.webp" alt="Location" />
                  </span>
                  Mangadu Rd, Paraniputhur, Iyyappanthangal, Chennai 600122
                </p>
                <p className="rs-contact-item">
                  <span className="rs-contact-icon">
                    <img src="/images/message.webp" alt="Email" />
                  </span>
                  <a href="mailto:info@ritchiestreet.co.in">info@ritchiestreet.co.in</a>
                </p>
                <p className="rs-contact-item">
                  <span className="rs-contact-icon">
                    <img src="/images/phone.webp" alt="Phone" />
                  </span>
                  <a href="tel:+918667507040">+91 86675 07040</a>
                </p>
              </div>
              <div className="rs-footer-socials">
                <a href="https://www.facebook.com/profile.php?id=61550673917474" target="_blank" rel="noopener noreferrer" className="rs-social-pill" aria-label="Facebook">
                  <img src="/images/fb.webp" alt="Facebook" />
                </a>
                <a href="https://www.instagram.com/ritchiestreet_chn" target="_blank" rel="noopener noreferrer" className="rs-social-pill" aria-label="Instagram">
                  <img src="/images/insta.webp" alt="Instagram" />
                </a>
                <a href="https://twitter.com/Ritchistreetchn" target="_blank" rel="noopener noreferrer" className="rs-social-pill" aria-label="X / Twitter">
                  <img src="/images/twitter.webp" alt="X" />
                </a>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="rs-footer-widget">
              <h4 className="rs-footer-heading">Quick Links</h4>
              <ul className="rs-footer-links">
                <li><Link to="/" onClick={scrollToTop}>Home</Link></li>
                
                <li><Link to="/categories" onClick={scrollToTop}>Categories</Link></li>
                <li><Link to="/services" onClick={scrollToTop}>Services</Link></li>
                <li><Link to="/about" onClick={scrollToTop}>About Us</Link></li>
              </ul>
            </div>

            {/* Col 3: Customer Service */}
            <div className="rs-footer-widget">
              <h4 className="rs-footer-heading">Customer Service</h4>
              <ul className="rs-footer-links">
                
                <li><Link to="/contact" onClick={scrollToTop}>Replacement Policy</Link></li>
                <li><Link to="/terms" onClick={scrollToTop}>Terms &amp; Conditions</Link></li>
                <li><Link to="/terms" onClick={scrollToTop}>Privacy Policy</Link></li>
                <li><Link to="/contact" onClick={scrollToTop}>Contact Us</Link></li>
              </ul>
            </div>

            {/* Col 4: Newsletter + Rotating Review */}
            <div className="rs-footer-widget">
              <h4 className="rs-footer-heading">Stay Updated</h4>
              <form className="rs-nl-form" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  placeholder="Your email address"
                  className="rs-nl-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
                <button type="submit" className="rs-nl-btn" disabled={loading}>
                  {loading ? '...' : 'Subscribe'}
                </button>
              </form>
              {message && (
                <p className={`rs-nl-msg ${error ? 'rs-nl-msg--error' : 'rs-nl-msg--ok'}`}>{message}</p>
              )}

              {/* Rotating Review */}
              <div className="rs-review-rotator">
                <div className="rs-rr-rating">
                  <span className="rs-rr-stars">★★★★★</span>
                  <span className="rs-rr-score">4.9 · Trusted by 5,000+ customers</span>
                </div>
                <div className="rs-rr-card" key={activeReview}>
                  <p className="rs-rr-text">"{reviews[activeReview].text}"</p>
                  <p className="rs-rr-author">— {reviews[activeReview].name}</p>
                </div>
                <div className="rs-rr-dots">
                  {reviews.map((_, i) => (
                    <button
                      key={i}
                      className={`rs-rr-dot${i === activeReview ? ' active' : ''}`}
                      onClick={() => setActiveReview(i)}
                      aria-label={`Review ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="rs-footer-bottom">
        <div className="rs-container">
          <div className="rs-bottom-inner">
            <p className="rs-copyright">Copyright © 2026 Mak Technology India</p>
            <div className="rs-bottom-links">
              <Link to="/terms" onClick={scrollToTop}>Privacy</Link>
              <span>|</span>
              <Link to="/terms" onClick={scrollToTop}>Terms</Link>
              <span>|</span>
              <Link to="/contact" onClick={scrollToTop}>Replacement</Link>
              <span>|</span>
              <Link to="/contact" onClick={scrollToTop}>Contact</Link>
            </div>
            
            <div className="rs-bottom-payments">
              <span>Payment method:</span>
              <span className="rs-pay-badge">
                Cash On Delivery
              </span>
              
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
