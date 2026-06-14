import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Form } from 'react-bootstrap'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  getAdminRoles, createAdminRole, updateAdminRole, deleteAdminRole, getAdminPermissions
} from '../../actions/adminActions'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const defaultRoleForm = { name: '', description: '', color: '#6366f1', permission_ids: [] }

function AdminRoles() {
  const dispatch = useDispatch()
  const { loading, roles = [], error } = useSelector(s => s.adminRoles)
  const { permissions = [] } = useSelector(s => s.adminPermissions)

  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [form, setForm] = useState(defaultRoleForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    dispatch(getAdminRoles())
    dispatch(getAdminPermissions())
  }, [dispatch])

  const openCreate = () => {
    setIsEdit(false)
    setSelectedRole(null)
    setForm({ ...defaultRoleForm, permission_ids: [] })
    setShowModal(true)
  }

  const openEdit = (role) => {
    setIsEdit(true)
    setSelectedRole(role)
    setForm({
      name: role.name,
      description: role.description || '',
      color: role.color || '#6366f1',
      permission_ids: role.permissions ? role.permissions.map(p => p.id) : []
    })
    setShowModal(true)
  }

  const handleCheckboxChange = (permId, checked) => {
    setForm(f => {
      const current = [...f.permission_ids]
      if (checked) {
        if (!current.includes(permId)) current.push(permId)
      } else {
        const index = current.indexOf(permId)
        if (index > -1) current.splice(index, 1)
      }
      return { ...f, permission_ids: current }
    })
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showToast('danger', 'Role name is required')
      return
    }
    try {
      if (isEdit) {
        await dispatch(updateAdminRole(selectedRole.id, form))
        showToast('success', 'Role updated successfully')
      } else {
        await dispatch(createAdminRole(form))
        showToast('success', 'Role created successfully')
      }
      setShowModal(false)
      dispatch(getAdminRoles())
    } catch (err) {
      showToast('danger', err.message || 'Error saving role')
    }
  }

  const handleDelete = async (roleId) => {
    try {
      await dispatch(deleteAdminRole(roleId))
      setDeleteConfirm(null)
      showToast('success', 'Role deleted successfully')
      dispatch(getAdminRoles())
    } catch (err) {
      showToast('danger', err.message || 'Failed to delete role')
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

  return (
    <AdminLayout title="Role Management">
      {msg && (
        <div className={`alert alert-${msg.type === 'success' ? 'success' : 'danger'} d-flex align-items-center gap-2 rounded-3 mb-4`}>
          <i className={`fas ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {msg.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="rounded-4 p-4 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div>
          <h5 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Access Roles</h5>
          <p className="text-muted small mb-0">Define permissions and access badges for your shop staff.</p>
        </div>
        <button className="btn fw-semibold rounded-3 px-4" style={{ background: 'var(--primary-color)', color: '#fff' }} onClick={openCreate}>
          <i className="fas fa-plus me-2"></i>Create New Role
        </button>
      </div>

      {/* Grid of Roles */}
      {loading ? <Loader /> : error ? <Message variant="danger">{error}</Message> : (
        <div className="row g-4">
          {roles.length === 0 ? (
            <div className="col-12 text-center p-5 text-muted">No roles found. Seed standard roles or create a new one.</div>
          ) : roles.map(role => (
            <div key={role.id} className="col-md-6 col-xl-4">
              <div className="card rounded-4 border-0 h-100" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '5px', background: role.color || '#6366f1' }}></div>
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: role.color || '#6366f1', display: 'inline-block' }}></span>
                      {role.name}
                    </h5>
                    {role.is_system_role && (
                      <span className="badge rounded-pill px-2.5 py-1" style={{ fontSize: '0.65rem', background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', fontWeight: 600 }}>System</span>
                    )}
                  </div>
                  
                  <p className="text-muted small flex-grow-1" style={{ fontSize: '0.82rem', minHeight: '38px' }}>{role.description || 'No description provided.'}</p>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between text-muted small mb-2" style={{ fontSize: '0.78rem' }}>
                      <span>Permissions</span>
                      <span className="fw-semibold text-dark">{role.permissions?.length || 0} active</span>
                    </div>
                    <div className="d-flex flex-wrap gap-1" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                      {role.permissions && role.permissions.length > 0 ? role.permissions.map(p => (
                        <span key={p.id} className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.7rem' }}>
                          {p.name}
                        </span>
                      )) : <span className="text-muted small">None assigned</span>}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                    <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                      <i className="fas fa-users me-1"></i> {role.users_count || 0} users assigned
                    </span>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-light rounded-3 px-2.5" onClick={() => openEdit(role)} title="Edit Role">
                        <i className="fas fa-edit me-1"></i>Edit
                      </button>
                      <button
                        className="btn btn-sm rounded-3 px-2.5 text-danger border-0"
                        style={{ background: role.is_system_role ? '#f1f5f9' : '#fff1f2', color: role.is_system_role ? '#94a3b8' : '#ef4444', cursor: role.is_system_role ? 'not-allowed' : 'pointer' }}
                        onClick={() => !role.is_system_role && setDeleteConfirm(role)}
                        disabled={role.is_system_role}
                        title={role.is_system_role ? "System roles cannot be deleted" : "Delete Role"}
                      >
                        <i className="fas fa-trash me-1"></i>Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Role Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {isEdit ? `Edit Role: ${selectedRole?.name}` : 'Create New Role'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <div className="row g-3">
            <div className="col-md-7">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-muted">Role Name</Form.Label>
                <Form.Control 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  disabled={isEdit && selectedRole?.is_system_role}
                  className="shadow-none rounded-3" 
                  placeholder="e.g. Order Dispatcher"
                  style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }} 
                />
                {isEdit && selectedRole?.is_system_role && (
                  <Form.Text className="text-muted small">System role names are read-only.</Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-muted">Description</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  value={form.description} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  disabled={isEdit && selectedRole?.is_system_role}
                  className="shadow-none rounded-3" 
                  placeholder="Briefly state duties..."
                  style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }} 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-muted d-block">Role Theme Color</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control 
                    type="color" 
                    value={form.color} 
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    disabled={isEdit && selectedRole?.is_system_role}
                    style={{ width: '48px', height: '38px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '8px' }} 
                  />
                  <Form.Control 
                    type="text" 
                    value={form.color} 
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    disabled={isEdit && selectedRole?.is_system_role}
                    className="shadow-none rounded-3" 
                    style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem', maxWidth: '120px' }} 
                  />
                </div>
              </Form.Group>
            </div>

            <div className="col-md-5 border-start">
              <h6 className="fw-bold text-dark mb-2 small uppercase"><i className="fas fa-shield-alt me-1.5 text-muted"></i>Check Role Permissions</h6>
              <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '8px' }}>
                {Object.keys(permissionsByCategory).map(category => (
                  <div key={category} className="mb-3">
                    <div className="fw-bold text-uppercase text-muted border-bottom mb-2 pb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                      {category}
                    </div>
                    {permissionsByCategory[category].map(perm => (
                      <Form.Check 
                        key={perm.id} 
                        type="checkbox"
                        id={`perm-${perm.id}`}
                        label={
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{perm.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>{perm.codename}</div>
                          </div>
                        }
                        checked={form.permission_ids.includes(perm.id)}
                        onChange={e => handleCheckboxChange(perm.id, e.target.checked)}
                        className="mb-2"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="btn btn-primary w-100 py-2.5 fw-bold rounded-3 mt-4" 
            style={{ background: 'var(--primary-color)', borderColor: 'var(--primary-color)', color: '#fff', fontSize: '0.88rem' }} 
            onClick={handleSubmit}>
            Save Role Configuration
          </button>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)} centered size="sm">
        <Modal.Body className="p-4 text-center">
          <div className="mb-3" style={{ fontSize: '2.5rem', color: '#ef4444' }}><i className="fas fa-exclamation-triangle"></i></div>
          <h6 className="fw-bold mb-1">Delete Role?</h6>
          <p className="text-muted small mb-4">Users holding the role "{deleteConfirm?.name}" will lose associated privileges.</p>
          <div className="d-flex gap-2">
            <button className="btn btn-light flex-grow-1 rounded-3 fw-semibold" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn flex-grow-1 rounded-3 fw-semibold" style={{ background: '#ef4444', color: '#fff' }} onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
          </div>
        </Modal.Body>
      </Modal>
    </AdminLayout>
  )
}

export default AdminRoles
