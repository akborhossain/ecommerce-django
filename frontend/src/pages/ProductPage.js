import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Image, ListGroup, Button, Card } from "react-bootstrap";
import Rating from "../components/Rating";
import axios from 'axios'

function ProductPage() {

  const { id } = useParams();

  const [qty, setQty] = useState(1);
  const [product, setProduct]=useState([])
  useEffect(()=>{
    async function fetchProduct(){
      const {data} = await axios.get(`/products/${id}`)
      setProduct(data)
    }
    fetchProduct()

  },[])

  return (
    <div>
      <Link></Link>

      <Row>
        <Col md={6}>
          <Image src={product.image} alt={product.name} fluid />
        </Col>
        <Col md={4}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h3>{product.name}</h3>
            </ListGroup.Item>
            <ListGroup.Item>
              <Rating
                value={product.rating}
                text={`${product.numReviews} reviews`}
                color={"#f8e825"}
              />
            </ListGroup.Item>
            <ListGroup.Item>Price: ${product.price}</ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col>Status:</Col>
                <Col>
                  {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                </Col>
              </Row>
            </ListGroup.Item>
            {product.countInStock > 0 && (
              <ListGroup.Item>
                <Row>
                  <Col>Quantity</Col>
                  <Col>
                    <Button
                      variant="light"
                      onClick={() => setQty(qty - 1)}
                      disabled={qty <= 1}
                    >
                      -
                    </Button>
                   
                    <span className="mx-2">{qty}</span>
               
                    <Button
                      variant="light"
                      onClick={() => setQty(qty + 1)}
                      disabled={qty >= product.countInStock}
                    >
                      +
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            )}
            <ListGroup.Item>
              <Row>
                <Col>
                  <Button
                    className="btn-block"
                    disabled={product.countInStock === 0}
                    type="button"
                  >
                    Add to Cart
                  </Button>
                </Col>
                <Col>
                  <Button
                    className="btn-block"
                    disabled={product.countInStock === 0}
                    type="button"
                  >
                    Buy Now
                  </Button>
                </Col>
              </Row>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        {/*
        <Col md={3}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <Row>
                  <Col>Price:</Col>
                  <Col>
                    <strong> ${product.price}</strong>
                  </Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Status:</Col>
                  <Col>
                    {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                  </Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Button
                  className="btn-block"
                  disabled={product.countInStock == 0}
                  type="button"
                >
                  {" "}
                  Add to Card
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
  */}
      </Row>
      <Row className="my-5">
        <Col>
          <ListGroup>
            <ListGroup.Item>
              <h2>Product Description</h2>
              {product.description}
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
    </div>
  );
}

export default ProductPage;
