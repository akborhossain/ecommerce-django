import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { ListGroup } from 'react-bootstrap'
import Loader from './Loader'
import { listProductCategories } from '../actions/productActions'

function CategorySidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const productCategoryList = useSelector((state) => state.productCategoryList)
  const { loading, categories, error } = productCategoryList

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

  // Map category names to FontAwesome icons for a premium look
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase()
    if (name.includes('electr') || name.includes('phone') || name.includes('tech') || name.includes('comput')) {
      return 'fas fa-laptop'
    }
    if (name.includes('cloth') || name.includes('fashion') || name.includes('tshirt') || name.includes('wear')) {
      return 'fas fa-tshirt'
    }
    if (name.includes('shoe') || name.includes('footwear')) {
      return 'fas fa-shoe-prints'
    }
    if (name.includes('access') || name.includes('watch') || name.includes('jewel')) {
      return 'fas fa-clock'
    }
    if (name.includes('home') || name.includes('kitchen') || name.includes('decor')) {
      return 'fas fa-home'
    }
    if (name.includes('beaut') || name.includes('cosmet') || name.includes('health')) {
      return 'fas fa-magic'
    }
    if (name.includes('toy') || name.includes('kid') || name.includes('game')) {
      return 'fas fa-gamepad'
    }
    if (name.includes('sport') || name.includes('fit') || name.includes('outdoors')) {
      return 'fas fa-running'
    }
    if (name.includes('book') || name.includes('station')) {
      return 'fas fa-book'
    }
    return 'fas fa-th-large' // Default fallback icon
  }

  if (loading) {
    return (
      <div className="category-sidebar p-3 d-flex justify-content-center">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="category-sidebar p-3 text-danger text-center small">
        Failed to load categories
      </div>
    )
  }

  return (
    <div className="category-sidebar p-2 shadow-sm bg-white">
      <div className="px-3 py-2 border-bottom mb-2">
        <span className="fw-bold text-uppercase text-secondary" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
          <i className="fas fa-bars me-2 text-primary"></i>Categories
        </span>
      </div>
      <ListGroup variant="flush">
        <ListGroup.Item
          action
          onClick={() => categoryHandler('')}
          className={`category-item border-0 d-flex align-items-center cursor-pointer ${!currentCategory ? 'bg-light text-primary fw-bold' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-shopping-bag me-3 text-secondary" style={{ width: '18px' }}></i>
          <span>All Products</span>
        </ListGroup.Item>
        
        {categories && categories.filter(c => c.parent === null).map((category) => (
          <ListGroup.Item
            key={category.id}
            action
            onClick={() => categoryHandler(category.name)}
            className={`category-item border-0 d-flex align-items-center cursor-pointer ${currentCategory === category.name ? 'bg-light text-primary fw-bold' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <i className={`${getCategoryIcon(category.name)} me-3 text-secondary`} style={{ width: '18px' }}></i>
            <span>{category.name}</span>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  )
}

export default CategorySidebar
