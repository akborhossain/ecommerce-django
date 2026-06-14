import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { Nav } from 'react-bootstrap'
import Loader from './Loader'
import { listProductCategories } from '../actions/productActions'

function CategoryNav() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const productCategoryList = useSelector((state) => state.productCategoryList)
  const { loading, categories } = productCategoryList

  // Parse category parameter from URL query string
  const getCategoryFromQuery = () => {
    const params = new URLSearchParams(location.search)
    return params.get('category') || ''
  }

  const currentCategory = getCategoryFromQuery()

  useEffect(() => {
    dispatch(listProductCategories())
  }, [dispatch])

  const categoryHandler = (category) => {
    if (category) {
      navigate(`/?category=${category}`)
    } else {
      navigate('/')
    }
  }

  if (loading) return null; // Silently load category bar

  return (
    <div className="bg-white rounded-pill px-4 py-2 shadow-sm border mb-4 d-flex align-items-center overflow-auto" style={{ whiteSpace: 'nowrap', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
      <Nav className="w-100 flex-nowrap align-items-center" activeKey={currentCategory || 'all'}>
        <span className="text-muted fw-bold me-3 text-uppercase small" style={{ letterSpacing: '0.05em' }}>Categories:</span>
        <Nav.Item>
          <Nav.Link 
            eventKey="all" 
            onClick={() => categoryHandler('')}
            className={`px-3 py-1.5 rounded-pill fw-semibold me-2 transition-all small text-decoration-none ${!currentCategory ? 'bg-primary text-white' : 'text-secondary hover-bg-light'}`}
            style={{ border: 'none' }}
          >
            All Products
          </Nav.Link>
        </Nav.Item>
        {categories.map((category) => (
          <Nav.Item key={category}>
            <Nav.Link 
              eventKey={category} 
              onClick={() => categoryHandler(category)}
              className={`px-3 py-1.5 rounded-pill fw-semibold me-2 transition-all small text-decoration-none ${currentCategory === category ? 'bg-primary text-white' : 'text-secondary hover-bg-light'}`}
              style={{ border: 'none' }}
            >
              {category}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  )
}

export default CategoryNav
