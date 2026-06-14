import React, { useEffect } from "react";
import { Button, Row, Col, ListGroup, Image, Card, Badge } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import { useDispatch, useSelector } from "react-redux";
import CheckoutSteps from "../components/CheckoutSteps";
import { createOrder } from '../actions/orderActions'
import { ORDER_CREATE_RESET } from '../constants/orderConstants'

function PlaceOrderPage() {
  const orderCreate = useSelector(state => state.orderCreate)
  const { order, error, success } = orderCreate
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector(state => state.cart)

  // Guard: no payment method → redirect
  if (!cart.paymentMethod) {
    navigate('/payment')
  }

  // Guard: no shipping address → redirect
  if (!cart.shippingAddress || !cart.shippingAddress.address) {
    navigate('/shipping')
  }

  // Calculate prices
  const itemsPrice = cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
  const shippingCost = (Number(itemsPrice) > 100 ? 0 : 10).toFixed(2)
  const taxPrice = (Number(itemsPrice) * 0.05).toFixed(2)
  const totalPrice = (Number(itemsPrice) + Number(shippingCost) + Number(taxPrice)).toFixed(2)

  useEffect(() => {
    if (success) {
      navigate(`/order/${order._id}`)
      dispatch({ type: ORDER_CREATE_RESET })
    }
  }, [success, navigate, order, dispatch])

  const placeOrder = () => {
    dispatch(createOrder({
      orderItems: cart.cartItems,
      shippingAddress: cart.shippingAddress,
      paymentMethod: cart.paymentMethod,
      itemsPrice: itemsPrice,
      shippingCost: shippingCost,
      taxPrice: taxPrice,
      totalPrice: totalPrice,
    }))
  }

  const paymentIcons = {
    'PayPal': 'fab fa-paypal',
    'Credit / Debit Card': 'fas fa-credit-card',
    'bKash': 'fas fa-mobile-alt',
    'Cash on Delivery': 'fas fa-money-bill-wave',
  }

  return (
    <div className="py-3">
      <div className="d-flex justify-content-center mb-2">
        <CheckoutSteps step1 step2 step3 step4 />
      </div>

      <Row className="g-4">
        {/* Left Column — Order Details */}
        <Col md={8}>
          {/* Shipping Card */}
          <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div className="p-4 border-bottom d-flex align-items-center gap-3" style={{ background: 'linear-gradient(135deg, #fff7f0 0%, #fff 100%)' }}>
              <div className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10" style={{ width: '44px', height: '44px' }}>
                <i className="fas fa-map-marker-alt text-primary"></i>
              </div>
              <div>
                <h2 className="h5 fw-bold mb-0">Delivery Address</h2>
                <span className="text-muted small">Where should we deliver?</span>
              </div>
            </div>
            <div className="p-4">
              {cart.shippingAddress && (
                <div className="d-flex align-items-start gap-3">
                  <div className="flex-grow-1">
                    <p className="mb-1 fw-semibold text-dark">{cart.shippingAddress.address}</p>
                    <p className="mb-0 text-muted small">
                      {[
                        cart.shippingAddress.union,
                        cart.shippingAddress.postOffice,
                        cart.shippingAddress.policeStation,
                        cart.shippingAddress.district,
                        cart.shippingAddress.division,
                        cart.shippingAddress.postalCode,
                        cart.shippingAddress.country
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <Link to="/shipping" className="btn btn-sm btn-outline-secondary rounded-pill px-3" style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                    Change
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Card */}
          <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div className="p-4 border-bottom d-flex align-items-center gap-3" style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #fff 100%)' }}>
              <div className="d-flex align-items-center justify-content-center rounded-3 bg-info bg-opacity-10" style={{ width: '44px', height: '44px' }}>
                <i className="fas fa-credit-card text-info"></i>
              </div>
              <div>
                <h2 className="h5 fw-bold mb-0">Payment Method</h2>
                <span className="text-muted small">How will you pay?</span>
              </div>
            </div>
            <div className="p-4 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <i className={`${paymentIcons[cart.paymentMethod] || 'fas fa-wallet'} text-primary`} style={{ fontSize: '1.4rem' }}></i>
                <span className="fw-semibold text-dark">{cart.paymentMethod}</span>
              </div>
              <Link to="/payment" className="btn btn-sm btn-outline-secondary rounded-pill px-3" style={{ fontSize: '0.78rem' }}>
                Change
              </Link>
            </div>
          </Card>

          {/* Order Items Card */}
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="p-4 border-bottom d-flex align-items-center gap-3" style={{ background: 'linear-gradient(135deg, #f0fff4 0%, #fff 100%)' }}>
              <div className="d-flex align-items-center justify-content-center rounded-3 bg-success bg-opacity-10" style={{ width: '44px', height: '44px' }}>
                <i className="fas fa-box-open text-success"></i>
              </div>
              <div>
                <h2 className="h5 fw-bold mb-0">Order Items ({cart.cartItems.reduce((a, i) => a + i.qty, 0)})</h2>
                <span className="text-muted small">Review your selected items</span>
              </div>
            </div>

            {cart.cartItems.length === 0 ? (
              <div className="p-4">
                <Message variant='info'>Your cart is empty</Message>
              </div>
            ) : (
              <ListGroup variant='flush'>
                {cart.cartItems.map((item, index) => (
                  <ListGroup.Item key={index} className="px-4 py-3 border-bottom">
                    <Row className="align-items-center g-3">
                      <Col xs={3} md={1}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          fluid
                          rounded
                          className="shadow-sm"
                          style={{ aspectRatio: '1', objectFit: 'cover' }}
                        />
                      </Col>
                      <Col xs={9} md={7}>
                        <Link to={`/product/${item.product}`} className="text-decoration-none fw-semibold text-dark d-block" style={{ fontSize: '0.9rem' }}>
                          {item.name}
                        </Link>
                        {item.variant_name && (
                          <Badge bg="light" text="dark" className="mt-1 border" style={{ fontSize: '0.72rem' }}>
                            {item.variant_name}
                          </Badge>
                        )}
                      </Col>
                      <Col md={4} xs={12}>
                        <div className="d-flex align-items-center justify-content-between justify-content-md-end gap-2">
                          <span className="text-muted small">{item.qty} × ${item.price}</span>
                          <span className="fw-bold text-primary">${(item.qty * item.price).toFixed(2)}</span>
                        </div>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card>
        </Col>

        {/* Right Column — Order Summary */}
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ position: 'sticky', top: '100px' }}>
            <div className="p-4 border-bottom" style={{ background: 'linear-gradient(135deg, #fff7f0 0%, #fff 100%)' }}>
              <h2 className="h5 fw-bold mb-0">Order Summary</h2>
            </div>

            <div className="p-4">
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Subtotal ({cart.cartItems.reduce((a, i) => a + i.qty, 0)} items)</span>
                <span className="fw-semibold">${itemsPrice}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Shipping</span>
                <span className="fw-semibold">
                  {Number(shippingCost) === 0
                    ? <span className="text-success">FREE</span>
                    : `$${shippingCost}`
                  }
                </span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">VAT / Tax (5%)</span>
                <span className="fw-semibold">${taxPrice}</span>
              </div>

              {Number(shippingCost) === 0 && (
                <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded-3" style={{ background: '#f0fff4', border: '1px dashed #86efac' }}>
                  <i className="fas fa-gift text-success small"></i>
                  <span className="text-success small fw-semibold">You qualify for free shipping!</span>
                </div>
              )}

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fw-bold h5 mb-0">Total</span>
                <span className="fw-bold h4 mb-0 text-primary">${totalPrice}</span>
              </div>

              {error && <Message variant='danger' className="mb-3">{error}</Message>}

              <Button
                type="button"
                className="btn btn-primary w-100 py-3 rounded-3 shadow-sm fw-bold mb-3"
                disabled={cart.cartItems.length === 0}
                onClick={placeOrder}
                style={{ fontSize: '1rem' }}
              >
                <i className="fas fa-check-circle me-2"></i>
                Place Order
              </Button>

              <div className="d-flex align-items-center justify-content-center gap-2">
                <i className="fas fa-shield-alt text-success small"></i>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Secure 256-bit SSL encrypted checkout</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default PlaceOrderPage
