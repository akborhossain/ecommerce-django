import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { login } from "../actions/userAction";

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const redirect = location.search ? location.search.split("=")[1] : "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.userLogin);
  const { error, loading, userInfo } = userLogin;

  useEffect(() => {
    if (userInfo) navigate(`${redirect}`);
  }, [navigate, userInfo, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="fw-extrabold mb-1" style={{ fontSize: '2rem', letterSpacing: '-0.04em' }}>
            <span style={{ color: 'var(--primary-color)' }}>Daraz</span>
            <span className="text-dark">Shop</span>
          </div>
          <p className="text-muted small">Sign in to your account to continue shopping</p>
        </div>

        <Card className="border-0 shadow-sm rounded-4 p-4">
          <h2 className="fw-bold mb-4 text-center" style={{ fontSize: '1.4rem' }}>Welcome Back!</h2>

          {error && <Message variant="danger">{error}</Message>}
          {loading && <Loader />}

          <Form onSubmit={submitHandler}>
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

            <Form.Group controlId="password" className="mb-4">
              <div className="d-flex justify-content-between">
                <Form.Label className="fw-semibold small text-muted">Password</Form.Label>
                <a href="#" className="text-primary small text-decoration-none">Forgot password?</a>
              </div>
              <div className="position-relative">
                <i className="fas fa-lock position-absolute text-muted" style={{ top: '12px', left: '14px', fontSize: '0.9rem' }}></i>
                <Form.Control
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
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

            <Button
              type="submit"
              variant="primary"
              className="w-100 py-3 rounded-3 shadow-sm fw-bold mb-3"
              style={{ fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form>

          <div className="text-center small text-muted">
            Don't have an account?{" "}
            <Link to={redirect ? `/register?redirect=${redirect}` : "/register"} className="text-primary fw-semibold text-decoration-none">
              Create Account
            </Link>
          </div>
        </Card>

        <div className="text-center mt-3 small text-muted">
          <i className="fas fa-shield-alt text-success me-1"></i>
          Your personal data is protected by 256-bit SSL encryption
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
