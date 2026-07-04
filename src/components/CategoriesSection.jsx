import React from 'react';
import { Link } from 'react-router-dom';
import './CategoriesSection.css';
import '../api/Home.css';

const CategoriesSection = () => {
  const categories = [
    { name: 'Laptop', image: '/laptop.png', slug: 'laptops' },
    { name: 'Gaming', image: '/gaming.png', slug: 'gamings' },
    { name: 'Desktop', image: '/desktop.png', slug: 'desktops' },
    { name: 'iPad', image: '/ipad.png', slug: 'ipads-tablets' },
    { name: 'CCTV', image: '/cctv.png', slug: 'cctvs' },
    { name: 'Other', image: '/other.png', slug: 'others' }
  ];

  return (
    <section className="categories-section-premium">
      <div className="section-header">
        <h2 className="section-title">Categories</h2>
      </div>
      <div className="categories-grid-premium">
        {categories.map((category) => (
          <Link 
            key={category.slug} 
            to={`/category/${category.slug}`} 
            className="category-card-premium"
          >
            <img
              className="category-img-fill"
              src={category.image}
              alt={category.name}
              loading="lazy"
            />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;
