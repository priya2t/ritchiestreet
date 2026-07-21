import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../api/Layout';

const sections = [
  {
    id: 1, icon: '/images/wavehand.webp', title: 'Introduction',
    content: [
      'Welcome to ritchiestreet.co.in. By using our website and services, you agree to comply with the following terms and conditions. Please read them carefully before proceeding with any transactions.'
    ]
  },
  {
    id: 2, icon: '/images/trophy.webp', title: 'Product Quality and Warranty',
    content: [
      'We take pride in offering high-quality products, including Computers, Laptops & Laptop Services, CCTV with installation, Home Automation, and computer-related cables.',
      'All products sold on our platform come with a manufacturer\'s warranty, the terms of which may vary. Warranty details are provided with each product listing.'
    ]
  },
  {
    id: 3, icon: '/images/cart.webp', title: 'Order Placement and Processing',
    content: [
      'When you place an order on our website, you are making an offer to purchase a product or service. We reserve the right to accept or decline this offer.',
      'Orders are processed promptly, and you will receive confirmation via email once your order is placed.'
    ]
  },
  {
    id: 4, icon: '/images/truck1.webp', title: 'Shipping and Delivery',
    content: [
      'We aim to deliver products within the specified delivery timeframe. However, delays may occur due to unforeseen circumstances. We are not liable for any such delays.',
      'Shipping costs are clearly stated during the checkout process.'
    ]
  },
  {
    id: 5, icon: '/images/return1.webp', title: 'Returns and Replacement Policy',
    content: [
      'If you receive a defective or damaged product, please contact our customer service team within two days of delivery to request a replacement.',
      'To be eligible for a replacement, the product must be in its original packaging and unused.',
      'We reserve the right to reject replacement requests that do not meet our eligibility criteria.'
    ]
  },
  {
    id: 6, icon: '/images/cross.webp', title: 'Cancellation Policy',
    content: [
      'You can cancel your order within 1 day of placing it, provided it has not been shipped. A cancellation fee may apply.'
    ]
  },
  {
    id: 7, icon: '/images/security1.webp', title: 'Privacy Policy',
    content: [
      'We are committed to protecting your privacy. Our Privacy Policy outlines how we collect, use, and safeguard your personal information.'
    ]
  },
  {
    id: 8, icon: '/images/justice.webp', title: 'Limitation of Liability',
    content: [
      'We shall not be held liable for any direct or indirect damages arising from the use of our website or products.'
    ]
  },
  {
    id: 9, icon: '/images/edit.webp', title: 'Changes to Terms and Conditions',
    content: [
      'We reserve the right to modify these terms and conditions at any time. Any changes will be posted on our website.'
    ]
  },
  {
    id: 10, icon: '/images/telephone.webp', title: 'Communication Policy',
    content: [
      'We communicate with our customers primarily through phone calls and official order confirmation emails. We do not send unsolicited SMS messages to customers.',
      'Our official address for communication and correspondence is "F1 Teknosolutionss, Mangadu Rd, Paraniputhur, Chennai, Tamil Nadu 600122".',
      'Please ensure that your contact information, including your phone number and email address, is accurate and up to date.'
    ]
  },
  {
    id: 11, icon: '/images/bulb.webp', title: 'Intellectual Property',
    content: [
      'All content, including text, images, logos, and trademarks displayed on ritchiestreet.co.in, are the property of F1techno, our parent company, and are protected by intellectual property laws. Any unauthorized use or reproduction is strictly prohibited.'
    ]
  },
  {
    id: 12, icon: '/images/male.webp', title: 'User Account',
    content: [
      'To access certain features and make purchases on our website, you may need to create a user account. You are responsible for maintaining the confidentiality of your account information and password.'
    ]
  },
  {
    id: 13, icon: '/images/block.webp', title: 'Prohibited Activities',
    content: [
      'You agree not to engage in any unlawful, fraudulent, or malicious activities on our website, including but not limited to hacking, data mining, and spamming.'
    ]
  },
  {
    id: 14, icon: '/images/link.webp', title: 'Third-Party Links',
    content: [
      'Our website may contain links to third-party websites. We are not responsible for the content or privacy practices of these websites.'
    ]
  },
  {
    id: 15, icon: '/images/chat.webp', title: 'Contact Information',
    content: [
      'If you have any questions, concerns, or inquiries regarding our terms and conditions, please contact our customer service team.'
    ],
    contacts: [
      { type: 'email', label: 'customerCare@ritchiestreet.co.in', href: 'mailto:customerCare@ritchiestreet.co.in' },
      { type: 'phone', label: '+91 86675 07040', href: 'tel:+91 86675 07040' }
    ]
  }
];

const Terms = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    document.title = 'Terms & Conditions - Ritchie Street Best Online Electronics Hub';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Read our Terms and Conditions including replacement policy, shipping, returns, and privacy policy for Ritchie Street electronics.');
    }
  }, []);

  const toggleSection = (id) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(`term-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .terms-section-card { animation: fadeInUp 0.5s ease forwards; }
        .terms-toc-link:hover { color: #f15b29 !important; background: #fff7ed !important; }
        .terms-section-card:hover { border-left-color: #f15b29 !important; box-shadow: 0 8px 32px rgba(241,91,41,0.1) !important; }
        .terms-contact-btn:hover { background: #f15b29 !important; color: #fff !important; transform: translateY(-2px); }
        @media (max-width: 900px) {
          .terms-layout { flex-direction: column !important; }
          .terms-toc { width: 100% !important; position: static !important; }
        }
      `}</style>

      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #111827 100%)',
        padding: '60px 20px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 80%, rgba(241,91,41,0.12) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-block', background: 'rgba(241,91,41,0.2)', color: '#f15b29',
            padding: '6px 18px', borderRadius: '20px', fontSize: '13px',
            fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px'
          }}>
            Legal
          </span>
          <h1 style={{
            fontSize: '44px', fontWeight: '800', color: '#ffffff',
            margin: '0 0 16px 0', lineHeight: '1.2'
          }}>
            Terms & <span style={{ color: '#f15b29' }}>Conditions</span>
          </h1>
          <p style={{ fontSize: '17px', color: '#94a3b8', margin: '0 0 24px 0', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
            Please read these terms carefully before using our website and services.
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.08)', borderRadius: '10px',
            padding: '10px 20px', fontSize: '13px', color: '#94a3b8'
          }}>
            📅 Last updated: June 2025 &nbsp;|&nbsp; 🔢 15 sections
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div style={{
        backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0',
        padding: '12px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '8px', fontSize: '14px', color: '#64748b' }}>
          <Link to="/" style={{ color: '#f15b29', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
          <span>›</span>
          <span style={{ color: '#111827', fontWeight: '500' }}>Terms & Conditions</span>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 60px 20px' }}>
        <div className="terms-layout" style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>

          {/* Table of Contents Sidebar */}
          <div className="terms-toc" style={{
            width: '280px', flexShrink: 0,
            position: 'sticky', top: '100px',
            backgroundColor: '#ffffff', borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            padding: '24px', border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '14px', fontWeight: '700', color: '#111827',
              textTransform: 'uppercase', letterSpacing: '1px',
              margin: '0 0 16px 0', paddingBottom: '12px',
              borderBottom: '2px solid #f15b29', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <img src='/images/edit.webp'/> Quick Navigation
            </h3>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sections.map(s => (
                <button
                  key={s.id}
                  className="terms-toc-link"
                  onClick={() => scrollToSection(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: '8px',
                    border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                    fontSize: '13px', fontWeight: activeSection === s.id ? '700' : '500',
                    color: activeSection === s.id ? '#f15b29' : '#64748b',
                    background: activeSection === s.id ? '#fff7ed' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{
                    minWidth: '22px', height: '22px', borderRadius: '6px',
                    background: activeSection === s.id ? '#f15b29' : '#f1f5f9',
                    color: activeSection === s.id ? '#fff' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '700'
                  }}>{s.id}</span>
                  {s.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Intro alert */}
            <div style={{
              backgroundColor: '#fff7ed', border: '1px solid #fed7aa',
              borderRadius: '16px', padding: '20px 24px',
              marginBottom: '32px', display: 'flex', alignItems: 'flex-start', gap: '14px'
            }}>
              <span style={{ fontSize: '24px', flexShrink: 0 }}><img src='/images/warning.webp'/></span>
              <div>
                <p style={{ fontSize: '14px', color: '#9a3412', margin: 0, lineHeight: '1.7' }}>
                  <strong>Important:</strong> By accessing and using <a href="https://ritchiestreet.co.in" style={{ color: '#f15b29' }}>ritchiestreet.co.in</a>, you confirm that you have read, understood, and agreed to be bound by these Terms and Conditions. If you disagree with any part, please discontinue use of our services.
                </p>
              </div>
            </div>

            {/* Terms Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  id={`term-${section.id}`}
                  className="terms-section-card"
                  style={{
                    backgroundColor: '#ffffff', borderRadius: '16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #e2e8f0',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    animationDelay: `${idx * 0.04}s`
                  }}
                >
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    style={{
                      width: '100%', padding: '20px 24px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left', gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                        background: 'linear-gradient(135deg, #fff7ed, #ffe4cc)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px'
                      }}>
                        <img src={section.icon} alt={section.title} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                      </div>
                      <div>
                        <span style={{
                          fontSize: '12px', fontWeight: '600', color: '#f15b29',
                          textTransform: 'uppercase', letterSpacing: '0.5px'
                        }}>
                          Section {section.id}
                        </span>
                        <h3 style={{
                          fontSize: '17px', fontWeight: '700', color: '#111827',
                          margin: '2px 0 0 0'
                        }}>
                          {section.title}
                        </h3>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '20px', color: '#94a3b8', flexShrink: 0,
                      transform: openSections[section.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }}>
                      ⌄
                    </span>
                  </button>

                  {/* Section Content */}
                  {openSections[section.id] !== false && (
                    <div style={{
                      padding: '0 24px 24px 24px',
                      borderTop: '1px solid #f1f5f9'
                    }}>
                      <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {section.content.map((para, i) => (
                          <p key={i} style={{
                            fontSize: '15px', color: '#475569', lineHeight: '1.8', margin: 0
                          }}>
                            {para}
                          </p>
                        ))}
                        {section.contacts && (
                          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                            {section.contacts.map((c, i) => (
                              <a
                                key={i}
                                href={c.href}
                                className="terms-contact-btn"
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                                  padding: '10px 20px', borderRadius: '8px',
                                  border: '1px solid #f15b29', color: '#f15b29',
                                  background: '#fff', fontWeight: '600', fontSize: '14px',
                                  textDecoration: 'none', transition: 'all 0.3s ease'
                                }}
                              >
                                {c.type === 'email' ? '✉️' : '📞'} {c.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer Agreement Box */}
            <div style={{
              marginTop: '40px', background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              borderRadius: '20px', padding: '40px 32px', textAlign: 'center',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(241,91,41,0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}><img src='/images/wavehand.webp' /></div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: '0 0 12px 0' }}>
                  You've Agreed to Our Terms
                </h3>
                <p style={{ fontSize: '15px', color: '#94a3b8', margin: '0 0 28px 0', lineHeight: '1.7', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
                  By continuing to use <a href="https://ritchiestreet.co.in" style={{ color: '#f15b29' }}>ritchiestreet.co.in</a>, you acknowledge that you have read, understood, and agreed to these Terms and Conditions. These constitute a legally binding agreement between you and us. Please review them periodically as they may be updated.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/contact" style={{
                    padding: '12px 28px', backgroundColor: '#f15b29', color: '#fff',
                    borderRadius: '10px', textDecoration: 'none', fontSize: '14px',
                    fontWeight: '600', display: 'inline-block', transition: 'all 0.3s ease'
                  }}>
                    Contact Us
                  </Link>
                  <Link to="/" style={{
                    padding: '12px 28px', backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#ffffff', borderRadius: '10px', textDecoration: 'none',
                    fontSize: '14px', fontWeight: '600', display: 'inline-block',
                    border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.3s ease'
                  }}>
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      </div>
  );
};

export default Terms;
