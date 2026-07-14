import React from 'react';
import '../api/Home.css';

const BrandLogos = () => {
  const brands = [
    { name: 'Acer', img: '/images/acer.png' },
    { name: 'HP', img: '/images/hp.png' },
    { name: 'Dell', img: '/images/dell.png' },
    { name: 'Lenovo', img: '/images/lenova.png' },
    { name: 'Logitech', img: '/images/logi.png' },
    { name: 'Samsung', img: '/images/samsung.png' },
    { name: 'Asus', img: '/images/asus.png' },
    { name: 'Zebronics', img: '/images/zebronics.png' }
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
