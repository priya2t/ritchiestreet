import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts } from './woocommerce';
import { useCartStore } from './cartStore';
import Layout from './Layout';
import { asset } from './siteConfig';
import ProductCard from '../components/ProductCard';
import ProductTicker from '../components/ProductTicker';
import CategoriesSection from '../components/CategoriesSection';
import BrandLogos from '../components/BrandLogos';
import SourcingModal from '../components/SourcingModal';
import ProductSourcingSection from '../components/ProductSourcingSection';
import { FaShippingFast, FaUndo, FaMoneyBillWave, FaHeadset, FaAward, FaTruck, FaTools, FaLock, FaPhone, FaWhatsapp } from 'react-icons/fa';
import './Home.css';

const BenefitCard = ({ icon, title, desc, accent }) => (
  <article className={`premium-card premium-card--${accent}`} aria-label={title}>
    <div className="premium-card__badge" aria-hidden="true">
      {icon}
    </div>
    <h3 className="premium-card__title">{title}</h3>
    <p className="premium-card__desc">{desc}</p>
  </article>
);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { addToCart, openCart } = useCartStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSourcingOpen, setIsSourcingOpen] = useState(false);
  const navigate = useNavigate();
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
        <ProductSourcingSection onOpen={() => setIsSourcingOpen(true)} />

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
                    <img src="/images/laptop1.webp" alt="Computer Repair" />
                  </span>
                  <span className="hrp-service-label">Computer<br/>Repair</span>
                </Link>
                <Link to="/services" className="hrp-service-item">
                  <span className="hrp-service-icon">
                    <img src="/images/tv&mobile.webp" alt="TV Repair" />
                  </span>
                  <span className="hrp-service-label">Tv & Mobile<br/>Repair</span>
                </Link>
                <Link to="/services" className="hrp-service-item">
                  <span className="hrp-service-icon">
                    <img src="/images/printer.webp" alt="Printer Repair" />
                  </span>
                  <span className="hrp-service-label">Printer<br/>Service</span>
                </Link>
                <Link to="/contact" className="hrp-service-item">
                  <span className="hrp-service-icon">
                    <img src="/images/globe.webp" alt="Web Developement" />
                  </span>
                  <span className="hrp-service-label">Web<br/>Developement</span>
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
              <div className="hrp-card-title">Quick Assistance</div>
              {/*<p className="hrp-contact-subtitle">
                Need help choosing a product or booking a repair?<br />
                Our experts are ready to assist you.
              </p>*/}
              <div className="hrp-contact-row">
                <a href="tel:+919876543210" className="hrp-contact-btn hrp-contact-call">
                  <FaPhone /> Call Now
                </a>
                <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="hrp-contact-btn hrp-contact-wa">
                  <FaWhatsapp /> WhatsApp
                </a>
              </div>
              <p className="hrp-contact-email">
                Prefer email? <a href="mailto:info@ritchiestreet.co.in">info@ritchiestreet.co.in</a>
              </p>
              {/* Trust badges 
              <div className="hrp-trust-row">
                <span className="hrp-trust-badge">✓ Genuine Parts</span>
                <span className="hrp-trust-badge">✓ Certified</span>
                <span className="hrp-trust-badge">✓ Warranty</span>
                <span className="hrp-trust-badge">✓ Same-Day Support</span>
              </div>*/}
            </div>

          </div>
        </section>

        {/* Categories Section */}
        <CategoriesSection />

        {/* Featured Products Section */}
        <section className="featured-products-section">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            {/*<Link to="/products" className="view-all-btn">View All</Link>*/}
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
        <section className="premium-section" aria-labelledby="why-choose-title">
          <div className="premium-section__inner">
            <div className="premium-section__header">
              <h2 id="why-choose-title" className="premium-section__title">
                Why Choose Us
              </h2>
              <div className="premium-section__accent" aria-hidden="true"></div>
            </div>
            <div className="premium-section__grid">
              <BenefitCard
                icon={<FaShippingFast />}
                title="Free Shipping"
                desc="Fast & reliable delivery on all orders above ₹1000."
                accent="blue"
              />
              <BenefitCard
                icon={<FaUndo />}
                title="Easy Replacements"
                desc="Hassle-free replacements within 7 days."
                accent="green"
              />
              <BenefitCard
                icon={<FaMoneyBillWave />}
                title="Cash On Delivery"
                desc="Multiple safe payment options."
                accent="purple"
              />
              <BenefitCard
                icon={<FaHeadset />}
                title="24/7 Support"
                desc="Expert assistance whenever you need help."
                accent="orange"
              />
            </div>
          </div>
        </section>

        {/* Why Buy From Ritchie Street Section */}
        <section className="premium-section premium-section--decorated" aria-labelledby="why-buy-title">
          <div className="premium-section__inner">
            <div className="premium-section__header">
              <h2 id="why-buy-title" className="premium-section__title">
                Why Buy From Ritchie Street
              </h2>
              <div className="premium-section__accent" aria-hidden="true"></div>
            </div>
            <div className="premium-section__grid">
              <BenefitCard
                icon={<FaAward />}
                title="Genuine Products"
                desc="100% authentic products from authorized dealers."
                accent="blue"
              />
              <BenefitCard
                icon={<FaTruck />}
                title="Fast Delivery"
                desc="Quick delivery across Chennai and nearby locations."
                accent="orange"
              />
              <BenefitCard
                icon={<FaTools />}
                title="Expert Support"
                desc="Professional technical guidance before and after purchase."
                accent="purple"
              />
              <BenefitCard
                icon={<FaLock />}
                title="Secure Shopping"
                desc="Trusted checkout with encrypted payment protection."
                accent="green"
              />
            </div>
          </div>
        </section>

      </main>

      <SourcingModal
        isOpen={isSourcingOpen}
        onClose={() => setIsSourcingOpen(false)}
        onRequest={() => navigate('/contact')}
      />
    </Layout>
  );
};

export default Home;
