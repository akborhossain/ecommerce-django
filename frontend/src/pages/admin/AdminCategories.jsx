import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Form } from 'react-bootstrap'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  getAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory
} from '../../actions/adminActions'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const defaultSchemaItem = { key: '', type: 'string' }

function AdminCategories() {
  const dispatch = useDispatch()
  const { loading, categories = [], error } = useSelector(s => s.adminCategories)

  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedCat, setSelectedCat] = useState(null)
  const [name, setName] = useState('')
  const [parent, setParent] = useState('')
  const [schemaItems, setSchemaItems] = useState([defaultSchemaItem])
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    dispatch(getAdminCategories())
  }, [dispatch])

  const openCreate = () => {
    setIsEdit(false)
    setSelectedCat(null)
    setName('')
    setParent('')
    setSchemaItems([{ key: '', type: 'string' }])
    setShowModal(true)
  }

  const openEdit = (cat) => {
    setIsEdit(true)
    setSelectedCat(cat)
    setName(cat.name)
    setParent(cat.parent || '')
    
    // Parse attributes_schema dictionary into items array
    if (cat.attributes_schema && Object.keys(cat.attributes_schema).length > 0) {
      const items = Object.entries(cat.attributes_schema).map(([key, type]) => ({ key, type }))
      setSchemaItems(items)
    } else {
      setSchemaItems([{ key: '', type: 'string' }])
    }
    setShowModal(true)
  }

  const handleAddSchemaItem = () => {
    setSchemaItems([...schemaItems, { key: '', type: 'string' }])
  }

  const handleRemoveSchemaItem = (index) => {
    const items = [...schemaItems]
    items.splice(index, 1)
    setSchemaItems(items)
  }

  const handleSchemaItemChange = (index, field, value) => {
    const items = [...schemaItems]
    items[index][field] = value
    setSchemaItems(items)
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast('danger', 'Category name is required')
      return
    }

    // Convert schema items back to dictionary
    const attributes_schema = {}
    schemaItems.forEach(item => {
      if (item.key.trim()) {
        attributes_schema[item.key.trim().toLowerCase()] = item.type
      }
    })

    const payload = {
      name: name.trim(),
      parent: parent || null,
      attributes_schema
    }

    try {
      if (isEdit) {
        await dispatch(updateAdminCategory(selectedCat.id, payload))
        showToast('success', 'Category updated successfully')
      } else {
        await dispatch(createAdminCategory(payload))
        showToast('success', 'Category created successfully')
      }
      setShowModal(false)
      dispatch(getAdminCategories())
    } catch (err) {
      showToast('danger', err.message || 'Error saving category')
    }
  }

  const handleDelete = async (catId) => {
    try {
      await dispatch(deleteAdminCategory(catId))
      setDeleteConfirm(null)
      showToast('success', 'Category deleted successfully')
      dispatch(getAdminCategories())
    } catch (err) {
      showToast('danger', err.message || 'Failed to delete category')
    }
  }

  const showToast = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  const getParentName = (parentId) => {
    const parentCat = categories.find(c => c.id === parentId)
    return parentCat ? parentCat.name : '—'
  }

  return (
    <AdminLayout title="Category Management">
      {msg && (
        <div className={`alert alert-${msg.type === 'success' ? 'success' : 'danger'} d-flex align-items-center gap-2 rounded-3 mb-4`}>
          <i className={`fas ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {msg.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="rounded-4 p-4 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div>
          <h5 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Product Categories</h5>
          <p className="text-muted small mb-0">Organize your store items in category trees and specify metadata schemas.</p>
        </div>
        <button className="btn fw-semibold rounded-3 px-4" style={{ background: 'var(--primary-color)', color: '#fff' }} onClick={openCreate}>
          <i className="fas fa-plus me-2"></i>Create Category
        </button>
      </div>

      {/* Table */}
      <div className="rounded-4 overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="p-4 border-bottom">
          <h6 className="fw-bold mb-0">Categories <span className="text-muted fw-normal">({categories.length})</span></h6>
        </div>
        {loading ? <div className="p-4"><Loader /></div> : error ? <div className="p-4"><Message variant="danger">{error}</Message></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-hover mb-0" style={{ fontSize: '0.85rem' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  {['ID', 'Category Name', 'Parent Category', 'Custom Attributes Schema', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', border: 'none', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr><td colSpan={5} className="text-center p-4 text-muted">No categories found</td></tr>
                ) : categories.map(cat => (
                  <tr key={cat.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>#{cat.id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{cat.name}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{getParentName(cat.parent)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="d-flex flex-wrap gap-1">
                        {cat.attributes_schema && Object.keys(cat.attributes_schema).length > 0 ? (
                          Object.entries(cat.attributes_schema).map(([key, type]) => (
                            <span key={key} className="badge bg-light text-dark border px-2.5 py-1 rounded" style={{ fontSize: '0.72rem' }}>
                              {key}: <span className="text-secondary font-monospace" style={{ fontSize: '0.68rem' }}>{type}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-muted small">None configured</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-light rounded-3 px-2 py-1" onClick={() => openEdit(cat)} title="Edit Category">
                          <i className="fas fa-edit" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                        <button
                          className="btn btn-sm rounded-3 px-2 py-1"
                          style={{ background: '#fff1f2', color: '#ef4444', border: '1px solid #fca5a5' }}
                          onClick={() => setDeleteConfirm(cat)}
                          title="Delete Category"
                        >
                          <i className="fas fa-trash" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {isEdit ? `Edit Category: ${selectedCat?.name}` : 'Create Category'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <div className="row g-3">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-muted">Category Name</Form.Label>
                <Form.Control
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="shadow-none rounded-3"
                  placeholder="e.g. Smartwatches"
                  style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-muted">Parent Category (Optional)</Form.Label>
                <Form.Select
                  value={parent}
                  onChange={e => setParent(e.target.value)}
                  className="shadow-none rounded-3"
                  style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories
                    .filter(c => !isEdit || c.id !== selectedCat.id) // Prevent cycling
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-6 border-start">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold text-dark mb-0 small uppercase">
                  <i className="fas fa-list-ul me-1.5 text-muted"></i>Attributes Schema
                </h6>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary py-0.5 rounded-2"
                  style={{ fontSize: '0.72rem', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                  onClick={handleAddSchemaItem}
                >
                  + Add Row
                </button>
              </div>

              <div style={{ maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                {schemaItems.map((item, index) => (
                  <div key={index} className="d-flex gap-2 align-items-center mb-2">
                    <Form.Control
                      value={item.key}
                      onChange={e => handleSchemaItemChange(index, 'key', e.target.value)}
                      placeholder="e.g. ram or resolution"
                      className="shadow-none rounded-3"
                      style={{ border: '1px solid #e2e8f0', fontSize: '0.82rem' }}
                    />
                    <Form.Select
                      value={item.type}
                      onChange={e => handleSchemaItemChange(index, 'type', e.target.value)}
                      className="shadow-none rounded-3"
                      style={{ border: '1px solid #e2e8f0', fontSize: '0.82rem', maxWidth: '120px' }}
                    >
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                    </Form.Select>
                    <button
                      type="button"
                      className="btn btn-sm text-danger"
                      style={{ fontSize: '0.9rem' }}
                      onClick={() => handleRemoveSchemaItem(index)}
                      disabled={schemaItems.length === 1}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="btn btn-primary w-100 py-2.5 fw-bold rounded-3 mt-4"
            style={{ background: 'var(--primary-color)', borderColor: 'var(--primary-color)', color: '#fff', fontSize: '0.88rem' }}
            onClick={handleSubmit}>
            Save Category
          </button>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)} centered size="sm">
        <Modal.Body className="p-4 text-center">
          <div className="mb-3" style={{ fontSize: '2.5rem', color: '#ef4444' }}><i className="fas fa-exclamation-triangle"></i></div>
          <h6 className="fw-bold mb-1">Delete Category?</h6>
          <p className="text-muted small mb-4">Are you sure? Removing "{deleteConfirm?.name}" will affect catalog associations.</p>
          <div className="d-flex gap-2">
            <button className="btn btn-light flex-grow-1 rounded-3 fw-semibold" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn flex-grow-1 rounded-3 fw-semibold" style={{ background: '#ef4444', color: '#fff' }} onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
          </div>
        </Modal.Body>
      </Modal>
    </AdminLayout>
  )
}

export default AdminCategories
