import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiArrowRight, FiTool, FiAward, FiClock, FiMapPin } from 'react-icons/fi';
import Layout from '../api/Layout';
import { submitServiceBooking } from '../api/ServiceNetwork';
import { SERVICE_TYPES } from '../constants/serviceTypes';
import './BookService.css';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  service_type: '',
  product_details: '',
  address: '',
  preferred_date: '',
  message: ''
};

const serviceTypes = SERVICE_TYPES;

const BookService = () => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const phoneDigits = formData.phone.replace(/\D/g, '');

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!/^[6-9]\d{9}$/.test(phoneDigits.replace(/^91/, '').replace(/^0/, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.service_type) newErrors.service_type = 'Please select a service type';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await submitServiceBooking({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim()
      });
      if (res.success) {
        setBookingId(res.booking_id);
        setFormData(initialForm);
      } else {
        setError(res.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: <FiTool size={18} />, text: 'Certified service engineers' },
    { icon: <FiAward size={18} />, text: 'Genuine spare parts' },
    { icon: <FiClock size={18} />, text: 'Same-day doorstep support in Chennai' },
    { icon: <FiMapPin size={18} />, text: 'Coverage across Chennai' }
  ];

  return (
    <Layout
      title="Book a Service - Ritchie Street"
      description="Book a professional electronics repair and installation service from Ritchie Street in Chennai."
    >
      <div className="sn-booking-page">
        <div className="sn-booking-container">
          <div className="sn-booking-hero">
            <h1>Book a Service</h1>
            <p>
              Need a repair or installation? Share your requirement and our team will
              get back to you shortly to schedule a visit at your convenience.
            </p>
          </div>

          <div className="sn-booking-grid">
            <aside className="sn-booking-info-card">
              <h2>Why choose Ritchie Street service?</h2>
              <ul>
                {benefits.map((b, i) => (
                  <li key={i}>
                    {b.icon}
                    <span>{b.text}</span>
                  </li>
                ))}
              </ul>
              <h2>Are you a service engineer?</h2>
              <div className="sn-booking-info-links">
                <Link to="/service-engineer-registration" className="sn-booking-link-primary">
                  Service Engineer Registration <FiArrowRight size={16} />
                </Link>
                <Link to="/contact" className="sn-booking-link-secondary">
                  Contact Us
                </Link>
              </div>
            </aside>

            <div className="sn-booking-form-card">
              {bookingId ? (
                <div className="sn-booking-success-box">
                  <h3>Booking Request Submitted</h3>
                  <p>
                    Thank you! Your service booking request (ID: {bookingId}) has been
                    received. Our team will contact you shortly to confirm the schedule.
                  </p>
                  <button
                    type="button"
                    className="sn-booking-submit"
                    style={{ marginTop: '24px', maxWidth: '280px' }}
                    onClick={() => setBookingId(null)}
                  >
                    Book Another Service
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h2>Service Booking Form</h2>
                  <div className="sn-booking-form-grid">
                    <div className="sn-booking-field">
                      <label htmlFor="sn-name">Full Name <span className="sn-booking-required">*</span></label>
                      <input id="sn-name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Your full name" />
                      {errors.name && <span className="sn-booking-error-text">{errors.name}</span>}
                    </div>
                    <div className="sn-booking-field">
                      <label htmlFor="sn-phone">Phone <span className="sn-booking-required">*</span></label>
                      <input id="sn-phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" />
                      {errors.phone && <span className="sn-booking-error-text">{errors.phone}</span>}
                    </div>
                    <div className="sn-booking-field">
                      <label htmlFor="sn-email">Email</label>
                      <input id="sn-email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                      {errors.email && <span className="sn-booking-error-text">{errors.email}</span>}
                    </div>
                    <div className="sn-booking-field">
                      <label htmlFor="sn-service-type">Service Type <span className="sn-booking-required">*</span></label>
                      <select id="sn-service-type" name="service_type" value={formData.service_type} onChange={handleChange}>
                        <option value="">Select a service</option>
                        {serviceTypes.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.service_type && <span className="sn-booking-error-text">{errors.service_type}</span>}
                    </div>
                    <div className="sn-booking-field sn-booking-field--full">
                      <label htmlFor="sn-product-details">Product Details</label>
                      <input id="sn-product-details" name="product_details" type="text" value={formData.product_details} onChange={handleChange} placeholder="Brand, model, approximate purchase date" />
                    </div>
                    <div className="sn-booking-field sn-booking-field--full">
                      <label htmlFor="sn-address">Service Address</label>
                      <textarea id="sn-address" name="address" value={formData.address} onChange={handleChange} placeholder="Address where the service visit is required" />
                    </div>
                    <div className="sn-booking-field">
                      <label htmlFor="sn-preferred-date">Preferred Date</label>
                      <input id="sn-preferred-date" name="preferred_date" type="date" value={formData.preferred_date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="sn-booking-field">
                      <label htmlFor="sn-message">Additional Message</label>
                      <input id="sn-message" name="message" type="text" value={formData.message} onChange={handleChange} placeholder="Any other details" />
                    </div>
                  </div>

                  {error && <div className="sn-booking-alert sn-booking-alert--error">{error}</div>}

                  <button type="submit" className="sn-booking-submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Booking Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookService;
