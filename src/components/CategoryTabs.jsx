import React from 'react';

const CategoryTabs = ({ categories, activeCategory, onCategoryChange }) => {
  const tabs = ['All', 'Computer Accessories', 'Phone', 'TV', 'Others'];

  return (
    <div className="category-tabs-wrapper">
      <div className="category-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`category-tab ${activeCategory === tab ? 'active' : ''}`}
            onClick={() => onCategoryChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
