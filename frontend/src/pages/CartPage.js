import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  ListGroup,
  Image,
  Form,
  Button,
  Card,
} from "react-bootstrap";
import Message from "../components/Message";
import { addToCart } from "../actions/cartActions";
import axios from 'axios'

function CartPage() {
  const { id: productId } = useParams(); // Get the product ID from the URL
  console.log("Id"+ productId)
  const location = useLocation(); // Get the current location
  const navigate = useNavigate(); // Get the navigate function
  const [loading, setLoading]=useState(true);

  const qty = location.search ? Number(location.search.split("=")[1]) : 1;
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart);
  const { cartItems } = cart;
 
  
  
  useEffect(() => {
    if (productId) {
      console.log(productId)
      dispatch(addToCart(productId, qty));
    }
  }, [dispatch, productId, qty]);
  const updateQtyHandler = (id, qty) => {
    dispatch(addToCart(id, qty));
  };

  const removeFromCartHandler = (id) => {
    //dispatch(removeFromCart(id));
    console.log("ok", id);
  };

  return (
    <Row>
      <Col md={8}>
        <h1>Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <Message variant="info">
            Your cart is empty! <Link to="/">Go Back</Link>
          </Message>
        ) : (
          <ListGroup variant="flush">
            {cartItems.map((item) => (
              <ListGroup.Item key={item.product}>
                <Row>
                  <Col md={2}>
                    <Image src={item.image} alt={item.name} fluid rounded />
                  </Col>
                  <Col md={3}>
                    <Link to={`/product/${item.product}`}> {item.name} </Link>
                  </Col>
                  <Col md={2}>{item.price}</Col>
                  <Col md={3}>
                    <Button
                      variant="light"
                      onClick={() =>
                        updateQtyHandler(item.product, item.qty - 1)
                      }
                      disabled={item.qty <= 1}
                    >
                      -
                    </Button>

                    <span className="mx-2">{item.qty}</span>

                    <Button
                      variant="light"
                      onClick={() =>
                        updateQtyHandler(item.product, item.qty + 1)
                      }
                      disabled={item.qty >= item.countInStock}
                    >
                      +
                    </Button>
                  </Col>
                  <Col md={1}>
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => removeFromCartHandler(item.product)}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </Col>
                  <Col>
                    <Col md={5}>{item.price * item.qty}</Col>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>
      <Col md={4}>
        <Card>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>
                Subtotal
              </h2>
              $
              {cartItems
                .reduce((acc, item) => acc + item.qty * item.price, 0)
                .toFixed(2)}
            </ListGroup.Item>
          </ListGroup>

          <ListGroup.Item>
            <Button
              type="button"
              className="w-100"
              disabled={cartItems.length === 0}
              onClick={'checkoutHandler'}
            >
              Proceed To Checkout
            </Button>
          </ListGroup.Item>
        </Card>
      </Col>
    </Row>
  );
}

export default CartPage;
