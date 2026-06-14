import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Carousel, Image } from 'react-bootstrap'
import Loader from './Loader'
import Message from './Message'
import { listTopProducts } from '../actions/productActions'

function ProductCarousel() {
  const dispatch = useDispatch()

  const productTopRated = useSelector((state) => state.productTopRated)
  const { loading, error, products } = productTopRated

  useEffect(() => {
    dispatch(listTopProducts())
  }, [dispatch])

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : (
    <Carousel pause='hover' className='bg-dark rounded-4 overflow-hidden mb-4 shadow-sm'>
      {products.map((product) => (
        <Carousel.Item key={product._id}>
          <Link to={`/product/${product._id}`} className='text-decoration-none'>
            <div className="d-flex align-items-center justify-content-center p-5 position-relative" style={{ height: '380px' }}>
              <Image 
                src={product.image} 
                alt={product.name} 
                fluid 
                style={{ maxHeight: '300px', objectFit: 'contain', zIndex: 2 }} 
              />
              <Carousel.Caption className='carousel-caption d-none d-md-block text-start p-4 rounded-3' style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', left: '5%', right: 'auto', bottom: '10%', maxWidth: '400px' }}>
                <h3 className="fw-bold text-white mb-2" style={{ letterSpacing: '-0.02em', fontSize: '1.25rem' }}>{product.name}</h3>
                <p className="h5 fw-bold text-primary mb-0">${product.price}</p>
              </Carousel.Caption>
            </div>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  )
}

export default ProductCarousel
