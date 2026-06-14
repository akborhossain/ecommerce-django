import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { register } from "../actions/userAction";

function RegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const redirect = location.search ? location.search.split("=")[1] : "/";
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const userRegister = useSelector((state) => state.userRegister);
  const { error, loading, userInfo } = userRegister;

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [navigate, userInfo, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirm_password) {
      setMessage("Passwords do not match");
    } else {
      setMessage("");
      dispatch(register(first_name, last_name, email, password));
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="fw-extrabold mb-1" style={{ fontSize: '2rem', letterSpacing: '-0.04em' }}>
            <span style={{ color: 'var(--primary-color)' }}>Daraz</span>
            <span className="text-dark">Shop</span>
          </div>
          <p className="text-muted small">Create your free account and start shopping</p>
        </div>

        <Card className="border-0 shadow-sm rounded-4 p-4">
          <h2 className="fw-bold mb-4 text-center" style={{ fontSize: '1.4rem' }}>Create Account</h2>

          {message && <Message variant="danger">{message}</Message>}
          {error && <Message variant="danger">{typeof error === 'string' ? error : JSON.stringify(error)}</Message>}
          {loading && <Loader />}

          <Form onSubmit={submitHandler}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="first_name" className="mb-3">
                  <Form.Label className="fw-semibold small text-muted">First Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="First name"
                    value={first_name}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="shadow-none rounded-3 py-2"
                    style={{ border: '1px solid #e2e8f0' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="last_name" className="mb-3">
                  <Form.Label className="fw-semibold small text-muted">Last Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Last name"
                    value={last_name}
                    onChange={(e) => setLastName(e.target.value)}
                    className="shadow-none rounded-3 py-2"
                    style={{ border: '1px solid #e2e8f0' }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="email" className="mb-3">
              <Form.Label className="fw-semibold small text-muted">Email Address</Form.Label>
              <div className="position-relative">
                <i className="fas fa-envelope position-absolute text-muted" style={{ top: '12px', left: '14px', fontSize: '0.9rem' }}></i>
                <Form.Control
                  required
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="shadow-none rounded-3 ps-5 py-2"
                  style={{ border: '1px solid #e2e8f0' }}
                />
              </div>
            </Form.Group>

            <Form.Group controlId="password" className="mb-3">
              <Form.Label className="fw-semibold small text-muted">Password</Form.Label>
              <div className="position-relative">
                <i className="fas fa-lock position-absolute text-muted" style={{ top: '12px', left: '14px', fontSize: '0.9rem' }}></i>
                <Form.Control
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password (min 8 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="shadow-none rounded-3 ps-5 py-2"
                  style={{ border: '1px solid #e2e8f0', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="btn btn-link position-absolute p-0 text-muted border-0"
                  style={{ top: '10px', right: '14px', fontSize: '0.9rem' }}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </Form.Group>

            <Form.Group controlId="confirm_password" className="mb-4">
              <Form.Label className="fw-semibold small text-muted">Confirm Password</Form.Label>
              <div className="position-relative">
                <i className="fas fa-lock position-absolute text-muted" style={{ top: '12px', left: '14px', fontSize: '0.9rem' }}></i>
                <Form.Control
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirm_password}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`shadow-none rounded-3 ps-5 py-2 ${confirm_password && password !== confirm_password ? 'border-danger' : ''}`}
                  style={{ border: `1px solid ${confirm_password && password !== confirm_password ? '#dc3545' : '#e2e8f0'}` }}
                />
              </div>
              {confirm_password && password !== confirm_password && (
                <div className="text-danger small mt-1">
                  <i className="fas fa-exclamation-circle me-1"></i>
                  Passwords do not match
                </div>
              )}
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="w-100 py-3 rounded-3 shadow-sm fw-bold mb-3"
              style={{ fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="text-center small" style={{ color: '#94a3b8' }}>
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary text-decoration-none">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary text-decoration-none">Privacy Policy</a>
            </div>
          </Form>
        </Card>

        <div className="text-center mt-3 small text-muted">
          Already have an account?{" "}
          <Link to={redirect ? `/login?redirect=${redirect}` : "/login"} className="text-primary fw-semibold text-decoration-none">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
