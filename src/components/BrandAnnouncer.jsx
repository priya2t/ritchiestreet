import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMousePointer } from 'react-icons/fi';
import './BrandAnnouncer.css';

const ALLOWED_PATHS = ['/', '/about', '/services', '/contact', '/terms'];

const PAGE_MAP = {
  home: '/',
  about: '/about',
  services: '/services',
  contact: '/contact',
  terms: '/terms',
};

const normalizePath = (value) => {
  if (!value) return null;
  const normalized = value.startsWith('/') ? value : PAGE_MAP[value.toLowerCase()];
  if (!normalized) return null;
  return normalized.replace(/\/$/, '') || '/';
};

const Bubble = () => (
  <span className="ba__bubble" aria-hidden="true">
    <span className="ba__bubble-main">வாருங்கள்!</span>
    <span className="ba__bubble-sub">Find My Product</span>
    <span className="ba__bubble-shine" aria-hidden="true" />
  </span>
);

const Waves = ({ className }) => (
  <span className={`ba__waves ${className}`} aria-hidden="true">
    <span className="ba__wave ba__wave--1" />
    <span className="ba__wave ba__wave--2" />
    <span className="ba__wave ba__wave--3" />
  </span>
);

const Cursor = ({ variant = 'hero' }) => (
  <span className={`ba__cursor ba__cursor--${variant}`} aria-hidden="true">
    <span className="ba__cursor-hand">
      <FiMousePointer size="100%" />
    </span>
    <span className="ba__cursor-ripple" />
    <span className="ba__cursor-hint">
      <span className="ba__cursor-hint-inner">
        <span className="ba__cursor-hint-emoji">👆</span>
        <span>Click Me</span>
      </span>
    </span>
  </span>
);

const BrandAnnouncer = ({
  show = true,
  page,
  size = 'lg',
  animate = true,
  position = 'bottom-right',
}) => {
  const location = useLocation();
  const [phase, setPhase] = useState('idle');
  const [prefersReduced, setPrefersReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const currentPath = normalizePath(page) || normalizePath(location.pathname);
  const isAllowed = ALLOWED_PATHS.includes(currentPath);

  useEffect(() => {
    if (!show || !isAllowed) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReduced(mq.matches);
    handleChange();

    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [show, isAllowed]);

  useLayoutEffect(() => {
    if (isAllowed) setPhase('idle');
  }, [currentPath, isAllowed]);

  useEffect(() => {
    if (!show || !isAllowed) return;

    if (!animate || prefersReduced) {
      setPhase('rest');
      return;
    }

    setPhase('idle');
    const timers = [
      setTimeout(() => setPhase('intro'), 500),
      setTimeout(() => setPhase('playing'), 1400),
      setTimeout(() => setPhase('rest'), 4800),
    ];

    return () => timers.forEach(clearTimeout);
  }, [show, isAllowed, animate, prefersReduced, currentPath]);

  if (!show || !isAllowed) return null;

  const className = [
    'ba',
    `ba--phase-${phase}`,
    `ba--size-${size}`,
    `ba--position-${position}`,
    prefersReduced || !animate ? 'ba--reduced' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} role="banner" aria-label="RitchieStreet Product Finder">
      <Link
        to="/contact#product-finder-form"
        className="ba__link"
        aria-label="Find a product - go to Product Finder enquiry form"
      >
        <span className="ba__hero" aria-hidden={phase === 'rest'}>
          <span className="ba__hero-figure">
            <img
              src="/images/murasu_man.webp"
              alt="RitchieStreet Murasu Announcer"
              className="ba__hero-img"
              width="280"
              height="280"
              loading="eager"
            />
            <Cursor variant="hero" />
          </span>
          <span className="ba__drum" aria-hidden="true" />
          <Waves className="ba__hero-waves" />
          <span className="ba__call" aria-hidden="true">
            வாருங்கள்!
          </span>
        </span>

        <span className="ba__widget" aria-hidden={phase !== 'rest'}>
          <span className="ba__widget-mascot">
            <img
              src="/images/murasu_man.webp"
              alt=""
              className="ba__widget-img"
              width="72"
              height="72"
              loading="eager"
            />
            <Waves className="ba__widget-waves" />
          </span>
          <Bubble />
          <Cursor variant="widget" />
        </span>
      </Link>
    </div>
  );
};

export default BrandAnnouncer;
