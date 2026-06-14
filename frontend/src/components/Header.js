import React from "react";
import { useDispatch, useSelector } from 'react-redux'
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { LinkContainer } from 'react-router-bootstrap'
import { logout } from '../actions/userAction'
import SearchBox from "./SearchBox"

function Header() {
  const userLogin = useSelector(state => state.userLogin)
  const { userInfo } = userLogin
  const dispatch = useDispatch()

  const cart = useSelector(state => state.cart)
  const { cartItems } = cart
  const totalCartItemsCount = cartItems ? cartItems.reduce((acc, item) => acc + item.qty, 0) : 0

  const logoutHandler = () => {
    dispatch(logout())
  }

  return (
    <header className="sticky-top">
      {/* Top Utility Bar */}
      <div className="topbar py-1 d-none d-md-block">
        <Container className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3 align-items-center">
            {userInfo && userInfo.is_staff && (
              <LinkContainer to="/admin-panel">
                <a href="#" className="small fw-bold text-danger" style={{ textDecoration: 'none' }}>
                  <i className="fas fa-user-shield me-1"></i>Admin Panel
                </a>
              </LinkContainer>
            )}
            <a href="#" className="small">Become a Seller</a>
            <a href="#" className="small">Help & Support</a>
            <a href="#" className="small">Daraz Affiliate Program</a>
          </div>
          <div className="d-flex gap-3">
            <span className="text-muted small"><i className="fas fa-mobile-alt me-1"></i>Save More on App</span>
          </div>
        </Container>
      </div>

      {/* Main Header Navigation */}
      <Navbar bg="white" variant="light" expand="lg" collapseOnSelect className="py-2 border-bottom shadow-sm">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand className="fw-extrabold text-uppercase" style={{ color: 'var(--primary-color)', fontSize: '1.6rem', letterSpacing: '-0.03em' }}>
              <span style={{ color: 'var(--primary-color)' }}>Daraz</span>
              <span className="text-dark">Shop</span>
            </Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {/* Centered Search Box */}
            <div className="mx-auto my-2 my-lg-0 w-100" style={{ maxWidth: '480px' }}>
              <SearchBox />
            </div>

            <Nav className="ms-auto align-items-center gap-3">
              {/* Wishlist Link */}
              <LinkContainer to="/profile">
                <Nav.Link className="px-2 text-dark position-relative" title="Wishlist">
                  <i className="far fa-heart" style={{ fontSize: '1.2rem', color: '#757575' }}></i>
                </Nav.Link>
              </LinkContainer>

              {/* Cart Button */}
              <LinkContainer to="/cart">
                <Nav.Link className="px-2 text-dark position-relative me-2" title="Cart">
                  <i className="fas fa-shopping-cart" style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}></i>
                  {totalCartItemsCount > 0 && (
                    <span 
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                      style={{ fontSize: '0.65rem', padding: '0.25em 0.5em', border: '2px solid white' }}
                    >
                      {totalCartItemsCount}
                    </span>
                  )}
                </Nav.Link>
              </LinkContainer>

              {/* User actions */}
              {userInfo ? (
                <NavDropdown 
                  title={
                    <span className="small fw-semibold text-dark">
                      <i className="fas fa-user me-2 text-secondary"></i>{userInfo.name}
                    </span>
                  } 
                  id="username" 
                  className="px-lg-2"
                >
                  <LinkContainer to="/profile">
                    <NavDropdown.Item className="small">Profile</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler} className="small text-danger">Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link className="px-3 py-1 border rounded-pill small fw-semibold text-white bg-primary text-center" style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
                    <i className="fas fa-user me-2"></i>Login
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;
