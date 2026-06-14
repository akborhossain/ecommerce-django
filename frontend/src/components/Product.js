import React from "react";
import { Card } from "react-bootstrap";
import Rating from './Rating'
import { Link } from 'react-router-dom'


function Product({ product }) {
  return (
    <Card className="my-3 p-3 border-0 shadow-sm rounded-4 h-100 d-flex flex-column justify-content-between product-card">
      <Link to={`/product/${product._id}`} className="text-decoration-none">
        <div className="overflow-hidden rounded-3 mb-3" style={{ height: '200px', backgroundColor: '#f8fafc' }}>
          <Card.Img 
            src={product.image} 
            className="w-100 h-100 object-fit-cover transition-transform duration-300"
            style={{ objectFit: 'contain', padding: '10px' }}
          />
        </div>
      </Link>
      <Card.Body className="p-0 d-flex flex-column justify-content-between flex-grow-1">
        <div>
          <div className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            {product.brand}
          </div>
          <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
            <Card.Title as="div" className="fw-semibold mb-2 product-card-title">
              {product.name}
            </Card.Title>
          </Link>
          <div className="mb-2">
            <Rating value={product.rating} text={`${product.numReviews} reviews`} color={'#f59e0b'} />
          </div>
        </div>
        <div className="mt-auto">
          <div className="d-flex align-items-baseline gap-2 mb-2 flex-wrap">
            <span className="h4 fw-bold mb-0 text-primary">${product.price}</span>
            <span className="original-price">${(product.price * 1.3).toFixed(2)}</span>
            <span className="discount-badge">-23%</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className={`badge px-2 py-1 rounded-pill small ${product.countInStock > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`} style={{ fontSize: '0.75rem' }}>
              {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default Product;
