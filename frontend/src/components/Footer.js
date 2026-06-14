import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const footerLinks = {
  shop: [
    { label: 'All Products', path: '/' },
    { label: 'Flash Sale', path: '/' },
    { label: 'New Arrivals', path: '/' },
    { label: 'Best Sellers', path: '/' },
    { label: 'Deals & Offers', path: '/' },
  ],
  account: [
    { label: 'My Account', path: '/profile' },
    { label: 'My Orders', path: '/profile' },
    { label: 'Address Book', path: '/profile' },
    { label: 'Shopping Cart', path: '/cart' },
    { label: 'Login / Register', path: '/login' },
  ],
  help: [
    { label: 'Help Center', path: '/' },
    { label: 'How to Buy', path: '/' },
    { label: 'Track Your Order', path: '/profile' },
    { label: 'Return & Refund', path: '/' },
    { label: 'Contact Us', path: '/' },
  ],
}

const paymentIcons = [
  { icon: 'fab fa-paypal', label: 'PayPal', color: '#003087' },
  { icon: 'fab fa-cc-visa', label: 'Visa', color: '#1a1f71' },
  { icon: 'fab fa-cc-mastercard', label: 'Mastercard', color: '#eb001b' },
  { icon: 'fab fa-cc-amex', label: 'Amex', color: '#007bc1' },
  { icon: 'fas fa-money-bill-wave', label: 'COD', color: '#16a34a' },
]

const socialLinks = [
  { icon: 'fab fa-facebook-f', href: '#', color: '#1877f2', label: 'Facebook' },
  { icon: 'fab fa-instagram', href: '#', color: '#e1306c', label: 'Instagram' },
  { icon: 'fab fa-twitter', href: '#', color: '#1da1f2', label: 'Twitter' },
  { icon: 'fab fa-youtube', href: '#', color: '#ff0000', label: 'YouTube' },
  { icon: 'fab fa-tiktok', href: '#', color: '#010101', label: 'TikTok' },
]

function Footer() {
  return (
    <footer style={{ background: '#1a1a2e', color: '#cdd5e0' }}>
      {/* Top Promo Bar */}
      <div style={{ background: 'var(--primary-color)', padding: '14px 0' }}>
        <Container>
          <Row className="g-2 align-items-center text-center text-md-start">
            <Col md={3} className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
              <i className="fas fa-truck" style={{ color: '#fff', fontSize: '1.2rem' }}></i>
              <div>
                <div className="fw-bold text-white" style={{ fontSize: '0.85rem' }}>Free Shipping</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>On orders over $100</div>
              </div>
            </Col>
            <Col md={3} className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
              <i className="fas fa-undo-alt" style={{ color: '#fff', fontSize: '1.2rem' }}></i>
              <div>
                <div className="fw-bold text-white" style={{ fontSize: '0.85rem' }}>Easy Returns</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>30 days return policy</div>
              </div>
            </Col>
            <Col md={3} className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
              <i className="fas fa-headset" style={{ color: '#fff', fontSize: '1.2rem' }}></i>
              <div>
                <div className="fw-bold text-white" style={{ fontSize: '0.85rem' }}>24/7 Support</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>Dedicated support team</div>
              </div>
            </Col>
            <Col md={3} className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
              <i className="fas fa-shield-alt" style={{ color: '#fff', fontSize: '1.2rem' }}></i>
              <div>
                <div className="fw-bold text-white" style={{ fontSize: '0.85rem' }}>Secure Payment</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>SSL encrypted checkout</div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Footer Body */}
      <div style={{ padding: '50px 0 30px' }}>
        <Container>
          <Row className="g-5">
            {/* Brand Column */}
            <Col lg={3} md={6}>
              <div className="mb-4">
                <div className="fw-extrabold mb-2" style={{ fontSize: '1.8rem', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  <span style={{ color: 'var(--primary-color)' }}>Daraz</span>
                  <span className="text-white">Shop</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.7 }}>
                  Your one-stop destination for the best products. Shop millions of items at unbeatable prices delivered right to your door.
                </p>
              </div>

              {/* App Download */}
              <div className="mb-4">
                <div className="fw-semibold text-white mb-2" style={{ fontSize: '0.85rem' }}>Download Our App</div>
                <div className="d-flex gap-2">
                  <a
                    href="#"
                    className="d-flex align-items-center gap-2 text-decoration-none px-3 py-2 rounded-3"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  >
                    <i className="fab fa-apple text-white" style={{ fontSize: '1.1rem' }}></i>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Download on the</div>
                      <div className="text-white fw-semibold" style={{ fontSize: '0.75rem' }}>App Store</div>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="d-flex align-items-center gap-2 text-decoration-none px-3 py-2 rounded-3"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  >
                    <i className="fab fa-google-play text-white" style={{ fontSize: '1.1rem' }}></i>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Get it on</div>
                      <div className="text-white fw-semibold" style={{ fontSize: '0.75rem' }}>Google Play</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <div className="fw-semibold text-white mb-2" style={{ fontSize: '0.85rem' }}>Follow Us</div>
                <div className="d-flex gap-2">
                  {socialLinks.map(({ icon, href, color, label }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="d-flex align-items-center justify-content-center text-decoration-none rounded-circle"
                      style={{
                        width: '36px',
                        height: '36px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = color
                        e.currentTarget.style.color = '#fff'
                        e.currentTarget.style.border = `1px solid ${color}`
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                        e.currentTarget.style.color = '#94a3b8'
                        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'
                      }}
                    >
                      <i className={icon}></i>
                    </a>
                  ))}
                </div>
              </div>
            </Col>

            {/* Shop Links */}
            <Col lg={2} md={6}>
              <h6 className="text-white fw-bold mb-3" style={{ fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Shop
              </h6>
              <ul className="list-unstyled mb-0">
                {footerLinks.shop.map(({ label, path }) => (
                  <li key={label} className="mb-2">
                    <Link
                      to={path}
                      className="text-decoration-none"
                      style={{ color: '#94a3b8', fontSize: '0.85rem', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Col>

            {/* Account Links */}
            <Col lg={2} md={6}>
              <h6 className="text-white fw-bold mb-3" style={{ fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                My Account
              </h6>
              <ul className="list-unstyled mb-0">
                {footerLinks.account.map(({ label, path }) => (
                  <li key={label} className="mb-2">
                    <Link
                      to={path}
                      className="text-decoration-none"
                      style={{ color: '#94a3b8', fontSize: '0.85rem', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Col>

            {/* Help Links */}
            <Col lg={2} md={6}>
              <h6 className="text-white fw-bold mb-3" style={{ fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Help
              </h6>
              <ul className="list-unstyled mb-0">
                {footerLinks.help.map(({ label, path }) => (
                  <li key={label} className="mb-2">
                    <Link
                      to={path}
                      className="text-decoration-none"
                      style={{ color: '#94a3b8', fontSize: '0.85rem', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Col>

            {/* Newsletter */}
            <Col lg={3} md={6}>
              <h6 className="text-white fw-bold mb-3" style={{ fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Newsletter
              </h6>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Subscribe to get exclusive deals, flash sale alerts, and more delivered to your inbox.
              </p>
              <form onSubmit={e => e.preventDefault()} className="mb-4">
                <div className="d-flex rounded-3 overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="form-control border-0 bg-transparent text-white rounded-0"
                    style={{ fontSize: '0.85rem', outline: 'none', boxShadow: 'none' }}
                  />
                  <button
                    type="submit"
                    className="btn px-3 fw-semibold"
                    style={{ background: 'var(--primary-color)', color: '#fff', borderRadius: 0, fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                  >
                    Subscribe
                  </button>
                </div>
              </form>

              {/* Contact Info */}
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-phone-alt" style={{ color: 'var(--primary-color)', width: '16px', fontSize: '0.85rem' }}></i>
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>+880 1800-000000</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-envelope" style={{ color: 'var(--primary-color)', width: '16px', fontSize: '0.85rem' }}></i>
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>support@darazshop.com</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary-color)', width: '16px', fontSize: '0.85rem' }}></i>
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Dhaka, Bangladesh</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 0' }}>
        <Container>
          <Row className="align-items-center g-3">
            <Col md={6} className="text-center text-md-start">
              <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                © {new Date().getFullYear()} DarazShop. All rights reserved. Built with ❤️ in Bangladesh.
              </span>
            </Col>
            <Col md={6}>
              <div className="d-flex align-items-center justify-content-center justify-content-md-end gap-2 flex-wrap">
                {paymentIcons.map(({ icon, label, color }) => (
                  <div
                    key={label}
                    title={label}
                    className="d-flex align-items-center justify-content-center rounded-2"
                    style={{
                      width: '40px',
                      height: '26px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <i className={icon} style={{ color, fontSize: '1rem' }}></i>
                  </div>
                ))}
                <span style={{ color: '#475569', fontSize: '0.75rem', marginLeft: '8px' }}>Secure Payments</span>
              </div>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col className="text-center text-md-start d-flex gap-3 justify-content-center justify-content-md-start">
              {['Privacy Policy', 'Terms of Use', 'Cookie Policy', 'Sitemap'].map(link => (
                <a
                  key={link}
                  href="#"
                  className="text-decoration-none"
                  style={{ color: '#475569', fontSize: '0.75rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                >
                  {link}
                </a>
              ))}
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  )
}

export default Footer
