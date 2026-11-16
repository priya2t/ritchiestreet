import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import Layout from '../api/Layout';
import { getServicePaymentInfo, submitEngineerRegistration } from '../api/ServiceNetwork';
import { submitPaymentDetails } from '../api/sn-engineer';
import './EngineerRegistration.css';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  pincode: '',
  experience_years: '',
  specialization: '',
  id_proof_number: ''
};

const specializations = [
  'Laptop / Desktop Repair',
  'Mobile Repair',
  'Printer Repair',
  'CCTV Installation & Repair',
  'TV Repair',
  'Networking',
  'Data Recovery',
  'General Electronics'
];

const experienceOptions = [
  'Less than 1 year',
  '1 - 2 years',
  '3 - 5 years',
  '6 - 10 years',
  'More than 10 years'
];

const EngineerRegistration = () => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [payUtr, setPayUtr] = useState('');
  const [payShot, setPayShot] = useState(null);
  const [payMsg, setPayMsg] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payDone, setPayDone] = useState(false);

  useEffect(() => {
    getServicePaymentInfo().then((data) => {
      if (data && data.success) {
        setPaymentInfo(data);
      }
    });
  }, []);

  // Generate the QR code once registration succeeds.
  useEffect(() => {
    if (!registration) return;

    const payload = [
      'Ritchie Street - Service Engineer Registration',
      `Reference: ${registration.reference}`,
      `Fee: ${registration.currency || 'INR'} ${registration.registration_fee}`,
      `Payee: ${paymentInfo?.payee_name || 'Ritchie Street'}`,
      'Note: Service Engineer Registration Fee'
    ].join(' | ');

    QRCode.toDataURL(payload, { width: 440, margin: 1 })
      .then(setQrDataUrl)
      .catch((err) => console.error('QR generation failed:', err));
  }, [registration, paymentInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const normalizePhone = (phone) => {
    let digits = phone.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    return digits;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!/^[6-9]\d{9}$/.test(normalizePhone(formData.phone))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'A valid email address is required';
    }
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (formData.pincode.trim() && !/^[1-9]\d{5}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must be a valid 6-digit number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await submitEngineerRegistration({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode.trim()
      });
      if (res.success) {
        setRegistration(res);
        setSubmittedEmail(formData.email.trim());
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

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPayMsg('');
    if (!payUtr.trim()) {
      setPayMsg('Please enter the UPI transaction ID (UTR).');
      return;
    }
    setPayLoading(true);
    try {
      let shot = null;
      if (payShot) shot = await fileToBase64(payShot);
      const res = await submitPaymentDetails({
        registrationId: registration.registration_id,
        email: submittedEmail,
        utr: payUtr.trim(),
        screenshotBase64: shot
      });
      if (res.success) {
        setPayDone(true);
        setPayMsg(res.message || 'Payment details submitted.');
      } else {
        setPayMsg(res.message || 'Submission failed.');
      }
    } catch (err) {
      setPayMsg(err.response?.data?.message || err.message || 'Submission failed.');
    } finally {
      setPayLoading(false);
    }
  };

  const feeAmount = registration?.registration_fee ?? paymentInfo?.fee ?? 0;
  const feeCurrency = registration?.currency || paymentInfo?.currency || 'INR';

  return (
    <Layout
      title="Service Engineer Registration - Ritchie Street"
      description="Join the Ritchie Street service network as a service engineer. Register online and complete the registration fee payment."
    >
      <div className="sn-engineer-page">
        <div className="sn-engineer-container">
          <div className="sn-engineer-hero">
            <h1>Service Engineer Registration</h1>
            <p>
              Join the Ritchie Street service network. Fill in your details below and
              complete the one-time registration fee to get listed as an authorized
              service engineer.
            </p>
          </div>

          <div className="sn-engineer-fee-banner">
            <span>One-time Registration Fee:</span>
            <strong>₹{Number(feeAmount).toLocaleString('en-IN')}</strong>
          </div>

          <div className="sn-engineer-card">
            {registration ? (
              <div className="sn-engineer-payment-panel">
                <h3>Registration Submitted</h3>
                <p className="sn-engineer-payment-sub">
                  Thank you! Your registration has been received.
                  Please scan the QR code below to pay the registration fee. Your payment
                  status will remain <strong>Pending</strong> until it is verified by our team.
                </p>

                {qrDataUrl && (
                  <div className="sn-engineer-qr-wrap">
                    <img src={qrDataUrl} alt="Registration fee payment QR code" />
                  </div>
                )}

                <div className="sn-engineer-payment-meta">
                  <span>Reference: <strong>{registration.reference}</strong></span>
                  <span className="sn-engineer-fee-amount">
                    {feeCurrency} {Number(feeAmount).toLocaleString('en-IN')}
                  </span>
                  <span className="sn-engineer-status-badge">
                    Payment Status: Pending Verification
                  </span>
                </div>

                <div className="sn-engineer-note">
                  After payment, our team will verify the transaction and activate your
                  engineer profile. Please keep your reference number
                  (<strong> {registration.reference} </strong>) handy for verification.
                  Do not share payment screenshots publicly.
                </div>

                <div className="sn-engineer-payment-form">
                  <h4>Submit Payment Details</h4>
                  {payDone ? (
                    <p className="sn-engineer-payment-done">
                      Payment details submitted successfully. Our team will verify and
                      approve your registration shortly.
                    </p>
                  ) : (
                    <form onSubmit={handlePaymentSubmit}>
                      <div className="sn-engineer-field">
                        <label htmlFor="sn-utr">UPI Transaction ID (UTR)</label>
                        <input
                          id="sn-utr"
                          type="text"
                          value={payUtr}
                          onChange={(e) => setPayUtr(e.target.value)}
                          placeholder="Enter UTR / transaction ID"
                        />
                      </div>
                      <div className="sn-engineer-field">
                        <label htmlFor="sn-shot">Payment Screenshot (optional)</label>
                        <input
                          id="sn-shot"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => setPayShot(e.target.files[0])}
                        />
                      </div>
                      {payMsg && <div className="sn-engineer-alert sn-engineer-alert--error">{payMsg}</div>}
                      <button type="submit" className="sn-engineer-submit" disabled={payLoading}>
                        {payLoading ? 'Submitting...' : 'Submit Payment Details'}
                      </button>
                    </form>
                  )}
                </div>

                <button
                  type="button"
                  className="sn-engineer-reset-btn"
                  onClick={() => { setRegistration(null); setQrDataUrl(''); }}
                >
                  Register Another Engineer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h2>Engineer Details</h2>
                <div className="sn-engineer-form-grid">
                  <div className="sn-engineer-field">
                    <label htmlFor="sn-eng-name">Full Name <span className="sn-engineer-required">*</span></label>
                    <input id="sn-eng-name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Your full name" />
                    {errors.name && <span className="sn-engineer-error-text">{errors.name}</span>}
                  </div>
                  <div className="sn-engineer-field">
                    <label htmlFor="sn-eng-phone">Phone <span className="sn-engineer-required">*</span></label>
                    <input id="sn-eng-phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" />
                    {errors.phone && <span className="sn-engineer-error-text">{errors.phone}</span>}
                  </div>
                  <div className="sn-engineer-field">
                    <label htmlFor="sn-eng-email">Email <span className="sn-engineer-required">*</span></label>
                    <input id="sn-eng-email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                    {errors.email && <span className="sn-engineer-error-text">{errors.email}</span>}
                  </div>
                  <div className="sn-engineer-field">
                    <label htmlFor="sn-eng-city">City <span className="sn-engineer-required">*</span></label>
                    <input id="sn-eng-city" name="city" type="text" value={formData.city} onChange={handleChange} placeholder="e.g. Chennai" />
                    {errors.city && <span className="sn-engineer-error-text">{errors.city}</span>}
                  </div>
                  <div className="sn-engineer-field">
                    <label htmlFor="sn-eng-pincode">Pincode</label>
                    <input id="sn-eng-pincode" name="pincode" type="text" inputMode="numeric" maxLength="6" value={formData.pincode} onChange={handleChange} placeholder="6-digit pincode" />
                    {errors.pincode && <span className="sn-engineer-error-text">{errors.pincode}</span>}
                  </div>
                  <div className="sn-engineer-field">
                    <label htmlFor="sn-eng-exp">Experience</label>
                    <select id="sn-eng-exp" name="experience_years" value={formData.experience_years} onChange={handleChange}>
                      <option value="">Select experience</option>
                      {experienceOptions.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sn-engineer-field">
                    <label htmlFor="sn-eng-spec">Specialization</label>
                    <select id="sn-eng-spec" name="specialization" value={formData.specialization} onChange={handleChange}>
                      <option value="">Select specialization</option>
                      {specializations.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sn-engineer-field sn-engineer-field--full">
                    <label htmlFor="sn-eng-address">Address</label>
                    <textarea id="sn-eng-address" name="address" value={formData.address} onChange={handleChange} placeholder="Your full address" />
                  </div>
                  <div className="sn-engineer-field sn-engineer-field--full">
                    <label htmlFor="sn-eng-id">ID Proof Number (Aadhaar / License / Other)</label>
                    <input id="sn-eng-id" name="id_proof_number" type="text" value={formData.id_proof_number} onChange={handleChange} placeholder="Enter ID proof number" />
                  </div>
                </div>

                {error && <div className="sn-engineer-alert sn-engineer-alert--error">{error}</div>}

                <button type="submit" className="sn-engineer-submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EngineerRegistration;
