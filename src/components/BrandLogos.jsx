import React from 'react';
import '../api/Home.css';

const BrandLogos = () => {
  const brands = [
    { name: 'Acer', img: '/demo/acer.png' },
    { name: 'HP', img: '/demo/hp.png' },
    { name: 'Dell', img: '/demo/dell.png' },
    { name: 'Lenovo', img: '/demo/lenova.png' },
    { name: 'Logitech', img: '/demo/logi.png' },
    { name: 'Samsung', img: '/demo/samsung.png' },
    { name: 'Asus', img: '/demo/asus.png' },
    { name: 'Zebronics', img: '/demo/zebronics.png' }
  ];

  // Duplicate brands for seamless infinite scrolling
  const duplicatedBrands = [...brands, ...brands, ...brands];

  return (
    <section className="brands-section">
      <div className="brands-slider-container">
        <h2 className="brands-section-title">Trusted Brands</h2>
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
