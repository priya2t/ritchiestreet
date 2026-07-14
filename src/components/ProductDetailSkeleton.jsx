import React from 'react';

const ProductDetailSkeleton = () => {
  return (
    <div className="pd-content-skeleton">
      <div className="pd-container">
        <nav className="pd-breadcrumb pd-skeleton-breadcrumb">
          <span className="pd-skeleton-text">Loading...</span>
        </nav>

        <div className="pd-gallery">
          <div className="pd-main-image-wrapper">
            <div className="pd-image-placeholder pd-skeleton-image" aria-hidden="true" />
          </div>
          <div className="pd-thumbnails pd-skeleton-thumbnails">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="pd-skeleton-thumb" aria-hidden="true" />
            ))}
          </div>
        </div>

        <div className="pd-info">
          <div className="pd-skeleton-title" aria-hidden="true" />
          <div className="pd-skeleton-rating" aria-hidden="true" />
          <div className="pd-skeleton-price" aria-hidden="true" />
          <div className="pd-skeleton-stock" aria-hidden="true" />
          <div className="pd-skeleton-short-desc" aria-hidden="true" />
          <div className="pd-skeleton-quantity" aria-hidden="true" />
          <div className="pd-skeleton-actions" aria-hidden="true" />
          <div className="pd-skeleton-trust" aria-hidden="true" />
        </div>
      </div>

      <div className="pd-description-section">
        <h2 className="pd-section-title pd-skeleton-section-title">Product Description</h2>
        <div className="pd-skeleton-paragraph" aria-hidden="true">
          <div className="pd-skeleton-line" />
          <div className="pd-skeleton-line" />
          <div className="pd-skeleton-line" />
          <div className="pd-skeleton-line" />
          <div className="pd-skeleton-line" />
        </div>
      </div>

      <div className="pd-reviews-section">
        <h2 className="pd-section-title pd-skeleton-section-title">Customer Reviews</h2>
        <div className="pd-reviews-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="pd-review-card pd-skeleton-review" aria-hidden="true">
              <div className="pd-review-header">
                <div className="pd-skeleton-avatar" />
                <div className="pd-skeleton-name" />
              </div>
              <div className="pd-skeleton-rating" />
              <div className="pd-skeleton-body" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
