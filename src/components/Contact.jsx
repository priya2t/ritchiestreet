import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { submitContactForm } from '../api/wordpress';

const inputStyle = {
  width: '100%',
  height: '50px',
  border: '2px solid #e2e8f0',
  borderRadius: '10px',
  padding: '0 16px',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#f8fafc',
  color: '#111827',
  transition: 'all 0.3s ease'
};

const Contact = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    product: '',
    description: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');

  useEffect(() => {
    document.title = 'Contact Us - Ritchie Street Best Online Electronics Hub';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Contact Ritchie Street for electronics, software development, and networking services in Chennai. Call us at +91 86675 07040.');
    }
  }, []);

  useEffect(() => {
    if (location.hash === '#product-finder-form') {
      const el = document.getElementById('product-finder-form');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    }
  }, [location.hash]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await submitContactForm(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', product: '', description: '' });
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = { borderColor: '#f15b29', boxShadow: '0 0 0 4px rgba(241,91,41,0.12)', backgroundColor: '#ffffff' };

  const contactCards = [
    {
      icon: '/images/chat.webp', title: 'Call Us', color: '#f15b29',
      lines: [
        { href: 'tel:+918667507040', text: '+91 86675 07040' }
      ]
    },
    {
      icon: '/images/message.webp', title: 'Email Us', color: '#2563eb',
      lines: [
        { href: 'mailto:info@ritchiestreet.co.in', text: 'info@ritchiestreet.co.in' },
        { href: 'https://www.ritchiestreet.co.in', text: 'www.ritchiestreet.co.in' }
      ]
    },
    {
      icon: '/images/location.webp', title: 'Visit Us', color: '#16a34a',
      lines: [
        { text: '6, 107, Mangadu Rd, next to Niagara Juice Shop, Mangala Nagar, Paraniputhur, Iyyappanthangal, Chennai, Tamil Nadu 600122' }
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .contact-card { animation: fadeInUp 0.5s ease forwards; }
        .contact-card:hover { transform: translateY(-6px) !important; box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important; }
        .social-icon-btn:hover { transform: scale(1.15) !important; }
        @media (max-width: 900px) {
          .contact-main-grid { flex-direction: column !important; }
          .contact-form-row { flex-direction: column !important; }
        }
      `}</style>

      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #111827 100%)',
        padding: '64px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 80%, rgba(241,91,41,0.13) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-block', background: 'rgba(241,91,41,0.2)', color: '#f15b29',
            padding: '6px 18px', borderRadius: '20px', fontSize: '13px',
            fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '18px'
          }}>
            Get In Touch
          </span>
          <h1 style={{
            fontSize: '46px', fontWeight: '800', color: '#ffffff',
            margin: '0 0 16px 0', lineHeight: '1.2'
          }}>
            Contact <span style={{ color: '#f15b29' }}>RitchieStreet</span>
          </h1>
          <p style={{
            fontSize: '17px', color: '#94a3b8', margin: '0 auto',
            maxWidth: '500px', lineHeight: '1.7'
          }}>
            Have a question, need a quote, or want to know more? We're here to help you every step of the way.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '8px', fontSize: '14px', color: '#64748b' }}>
          <Link to="/" style={{ color: '#f15b29', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
          <span>›</span>
          <span style={{ color: '#111827', fontWeight: '500' }}>Contact Us</span>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 20px 64px 20px' }}>

        {/* Quick Contact Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '48px'
        }}>
          {contactCards.map((card, i) => (
            <div key={i} className="contact-card" style={{
              backgroundColor: '#ffffff', borderRadius: '20px',
              padding: '28px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
              border: '1px solid #f1f5f9', transition: 'all 0.3s ease',
              animationDelay: `${i * 0.1}s`
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: `${card.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px', marginBottom: '16px',
                border: `2px solid ${card.color}25`
              }}>
                {typeof card.icon === 'string' && (card.icon.startsWith('/') || card.icon.includes('.'))
                  ? <img src={card.icon} alt={card.title} style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                  : card.icon}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 10px 0' }}>{card.title}</h3>
              {card.lines.map((line, j) => (
                line.href ? (
                  <a key={j} href={line.href} style={{
                    display: 'block', fontSize: '14px', color: card.color,
                    textDecoration: 'none', fontWeight: '500', marginBottom: '4px',
                    transition: 'opacity 0.2s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    {line.text}
                  </a>
                ) : (
                  <p key={j} style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>{line.text}</p>
                )
              ))}
            </div>
          ))}
        </div>

        {/* Map + Form Grid */}
        <div className="contact-main-grid" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

          {/* Left: Map + Social */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Map */}
            <div style={{
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              border: '1px solid #e2e8f0', height: '340px'
            }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248783.14652415624!2d79.84599848671878!3d13.020595500000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526162c6fe9de9%3A0xb3a12f1400dcab4a!2sF1%20Tekno%20Solutions!5e0!3m2!1sen!2sin!4v1765988025468!5m2!1sen!2sin"
                width="100%" height="100%"
                frameBorder="0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ display: 'block', border: 'none', width: '100%', height: '100%' }}
              />
            </div>

            {/* Social Media */}
            <div style={{
              backgroundColor: '#ffffff', borderRadius: '20px', padding: '28px 24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>Follow Us</h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>Stay connected on social media</p>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[
                  { href: 'https://www.facebook.com/profile.php?id=61550673917474', src: '/images/fb.webp', alt: 'Facebook', bg: '#1877f2' },
                  { href: 'https://twitter.com/Ritchistreetchn', src: '/images/twitter.webp', alt: 'Twitter', bg: '#1da1f2' },
                  { href: 'https://www.instagram.com/ritchiestreet_chn', src: '/images/insta.webp', alt: 'Instagram', bg: '#e1306c' }
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="social-icon-btn"
                    style={{
                      width: '52px', height: '52px', borderRadius: '14px',
                      background: `${s.bg}15`, border: `2px solid ${s.bg}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'transform 0.3s ease', overflow: 'hidden'
                    }}
                  >
                    <img src={s.src} alt={s.alt} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div id="product-finder-form" style={{ flex: '1.2' }}>
            <div style={{
              backgroundColor: '#ffffff', borderRadius: '20px', padding: '36px 32px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9'
            }}>
              {/* Form Header */}
              <div style={{ marginBottom: '28px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff7ed', color: '#f15b29',
                  padding: '5px 14px', borderRadius: '20px', fontSize: '12px',
                  fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px'
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#f15b29" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  PRODUCT SOURCING REQUEST
                </span>
                <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 6px 0' }}>
                  Can't Find Your Product?
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Tell us what you're looking for and our sourcing experts will find genuine IT products through our trusted distributor network and send you the best available price and availability within 24 hours.
                </p>
              </div>

              {/* Success Message */}
              {submitted && (
                <div style={{
                  background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px',
                  padding: '16px 20px', marginBottom: '24px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  fontSize: '14px', color: '#16a34a', fontWeight: '600'
                }}>
                  <span style={{ fontSize: '20px' }}>✅</span>
                  Thank you for reaching us! Our Sales Team will get back to you soon.
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
                  padding: '16px 20px', marginBottom: '24px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  fontSize: '14px', color: '#dc2626', fontWeight: '600'
                }}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name + Email Row */}
                <div className="contact-form-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text" name="name" placeholder="John Doe"
                      value={formData.name} onChange={handleChange} required
                      style={{ ...inputStyle, ...(focused === 'name' ? focusStyle : {}) }}
                      onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email" name="email" placeholder="john@example.com"
                      value={formData.email} onChange={handleChange} required
                      style={{ ...inputStyle, ...(focused === 'email' ? focusStyle : {}) }}
                      onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="text" name="phone" placeholder="+91 99999 99999"
                    value={formData.phone} onChange={handleChange} required
                    style={{ ...inputStyle, ...(focused === 'phone' ? focusStyle : {}) }}
                    onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                  />
                </div>

                {/* Item Name */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Item / Product Name *
                  </label>
                  <input
                    type="text" name="product" placeholder="e.g. Laptop, CCTV, Router..."
                    value={formData.product} onChange={handleChange} required
                    style={{ ...inputStyle, ...(focused === 'product' ? focusStyle : {}) }}
                    onFocus={() => setFocused('product')} onBlur={() => setFocused('')}
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Item Description *
                  </label>
                  <textarea
                    name="description" placeholder="Tell us more about what you're looking for..."
                    value={formData.description} onChange={handleChange} required
                    style={{
                      ...inputStyle, height: '130px', padding: '14px 16px',
                      resize: 'vertical', fontFamily: 'inherit',
                      ...(focused === 'description' ? focusStyle : {})
                    }}
                    onFocus={() => setFocused('description')} onBlur={() => setFocused('')}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', height: '52px',
                    background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #f15b29, #f15b29)',
                    color: '#ffffff', border: 'none', borderRadius: '12px',
                    fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: loading ? 'none' : '0 8px 24px rgba(241,91,41,0.35)',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(241,91,41,0.45)'; }}}
                  onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(241,91,41,0.35)'; }}}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>

                <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', margin: '16px 0 0 0' }}>
                  We typically respond within 24 hours on business days.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      </div>
  );
};

export default Contact;
