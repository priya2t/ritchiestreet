import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from './woocommerce';
import Layout from './Layout';
import { FaShippingFast, FaUndo, FaMoneyBillWave, FaHeadset, FaAward, FaTruck, FaTools, FaLock, FaPhone, FaWhatsapp } from 'react-icons/fa';
import './Home.css';

const CategoriesSection = React.lazy(() => import('../components/CategoriesSection'));
const ProductTicker = React.lazy(() => import('../components/ProductTicker'));
const BrandLogos = React.lazy(() => import('../components/BrandLogos'));

const BenefitCard = React.memo(({ icon: Icon, title, desc, accent }) => (
  <article className={`premium-card premium-card--${accent}`} aria-label={title}>
    <div className="premium-card__badge" aria-hidden="true">
      <Icon />
    </div>
    <h3 className="premium-card__title">{title}</h3>
    <p className="premium-card__desc">{desc}</p>
  </article>
));

const whyChooseData = [
  { icon: FaShippingFast, title: 'Free Shipping', desc: 'Fast & reliable delivery on all orders above Rs 1000.', accent: 'blue' },
  { icon: FaUndo, title: 'Easy Replacements', desc: 'Hassle-free replacements within 7 days.', accent: 'green' },
  { icon: FaMoneyBillWave, title: 'Cash On Delivery', desc: 'Multiple safe payment options.', accent: 'purple' },
  { icon: FaHeadset, title: '24/7 Support', desc: 'Expert assistance whenever you need help.', accent: 'orange' },
];

const whyBuyData = [
  { icon: FaAward, title: 'Genuine Products', desc: '100% authentic products from authorized dealers.', accent: 'blue' },
  { icon: FaTruck, title: 'Fast Delivery', desc: 'Quick delivery across Chennai and nearby locations.', accent: 'orange' },
  { icon: FaTools, title: 'Expert Support', desc: 'Professional technical guidance before and after purchase.', accent: 'purple' },
  { icon: FaLock, title: 'Secure Shopping', desc: 'Trusted checkout with encrypted payment protection.', accent: 'green' },
];

const Home = ({ onPriceCompare }) => {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [promoSlide, setPromoSlide] = useState(0);
  const [isPromoPaused, setIsPromoPaused] = useState(false);
  const mainRef = useRef(null);
  const heroRef = useRef(null);

  const banners = useMemo(() => [
    { image: '/images/slider1A.webp', alt: 'Ritchie Street Shopping banner', link: null },
    { image: '/images/slider2A.webp', alt: 'Services banner', link: '/services' },
    { image: '/images/slider3A.webp', alt: 'Other Enquiries banner', link: '/contact' },
    { image: '/images/tally.webp', alt: 'Tally banner', link: null }
  ], []);

  const promoBanners = useMemo(() => [
    { image: '/images/coming_soon_banner.webp', alt: 'Products coming soon', link: null },
    { image: '/images/refurbished.webp', alt: 'Refurbished Products', link: '/category/refurbished' },
    { image: '/images/used.webp', alt: 'Used Products', link: '/category/used' },
    { image: '/images/rental.webp', alt: 'Rental Products', link: '/category/rental' }
  ], []);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const id = requestAnimationFrame(() => {
      main.classList.add('home-ready');
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPaused, banners]);

  useEffect(() => {
    if (!isPromoPaused) {
      const interval = setInterval(() => {
        setPromoSlide((prev) => (prev + 1) % promoBanners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPromoPaused, promoBanners]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      setProductsLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setProductsLoading(false);
    }
  };

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners]);

  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, [banners]);

  const goToPromoSlide = useCallback((index) => {
    setPromoSlide(index);
  }, []);

  const goToPrevPromoSlide = useCallback(() => {
    setPromoSlide((prev) => (prev - 1 + promoBanners.length) % promoBanners.length);
  }, [promoBanners]);

  const goToNextPromoSlide = useCallback(() => {
    setPromoSlide((prev) => (prev + 1) % promoBanners.length);
  }, [promoBanners]);

  return (
    <Layout title="Ritchie Street Best Online Electronics Hub" description="Shop electronics, computer accessories, services, CCTV, laptops and Chennai technology support from Ritchie Street.">
      <main ref={mainRef} className="home">
        {/* Hero Section - Premium Carousel + Right Panel */}
        <section ref={heroRef} className="hero-section">
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
                    {banner.link ? (
                      <Link to={banner.link} className="hero-slide-link">
                        <img
                          src={banner.image}
                          alt={banner.alt}
                          width="675"
                          height="360"
                          {...(index === 0
                            ? { fetchPriority: 'high', loading: 'eager', decoding: 'async' }
                            : { loading: 'lazy', decoding: 'async' })}
                        />
                      </Link>
                    ) : (
                      <img
                        src={banner.image}
                        alt={banner.alt}
                        width="675"
                        height="360"
                        {...(index === 0
                          ? { fetchPriority: 'high', decoding: 'async' }
                          : { loading: 'lazy', decoding: 'async' })}
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
                    <img src="/images/laptop1.webp" alt="Computer Repair" width="48" height="48" loading="lazy" decoding="async" />
                  </span>
                  <span className="hrp-service-label">Computer<br/>Repair</span>
                </Link>
                <Link to="/services" className="hrp-service-item">
                  <span className="hrp-service-icon">
                    <img src="/images/tv&mobile.webp" alt="TV Repair" width="48" height="48" loading="lazy" decoding="async" />
                  </span>
                  <span className="hrp-service-label">Tv & Mobile<br/>Repair</span>
                </Link>
                <Link to="/services" className="hrp-service-item">
                  <span className="hrp-service-icon">
                    <img src="/images/printer.webp" alt="Printer Repair" width="48" height="48" loading="lazy" decoding="async" />
                  </span>
                  <span className="hrp-service-label">Printer<br/>Service</span>
                </Link>
                <Link to="/contact" className="hrp-service-item">
                  <span className="hrp-service-icon">
                    <img src="/images/globe.webp" alt="Web Developement" width="48" height="48" loading="lazy" decoding="async" />
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
                <span className="hrp-trust-badge">Γ£ô Genuine Parts</span>
                <span className="hrp-trust-badge">Γ£ô Certified</span>
                <span className="hrp-trust-badge">Γ£ô Warranty</span>
                <span className="hrp-trust-badge">Γ£ô Same-Day Support</span>
              </div>*/}
            </div>

          </div>
        </section>

        {/* Coming Soon Banner - Promo Slider */}
        <div className="coming-soon-banner coming-soon-banner--home">
          <div
            className="promo-carousel"
            onMouseEnter={() => setIsPromoPaused(true)}
            onMouseLeave={() => setIsPromoPaused(false)}
          >
            <div className="promo-carousel-track" style={{ transform: `translateX(-${promoSlide * 100}%)` }}>
              {promoBanners.map((banner, index) => (
                <div
                  key={index}
                  className={`promo-carousel-slide ${index === promoSlide ? 'active' : ''}`}
                >
                  {banner.link ? (
                    <Link to={banner.link} className="promo-slide-link">
                      <img
                        src={banner.image}
                        alt={banner.alt}
                        width="1200"
                        height="300"
                        loading="lazy"
                        decoding="async"
                      />
                    </Link>
                  ) : (
                    <img
                      src={banner.image}
                      alt={banner.alt}
                      width="1200"
                      height="300"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
              ))}
            </div>

            <button className="promo-carousel-arrow promo-carousel-arrow-prev" onClick={goToPrevPromoSlide}>‹</button>
            <button className="promo-carousel-arrow promo-carousel-arrow-next" onClick={goToNextPromoSlide}>›</button>

            <div className="promo-carousel-dots">
              {promoBanners.map((_, index) => (
                <button
                  key={index}
                  className={`promo-carousel-dot ${index === promoSlide ? 'active' : ''}`}
                  onClick={() => goToPromoSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <Suspense fallback={<div />}>
          {/* Categories Section */}
          <CategoriesSection />

          {/* Featured Products Section */}
          <section className="featured-products-section">
            <div className="section-header">
              <h2 className="section-title">Featured Products</h2>
            </div>
            {productsLoading ? (
              <div className="loading">Loading products...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <ProductTicker products={products} onPriceCompare={onPriceCompare} />
            )}
          </section>

          {/* Trusted Brands Section */}
          <BrandLogos />
        </Suspense>

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
              {whyChooseData.map((item) => (
                <BenefitCard key={item.title} {...item} />
              ))}
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
              {whyBuyData.map((item) => (
                <BenefitCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </section>

      </main>
    </Layout>
  );
};

export default Home;
