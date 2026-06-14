import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Form } from 'react-bootstrap'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  getAdminPermissions, createAdminPermission, updateAdminPermission, deleteAdminPermission
} from '../../actions/adminActions'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const defaultPermForm = { name: '', codename: '', category: 'general', description: '' }

function AdminPermissions() {
  const dispatch = useDispatch()
  const { loading, permissions = [], error } = useSelector(s => s.adminPermissions)

  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedPerm, setSelectedPerm] = useState(null)
  const [form, setForm] = useState(defaultPermForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    dispatch(getAdminPermissions())
  }, [dispatch])

  const openCreate = () => {
    setIsEdit(false)
    setSelectedPerm(null)
    setForm(defaultPermForm)
    setShowModal(true)
  }

  const openEdit = (perm) => {
    setIsEdit(true)
    setSelectedPerm(perm)
    setForm({
      name: perm.name,
      codename: perm.codename,
      category: perm.category || 'general',
      description: perm.description || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.codename.trim()) {
      showToast('danger', 'Name and codename are required')
      return
    }
    try {
      if (isEdit) {
        await dispatch(updateAdminPermission(selectedPerm.id, form))
        showToast('success', 'Permission updated successfully')
      } else {
        await dispatch(createAdminPermission(form))
        showToast('success', 'Permission created successfully')
      }
      setShowModal(false)
      dispatch(getAdminPermissions())
    } catch (err) {
      showToast('danger', err.message || 'Error saving permission')
    }
  }

  const handleDelete = async (permId) => {
    try {
      await dispatch(deleteAdminPermission(permId))
      setDeleteConfirm(null)
      showToast('success', 'Permission deleted successfully')
      dispatch(getAdminPermissions())
    } catch (err) {
      showToast('danger', err.message || 'Failed to delete permission')
    }
  }

  const showToast = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, p) => {
    const cat = p.category || 'general'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  const categories = Object.keys(permissionsByCategory).sort()

  return (
    <AdminLayout title="Permission Reference">
      {msg && (
        <div className={`alert alert-${msg.type === 'success' ? 'success' : 'danger'} d-flex align-items-center gap-2 rounded-3 mb-4`}>
          <i className={`fas ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {msg.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="rounded-4 p-4 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div>
          <h5 className="fw-bold mb-1" style={{ color: '#0f172a' }}>System Permissions</h5>
          <p className="text-muted small mb-0">Fine-grained access rights used to control system actions.</p>
        </div>
        <button className="btn fw-semibold rounded-3 px-4" style={{ background: 'var(--primary-color)', color: '#fff' }} onClick={openCreate}>
          <i className="fas fa-plus me-2"></i>Add Custom Permission
        </button>
      </div>

      {loading ? <Loader /> : error ? <Message variant="danger">{error}</Message> : (
        <div className="d-flex flex-column gap-4">
          {categories.length === 0 ? (
            <div className="text-center p-5 text-muted bg-white rounded-4 shadow-sm">No permissions configured in system. Run the RBAC seeder.</div>
          ) : categories.map(category => (
            <div key={category} className="rounded-4 overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div className="p-4 border-bottom d-flex align-items-center justify-content-between" style={{ background: '#f8fafc' }}>
                <h6 className="fw-bold mb-0 text-uppercase text-secondary d-flex align-items-center gap-2" style={{ fontSize: '0.82rem', letterSpacing: '0.05em' }}>
                  <i className="fas fa-folder text-muted" style={{ fontSize: '0.9rem' }}></i>
                  {category} Component Permissions
                </h6>
                <span className="badge rounded-pill bg-light text-dark border px-2.5 py-1" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  {permissionsByCategory[category].length} permission{permissionsByCategory[category].length > 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-hover mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="table-light">
                    <tr>
                      {['ID', 'Permission Name', 'Codename', 'Description', 'Active Roles', 'Direct Users', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', border: 'none' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissionsByCategory[category].map(perm => (
                      <tr key={perm.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>#{perm.id}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="fw-bold text-dark">{perm.name}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <code className="px-2 py-1 bg-light rounded text-danger" style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>{perm.codename}</code>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b', maxWidth: '300px' }}>
                          {perm.description || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span className="badge rounded-pill bg-primary-subtle text-primary px-2.5 py-1" style={{ fontSize: '0.75rem', backgroundColor: '#e8f0fe', color: '#1a73e8' }}>
                            {perm.roles_count || 0} role{perm.roles_count !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span className="badge rounded-pill bg-warning-subtle text-warning px-2.5 py-1" style={{ fontSize: '0.75rem', backgroundColor: '#fffbeb', color: '#b78103' }}>
                            {perm.direct_users_count || 0} user{perm.direct_users_count !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-light rounded-3 px-2 py-1" onClick={() => openEdit(perm)} title="Edit Permission">
                              <i className="fas fa-edit" style={{ fontSize: '0.75rem' }}></i>
                            </button>
                            <button
                              className="btn btn-sm rounded-3 px-2 py-1"
                              style={{ background: '#fff1f2', color: '#ef4444', border: '1px solid #fca5a5' }}
                              onClick={() => setDeleteConfirm(perm)}
                              title="Delete Permission"
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
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Permission Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {isEdit ? 'Edit Permission' : 'Create Custom Permission'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-muted">Permission Name</Form.Label>
            <Form.Control 
              value={form.name} 
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="shadow-none rounded-3" 
              placeholder="e.g. Can Dispatch Orders"
              style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }} 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-muted">Codename</Form.Label>
            <Form.Control 
              value={form.codename} 
              onChange={e => setForm(f => ({ ...f, codename: e.target.value }))}
              disabled={isEdit}
              className="shadow-none rounded-3" 
              placeholder="e.g. can_dispatch_orders"
              style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }} 
            />
            {isEdit && <Form.Text className="text-muted small">Codenames cannot be altered once created.</Form.Text>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-muted">Component Category</Form.Label>
            <Form.Select 
              value={form.category} 
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="shadow-none rounded-3" 
              style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
            >
              <option value="general">general (Dashboard, settings)</option>
              <option value="orders">orders (Order listings, shipment tracking)</option>
              <option value="products">products (Product catalog, stock levels)</option>
              <option value="users">users (User account configurations)</option>
              <option value="roles">roles (Roles, Permissions settings)</option>
              <option value="reports">reports (Analytics and CSV sales exporting)</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold small text-muted">Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={form.description} 
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="shadow-none rounded-3" 
              placeholder="Specify the scope of this permission..."
              style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }} 
            />
          </Form.Group>

          <button className="btn w-100 py-2.5 fw-bold rounded-3" 
            style={{ background: 'var(--primary-color)', color: '#fff', fontSize: '0.88rem' }} 
            onClick={handleSubmit}>
            Save Permission
          </button>
        </Modal.Body>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)} centered size="sm">
        <Modal.Body className="p-4 text-center">
          <div className="mb-3" style={{ fontSize: '2.5rem', color: '#ef4444' }}><i className="fas fa-exclamation-triangle"></i></div>
          <h6 className="fw-bold mb-1">Delete Permission?</h6>
          <p className="text-muted small mb-4">Deleting "{deleteConfirm?.codename}" will remove it from all roles and users.</p>
          <div className="d-flex gap-2">
            <button className="btn btn-light flex-grow-1 rounded-3 fw-semibold" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn flex-grow-1 rounded-3 fw-semibold" style={{ background: '#ef4444', color: '#fff' }} onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
          </div>
        </Modal.Body>
      </Modal>
    </AdminLayout>
  )
}

export default AdminPermissions
