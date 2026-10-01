import { useEffect } from 'react';

const Seo = ({ title, description }) => {
  useEffect(() => {
    // Page title
    document.title = title;

    // Meta description
    let meta = document.querySelector('meta[name="description"]');

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }

    meta.content = description;

    // Canonical URL
    const canonicalUrl =
      `https://ritchiestreet.co.in${window.location.pathname}`;

    let canonical = document.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    canonical.href = canonicalUrl;
  }, [title, description]);

  return null;
};

export default Seo;