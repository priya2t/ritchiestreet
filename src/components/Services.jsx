import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { submitServiceForm } from '../api/wordpress';
import Layout from '../api/Layout';

const Services = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Services - Ritchie Street Best Online Electronics Hub';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get professional electronics services from Ritchie Street. Laptop, Desktop, Printer, CCTV, Mobile, TV repair and data recovery services in Chennai.');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.serviceType) {
      newErrors.serviceType = 'Service Type is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await submitServiceForm(formData);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        serviceType: '',
        message: ''
      });
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

  const serviceTypes = [
    { name: 'Laptop', icon: '/images/laptop.webp' },
    { name: 'Desktop', icon: '/images/computer.jpeg' },
    { name: 'Mobile', icon: '/images/smartphone.png' },
    { name: 'Printer', icon: '/images/printer.png' },
    { name: 'CCTV', icon: '/images/cctv.webp' },
    { name: 'TV', icon: '/images/tv.png' },
    { name: 'Data Recovery', icon: '/images/harddisk.png' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f8fafc, #eef5ff)'
    }}>
      <style>
        {`
          @media (max-width: 1024px) {
            .services-main-content {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 768px) {
            .services-form-row {
              grid-template-columns: 1fr !important;
            }
            .service-icons-strip {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 480px) {
            .service-icons-strip {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
      
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
            Professional Services
          </span>
          <h1 style={{
            fontSize: '46px', fontWeight: '800', color: '#ffffff',
            margin: '0 0 16px 0', lineHeight: '1.2'
          }}>
            Our Service Center
          </h1>
          <h2 style={{
            fontSize: '20px', fontWeight: '500', color: '#94a3b8', margin: '0 0 16px 0'
          }}>
            Professional Repair & Support Solutions
          </h2>
          <p style={{
            fontSize: '17px', color: '#94a3b8', margin: '0 auto',
            maxWidth: '600px', lineHeight: '1.7'
          }}>
            Expert repair services for Laptop, Desktop, Mobile, Printer, CCTV, TV and Data Recovery.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="services-main-content" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px 40px 20px',
        display: 'grid',
        gridTemplateColumns: '30% 70%',
        gap: '30px'
      }}>
        {/* Benefits Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          height: 'fit-content'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 0 15px 0',
            color: '#1e293b'
          }}>
            Additional Benefits
          </h3>
          <p style={{
            fontSize: '15px',
            color: '#64748b',
            margin: '0 0 25px 0',
            lineHeight: '1.6'
          }}>
            Round-the-clock support from certified experts—wherever you are.
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f1f5f9',
              fontSize: '15px',
              color: '#334155'
            }}>
              <span style={{ fontSize: '20px', marginRight: '12px' }}><img src="/images/telephone.png"/></span>
              24/7 Support
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f1f5f9',
              fontSize: '15px',
              color: '#334155'
            }}>
              <span style={{ fontSize: '20px', marginRight: '12px' }}><img src="/images/tools.png"/></span>
              Troubleshooting
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f1f5f9',
              fontSize: '15px',
              color: '#334155'
            }}>
              <span style={{ fontSize: '20px', marginRight: '12px' }}><img src="/images/laptop1.png"/></span>
              Remote Guidance
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 0',
              fontSize: '15px',
              color: '#334155'
            }}>
              <span style={{ fontSize: '20px', marginRight: '12px' }}><img src="/images/phone.png"/></span>
              Expert Assistance
            </li>
          </ul>
          <div style={{
            marginTop: '25px',
            padding: '15px',
            background: 'linear-gradient(135deg, #f15b29, #f15b29)',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <p style={{
              margin: '0',
              fontSize: '14px',
              color: 'white',
              opacity: 0.9
            }}>
              Call us now
            </p>
            <a href="tel:+918667507040" style={{
              display: 'block',
              fontSize: '24px',
              fontWeight: '700',
              color: 'white',
              textDecoration: 'none',
              marginTop: '5px'
            }}>
              +91 86675 07040
            </a>
          </div>
        </div>

        {/* Form Section */}
        <div>
          {/* Service Icons Strip */}
          <div className="service-icons-strip" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
          }}>
            {serviceTypes.map((service) => (
              <div key={service.name} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px 15px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                border: formData.serviceType === service.name ? '2px solid #2563eb' : 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => setFormData({ ...formData, serviceType: service.name })}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                  {typeof service.icon === 'string' && (service.icon.startsWith('/') || service.icon.includes('.'))
                    ? <img src={service.icon} alt={service.name} style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                    : service.icon}
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#334155'
                }}>
                  {service.name}
                </div>
              </div>
            ))}
          </div>

          {/* Service Form Card */}
          <div style={{
            background: '#ffffff',
            padding: '35px',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 25px 0',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '12px' }}><img src="/images/spanner.png"/></span>
              Request a Service
            </h2>
            
            {submitted && (
              <div style={{
                background: '#dcfce7',
                border: '1px solid #22c55e',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '25px',
                color: '#166534',
                fontSize: '15px'
              }}>
                Thank You For Reaching Us. Our Services Team will get back to you soon
              </div>
            )}
            
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '25px',
                color: '#dc2626',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                ⚠️ {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="services-form-row" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name*"
                    value={formData.name}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      height: '50px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      padding: '0 15px',
                      fontSize: '15px',
                      transition: 'all 0.3s',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {errors.name && <div style={{
                    color: '#dc2626',
                    fontSize: '13px',
                    marginTop: '5px'
                  }}>{errors.name}</div>}
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email*"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      height: '50px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      padding: '0 15px',
                      fontSize: '15px',
                      transition: 'all 0.3s',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {errors.email && <div style={{
                    color: '#dc2626',
                    fontSize: '13px',
                    marginTop: '5px'
                  }}>{errors.email}</div>}
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone*"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    height: '50px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '0 15px',
                    fontSize: '15px',
                    transition: 'all 0.3s',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.phone && <div style={{
                  color: '#dc2626',
                  fontSize: '13px',
                  marginTop: '5px'
                }}>{errors.phone}</div>}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    height: '50px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '0 15px',
                    fontSize: '15px',
                    transition: 'all 0.3s',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select Service Type</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Printer">Printer</option>
                  <option value="CCTV">CCTV</option>
                  <option value="TV">TV</option>
                  <option value="Data Recovery">Data Recovery</option>
                </select>
                {errors.serviceType && <div style={{
                  color: '#dc2626',
                  fontSize: '13px',
                  marginTop: '5px'
                }}>{errors.serviceType}</div>}
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <textarea
                  name="message"
                  placeholder="Enter Message*"
                  value={formData.message}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    height: '150px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '15px',
                    fontSize: '15px',
                    transition: 'all 0.3s',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.message && <div style={{
                  color: '#dc2626',
                  fontSize: '13px',
                  marginTop: '5px'
                }}>{errors.message}</div>}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '52px',
                  background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #f15b29, #f15b29)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: loading ? 'none' : '0 8px 20px rgba(241,91,41,0.35)'
                }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(241,91,41,0.45)'; }}}
                onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(241,91,41,0.35)'; }}}
              >
                {loading ? 'Sending...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      </div>

      </div>
  );
};

export default Services;
