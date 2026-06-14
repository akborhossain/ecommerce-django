import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Row, Col, Form, Button, Offcanvas, Card } from "react-bootstrap";
import Product from "../components/Product";
import Loader from '../components/Loader';
import Message from '../components/Message';
import ProductCarousel from "../components/ProductCarousel";
import CategorySidebar from "../components/CategorySidebar";
import FlashSale from "../components/FlashSale";
import { listProducts, listProductCategories } from "../actions/productActions";

function ProductSkeleton() {
  return (
    <Card className="my-3 p-3 border-0 shadow-sm rounded-4 h-100 w-100 skeleton-card">
      <div className="skeleton-image mb-3 rounded-3" style={{ height: '200px', backgroundColor: '#e2e8f0' }}></div>
      <Card.Body className="p-0">
        <div className="skeleton-text mb-2" style={{ height: '12px', width: '40%', backgroundColor: '#e2e8f0' }}></div>
        <div className="skeleton-text mb-2" style={{ height: '18px', width: '85%', backgroundColor: '#e2e8f0' }}></div>
        <div className="skeleton-text mb-3" style={{ height: '14px', width: '60%', backgroundColor: '#e2e8f0' }}></div>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div className="skeleton-text" style={{ height: '24px', width: '30%', backgroundColor: '#e2e8f0' }}></div>
          <div className="skeleton-text" style={{ height: '20px', width: '25%', backgroundColor: '#e2e8f0' }}></div>
        </div>
      </Card.Body>
    </Card>
  );
}

function HomePage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mobile drawer filter toggle state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Price range inputs state
  const [priceMinInput, setPriceMinInput] = useState(searchParams.get('min_price') || '');
  const [priceMaxInput, setPriceMaxInput] = useState(searchParams.get('max_price') || '');

  // Extract params
  const keyword = searchParams.get('keyword') || '';
  const activeCategory = searchParams.get('category') || '';

  const productList = useSelector((state) => state.productList);
  const { error, loading, products, count } = productList;

  const productCategoryList = useSelector((state) => state.productCategoryList);
  const { categories: categoriesList } = productCategoryList;

  // Sync products list whenever URL search params change
  useEffect(() => {
    dispatch(listProducts(searchParams.toString()));
  }, [dispatch, searchParams]);

  // Sync category profiles list on mount
  useEffect(() => {
    dispatch(listProductCategories());
  }, [dispatch]);

  // Generic Search Params handler
  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Always reset to page 1 on filter changes
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const applyPriceRange = () => {
    const newParams = new URLSearchParams(searchParams);
    if (priceMinInput) {
      newParams.set('min_price', priceMinInput);
    } else {
      newParams.delete('min_price');
    }
    if (priceMaxInput) {
      newParams.set('max_price', priceMaxInput);
    } else {
      newParams.delete('max_price');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setPriceMinInput('');
    setPriceMaxInput('');
    setSearchParams({});
  };

  const FilterPanel = () => {
    // Dynamically compile available specification checks based on loaded catalog attributes
    const attributeFilters = {};
    if (products && Array.isArray(products)) {
      products.forEach(p => {
        if (p.attributes && typeof p.attributes === 'object') {
          Object.entries(p.attributes).forEach(([key, val]) => {
            if (key !== 'name' && key !== 'brand' && key !== 'price' && key !== 'category' && key !== 'description') {
              if (!attributeFilters[key]) {
                attributeFilters[key] = new Set();
              }
              attributeFilters[key].add(val);
            }
          });
        }
      });
    }

    const renderCategoryTree = (parentCategoryObj) => {
      const subs = categoriesList ? categoriesList.filter(c => c.parent === parentCategoryObj.id) : [];
      const isSelected = activeCategory === parentCategoryObj.name;
      return (
        <div key={parentCategoryObj.id} className="mb-1">
          <div 
            className={`cursor-pointer small py-1 d-flex justify-content-between align-items-center ${isSelected ? 'text-primary fw-bold' : 'text-dark'}`}
            style={{ cursor: 'pointer', fontSize: '0.875rem' }}
            onClick={() => handleFilterChange('category', isSelected ? null : parentCategoryObj.name)}
          >
            <span>
              {isSelected ? <i className="fas fa-chevron-right me-2 text-primary"></i> : <i className="far fa-circle me-2 text-muted" style={{ fontSize: '0.6rem' }}></i>}
              {parentCategoryObj.name}
            </span>
          </div>
          {subs.length > 0 && (
            <div className="ms-3 border-start ps-2 mb-2">
              {subs.map(sub => renderCategoryTree(sub))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="p-3 bg-white border rounded shadow-sm">
        {/* Category Hierarchy Tree */}
        <div className="mb-4">
          <h5 className="fw-bold mb-3 small text-uppercase text-secondary" style={{ letterSpacing: '0.05em' }}>
            Category Hierarchy
          </h5>
          {categoriesList && categoriesList.length > 0 ? (
            categoriesList.filter(c => c.parent === null).map(parentCat => renderCategoryTree(parentCat))
          ) : (
            <span className="text-muted small">No categories found.</span>
          )}
        </div>

        {/* Price slider inputs */}
        <div className="mb-4 border-top pt-3">
          <h5 className="fw-bold mb-3 small text-uppercase text-secondary" style={{ letterSpacing: '0.05em' }}>
            Price Range
          </h5>
          <div className="d-flex gap-2 align-items-center mb-2">
            <Form.Control 
              type="number" 
              placeholder="Min" 
              value={priceMinInput}
              onChange={(e) => setPriceMinInput(e.target.value)}
              size="sm"
            />
            <span className="text-muted">-</span>
            <Form.Control 
              type="number" 
              placeholder="Max" 
              value={priceMaxInput}
              onChange={(e) => setPriceMaxInput(e.target.value)}
              size="sm"
            />
          </div>
          <Button variant="primary" size="sm" className="w-100 py-1.5 rounded-pill btn-primary" onClick={applyPriceRange}>
            Apply Price
          </Button>
        </div>

        {/* Specifications Filter */}
        {Object.entries(attributeFilters).length > 0 && (
          <div className="mb-4 border-top pt-3">
            <h5 className="fw-bold mb-3 small text-uppercase text-secondary" style={{ letterSpacing: '0.05em' }}>
              Specifications
            </h5>
            {Object.entries(attributeFilters).map(([key, valueSet]) => (
              <div key={key} className="mb-3">
                <div className="small fw-bold text-uppercase text-muted mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.03em' }}>
                  {key}
                </div>
                {Array.from(valueSet).map(val => {
                  const isChecked = searchParams.get(key) === val;
                  return (
                    <Form.Check 
                      key={val}
                      type="checkbox"
                      id={`attr-${key}-${val}`}
                      label={val}
                      checked={isChecked}
                      className="small text-secondary mb-1"
                      onChange={(e) => handleFilterChange(key, e.target.checked ? val : null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Clear Filters Button */}
        <Button variant="outline-danger" size="sm" className="w-100 py-1.5 rounded-pill mt-2" onClick={clearAllFilters}>
          Clear All Filters
        </Button>
      </div>
    );
  };

  const totalPages = Math.ceil(count / 12);
  const currentPage = parseInt(searchParams.get('page') || '1');

  return (
    <div>
      {/* Hide banner & slider if search or category filters are active */}
      {!keyword && !activeCategory && (
        <>
          <Row className="mb-4">
            <Col md={3} className="d-none d-md-block">
              <CategorySidebar />
            </Col>
            <Col md={9} xs={12}>
              <ProductCarousel />
            </Col>
          </Row>
          {!loading && products && <FlashSale products={products} />}
        </>
      )}

      {/* Main Browse Feed Split Layout */}
      <Row className="mt-4">
        {/* Left Filters Sidebar (Desktop) */}
        <Col md={3} className="d-none d-md-block">
          <FilterPanel />
        </Col>

        {/* Right Product Grid */}
        <Col md={9} xs={12}>
          {/* Header actions (sorting dropdown, label) */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h2 className="fw-bold m-0 text-dark" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
              {keyword ? `Search Results for "${keyword}"` : activeCategory ? `Category: ${activeCategory}` : 'Just For You'}
            </h2>
            
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted text-nowrap">Sort By:</span>
              <Form.Select 
                size="sm" 
                value={searchParams.get('sort_by') || ''} 
                onChange={(e) => handleFilterChange('sort_by', e.target.value || null)}
                className="shadow-none border-secondary text-secondary"
                style={{ width: '160px' }}
              >
                <option value="">Default (Newest)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popularity">Popularity</option>
              </Form.Select>
            </div>
          </div>

          {loading ? (
            <Row className="g-3">
              {[...Array(8)].map((_, idx) => (
                <Col key={idx} sm={12} md={6} lg={4} xl={3} className="d-flex align-items-stretch">
                  <ProductSkeleton />
                </Col>
              ))}
            </Row>
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <>
              <Row className="g-3">
                {products && products.length === 0 ? (
                  <Col xs={12}>
                    <Message variant="info">No products found matching active filters.</Message>
                  </Col>
                ) : (
                  products.map((product) => (
                    <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="d-flex align-items-stretch">
                      <Product product={product} />
                    </Col>
                  ))
                )}
              </Row>

              {/* Grid Pagination Control */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-5">
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'primary' : 'outline-primary'}
                        onClick={() => handleFilterChange('page', String(pageNum))}
                        className="px-3 py-1.5 rounded-pill border-secondary small"
                        size="sm"
                        style={{
                          backgroundColor: currentPage === pageNum ? 'var(--primary-color)' : 'transparent',
                          borderColor: currentPage === pageNum ? 'var(--primary-color)' : '#dadada',
                          color: currentPage === pageNum ? 'white' : '#757575',
                        }}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      {/* Floating Filter Button (Mobile only) */}
      <Button 
        variant="primary" 
        className="d-md-none position-fixed bottom-0 start-50 translate-middle-x mb-4 py-2 px-4 rounded-pill shadow-lg bg-primary border-primary fw-semibold"
        onClick={() => setShowMobileFilters(true)}
        style={{ zIndex: 1000, backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
      >
        <i className="fas fa-filter me-2"></i>Filter Products
      </Button>

      {/* Slide-out Offcanvas drawer (Mobile only) */}
      <Offcanvas show={showMobileFilters} onHide={() => setShowMobileFilters(false)} placement="start">
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold">Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="bg-light">
          <FilterPanel />
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}

export default HomePage;
