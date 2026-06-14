import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Form } from 'react-bootstrap'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  getAdminUsers, updateAdminUser, getAdminRoles, getAdminPermissions,
  assignRoleToUser, removeRoleFromUser, assignPermissionToUser, removePermissionFromUser
} from '../../actions/adminActions'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

function AdminUsers() {
  const dispatch = useDispatch()
  const { loading, users = [], error } = useSelector(s => s.adminUsers)
  const { roles = [] } = useSelector(s => s.adminRoles)
  const { permissions = [] } = useSelector(s => s.adminPermissions)

  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', is_active: true, is_staff: false })
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    dispatch(getAdminUsers({ q: search }))
    dispatch(getAdminRoles())
    dispatch(getAdminPermissions())
  }, [dispatch, search])

  const openModal = (user) => {
    setSelectedUser(user)
    setForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      is_active: user.is_active,
      is_staff: user.is_staff
    })
    setShowModal(true)
  }

  const handleUpdateUser = async () => {
    try {
      await dispatch(updateAdminUser(selectedUser.id, form))
      setShowModal(false)
      dispatch(getAdminUsers({ q: search }))
      showToast('success', 'User status updated successfully')
    } catch (err) {
      showToast('danger', err.message || 'Error updating user')
    }
  }

  const showToast = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  const handleAddRole = async (roleId) => {
    if (!roleId) return
    try {
      await dispatch(assignRoleToUser(selectedUser.id, roleId))
      // Refetch full users data to reflect role changes
      const updatedUsers = await dispatch(getAdminUsers({ q: search }))
      // Update selectedUser state from refetched list
      const u = (updatedUsers || users).find(x => x.id === selectedUser.id)
      if (u) setSelectedUser(u)
      showToast('success', 'Role added successfully')
    } catch (err) {
      showToast('danger', 'Failed to add role')
    }
  }

  const handleRemoveRole = async (roleId) => {
    try {
      await dispatch(removeRoleFromUser(selectedUser.id, roleId))
      const updatedUsers = await dispatch(getAdminUsers({ q: search }))
      const u = (updatedUsers || users).find(x => x.id === selectedUser.id)
      if (u) setSelectedUser(u)
      showToast('success', 'Role removed successfully')
    } catch (err) {
      showToast('danger', 'Failed to remove role')
    }
  }

  const handleAddPermission = async (permId) => {
    if (!permId) return
    try {
      await dispatch(assignPermissionToUser(selectedUser.id, permId))
      const updatedUsers = await dispatch(getAdminUsers({ q: search }))
      const u = (updatedUsers || users).find(x => x.id === selectedUser.id)
      if (u) setSelectedUser(u)
      showToast('success', 'Direct permission assigned')
    } catch (err) {
      showToast('danger', 'Failed to assign permission')
    }
  }

  const handleRemovePermission = async (permId) => {
    try {
      await dispatch(removePermissionFromUser(selectedUser.id, permId))
      const updatedUsers = await dispatch(getAdminUsers({ q: search }))
      const u = (updatedUsers || users).find(x => x.id === selectedUser.id)
      if (u) setSelectedUser(u)
      showToast('success', 'Direct permission revoked')
    } catch (err) {
      showToast('danger', 'Failed to revoke permission')
    }
  }

  return (
    <AdminLayout title="User Management">
      {msg && (
        <div className={`alert alert-${msg.type === 'success' ? 'success' : 'danger'} d-flex align-items-center gap-2 rounded-3 mb-4`}>
          <i className={`fas ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {msg.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="rounded-4 p-4 mb-4 d-flex gap-3 align-items-end flex-wrap" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#64748b' }}>Search Users</label>
          <div className="position-relative">
            <i className="fas fa-search position-absolute text-muted" style={{ top: '11px', left: '12px', fontSize: '0.85rem' }}></i>
            <input type="text" className="form-control shadow-none ps-4 rounded-3"
              placeholder="Search by name, username, or email..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-4 overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="p-4 border-bottom">
          <h6 className="fw-bold mb-0">Users <span className="text-muted fw-normal">({users.length})</span></h6>
        </div>
        {loading ? <div className="p-4"><Loader /></div> : error ? <div className="p-4"><Message variant="danger">{error}</Message></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-hover mb-0" style={{ fontSize: '0.85rem' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  {['ID', 'Name', 'Username / Email', 'Status', 'Staff/Super', 'Roles', 'Direct Perms', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', border: 'none', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={8} className="text-center p-4 text-muted">No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>#{u.id}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="fw-bold text-dark">{u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : '—'}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="fw-semibold text-dark">{u.username}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge rounded-pill px-2.5 py-1 ${u.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}
                            style={{ fontSize: '0.72rem', fontWeight: 600, backgroundColor: u.is_active ? '#e6f4ea' : '#fce8e6', color: u.is_active ? '#137333' : '#c5221f' }}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.is_superuser ? (
                        <span className="badge bg-danger-subtle text-danger rounded-pill px-2.5 py-1 me-1" style={{ fontSize: '0.72rem', fontWeight: 600, backgroundColor: '#fce8e6', color: '#c5221f' }}>Superuser</span>
                      ) : null}
                      {u.is_staff ? (
                        <span className="badge bg-info-subtle text-info rounded-pill px-2.5 py-1" style={{ fontSize: '0.72rem', fontWeight: 600, backgroundColor: '#e8f0fe', color: '#1a73e8' }}>Staff</span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>Regular User</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="d-flex flex-wrap gap-1">
                        {u.roles && u.roles.length > 0 ? u.roles.map(ur => (
                          <span key={ur.id} className="badge text-white rounded-pill px-2 py-1" style={{ backgroundColor: ur.role.color || '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>
                            {ur.role.name}
                          </span>
                        )) : <span className="text-muted small">None</span>}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span className="badge rounded-circle bg-light text-dark p-2 border" style={{ fontSize: '0.75rem', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {u.direct_permissions ? u.direct_permissions.length : 0}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button className="btn btn-sm btn-light rounded-3 px-3 py-1 fw-bold text-dark border" onClick={() => openModal(u)}>
                        <i className="fas fa-user-shield me-1.5" style={{ color: 'var(--primary-color)' }}></i>Manage Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Manage Access Modal */}
      {selectedUser && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700 }}>Manage Access: <span style={{ color: 'var(--primary-color)' }}>{selectedUser.username}</span></Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pb-4">
            <div className="row g-4">
              {/* User basic attributes */}
              <div className="col-md-6 border-end">
                <h6 className="fw-bold mb-3 text-dark border-bottom pb-2"><i className="fas fa-user me-2 text-muted"></i>Account Details</h6>
                
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-muted">First Name</Form.Label>
                  <Form.Control value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                    className="shadow-none rounded-3" style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-muted">Last Name</Form.Label>
                  <Form.Control value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                    className="shadow-none rounded-3" style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-muted">Email Address</Form.Label>
                  <Form.Control type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="shadow-none rounded-3" style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
                </Form.Group>

                <div className="d-flex gap-4 mt-4">
                  <Form.Check type="switch" id="user-active-toggle" 
                    label={<span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Is Active</span>}
                    checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />

                  <Form.Check type="switch" id="user-staff-toggle" 
                    label={<span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Is Staff (Admin Access)</span>}
                    checked={form.is_staff} onChange={e => setForm(f => ({ ...f, is_staff: e.target.checked }))} />
                </div>

                <button className="btn btn-primary w-100 py-2.5 fw-bold rounded-3 mt-4" 
                  style={{ background: 'var(--primary-color)', borderColor: 'var(--primary-color)', color: '#fff', fontSize: '0.88rem' }} 
                  onClick={handleUpdateUser}>
                  Save Profile Changes
                </button>
              </div>

              {/* Roles & Permissions */}
              <div className="col-md-6">
                {/* Section: Roles */}
                <h6 className="fw-bold mb-3 text-dark border-bottom pb-2"><i className="fas fa-user-tag me-2 text-muted"></i>Assigned Roles</h6>
                <div className="d-flex flex-wrap gap-1.5 mb-3">
                  {selectedUser.roles && selectedUser.roles.length > 0 ? selectedUser.roles.map(ur => (
                    <span key={ur.id} className="badge d-inline-flex align-items-center gap-1.5 text-white rounded-pill px-2.5 py-1.5" 
                      style={{ backgroundColor: ur.role.color || '#64748b', fontSize: '0.78rem' }}>
                      {ur.role.name}
                      <i className="fas fa-times-circle cursor-pointer ms-1 hover-opacity" style={{ cursor: 'pointer' }} onClick={() => handleRemoveRole(ur.role.id)} title="Remove role"></i>
                    </span>
                  )) : <div className="text-muted small">No roles assigned. User holds default staff or standard permissions.</div>}
                </div>

                {/* Dropdown to add role */}
                <div className="mb-4">
                  <Form.Select className="shadow-none rounded-3" style={{ border: '1px solid #e2e8f0', fontSize: '0.82rem' }}
                    value="" onChange={e => handleAddRole(e.target.value)}>
                    <option value="">+ Add Role...</option>
                    {roles.filter(r => !selectedUser.roles?.some(ur => ur.role.id === r.id)).map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </Form.Select>
                </div>

                {/* Section: Direct Permissions */}
                <h6 className="fw-bold mb-3 text-dark border-bottom pb-2"><i className="fas fa-key me-2 text-muted"></i>Direct Permissions</h6>
                <div className="d-flex flex-wrap gap-1.5 mb-3" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {selectedUser.direct_permissions && selectedUser.direct_permissions.length > 0 ? selectedUser.direct_permissions.map(dp => (
                    <span key={dp.id} className="badge bg-light text-dark border d-inline-flex align-items-center gap-1.5 rounded-pill px-2.5 py-1.5" 
                      style={{ fontSize: '0.75rem' }}>
                      {dp.permission.name}
                      <i className="fas fa-times-circle text-danger ms-1" style={{ cursor: 'pointer' }} onClick={() => handleRemovePermission(dp.permission.id)} title="Revoke permission"></i>
                    </span>
                  )) : <div className="text-muted small w-100">No direct permissions. Access governed by roles only.</div>}
                </div>

                {/* Dropdown to add permission */}
                <div>
                  <Form.Select className="shadow-none rounded-3" style={{ border: '1px solid #e2e8f0', fontSize: '0.82rem' }}
                    value="" onChange={e => handleAddPermission(e.target.value)}>
                    <option value="">+ Assign Direct Permission...</option>
                    {permissions.filter(p => !selectedUser.direct_permissions?.some(dp => dp.permission.id === p.id)).map(p => (
                      <option key={p.id} value={p.id}>{p.category} › {p.name} ({p.codename})</option>
                    ))}
                  </Form.Select>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </AdminLayout>
  )
}

export default AdminUsers
