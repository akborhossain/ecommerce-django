import React, { useState, useEffect } from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function FlashSale({ products }) {
  const [timeRemaining, setTimeRemaining] = useState({ hours: '00', minutes: '00', seconds: '00' })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const difference = midnight - now

      let hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      let minutes = Math.floor((difference / 1000 / 60) % 60)
      let seconds = Math.floor((difference / 1000) % 60)

      setTimeRemaining({
        hours: hours < 10 ? `0${hours}` : String(hours),
        minutes: minutes < 10 ? `0${minutes}` : String(minutes),
        seconds: seconds < 10 ? `0${seconds}` : String(seconds),
      })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [])

  // If no products, render nothing
  if (!products || products.length === 0) return null

  // Take first 4 items for the flash sale
  const flashSaleProducts = products.slice(0, 4)

  return (
    <div className="flash-sale-box my-4 shadow-sm bg-white">
      {/* Flash Sale Header */}
      <div className="flash-sale-header d-flex justify-content-between align-items-center px-4 py-3 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <h3 className="m-0 text-primary fw-bold" style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
            <i className="fas fa-bolt me-2 animate-bounce"></i>FLASH SALE
          </h3>
          <div className="d-flex align-items-center gap-1.5 small text-secondary fw-semibold ms-2">
            <span className="me-2 text-dark">Ending in:</span>
            <span className="timer-unit">{timeRemaining.hours}</span>
            <span className="timer-separator">:</span>
            <span className="timer-unit">{timeRemaining.minutes}</span>
            <span className="timer-separator">:</span>
            <span className="timer-unit">{timeRemaining.seconds}</span>
          </div>
        </div>
        <Link to="/" className="btn btn-outline-primary py-1 px-3 rounded-pill text-decoration-none small" style={{ fontSize: '0.8rem' }}>
          SHOP MORE
        </Link>
      </div>

      {/* Flash Sale Items Grid */}
      <div className="p-3 bg-light">
        <Row className="g-3">
          {flashSaleProducts.map((product, index) => {
            // Calculate mock discount details (30% discount)
            const currentPrice = Number(product.price)
            const originalPrice = (currentPrice * 1.3).toFixed(2)
            const discountPercentage = 23 // 30% discount translates to 23% off actual vs original (1 / 1.3 = 0.77 -> 23% off)
            
            // Mock stock calculations based on product ID
            const prodId = product._id || index
            const totalStock = 20
            const soldCount = (prodId * 3) % 12 + 5
            const leftCount = totalStock - soldCount
            const percentSold = (soldCount / totalStock) * 100

            return (
              <Col key={product._id} xs={6} md={3}>
                <Card className="product-card h-100 border-0 shadow-sm rounded overflow-hidden position-relative">
                  {/* Floating Discount Badge */}
                  <div className="position-absolute top-0 start-0 m-2 z-index-1">
                    <span className="badge bg-danger rounded-pill px-2 py-1 small">
                      -{discountPercentage}%
                    </span>
                  </div>

                  {/* Product Image */}
                  <Link to={`/product/${product._id}`}>
                    <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#fff' }} className="d-flex align-items-center justify-content-center p-3">
                      <Card.Img 
                        variant="top" 
                        src={product.image} 
                        className="img-fluid max-h-100" 
                        style={{ maxHeight: '100%', width: 'auto', objectFit: 'contain', transition: 'transform 0.3s ease' }} 
                      />
                    </div>
                  </Link>

                  {/* Product Content */}
                  <Card.Body className="p-3 d-flex flex-column bg-white">
                    <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
                      <Card.Title className="product-card-title mb-2 text-truncate-2 small fw-semibold">
                        {product.name}
                      </Card.Title>
                    </Link>

                    {/* Price and Strikethrough */}
                    <div className="mb-2">
                      <span className="text-primary fw-bold fs-5 me-2">${currentPrice.toFixed(2)}</span>
                      <span className="text-muted text-decoration-line-through small">${originalPrice}</span>
                    </div>

                    {/* Stock level bar */}
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                        <span>{leftCount} left</span>
                        <span>{soldCount} sold</span>
                      </div>
                      <div className="stock-bar w-100">
                        <div 
                          className="stock-bar-fill" 
                          style={{ width: `${percentSold}%` }}
                        ></div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )
          })}
        </Row>
      </div>
    </div>
  )
}

export default FlashSale
