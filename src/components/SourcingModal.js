import React, { useEffect, useRef, useState } from 'react';
import { FiCheck, FiX, FiArrowRight } from 'react-icons/fi';
import './SourcingModal.css';

const SourcingModal = ({ isOpen, onClose, onRequest }) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeBtnRef = useRef(null);
  const modalRef = useRef(null);
  const prevOverflow = useRef('');
  const hideTimer = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      prevOverflow.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });

      const focusTimer = setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);

      return () => {
        clearTimeout(focusTimer);
        document.body.style.overflow = prevOverflow.current || '';
      };
    }

    setVisible(false);
    hideTimer.current = setTimeout(() => {
      setMounted(false);
    }, 350);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableSelector =
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

    const getFocusable = () =>
      Array.from(modal.querySelectorAll(focusableSelector)).filter(
        (el) => !el.disabled && el.getAttribute('aria-hidden') !== 'true'
      );

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!mounted && !isOpen) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePrimary = () => {
    if (onRequest) {
      onRequest();
    } else {
      onClose();
    }
  };

  const products = [
    'Laptop',
    'Desktop',
    'Graphics Card',
    'SSD',
    'RAM',
    'Processor',
    'Motherboard',
    'Printer',
    'CCTV',
    'Router',
    'NAS',
    'Server',
    'Accessories',
    'Bulk Orders'
  ];

  const benefits = [
    'Genuine Products',
    'Best Market Pricing',
    'Warranty Support',
    'Fast Procurement',
    'Trusted Distributor Network',
    'Doorstep Delivery'
  ];

  return (
    <div
      className={`sourcing-overlay ${visible ? 'sourcing-overlay--open' : ''}`}
      onClick={handleBackdrop}
      aria-hidden={!isOpen}
    >
      <div
        ref={modalRef}
        className={`sourcing-modal ${visible ? 'sourcing-modal--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sourcing-modal-title"
        aria-describedby="sourcing-modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          className="sourcing-modal__close"
          onClick={onClose}
          aria-label="Close sourcing service popup"
          type="button"
        >
          <FiX />
        </button>

        <div className="sourcing-modal__content">
          <span className="sourcing-modal__badge">
            <svg
              className="sourcing-modal__badge-icon"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="#e85d04"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            RITCHIESTREET SOURCING SERVICE
          </span>

          <h2 id="sourcing-modal-title" className="sourcing-modal__title">
            Looking for a Product That's Not Listed?
          </h2>
          <p className="sourcing-modal__subtitle">
            We'll Find It For You.
          </p>

          <p id="sourcing-modal-desc" className="sourcing-modal__desc">
            At Ritchiestreet, you're not limited to the products displayed on our website.
            Using our trusted distributor network, we can source thousands of genuine IT and electronics products at highly competitive prices.
          </p>

          <p className="sourcing-modal__desc">
            Whether you're looking for
          </p>
          <ul className="sourcing-modal__product-list">
            {products.map((product) => (
              <li key={product} className="sourcing-modal__product-item">
                <span className="sourcing-modal__dot" aria-hidden="true" />
                {product}
              </li>
            ))}
          </ul>
          <p className="sourcing-modal__desc">
            our sourcing specialists will help you find the right product quickly.
          </p>

          <div className="sourcing-modal__benefits">
            <h3 className="sourcing-modal__benefits-title">Why Choose Us?</h3>
            <ul className="sourcing-modal__benefits-list">
              {benefits.map((benefit) => (
                <li key={benefit} className="sourcing-modal__benefit">
                  <span className="sourcing-modal__check" aria-hidden="true">
                    <FiCheck />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="sourcing-modal__trust">
            <p className="sourcing-modal__trust-text">
              We usually respond with pricing and availability within 24 hours.
            </p>
          </div>

          <div className="sourcing-modal__actions">
            <button
              className="sourcing-modal__btn sourcing-modal__btn--primary"
              onClick={handlePrimary}
              type="button"
            >
              Continue to Product Request
              <FiArrowRight className="sourcing-modal__btn-icon" />
            </button>
            <button
              className="sourcing-modal__btn sourcing-modal__btn--secondary"
              onClick={onClose}
              type="button"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourcingModal;
