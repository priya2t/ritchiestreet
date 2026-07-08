import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from './woocommerce';
import { useCartStore } from './cartStore';
import Layout from './Layout';
import { asset } from './siteConfig';
import ProductCard from '../components/ProductCard';
import ProductTicker from '../components/ProductTicker';
import CategoriesSection from '../components/CategoriesSection';
import BrandLogos from '../components/BrandLogos';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { addToCart, openCart } = useCartStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const banners = [
    { image: '/images/slider.webp', alt: 'Ritchie Street Shopping banner', link: null },
    { image: '/images/services.webp', alt: 'Services banner', link: '/services' },
    { image: '/images/contactBanner.webp', alt: 'Other Enquiries banner', link: '/contact' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPaused, banners.length]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: (parseFloat(product.prices.price || 0) / 100),
      images: product.images,
      prices: product.prices
    };
    addToCart(productToAdd);
    openCart();
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const filteredProducts = products.filter(product => {
    const categoryName = product.categories && product.categories.length > 0 
      ? product.categories[0].name 
      : '';
    
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Laptop') return categoryName.includes('Laptop');
    if (activeCategory === 'Gaming') return categoryName.includes('Gaming');
    if (activeCategory === 'Desktop') return categoryName.includes('Desktop');
    if (activeCategory === 'iPad') return categoryName.includes('iPad') || categoryName.includes('Tablet');
    if (activeCategory === 'CCTV') return categoryName.includes('CCTV');
    if (activeCategory === 'Computer Accessories') return categoryName.includes('Computer') || categoryName.includes('Accessory');
    if (activeCategory === 'Phone') return categoryName.includes('Phone') || categoryName.includes('Mobile');
    if (activeCategory === 'TV') return categoryName.includes('TV') || categoryName.includes('Television');
    if (activeCategory === 'Others') return true;
    return false;
  });

  return (
    <Layout title="Ritchie Street Best Online Electronics Hub" description="Shop electronics, computer accessories, services, CCTV, laptops and Chennai technology support from Ritchie Street.">
      <main className="home">
        {/* Hero Section - Premium Carousel + Right Panel */}
        <section className="hero-section">

          {/* Left: Slider */}
          <div className="hero-left">
            <div
              className="hero-carousel"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="hero-carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {banners.map((banner, index) => (
                  <div
                    key={index}
                    className={`hero-carousel-slide ${index === currentSlide ? 'active' : ''}`}
                  >
                    {loading ? (
                      <div className="hero-skeleton"></div>
                    ) : banner.link ? (
                      <Link to={banner.link} className="hero-slide-link">
                        <img
                          src={banner.image}
                          alt={banner.alt}
                          loading="lazy"
                        />
                      </Link>
                    ) : (
                      <img
                        src={banner.image}
                        alt={banner.alt}
                        loading="lazy"
                      />
                    )}
                  </div>
                ))}
              </div>

              <button className="hero-carousel-arrow hero-carousel-arrow-prev" onClick={goToPrevSlide}>‹</button>
              <button className="hero-carousel-arrow hero-carousel-arrow-next" onClick={goToNextSlide}>›</button>

              <div className="hero-carousel-dots">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    className={`hero-carousel-dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Live Business Panel */}
          <div className="hero-right">

            {/* Services Grid */}
            <div className="hrp-card hrp-services">
              <div className="hrp-card-title">Our Services</div>
              <div className="hrp-services-grid">
                <Link to="/services" className="hrp-service-item">
                  <span className="hrp-service-icon">
                    <img src="/images/laptop1.png" alt="Computer Repair" />
                  </span>
                  <span className="hrp-service-label">Computer<br/>Repair</span>
                </Link>
                <Link to="/services" className="hrp-service-item">
                  <span className="hrp-service-icon">
                    <img src="/images/tv.png" alt="TV Repair" />
                  </span>
                  <span className="hrp-service-label">Tv & Mobile<br/>Repair</span>
                </Link>
                <Link to="/services" className="hrp-service-item">
                  <span className="hrp-service-icon">
                    <img src="/images/printer.png" alt="Printer Repair" />
                  </span>
                  <span className="hrp-service-label">Printer<br/>Service</span>
                </Link>
                <Link to="/contact" className="hrp-service-item">
                  <span className="hrp-service-icon">
                    <img src="/images/globe.png" alt="Web Developement" />
                  </span>
                  <span className="hrp-service-label">Web<br/>Dev</span>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="hrp-card hrp-stats">
              <div className="hrp-stats-grid">
                <div className="hrp-stat-item">
                  <span className="hrp-stat-num">10+</span>
                  <span className="hrp-stat-label">Years Exp.</span>
                </div>
                <div className="hrp-stat-item">
                  <span className="hrp-stat-num">5K+</span>
                  <span className="hrp-stat-label">Customers</span>
                </div>
                <div className="hrp-stat-item">
                  <span className="hrp-stat-num">15K+</span>
                  <span className="hrp-stat-label">Repairs</span>
                </div>
                <div className="hrp-stat-item">
                  <span className="hrp-stat-num">⚡</span>
                  <span className="hrp-stat-label">Same Day</span>
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="hrp-card hrp-contact">
              <div className="hrp-card-title">Quick Contact</div>
              <div className="hrp-contact-row">
                <a href="tel:+919876543210" className="hrp-contact-btn hrp-contact-call">
                  <span>📞</span> Call Now
                </a>
                <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="hrp-contact-btn hrp-contact-wa">
                  <span>💬</span> WhatsApp
                </a>
                <a href="mailto:info@ritchiestreet.com" className="hrp-contact-btn hrp-contact-mail">
                  <span>📧</span> Email
                </a>
              </div>
              {/* Trust badges */}
              <div className="hrp-trust-row">
                <span className="hrp-trust-badge">✓ Genuine Parts</span>
                <span className="hrp-trust-badge">✓ Warranty</span>
                <span className="hrp-trust-badge">✓ Certified</span>
                <span className="hrp-trust-badge">✓ Affordable</span>
              </div>
            </div>

          </div>
        </section>

        {/* Categories Section */}
        <CategoriesSection />

        {/* Featured Products Section */}
        <section className="featured-products-section">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products" className="view-all-btn">View All</Link>
          </div>
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <ProductTicker products={products} />
          )}
        </section>

        {/* Trusted Brands Section */}
        <BrandLogos />

        {/* Why Choose Us Section */}
        <section className="service-features-section">
          <h2 className="service-features-title">Why Choose Us</h2>
          <div className="service-features-grid">
            <div className="service-feature-card">
              <div className="service-icon-wrapper shipping">
                <img src='/images/free_ship.png' alt="Free Shipping" />
              </div>
              <h3 className="service-feature-title">Free Shipping</h3>
              <p className="service-feature-desc">On all orders over ₹1000</p>
            </div>
            <div className="service-feature-card">
              <div className="service-icon-wrapper returns">
                <img src='/images/free_return.png' alt="Free Returns" />
              </div>
              <h3 className="service-feature-title">Free Returns</h3>
              <p className="service-feature-desc">Returns are free within 9 days</p>
            </div>
            <div className="service-feature-card">
              <div className="service-icon-wrapper payment">
                <img src='/images/lock_card.png' alt="Payment Secure" />
              </div>
              <h3 className="service-feature-title">Payment Secure</h3>
              <p className="service-feature-desc">Your payments are safe with us</p>
            </div>
            <div className="service-feature-card">
              <div className="service-icon-wrapper support">
                <img src="/images/static-icons-4.png" alt="Support 24/7" />
              </div>
              <h3 className="service-feature-title">Support 24/7</h3>
              <p className="service-feature-desc">Contact us 24 hours a day</p>
            </div>
          </div>
        </section>

        {/* Why Buy From Ritchie Street Section */}
        <section className="why-buy-section">
          <div className="section-header">
            <h2 className="section-title">Why Buy From Ritchie Street</h2>
          </div>
          <div className="why-buy-grid">
            <div className="why-buy-card">
              <div className="why-buy-icon">✓</div>
              <h3 className="why-buy-title">Genuine Products</h3>
              <p className="why-buy-desc">100% authentic products from authorized dealers</p>
            </div>
            <div className="why-buy-card">
              <div className="why-buy-icon">
                 <img src="/images/truck.png" alt="Quick Delivery"/>
              </div>
              <h3 className="why-buy-title">Fast Delivery</h3>
              <p className="why-buy-desc">Quick delivery across Chennai and beyond</p>
            </div>
            <div className="why-buy-card">
              <div className="why-buy-icon">
                 <img src="/images/support.png" alt="Customer Care Support" />
              </div>
              <h3 className="why-buy-title">Expert Support</h3>
              <p className="why-buy-desc">Professional technical support team</p>
            </div>
            <div className="why-buy-card">
              <div className="why-buy-icon">
                <img src="/images/security1.png" alt="Secure Payment" />
              </div>
              <h3 className="why-buy-title">Secure Payments</h3>
              <p className="why-buy-desc">Safe and secure payment options</p>
            </div>
          </div>
        </section>

      </main>
    </Layout>
  );
};

export default Home;
