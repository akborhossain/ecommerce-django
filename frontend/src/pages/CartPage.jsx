import React, { useEffect ,useState} from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {Row,Col,ListGroup,Image,Button,Card} from "react-bootstrap";
import Message from "../components/Message";
import { addToCart, removeFromCart } from "../actions/cartActions";

function CartPage() {
  const { id: productId } = useParams(); // Get the product ID from the URL
  console.log("Id "+ productId)
  const location = useLocation(); // Get the current location
  const navigate = useNavigate(); // Get the navigate function

  const qty = location.search ? Number(location.search.split("=")[1]) : 1;
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { cartItems } =  cart;
  
  useEffect(() => {
    if (productId) {
      dispatch(addToCart(productId, qty)); 
    }
  }, [dispatch, productId, qty]);

  const updateQtyHandler = (id, qty) => {
    dispatch(addToCart(id, qty));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
    console.log("ok", id);
  };

  const checkoutHandler =()=>{
    navigate('/login?redirect=/shipping');
  }

  
  return (
    <div className="py-4">
      <Row>
        <Col md={8}>
          <h1 className="mb-4">Shopping Cart</h1>
          {cartItems.length === 0 ? (
            <Message variant="info">
              Your cart is empty! <Link to="/" className="text-primary fw-bold">Go Back</Link>
            </Message>
          ) : (
            <Card className="border-0 shadow-sm">
              <ListGroup variant="flush">
                {cartItems.map((item) => (
                  <ListGroup.Item key={item.product} className="py-4">
                    <Row className="align-items-center g-3">
                      <Col xs={4} md={1}>
                        <Image src={item.image} alt={item.name} fluid rounded className="shadow-sm" />
                      </Col>
                      <Col xs={8} md={3}>
                        <Link to={`/product/${item.product}`} className="fw-semibold text-decoration-none text-dark d-block h5 mb-1"> {item.name} </Link>
                        <span className="d-md-none text-muted small">${item.price} each</span>
                      </Col>
                      <Col md={2} className="d-none d-md-block text-muted fw-medium">${item.price}</Col>
                      <Col xs={6} md={3}>
                        <div className="d-flex align-items-center bg-light rounded-pill p-1 shadow-sm" style={{ width: 'fit-content' }}>
                          <Button
                            variant="light"
                            className="rounded-pill px-2 px-md-3 py-1 border-0"
                            onClick={() => updateQtyHandler(item.product, item.qty - 1)}
                            disabled={item.qty <= 1}
                          >
                            <i className="fas fa-minus small"></i>
                          </Button>
      
                          <span className="mx-2 mx-md-3 fw-bold">{item.qty}</span>
      
                          <Button
                            variant="light"
                            className="rounded-pill px-2 px-md-3 py-1 border-0"
                            onClick={() => updateQtyHandler(item.product, item.qty + 1)}
                            disabled={item.qty >= item.countInStock}
                          >
                            <i className="fas fa-plus small"></i>
                          </Button>
                        </div>
                      </Col>
                      <Col xs={4} md={2} className="fw-bold h5 mb-0 text-end text-md-start">
                        ${(item.price * item.qty).toFixed(2)}
                      </Col>
                      <Col xs={2} md={1} className="text-end">
                        <Button
                          type="button"
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => removeFromCartHandler(item.product)}
                        >
                          <i className="fas fa-trash-alt h5 mb-0"></i>
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <ListGroup variant="flush">
              <ListGroup.Item className="bg-light py-3">
                <h2 className="mb-0 text-uppercase small fw-bold letter-spacing-1">Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items:</span>
                  <span className="h4 mb-0 fw-bold">
                    ${cartItems
                      .reduce((acc, item) => acc + item.qty * item.price, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item className="border-0">
                <Button
                  type="button"
                  className="btn btn-primary w-100 py-3 shadow-sm rounded-3"
                  disabled={cartItems.length === 0}
                  onClick={checkoutHandler}
                >
                  Proceed To Checkout
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
  
}

export default CartPage;
