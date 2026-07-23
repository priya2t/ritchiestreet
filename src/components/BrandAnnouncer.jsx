import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
      setPhase('compact');
      return;
    }

    setPhase('idle');
    const timers = [
      setTimeout(() => setPhase('intro'), 500),
      setTimeout(() => setPhase('playing'), 1400),
      setTimeout(() => setPhase('compact'), 4800),
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
        <div className="ba__stage" aria-hidden={phase === 'compact'}>
          <img
            src="/images/murasu_man.webp"
            alt="RitchieStreet Murasu Announcer"
            className="ba__image"
            width="280"
            height="280"
            loading="eager"
          />
          <span className="ba__drum" aria-hidden="true" />
          <span className="ba__waves" aria-hidden="true">
            <span className="ba__wave ba__wave--1" />
            <span className="ba__wave ba__wave--2" />
            <span className="ba__wave ba__wave--3" />
          </span>
          <span className="ba__call" aria-hidden="true">
            வாருங்கள்!
          </span>
        </div>

        <span className="ba__compact" aria-hidden={phase !== 'compact'}>
          <img
            src="/images/murasu_man.webp"
            alt=""
            className="ba__compact-img"
            width="72"
            height="72"
            loading="eager"
          />
          <span className="ba__compact-dot" aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
};

export default BrandAnnouncer;
