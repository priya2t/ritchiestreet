import React, { useId } from 'react';
import './AdvancePaymentNotice.css';

/**
 * Advance Payment Acknowledgement notice.
 *
 * Renders a professional warning card when the cart grand total exceeds ₹10,000.
 * It is fully accessible (labelled checkbox, focus states, ARIA) and responsive.
 */
function AdvancePaymentNotice({
  acknowledged = false,
  onAcknowledge,
  message = '',
}) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const checkboxId = `${id}-checkbox`;

  return (
    <div
      className="advance-payment-notice"
      role="region"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {message && (
        <div className="advance-payment-redirect-banner" role="alert" aria-live="polite">
          {message}
        </div>
      )}

      <div className="advance-payment-header">
        <span className="advance-payment-icon" aria-hidden="true">⚠️</span>
        <strong id={titleId} className="advance-payment-title">
          Advance Payment Required
        </strong>
      </div>

      <p id={descriptionId} className="advance-payment-description">
        Your order exceeds <strong>₹10,000</strong>.
        <br />
        To confirm your order, a <strong>50% advance payment</strong> is required before we begin processing your order.
        Please acknowledge this policy before proceeding.
      </p>

      <label className="advance-payment-checkbox-label" htmlFor={checkboxId}>
        <input
          id={checkboxId}
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => onAcknowledge?.(e.target.checked)}
          aria-describedby={descriptionId}
        />
        <span className="advance-payment-checkbox-text">
          I understand and agree to the 50% advance payment requirement.
        </span>
      </label>
    </div>
  );
}

export default AdvancePaymentNotice;
