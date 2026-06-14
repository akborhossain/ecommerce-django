import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Image, ListGroup, Button, Card, Form } from "react-bootstrap";
import Rating from "../components/Rating";
import Loader from "../components/Loader";
import Message from "../components/Message";

import { listProductDetails, createProductReview } from "../actions/productActions";
import { addToCart } from "../actions/cartActions";
import { PRODUCT_CREATE_REVIEW_RESET } from '../constants/productConstants'

const THUMBNAIL_FILTERS = [
  {},
  { filter: 'hue-rotate(90deg)' },
  { filter: 'brightness(1.2) contrast(1.1)' },
  { filter: 'saturate(1.5) hue-rotate(240deg)' }
];

function ProductPage() {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const productReviewCreate = useSelector((state) => state.productReviewCreate);
  const {
    loading: loadingProductReview,
    error: errorProductReview,
    success: successProductReview,
  } = productReviewCreate;

  useEffect(() => {
    if (successProductReview) {
      setRating(0);
      setComment('');
      dispatch({ type: PRODUCT_CREATE_REVIEW_RESET });
    }
    dispatch(listProductDetails(id));
    setActiveImageIndex(0);
  }, [dispatch, id, successProductReview, userInfo]);

  const addToCartHandler = () => {
    navigate(`/cart/${id}?qty=${qty}`);
  };

  const buyNowHandler = () => {
    dispatch(addToCart(id, qty));
    navigate('/login?redirect=/shipping');
  };

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(createProductReview(id, { rating, comment }));
  };

  return (
    <div className="py-3">
      <Link to="/" className="btn btn-light mb-4 rounded-pill px-4 shadow-sm border">
        <i className="fas fa-arrow-left me-2"></i>Go Back
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <div>
          <Row className="g-4 mb-5">
            {/* Gallery (Col lg=5, md=6) */}
            <Col lg={5} md={6}>
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white p-4">
                <div style={{ height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fluid 
                    className="rounded-3 mx-auto d-block object-fit-contain" 
                    style={{ 
                      maxHeight: '100%', 
                      transition: 'all 0.3s ease',
                      ...THUMBNAIL_FILTERS[activeImageIndex]
                    }} 
                  />
                </div>
                {/* Thumbnails list */}
                <div className="d-flex justify-content-center gap-2 mt-4">
                  {THUMBNAIL_FILTERS.map((style, idx) => (
                    <div 
                      key={idx}
                      className={`thumbnail-img rounded border ${activeImageIndex === idx ? 'active' : ''}`}
                      style={{ 
                        width: '65px', 
                        height: '65px', 
                        cursor: 'pointer',
                        padding: '4px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        borderColor: activeImageIndex === idx ? 'var(--primary-color)' : '#e2e8f0'
                      }}
                      onClick={() => setActiveImageIndex(idx)}
                      onMouseEnter={() => setActiveImageIndex(idx)}
                    >
                      <Image
                        src={product.image}
                        className="w-100 h-100 object-fit-contain"
                        style={style}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            {/* Product Details (Col lg=4, md=6) */}
            <Col lg={4} md={6}>
              <Card className="border-0 shadow-sm rounded-4 p-4 h-100 d-flex flex-column justify-content-between bg-white">
                <div>
                  <div className="text-uppercase text-muted fw-bold small mb-2">{product.brand}</div>
                  <h1 className="h3 fw-bold mb-3">{product.name}</h1>
                  
                  <div className="mb-3">
                    <Rating value={product.rating} text={`${product.numReviews} reviews`} color={"#f59e0b"} />
                  </div>
                  
                  <div className="d-flex align-items-baseline gap-2 mb-4 flex-wrap">
                    <span className="h3 fw-bold text-primary mb-0">${product.price}</span>
                    <span className="text-muted text-decoration-line-through small">${(product.price * 1.3).toFixed(2)}</span>
                    <span className="discount-badge">-23%</span>
                  </div>
                  
                  <hr className="my-4 text-muted opacity-25" />
                  
                  <div className="mb-4">
                    <Row className="align-items-center mb-3">
                      <Col xs={4} className="text-muted fw-medium">Availability:</Col>
                      <Col xs={8}>
                        <span className={`badge px-3 py-2 rounded-pill fw-semibold ${product.countInStock > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                          {product.countInStock > 0 ? `In Stock (${product.countInStock} available)` : "Out of Stock"}
                        </span>
                      </Col>
                    </Row>
                    
                    {product.countInStock > 0 && (
                      <Row className="align-items-center">
                        <Col xs={4} className="text-muted fw-medium">Quantity:</Col>
                        <Col xs={8}>
                          <div className="d-flex align-items-center bg-light rounded-pill p-1 shadow-sm" style={{ width: 'fit-content' }}>
                            <Button
                              variant="light"
                              className="rounded-circle px-3 py-1.5 border-0 bg-transparent text-dark hover-bg-gray"
                              onClick={() => setQty(qty - 1)}
                              disabled={qty <= 1}
                            >
                              <i className="fas fa-minus small"></i>
                            </Button>
                            <span className="mx-3 fw-bold" style={{ minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                            <Button
                              variant="light"
                              className="rounded-circle px-3 py-1.5 border-0 bg-transparent text-dark hover-bg-gray"
                              onClick={() => setQty(qty + 1)}
                              disabled={qty >= product.countInStock}
                            >
                              <i className="fas fa-plus small"></i>
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <Row className="g-3">
                    <Col xs={12}>
                      <Button 
                        onClick={addToCartHandler} 
                        className="btn btn-primary w-100 py-3 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2" 
                        disabled={product.countInStock === 0}
                        type="button"
                      >
                        <i className="fas fa-shopping-cart"></i>Add to Cart
                      </Button>
                    </Col>
                    <Col xs={12}>
                      <Button 
                        onClick={buyNowHandler}
                        className="btn btn-dark w-100 py-3 rounded-3 shadow-sm d-flex align-items-center justify-content-center" 
                        disabled={product.countInStock === 0}
                        type="button"
                      >
                        Buy Now
                      </Button>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>

            {/* Delivery/Shipping info pane (Col lg=3, md=12) */}
            <Col lg={3} md={12}>
              <Card className="border-0 shadow-sm rounded-4 p-4 shipping-pane bg-white h-100">
                <h5 className="fw-bold mb-3" style={{ fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                  <i className="fas fa-truck-moving text-primary me-2"></i>Delivery Options
                </h5>
                
                <ListGroup variant="flush" className="mb-4">
                  <ListGroup.Item className="px-0 py-2 border-0 bg-transparent">
                    <div className="d-flex align-items-start gap-2">
                      <i className="fas fa-map-marker-alt text-muted mt-1" style={{ fontSize: '0.9rem' }}></i>
                      <div>
                        <div className="fw-semibold small" style={{ fontSize: '0.8rem' }}>Dhaka, Dhaka North, Banani</div>
                        <span className="text-primary cursor-pointer fw-semibold" style={{ fontSize: '0.7rem' }}>Change Address</span>
                      </div>
                    </div>
                  </ListGroup.Item>
                  
                  <ListGroup.Item className="px-0 py-3 border-0 border-top bg-transparent">
                    <div className="d-flex align-items-start justify-content-between">
                      <div className="d-flex align-items-start gap-2">
                        <i className="fas fa-shipping-fast text-muted mt-1" style={{ fontSize: '0.9rem' }}></i>
                        <div>
                          <div className="fw-semibold small" style={{ fontSize: '0.8rem' }}>Standard Delivery</div>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>Est. Delivery: 2-4 days</span>
                        </div>
                      </div>
                      <div className="fw-bold text-dark small" style={{ fontSize: '0.8rem' }}>$2.50</div>
                    </div>
                  </ListGroup.Item>

                  <ListGroup.Item className="px-0 py-3 border-0 border-top bg-transparent">
                    <div className="d-flex align-items-start gap-2">
                      <i className="fas fa-hand-holding-usd text-muted mt-1" style={{ fontSize: '0.9rem' }}></i>
                      <div>
                        <div className="fw-semibold small" style={{ fontSize: '0.8rem' }}>Cash on Delivery</div>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>Available for this product</span>
                      </div>
                    </div>
                  </ListGroup.Item>
                </ListGroup>

                <h5 className="fw-bold mb-3 mt-2" style={{ fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                  <i className="fas fa-undo text-primary me-2"></i>Return & Warranty
                </h5>
                <ListGroup variant="flush">
                  <ListGroup.Item className="px-0 py-2 border-0 bg-transparent">
                    <div className="d-flex align-items-start gap-2">
                      <i className="fas fa-shield-alt text-muted mt-1" style={{ fontSize: '0.9rem' }}></i>
                      <div>
                        <div className="fw-semibold small" style={{ fontSize: '0.8rem' }}>100% Authentic</div>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>Official seller guarantee</span>
                      </div>
                    </div>
                  </ListGroup.Item>
                  
                  <ListGroup.Item className="px-0 py-3 border-0 border-top bg-transparent">
                    <div className="d-flex align-items-start gap-2">
                      <i className="fas fa-calendar-check text-muted mt-1" style={{ fontSize: '0.9rem' }}></i>
                      <div>
                        <div className="fw-semibold small" style={{ fontSize: '0.8rem' }}>7 Days Returns</div>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>Easy returns if unsatisfied</span>
                      </div>
                    </div>
                  </ListGroup.Item>

                  <ListGroup.Item className="px-0 py-3 border-0 border-top bg-transparent">
                    <div className="d-flex align-items-start gap-2">
                      <i className="fas fa-user-shield text-muted mt-1" style={{ fontSize: '0.9rem' }}></i>
                      <div>
                        <div className="fw-semibold small" style={{ fontSize: '0.8rem' }}>1 Year Warranty</div>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>Brand service center warranty</span>
                      </div>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
          
          <Row className="g-4 my-4">
            <Col md={6}>
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
                <h3 className="fw-bold mb-4">Customer Reviews</h3>
                {product.reviews && product.reviews.length === 0 && (
                  <Message variant="info">No reviews yet. Be the first to write one!</Message>
                )}
                <ListGroup variant="flush">
                  {product.reviews && product.reviews.map((review) => (
                    <ListGroup.Item key={review._id} className="py-4 px-0 border-0 border-bottom">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong className="h6 mb-0">{review.name}</strong>
                        <span className="text-muted small">{review.createdAt ? review.createdAt.substring(0, 10) : ''}</span>
                      </div>
                      <div className="mb-2">
                        <Rating value={review.rating} color={"#f59e0b"} />
                      </div>
                      <p className="text-secondary mb-0 small">{review.comment}</p>
                    </ListGroup.Item>
                  ))}
                  
                  <ListGroup.Item className="pt-4 px-0 border-0">
                    <h4 className="fw-bold mb-3">Write a Customer Review</h4>
                    {loadingProductReview && <Loader />}
                    {successProductReview && (
                      <Message variant="success">Review submitted successfully</Message>
                    )}
                    {errorProductReview && (
                      <Message variant="danger">{errorProductReview}</Message>
                    )}
                    
                    {userInfo ? (
                      product.has_purchased ? (
                        <Form onSubmit={submitHandler} className="mt-3">
                          <Form.Group controlId="rating" className="mb-3">
                            <Form.Label className="fw-semibold">Rating</Form.Label>
                            <Form.Select
                              value={rating}
                              onChange={(e) => setRating(Number(e.target.value))}
                              className="shadow-none py-2.5 rounded-3"
                              required
                            >
                              <option value="">Select...</option>
                              <option value="1">1 - Poor</option>
                              <option value="2">2 - Fair</option>
                              <option value="3">3 - Good</option>
                              <option value="4">4 - Very Good</option>
                              <option value="5">5 - Excellent</option>
                            </Form.Select>
                          </Form.Group>
                          <Form.Group controlId="comment" className="mb-3">
                            <Form.Label className="fw-semibold">Comment</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows="4"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder="Write your review here..."
                              className="shadow-none rounded-3"
                              required
                            />
                          </Form.Group>
                          <Button
                            disabled={loadingProductReview}
                            type="submit"
                            variant="primary"
                            className="py-2.5 px-4 shadow-sm rounded-3 mt-2"
                          >
                            Submit Review
                          </Button>
                        </Form>
                      ) : (
                        <Message variant="warning">
                          Only customers who purchased this product can write a review.
                        </Message>
                      )
                    ) : (
                      <Message variant="info">
                        Please <Link to="/login" className="fw-bold text-decoration-none">sign in</Link> to write a review.
                      </Message>
                    )}
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <h3 className="fw-bold mb-4">Product Description</h3>
                <p className="text-secondary leading-relaxed" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                  {product.description}
                </p>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
