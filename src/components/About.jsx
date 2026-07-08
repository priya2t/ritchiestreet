import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../api/Layout';

const useCountUp = (target, duration = 2000, startCounting = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, startCounting]);
  return count;
};

const About = () => {
  const navigate = useNavigate();
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  const customers = useCountUp(10000, 2000, statsVisible);
  const products = useCountUp(5000, 2000, statsVisible);
  const brands = useCountUp(50, 2000, statsVisible);
  const satisfaction = useCountUp(99, 2000, statsVisible);

  useEffect(() => {
    document.title = 'About Us - Ritchie Street Best Online Electronics Hub';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about Ritchie Street - your trusted partner for electronics, software development, and networking services in Chennai.');
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const featureCards = [
    { icon: '✅', title: 'Genuine Products', desc: '100% authentic products sourced directly from authorized distributors and top brands.' },
    { icon: '/images/money.png', title: 'Best Pricing', desc: 'Competitive prices on all electronics with regular deals, discounts, and offers.' },
    { icon: '/images/support.png', title: 'Expert Support', desc: 'Our trained team is available to assist you with any product or service query.' },
    { icon: '/images/truck.png', title: 'Fast Delivery', desc: 'Quick and reliable delivery across Chennai with real-time order tracking.' },
    { icon: '/images/security.png', title: 'Secure Shopping', desc: 'Shop safely with encrypted payments and a fully secure checkout experience.' },
    { icon: '/images/return.png', title: 'Easy Returns', desc: 'Hassle-free returns within 9 days. Customer satisfaction is our priority.' },
  ];

  const teamMembers = [
    { name: 'G. Kameshwaran', role: 'Founder & CEO', emoji: '/images/male.png', desc: 'A visionary professional with years of experience in electronics retail and tech services.' },
    { name: 'Core Team', role: 'Engineers & Developers', emoji: '/images/developer.png', desc: 'Network engineers, developers, and problem-solvers delivering exceptional tech.' },
    { name: 'Support Team', role: 'Customer Experience', emoji: '/images/icon-contact-nav.png', desc: 'Dedicated support agents available to ensure every customer gets the best experience.' },
  ];

  const trustBadges = [
    { icon: '✅', label: 'Genuine Products' },
    { icon: '🔐', label: 'Secure Payments' },
    { icon: '🚀', label: 'Fast Delivery' },
    { icon: '🤝', label: 'Trusted Sellers' },
    { icon: '🛡️', label: 'Warranty Support' },
  ];

  const cardHover = {
    onMouseEnter: (e) => {
      e.currentTarget.style.transform = 'translateY(-8px)';
      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'inherit' }}>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .about-hero-left { animation: fadeInLeft 0.8s ease forwards; }
        .about-hero-right { animation: fadeInRight 0.8s ease 0.2s forwards; opacity: 0; animation-fill-mode: forwards; }
        .about-fade-up { animation: fadeInUp 0.7s ease forwards; }
        .float-card { animation: float 4s ease-in-out infinite; }
        @media (max-width: 900px) {
          .about-hero-grid { flex-direction: column !important; }
          .about-story-grid { flex-direction: column !important; }
          .about-mission-grid { flex-direction: column !important; }
          .about-features-grid { grid-template-columns: 1fr 1fr !important; }
          .about-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .about-team-grid { flex-direction: column !important; align-items: center !important; }
          .about-trust-badges { flex-wrap: wrap !important; gap: 12px !important; }
          .about-cta-btns { flex-direction: column !important; align-items: center !important; }
        }
        @media (max-width: 600px) {
          .about-features-grid { grid-template-columns: 1fr !important; }
          .about-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .about-hero-title { font-size: 32px !important; }
        }
      `}</style>

      {/* ── HERO SECTION ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #111827 100%)',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 70% 50%, rgba(241,91,41,0.15) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />
        <div className="about-hero-grid" style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: '40px'
        }}>
          {/* Left */}
          <div className="about-hero-left" style={{ flex: 1 }}>
            <span style={{
              display: 'inline-block', background: 'rgba(241,91,41,0.2)',
              color: '#f15b29', padding: '6px 16px', borderRadius: '20px',
              fontSize: '13px', fontWeight: '700', letterSpacing: '1.5px',
              marginBottom: '20px', textTransform: 'uppercase'
            }}>
              About RitchieStreet
            </span>
            <h1 className="about-hero-title" style={{
              fontSize: '48px', fontWeight: '800', color: '#ffffff',
              lineHeight: '1.2', margin: '0 0 20px 0'
            }}>
              Chennai's Trusted<br />
              <span style={{ color: '#f15b29' }}>Electronics</span> Marketplace
            </h1>
            <p style={{
              fontSize: '18px', color: '#94a3b8', lineHeight: '1.7',
              margin: '0 0 36px 0', maxWidth: '500px'
            }}>
              Delivering genuine electronics, expert services, and exceptional customer support to Chennai and beyond.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/products')}
                style={{
                  padding: '14px 32px', backgroundColor: '#f15b29', color: '#fff',
                  border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f15b29'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f15b29'}
              >
                Explore Products
              </button>
              <button
                onClick={() => navigate('/contact')}
                style={{
                  padding: '14px 32px', backgroundColor: 'transparent', color: '#ffffff',
                  border: '2px solid rgba(255,255,255,0.3)', borderRadius: '10px',
                  fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f15b29'; e.currentTarget.style.color = '#f15b29'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff'; }}
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="about-hero-right" style={{ flex: 1, position: 'relative', minHeight: '380px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e293b, #334155)',
              borderRadius: '24px', overflow: 'hidden',
              height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
            }}>
              <img
                src="/images/about-us.webp"
                alt="Ritchie Street Electronics"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="font-size:80px;text-align:center">🏪</div>';
                }}
              />
            </div>
            {/* Floating trust badges */}
            {[
              { text: '✓ 100% Genuine', top: '10px', right: '-20px', delay: '0s' },
              { text: '✓ Trusted by Thousands', top: '90px', right: '-30px', delay: '1s' },
              { text: '✓ Fast Delivery', bottom: '90px', left: '-20px', delay: '2s' },
              { text: '✓ 24/7 Support', bottom: '10px', left: '-10px', delay: '0.5s' },
            ].map((badge, i) => (
              <div key={i} className="float-card" style={{
                position: 'absolute', top: badge.top, right: badge.right,
                bottom: badge.bottom, left: badge.left,
                backgroundColor: '#ffffff', borderRadius: '10px',
                padding: '10px 16px', fontSize: '13px', fontWeight: '600',
                color: '#111827', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap', animationDelay: badge.delay
              }}>
                {badge.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY SECTION ── */}
      <section style={{ padding: '36px 20px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{
              display: 'inline-block', background: '#fff7ed', color: '#f15b29',
              padding: '4px 14px', borderRadius: '20px', fontSize: '13px',
              fontWeight: '700', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase'
            }}>Our Story</span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0' }}>
              Built on Trust & Innovation
            </h2>
          </div>

          <div className="about-story-grid" style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{
                borderRadius: '20px', overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <img
                  src="/images/start_up.png"
                  alt="Our Story"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML='<div style="font-size:100px">🏬</div>'; }}
                />
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                {
                  icon: '/images/calendar.png', title: 'Who We Are',
                  text: "We're a passionate team of tech enthusiasts who believe that great solutions start with simple ideas and strong partnerships. Founded by Mr. G. Kameshwaran, our startup is built on innovation, trust, and a commitment to delivering results that make a real difference."
                },
                {
                  icon: '/images/gear.png', title: 'What We Do',
                  text: "We specialize in genuine electronics retail, custom software development, and networking services for businesses. Whether you need the latest gadgets, IT support, or reliable networking infrastructure — we're your one-stop tech destination."
                }
              ].map((item, i) => (
                <div key={i} style={{
                  backgroundColor: '#ffffff', borderRadius: '16px',
                  padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                  borderLeft: '4px solid #f15b29', transition: 'all 0.3s ease'
                }}
                  {...cardHover}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{
                      fontSize: '28px', width: '48px', height: '48px',
                      background: '#fff7ed', borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {typeof item.icon === 'string' && (item.icon.startsWith('/') || item.icon.includes('.'))
                        ? <img src={item.icon} alt={item.title} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                        : item.icon}
                    </span>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>{item.title}</h3>
                  </div>
                  <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.7', margin: 0 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section style={{ padding: '36px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{
              display: 'inline-block', background: '#fff7ed', color: '#f15b29',
              padding: '4px 14px', borderRadius: '20px', fontSize: '13px',
              fontWeight: '700', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase'
            }}>Why Choose Us</span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>
              The RitchieStreet Advantage
            </h2>
            <p style={{ fontSize: '17px', color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>
              We go beyond selling products — we deliver complete tech experiences.
            </p>
          </div>

          <div className="about-features-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px'
          }}>
            {featureCards.map((card, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff', borderRadius: '16px',
                padding: '20px 18px', textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #f1f5f9', transition: 'all 0.3s ease', cursor: 'default'
              }}
                {...cardHover}
              >
                <div style={{
                  fontSize: '28px', width: '56px', height: '56px',
                  background: 'linear-gradient(135deg, #fff7ed, #ffe4cc)',
                  borderRadius: '14px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 14px auto'
                }}>
                  {typeof card.icon === 'string' && (card.icon.startsWith('/') || card.icon.includes('.'))
                    ? <img src={card.icon} alt={card.title} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    : card.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 10px 0' }}>{card.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section style={{
        padding: '36px 20px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 30% 50%, rgba(241,91,41,0.1) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{
              display: 'inline-block', background: 'rgba(241,91,41,0.2)',
              color: '#f15b29', padding: '4px 14px', borderRadius: '20px',
              fontSize: '13px', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase'
            }}>Our Direction</span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
              Mission & Vision
            </h2>
          </div>

          <div className="about-mission-grid" style={{ display: 'flex', gap: '32px' }}>
            {[
              {
                icon: '/images/target.png', label: 'Our Mission', color: '#f15b29',
                text: 'To empower customers with affordable, genuine, and reliable electronics — and build long-term relationships based on trust, transparency, and results. We are committed to making technology accessible to everyone in Chennai and beyond.'
              },
              {
                icon: '/images/telescope.png', label: 'Our Vision', color: '#2563eb',
                text: 'To be the most trusted electronics destination in South India — a go-to marketplace where customers find quality-driven products and expert services without compromise, backed by a team that truly cares.'
              }
            ].map((item, i) => (
              <div key={i} style={{
                flex: 1, backgroundColor: 'rgba(255,255,255,0.07)',
                borderRadius: '16px', padding: '24px 24px',
                border: `1px solid ${item.color}33`, transition: 'all 0.3s ease'
              }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
              >
                <div style={{
                  fontSize: '40px', width: '72px', height: '72px',
                  background: `${item.color}22`, borderRadius: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '24px', border: `2px solid ${item.color}44`
                }}>
                  {typeof item.icon === 'string' && (item.icon.startsWith('/') || item.icon.includes('.'))
                    ? <img src={item.icon} alt={item.label} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    : item.icon}
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: item.color, margin: '0 0 16px 0' }}>{item.label}</h3>
                <p style={{ fontSize: '16px', color: '#cbd5e1', lineHeight: '1.8', margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATISTICS ── */}
      <section ref={statsRef} style={{ padding: '36px 20px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{
              display: 'inline-block', background: '#fff7ed', color: '#f15b29',
              padding: '4px 14px', borderRadius: '20px', fontSize: '13px',
              fontWeight: '700', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase'
            }}>Our Numbers</span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0 }}>
              Trusted by Thousands
            </h2>
          </div>

          <div className="about-stats-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px'
          }}>
            {[
              { value: customers, suffix: 'K+', label: 'Happy Customers', icon: '/images/smile.png', color: '#f15b29' },
              { value: Math.floor(products / 1000), suffix: 'K+', label: 'Products Available', icon: '/images/parcel.png', color: '#2563eb' },
              { value: brands, suffix: '+', label: 'Top Brands', icon: '/images/trophy.png', color: '#16a34a' },
              { value: satisfaction, suffix: '%', label: 'Customer Satisfaction', icon: '/images/star.png', color: '#f15b29' },
            ].map((stat, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff', borderRadius: '16px',
                padding: '20px 18px', textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #f1f5f9', transition: 'all 0.3s ease'
              }}
                {...cardHover}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                  {typeof stat.icon === 'string' && (stat.icon.startsWith('/') || stat.icon.includes('.'))
                    ? <img src={stat.icon} alt={stat.label} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    : stat.icon}
                </div>
                <div style={{ fontSize: '44px', fontWeight: '800', color: stat.color, lineHeight: 1 }}>
                  {stat.value}{stat.suffix}
                </div>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0 0 0', fontWeight: '500' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEET THE TEAM ── */}
      <section style={{ padding: '36px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{
              display: 'inline-block', background: '#fff7ed', color: '#f15b29',
              padding: '4px 14px', borderRadius: '20px', fontSize: '13px',
              fontWeight: '700', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase'
            }}>People Behind Us</span>
            <h2 style={{ fontSize: '40px', fontWeight: '800', color: '#111827', margin: '0 0 12px 0' }}>Meet the Team</h2>
            <p style={{ fontSize: '17px', color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>
              Developers, engineers, and support specialists — united by one goal.
            </p>
          </div>

          <div className="about-team-grid" style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {teamMembers.map((member, i) => (
              <div key={i} style={{
                backgroundColor: '#f8fafc', borderRadius: '16px', padding: '24px 20px',
                textAlign: 'center', width: '280px', flexShrink: 0,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #f1f5f9', transition: 'all 0.3s ease'
              }}
                {...cardHover}
              >
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f15b29, #f15b29)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '36px', margin: '0 auto 20px auto',
                  boxShadow: '0 8px 24px rgba(241,91,41,0.3)'
                }}>
                  {typeof member.emoji === 'string' && (member.emoji.startsWith('/') || member.emoji.includes('.'))
                    ? <img src={member.emoji} alt={member.name} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '50%' }} />
                    : member.emoji}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>{member.name}</h3>
                <p style={{
                  fontSize: '13px', color: '#f15b29', fontWeight: '600',
                  margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>{member.role}</p>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION ── */}
      <section style={{ padding: '32px 20px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 12px 0' }}>
            Why Customers Trust RitchieStreet
          </h2>
          <p style={{ fontSize: '16px', color: '#64748b', margin: '0 0 40px 0' }}>
            We've earned trust through consistent quality, transparency, and care.
          </p>
          <div className="about-trust-badges" style={{
            display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap'
          }}>
            {trustBadges.map((badge, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff', borderRadius: '50px',
                padding: '14px 28px', display: 'flex', alignItems: 'center', gap: '10px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
                fontSize: '15px', fontWeight: '600', color: '#111827', transition: 'all 0.3s ease'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f15b29'; e.currentTarget.style.color = '#f15b29'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#111827'; }}
              >
                <span style={{ fontSize: '20px' }}>{badge.icon}</span>
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)',
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(241,91,41,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '44px', fontWeight: '800', color: '#ffffff', margin: '0 0 16px 0' }}>
            Ready to Shop with <span style={{ color: '#f15b29' }}>Confidence?</span>
          </h2>
          <p style={{ fontSize: '18px', color: '#94a3b8', margin: '0 0 40px 0' }}>
            Explore thousands of genuine products with the best prices in Chennai.
          </p>
          <div className="about-cta-btns" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/products')}
              style={{
                padding: '16px 40px', backgroundColor: '#f15b29', color: '#fff',
                border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(241,91,41,0.4)'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f15b29'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f15b29'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Browse Products
            </button>
            <button
              onClick={() => navigate('/contact')}
              style={{
                padding: '16px 40px', backgroundColor: 'transparent', color: '#ffffff',
                border: '2px solid rgba(255,255,255,0.3)', borderRadius: '12px',
                fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#f15b29'; e.currentTarget.style.color = '#f15b29'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff'; }}
            >
              Contact Our Team
            </button>
          </div>
        </div>
      </section>

      </div>
  );
};

export default About;
