import React from 'react';
import '../api/Home.css';

const BrandLogos = () => {
  const brands = [
    { name: 'Acer', img: '/images/acer.webp' },
    { name: 'HP', img: '/images/hp.webp' },
    { name: 'Dell', img: '/images/dell.webp' },
    { name: 'Lenovo', img: '/images/lenova.webp' },
    { name: 'Logitech', img: '/images/logi.webp' },
    { name: 'Samsung', img: '/images/samsung.webp' },
    { name: 'Asus', img: '/images/asus.webp' },
    { name: 'Zebronics', img: '/images/zebronics.webp' }
  ];

  // Duplicate brands for seamless infinite scrolling
  const duplicatedBrands = [...brands, ...brands];

  return (
    <section className="brands-section">
      <div className="brands-slider-container">
        <h2 className="brands-section-title">Trusted Brands</h2>
        <div className="premium-section__accent" aria-hidden="true"></div>
        <div className="brands-slider">
          {duplicatedBrands.map((brand, index) => (
            <div key={`${brand.name}-${index}`} className="brand-logo-card">
              <img src={brand.img} alt={brand.name} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandLogos;
