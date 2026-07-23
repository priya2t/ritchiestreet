import React, { useEffect, useRef } from 'react';
import {
  LuSearch,
  LuBadgeCheck,
  LuDollarSign,
  LuUsers,
  LuClock,
  LuShieldCheck,
  LuTruck,
  LuArrowRight
} from 'react-icons/lu';
import './ProductSourcingSection.css';

const benefits = [
  { label: 'Genuine Products', icon: <LuBadgeCheck aria-hidden="true" /> },
  { label: 'Best Market Pricing', icon: <LuDollarSign aria-hidden="true" /> },
  { label: 'Trusted Distributor Network', icon: <LuUsers aria-hidden="true" /> },
  { label: 'Fast Procurement', icon: <LuClock aria-hidden="true" /> },
  { label: 'Warranty Support', icon: <LuShieldCheck aria-hidden="true" /> },
  { label: 'Doorstep Delivery Across India', icon: <LuTruck aria-hidden="true" /> }
];

const stats = [
  { value: '10,000+', label: 'Products Available' },
  { value: '24 Hours', label: 'Average Response' },
  { value: '100%', label: 'Genuine Products' }
];

const ProductSourcingSection = ({ onOpen }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      section.classList.add('rs-sourcing--animated');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('rs-sourcing--animated');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="rs-sourcing-section"
      aria-labelledby="rs-sourcing-title"
    >
      <div className="rs-sourcing__bg-shapes" aria-hidden="true">
        <span className="rs-sourcing__shape rs-sourcing__shape--1" />
        <span className="rs-sourcing__shape rs-sourcing__shape--2" />
        <span className="rs-sourcing__shape rs-sourcing__shape--3" />
      </div>

      <div className="rs-container rs-sourcing__container">
        <div className="rs-sourcing__grid">
          <div className="rs-sourcing__left">
            <span className="rs-sourcing__badge">
              EXCLUSIVE SOURCING SERVICE
            </span>

            <h2 id="rs-sourcing-title" className="rs-sourcing__title">
              RitchieStreet Product Finder
            </h2>

            <p className="rs-sourcing__subtitle">
              Looking for Something That's Not Listed?
              <br />
              <span className="rs-sourcing__subtitle-accent">We'll Source It For You.</span>
            </p>

            <p className="rs-sourcing__desc">
              Our online catalogue showcases only a portion of the products we can supply.
              Through our trusted distributor network, we source genuine laptops, desktops, graphics cards, networking equipment, printers, CCTV systems, servers, storage devices, accessories and many other IT products at competitive prices.
            </p>

            <ul className="rs-sourcing__benefits" aria-label="Sourcing benefits">
              {benefits.map((benefit) => (
                <li key={benefit.label} className="rs-sourcing__benefit">
                  <span className="rs-sourcing__benefit-icon" aria-hidden="true">
                    {benefit.icon}
                  </span>
                  <span className="rs-sourcing__benefit-label">{benefit.label}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="rs-sourcing__cta"
              onClick={onOpen}
              aria-haspopup="dialog"
            >
              <LuSearch className="rs-sourcing__cta-icon" aria-hidden="true" />
              Find My Product
              <LuArrowRight className="rs-sourcing__cta-arrow" aria-hidden="true" />
            </button>
          </div>

          <div className="rs-sourcing__right">
            <div className="rs-sourcing__stats-card">
              <p className="rs-sourcing__trust">
                <span className="rs-sourcing__trust-dot" aria-hidden="true" />
                Thousands of IT products are available beyond our online catalogue.
              </p>

              <div className="rs-sourcing__stats" aria-label="Sourcing service statistics">
                {stats.map((stat) => (
                  <div key={stat.label} className="rs-sourcing__stat">
                    <span className="rs-sourcing__stat-value">{stat.value}</span>
                    <span className="rs-sourcing__stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ProductSourcingSection;
