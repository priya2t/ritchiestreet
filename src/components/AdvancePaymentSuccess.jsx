import React from 'react';
import './AdvancePaymentSuccess.css';

/**
 * Green success card shown after the customer accepts the 50% advance payment.
 */
function AdvancePaymentSuccess({ title, message }) {
  return (
    <div
      className="advance-payment-success"
      role="status"
      aria-live="polite"
    >
      {title && <h3 className="advance-payment-success-title">{title}</h3>}
      {message && <p className="advance-payment-success-message">{message}</p>}
    </div>
  );
}

export default AdvancePaymentSuccess;
