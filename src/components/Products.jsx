// src/components/Products.jsx
import React, { useState, useEffect } from 'react';
import { getProducts } from '../api/wordpress';
import './Products.css'; // We'll create this next

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const result = await getProducts();
            console.log('Products data:', result);
            setProducts(Array.isArray(result) ? result : []);
            setError(null);
        } catch (err) {
            setError('Failed to load products. Please check your API keys.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading products...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h3>Error Loading Products</h3>
                <p>{error}</p>
                <button onClick={loadProducts}>Try Again</button>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="no-products">
                <h3>No Products Found</h3>
                <p>Please add some products to your WooCommerce store.</p>
            </div>
        );
    }

    return (
        <div className="products-container">
            <h1 className="products-title">Our Products</h1>
            <div className="products-grid">
                {products.map(product => (
                    <div key={product.id} className="product-card">
                        {product.images && product.images.length > 0 && (
                            <div className="product-image">
                                <img 
                                    src={product.images[0].src} 
                                    alt={product.name}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                    }}
                                />
                                {product.sale_price && (
                                    <span className="sale-badge">SALE!</span>
                                )}
                            </div>
                        )}
                        <div className="product-info">
                            <h3 className="product-title">{product.name}</h3>
                            <div className="product-price">
                                {(() => {
                                    const prices = product.prices || {};
                                    const regularPrice = (parseFloat(prices.regular_price || 0) / 100) || 0;
                                    const salePrice = (parseFloat(prices.sale_price || 0) / 100) || 0;
                                    const currentPrice = (parseFloat(prices.price || 0) / 100) || 0;

                                    if (salePrice > 0 && salePrice < regularPrice) {
                                        return (
                                            <>
                                                <span className="original-price">₹{regularPrice.toFixed(2)}</span>
                                                <span className="sale-price">₹{salePrice.toFixed(2)}</span>
                                            </>
                                        );
                                    } else if (currentPrice > 0) {
                                        return <span className="price">₹{currentPrice.toFixed(2)}</span>;
                                    } else {
                                        return <span className="price">Price not available</span>;
                                    }
                                })()}
                            </div>
                            {product.short_description && (
                                <div className="product-description" 
                                     dangerouslySetInnerHTML={{ __html: product.short_description.substring(0, 100) + '...' }} 
                                />
                            )}
                            <button className="view-product-btn">
                                View Product
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Products;