import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Form } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  getAdminProducts, updateAdminProduct, deleteAdminProduct, updateProductStock, createAdminProduct
} from '../../actions/adminActions'
import { listProductCategories } from '../../actions/productActions'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const defaultForm = { name: '', brand: '', description: '', price: '', countInStock: '', category: '' }

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null

  const getPageNumbers = () => {
    const nums = []
    const maxShow = 5
    let start = Math.max(1, page - Math.floor(maxShow / 2))
    let end = Math.min(pages, start + maxShow - 1)
    if (end - start < maxShow - 1) start = Math.max(1, end - maxShow + 1)
    if (start > 1) { nums.push(1); if (start > 2) nums.push('...') }
    for (let i = start; i <= end; i++) nums.push(i)
    if (end < pages) { if (end < pages - 1) nums.push('...'); nums.push(pages) }
    return nums
  }

  return (
    <div className="d-flex align-items-center justify-content-between p-3 border-top" style={{ background: '#fafbfc' }}>
      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
        Page {page} of {pages}
      </div>
      <div className="d-flex gap-1">
        <button
          className="btn btn-sm btn-light rounded-2"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={{ fontSize: '0.78rem', padding: '4px 10px' }}
        >
          <i className="fas fa-chevron-left" style={{ fontSize: '0.65rem' }}></i>
        </button>
        {getPageNumbers().map((num, i) => (
          num === '...' ? (
            <span key={`dots-${i}`} className="px-2 d-flex align-items-center" style={{ fontSize: '0.78rem', color: '#94a3b8' }}>…</span>
          ) : (
            <button
              key={num}
              className={`btn btn-sm rounded-2 ${num === page ? '' : 'btn-light'}`}
              onClick={() => onPageChange(num)}
              style={{
                fontSize: '0.78rem', padding: '4px 10px', minWidth: '32px',
                ...(num === page ? { background: 'var(--primary-color)', color: '#fff', fontWeight: 700 } : {})
              }}
            >
              {num}
            </button>
          )
        ))}
        <button
          className="btn btn-sm btn-light rounded-2"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          style={{ fontSize: '0.78rem', padding: '4px 10px' }}
        >
          <i className="fas fa-chevron-right" style={{ fontSize: '0.65rem' }}></i>
        </button>
      </div>
    </div>
  )
}

function AdminProducts() {
  const dispatch = useDispatch()
  const location = useLocation()
  const isStockPage = location.pathname.endsWith('/stock')

  const { loading, products = [], page = 1, pages = 1, count = 0, error } = useSelector(s => s.adminProducts)
  const { categories = [] } = useSelector(s => s.productCategoryList)

  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(isStockPage)
  const [currentPage, setCurrentPage] = useState(1)
  const [showEdit, setShowEdit] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showStock, setShowStock] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [stockVal, setStockVal] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    dispatch(getAdminProducts({ q: search, low_stock: lowStockOnly ? 'true' : '', page: currentPage }))
    dispatch(listProductCategories())
  }, [dispatch, search, lowStockOnly, currentPage])

  useEffect(() => {
    setLowStockOnly(location.pathname.endsWith('/stock'))
  }, [location.pathname])

  const openEdit = (p) => {
    setSelected(p)
    setImageFile(null)
    setForm({
      name: p.name || '',
      brand: p.brand || '',
      description: p.description || '',
      price: p.price || '',
      countInStock: p.countInStock || '',
      category: p.category_details?.id || ''
    })
    setShowEdit(true)
  }

  const openStock = (p) => { setSelected(p); setStockVal(String(p.countInStock)); setShowStock(true) }

  const openCreate = () => {
    setForm(defaultForm)
    setImageFile(null)
    setShowCreate(true)
  }

  const handleUpdate = async () => {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (imageFile) {
      fd.append('image', imageFile)
    }
    await dispatch(updateAdminProduct(selected._id, fd))
    setShowEdit(false)
    dispatch(getAdminProducts({ q: search, page: currentPage }))
    setMsg({ type: 'success', text: 'Product updated successfully' })
    setTimeout(() => setMsg(null), 3000)
  }

  const handleCreate = async () => {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (imageFile) {
      fd.append('image', imageFile)
    }
    await dispatch(createAdminProduct(fd))
    setShowCreate(false)
    dispatch(getAdminProducts({ page: 1 }))
    setCurrentPage(1)
    setMsg({ type: 'success', text: 'Product created successfully' })
    setTimeout(() => setMsg(null), 3000)
  }

  const handleDelete = async (id) => {
    await dispatch(deleteAdminProduct(id))
    setDeleteConfirm(null)
    setMsg({ type: 'success', text: 'Product deleted' })
    setTimeout(() => setMsg(null), 3000)
  }

  const handleStockUpdate = async () => {
    await dispatch(updateProductStock(selected._id, parseInt(stockVal)))
    setShowStock(false)
    setMsg({ type: 'success', text: `Stock updated to ${stockVal}` })
    setTimeout(() => setMsg(null), 3000)
  }

  const handlePageChange = (p) => setCurrentPage(p)

  const stockColor = (stock) => {
    if (stock === 0) return { bg: '#fff1f2', color: '#ef4444', text: 'Out of Stock' }
    if (stock <= 5) return { bg: '#fffbeb', color: '#d97706', text: 'Low Stock' }
    return { bg: '#f0fff4', color: '#16a34a', text: 'In Stock' }
  }

  return (
    <AdminLayout title="Product Management">
      {msg && (
        <div className={`alert alert-${msg.type === 'success' ? 'success' : 'danger'} d-flex align-items-center gap-2 rounded-3 mb-4`}>
          <i className={`fas ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {msg.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="rounded-4 p-4 mb-4 d-flex gap-3 align-items-end flex-wrap" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#64748b' }}>Search Products</label>
          <div className="position-relative">
            <i className="fas fa-search position-absolute text-muted" style={{ top: '11px', left: '12px', fontSize: '0.85rem' }}></i>
            <input type="text" className="form-control shadow-none ps-4 rounded-3"
              placeholder="Product name or brand..."
              value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
              style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
          </div>
        </div>
        <div>
          <Form.Check type="switch" id="low-stock-toggle" label={<span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Low Stock Only</span>}
            checked={lowStockOnly} onChange={e => { setLowStockOnly(e.target.checked); setCurrentPage(1) }} />
        </div>
        <button className="btn fw-semibold rounded-3 px-4" style={{ background: 'var(--primary-color)', color: '#fff', whiteSpace: 'nowrap' }} onClick={openCreate}>
          <i className="fas fa-plus me-2"></i>Add Product
        </button>
      </div>

      {/* Table */}
      <div className="rounded-4 overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="p-4 border-bottom">
          <h6 className="fw-bold mb-0">Products <span className="text-muted fw-normal">({count})</span></h6>
        </div>
        {loading ? <div className="p-4"><Loader /></div> : error ? <div className="p-4"><Message variant="danger">{error}</Message></div> : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-hover mb-0" style={{ fontSize: '0.85rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    {['Image', 'Name', 'Category', 'Brand', 'Price', 'Stock', 'Rating', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', border: 'none', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={8} className="text-center p-4 text-muted">No products found</td></tr>
                  ) : products.map(p => {
                    const sc = stockColor(p.countInStock)
                    return (
                      <tr key={p._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <img src={p.image || '/static/placeholder.png'} alt={p.name}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </td>
                        <td style={{ padding: '12px 16px', maxWidth: '180px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{p.category_details?.name || p.category || '—'}</td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{p.brand || '—'}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>${Number(p.price || 0).toFixed(2)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ background: sc.bg, color: sc.color, padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{p.countInStock}</span>
                            <button
                              onClick={() => openStock(p)}
                              className="btn btn-sm btn-light rounded-2 p-1"
                              title="Update Stock"
                              style={{ fontSize: '0.7rem', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <i className="fas fa-pen" style={{ fontSize: '0.6rem' }}></i>
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#f59e0b' }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i key={i} className={i < Math.floor(p.rating) ? 'fas fa-star' : 'far fa-star'} style={{ fontSize: '0.7rem' }}></i>
                          ))}
                          <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>({p.numReviews})</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-light rounded-3 px-2 py-1" onClick={() => openEdit(p)} title="Edit">
                              <i className="fas fa-edit" style={{ fontSize: '0.75rem' }}></i>
                            </button>
                            <button
                              className="btn btn-sm rounded-3 px-2 py-1"
                              style={{ background: '#fff1f2', color: '#ef4444', border: '1px solid #fca5a5' }}
                              onClick={() => setDeleteConfirm(p)}
                              title="Delete"
                            >
                              <i className="fas fa-trash" style={{ fontSize: '0.75rem' }}></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
          </>
        )}
      </div>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700 }}>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          {['name', 'brand', 'price', 'countInStock'].map(field => (
            <Form.Group key={field} className="mb-3">
              <Form.Label className="fw-semibold small text-muted text-capitalize">{field.replace(/([A-Z])/g, ' $1')}</Form.Label>
              <Form.Control value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                type={['price', 'countInStock'].includes(field) ? 'number' : 'text'}
                className="shadow-none rounded-3" style={{ border: '1px solid #e2e8f0' }} />
            </Form.Group>
          ))}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-muted">Category</Form.Label>
            <Form.Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="shadow-none rounded-3" style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
              <option value="">Select Category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-muted">Product Image File</Form.Label>
            <Form.Control type="file" onChange={e => setImageFile(e.target.files[0])}
              className="shadow-none rounded-3" style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
            {selected?.image && (
              <Form.Text className="text-muted d-block mt-1">Current: {selected.image.substring(selected.image.lastIndexOf('/') + 1)}</Form.Text>
            )}
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold small text-muted">Description</Form.Label>
            <Form.Control as="textarea" rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="shadow-none rounded-3" style={{ border: '1px solid #e2e8f0' }} />
          </Form.Group>
          <button className="btn w-100 py-2 fw-bold rounded-3" style={{ background: 'var(--primary-color)', color: '#fff' }} onClick={handleUpdate}>
            Save Changes
          </button>
        </Modal.Body>
      </Modal>

      {/* Create Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          {['name', 'brand', 'price', 'countInStock'].map(field => (
            <Form.Group key={field} className="mb-3">
              <Form.Label className="fw-semibold small text-muted text-capitalize">{field.replace(/([A-Z])/g, ' $1')}</Form.Label>
              <Form.Control value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                type={['price', 'countInStock'].includes(field) ? 'number' : 'text'}
                className="shadow-none rounded-3" style={{ border: '1px solid #e2e8f0' }} />
            </Form.Group>
          ))}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-muted">Category</Form.Label>
            <Form.Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="shadow-none rounded-3" style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
              <option value="">Select Category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-muted">Product Image File</Form.Label>
            <Form.Control type="file" onChange={e => setImageFile(e.target.files[0])}
              className="shadow-none rounded-3" style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold small text-muted">Description</Form.Label>
            <Form.Control as="textarea" rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="shadow-none rounded-3" style={{ border: '1px solid #e2e8f0' }} />
          </Form.Group>
          <button className="btn w-100 py-2 fw-bold rounded-3" style={{ background: 'var(--primary-color)', color: '#fff' }} onClick={handleCreate}>
            Create Product
          </button>
        </Modal.Body>
      </Modal>

      {/* Stock Modal */}
      <Modal show={showStock} onHide={() => setShowStock(false)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ fontSize: '1rem', fontWeight: 700 }}>Update Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <div className="text-muted small mb-3">{selected?.name}</div>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold small text-muted">New Stock Quantity</Form.Label>
            <Form.Control type="number" min="0" value={stockVal} onChange={e => setStockVal(e.target.value)}
              className="shadow-none rounded-3" style={{ border: '1px solid #e2e8f0' }} />
          </Form.Group>
          <button className="btn w-100 py-2 fw-bold rounded-3" style={{ background: 'var(--primary-color)', color: '#fff' }} onClick={handleStockUpdate}>
            Update Stock
          </button>
        </Modal.Body>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)} centered size="sm">
        <Modal.Body className="p-4 text-center">
          <div className="mb-3" style={{ fontSize: '2.5rem', color: '#ef4444' }}><i className="fas fa-exclamation-triangle"></i></div>
          <h6 className="fw-bold mb-1">Delete Product?</h6>
          <p className="text-muted small mb-4">"{deleteConfirm?.name}" will be permanently removed.</p>
          <div className="d-flex gap-2">
            <button className="btn btn-light flex-grow-1 rounded-3 fw-semibold" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn flex-grow-1 rounded-3 fw-semibold" style={{ background: '#ef4444', color: '#fff' }} onClick={() => handleDelete(deleteConfirm._id)}>Delete</button>
          </div>
        </Modal.Body>
      </Modal>
    </AdminLayout>
  )
}

export default AdminProducts
