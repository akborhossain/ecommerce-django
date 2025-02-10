import React, { useEffect, useState } from "react";
import {  Button, Row, Col, ListGroup, Image, Card } from "react-bootstrap";
import { Link } from 'react-router-dom';
import Message from '../components/Message';
import { useDispatch, useSelector } from "react-redux";
import CheckoutSteps from "../components/CheckoutSteps";

function PlaceOrderPage() {
  const cart=useSelector(state=>state.cart)
  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4 />
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2> Shipping</h2>
              <p>
                <strong>
                  Shipping: 
                </strong>
                {cart.shippingAddress.address},{cart.shippingAddress.union},{cart.shippingAddress.postOffice}
              </p>
            </ListGroup.Item>
            <ListGroup.Item>
              <h2> Payment Method</h2>
              <p>
                <strong>
                  Method: 
                </strong>
                {cart.paymentMethod}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2> Payment Method</h2>
              <p>
                <strong>
                  Method: 
                </strong>
                {cart.paymentMethod}
              </p>
            </ListGroup.Item>
            <ListGroup.Item>
              <h2> Order Item</h2>
              {cart.cartItems.length ===0 ? <Message variant='info'>
                Your cart is empty
              </Message>:(
                <ListGroup variant='flush'>
                  {cart.cartItems.map((item, index)=>(
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image src={item.image} alt={item.name} fluid rounded/>
                        </Col>
                        <Col>
                        <Link to={`/product/${index.product}`}> {item.name} </Link>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}

                </ListGroup>
              )}
  
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
    </div>
  )
}

export default PlaceOrderPage
