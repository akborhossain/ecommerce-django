import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Button, Form, Badge, ListGroup } from 'react-bootstrap'
import axios from 'axios'
import AdminLayout from '../../components/admin/AdminLayout'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const StatusBadge = ({ status }) => {
  const configs = {
    pending: { bg: '#fffbeb', color: '#d97706', border: '#fcd34d', label: 'Requested' },
    approved: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Approved' },
    rejected: { bg: '#fef2f2', color: '#ef4444', border: '#fca5a5', label: 'Rejected' },
    completed: { bg: '#f0fff4', color: '#16a34a', border: '#86efac', label: 'Refunded' },
  }
  const cfg = configs[status] || { bg: '#f4f4f5', color: '#71717a', border: '#e4e4e7', label: status }
  return (
    <span className="badge rounded-pill fw-semibold" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: '6px 12px' }}>
      {cfg.label}
    </span>
  )
}

const REASON_LABELS = {
  defective: 'Defective / Damaged product',
  wrong_item: 'Received wrong item',
  size_fit: 'Size or fit issue',
  unsatisfied: 'Not as expected / unsatisfied',
  other: 'Other reason',
}

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
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="btn btn-sm btn-light border"
          style={{ fontSize: '0.75rem', borderRadius: '6px' }}
        >
          Previous
        </button>
        {getPageNumbers().map((n, idx) => (
          <button
            key={idx}
            disabled={n === '...'}
            onClick={() => n !== '...' && onPageChange(n)}
            className={`btn btn-sm ${n === page ? 'btn-primary' : 'btn-light border'}`}
            style={{ fontSize: '0.75rem', minWidth: '28px', borderRadius: '6px' }}
          >
            {n}
          </button>
        ))}
        <button
          disabled={page === pages}
          onClick={() => onPageChange(page + 1)}
          className="btn btn-sm btn-light border"
          style={{ fontSize: '0.75rem', borderRadius: '6px' }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

function AdminReturns() {
  const dispatch = useDispatch()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [returns, setReturns] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [count, setCount] = useState(0)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [triggerFetch, setTriggerFetch] = useState(0)

  // Modal details
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [adminComment, setAdminComment] = useState('')
  const [submittingAction, setSubmittingAction] = useState(false)
  const [actionError, setActionError] = useState('')

  const { userInfo } = useSelector(state => state.userLogin)

  const getReturnsList = async () => {
    try {
      setLoading(true)
      setError('')
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      }
      const params = new URLSearchParams({
        page,
        status: statusFilter,
        q: search
      }).toString()

      const { data } = await axios.get(`/admin-panel/returns/?${params}`, config)
      setReturns(data.data || [])
      setPage(data.page || 1)
      setPages(data.pages || 1)
      setCount(data.count || 0)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.detail || err.message || 'Failed to fetch return requests')
    }
  }

  useEffect(() => {
    if (userInfo) {
      getReturnsList()
    }
  }, [userInfo, page, statusFilter, triggerFetch])

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    setTriggerFetch(t => t + 1)
  }

  const handleStatusTabClick = (status) => {
    setStatusFilter(status)
    setPage(1)
  }

  const openDetailModal = (ret) => {
    setSelectedReturn(ret)
    setAdminComment(ret.admin_comment || '')
    setActionError('')
    setShowDetailModal(true)
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      setSubmittingAction(true)
      setActionError('')
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        }
      }
      const { data } = await axios.put(
        `/admin-panel/returns/${selectedReturn._id}/`,
        {
          status: newStatus,
          admin_comment: adminComment
        },
        config
      )
      setSubmittingAction(false)
      setShowDetailModal(false)
      getReturnsList()
    } catch (err) {
      setSubmittingAction(false)
      setActionError(err.response?.data?.detail || err.message || 'Failed to update return request')
    }
  }

  const filterTabs = [
    { value: '', label: 'All Requests' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
  ]

  return (
    <AdminLayout title="Return Requests Manager">
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        {/* Header / Search bar */}
        <div className="p-4 border-bottom bg-white">
          <Form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
            <div className="col-md-6 col-lg-8">
              <Form.Group className="position-relative mb-0">
                <i className="fas fa-search position-absolute text-muted" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }}></i>
                <Form.Control
                  type="text"
                  placeholder="Search by ID, Order ID, Customer Name or Email..."
                  value={search}
                  onChange={handleSearchChange}
                  style={{ paddingLeft: '44px', borderRadius: '10px' }}
                />
              </Form.Group>
            </div>
            <div className="col-md-3 col-lg-2">
              <Button type="submit" variant="primary" className="w-100 rounded-3" style={{ height: '40px' }}>
                Search
              </Button>
            </div>
            <div className="col-md-3 col-lg-2">
              <Button
                variant="light"
                className="w-100 border rounded-3"
                style={{ height: '40px' }}
                onClick={() => { setSearch(''); setStatusFilter(''); setPage(1); setTriggerFetch(t => t + 1) }}
              >
                Reset
              </Button>
            </div>
          </Form>
        </div>

        {/* Status Filter Tabs */}
        <div className="px-4 py-2 border-bottom bg-light bg-opacity-50 d-flex gap-2 overflow-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleStatusTabClick(tab.value)}
              className="btn btn-sm px-3 py-1.5 fw-semibold border-0 text-nowrap rounded-3"
              style={{
                background: statusFilter === tab.value ? 'var(--primary-color)' : 'transparent',
                color: statusFilter === tab.value ? '#fff' : '#64748b',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Table */}
        <div className="table-responsive">
          {loading ? (
            <div className="p-5 text-center"><Loader /></div>
          ) : error ? (
            <div className="p-4"><Message variant="danger">{error}</Message></div>
          ) : returns.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <i className="fas fa-undo mb-3" style={{ fontSize: '2rem' }}></i>
              <div>No return requests found</div>
            </div>
          ) : (
            <table className="table table-hover align-middle mb-0" style={{ minWidth: '900px' }}>
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th className="px-4 py-3">Return ID</th>
                  <th className="py-3">Order ID</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Reason</th>
                  <th className="py-3">Submitted</th>
                  <th className="py-3 text-center">Status</th>
                  <th className="py-3 text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((ret) => (
                  <tr key={ret._id}>
                    <td className="px-4 py-3 fw-bold">#{ret._id}</td>
                    <td className="py-3">
                      <a href={`/admin-panel/orders?q=${ret.order}`} className="text-decoration-none fw-semibold">
                        Order #{ret.order}
                      </a>
                    </td>
                    <td className="py-3">
                      <div className="fw-semibold text-dark">{ret.customer_name}</div>
                      <div className="text-muted small">{ret.customer_email}</div>
                    </td>
                    <td className="py-3">
                      <span className="fw-medium text-dark">{ret.reason_display}</span>
                    </td>
                    <td className="py-3 text-muted small">
                      {new Date(ret.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-center">
                      <StatusBadge status={ret.status} />
                    </td>
                    <td className="py-3 text-end px-4">
                      <Button
                        variant="light"
                        className="btn-sm border fw-bold rounded-3"
                        onClick={() => openDetailModal(ret)}
                      >
                        Review Request
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <Pagination page={page} pages={pages} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Review Detail Modal */}
      {selectedReturn && (
        <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold text-dark">
              Review Return Request #{selectedReturn._id}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            {actionError && <Message variant="danger">{actionError}</Message>}

            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="p-3 bg-light rounded-4 h-100">
                  <div className="text-muted small fw-semibold text-uppercase mb-2">Request Details</div>
                  <div className="mb-2">
                    <span className="small text-muted d-block">Associated Order</span>
                    <strong className="text-dark">Order #{selectedReturn.order}</strong>
                  </div>
                  <div className="mb-2">
                    <span className="small text-muted d-block">Return Reason</span>
                    <strong className="text-dark">{selectedReturn.reason_display}</strong>
                  </div>
                  {selectedReturn.reason_detail && (
                    <div className="mb-2">
                      <span className="small text-muted d-block">Customer Comments</span>
                      <p className="small text-dark mb-0 bg-white p-2 rounded border">{selectedReturn.reason_detail}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 bg-light rounded-4 h-100">
                  <div className="text-muted small fw-semibold text-uppercase mb-2">Customer Info</div>
                  <div className="mb-2">
                    <span className="small text-muted d-block">Name</span>
                    <strong className="text-dark">{selectedReturn.customer_name}</strong>
                  </div>
                  <div className="mb-2">
                    <span className="small text-muted d-block">Email</span>
                    <a href={`mailto:${selectedReturn.customer_email}`} className="text-decoration-none fw-semibold">
                      {selectedReturn.customer_email}
                    </a>
                  </div>
                  <div className="mb-2">
                    <span className="small text-muted d-block">Submitted Date</span>
                    <strong className="text-dark">{new Date(selectedReturn.createdAt).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>

            <h5 className="fw-bold text-dark mb-3">Items Requested for Return</h5>
            <ListGroup className="mb-4 rounded-4 overflow-hidden border">
              {selectedReturn.return_items.map((item) => (
                <ListGroup.Item key={item._id} className="p-3">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <div className="fw-bold text-dark" style={{ fontSize: '0.92rem' }}>{item.order_item_name}</div>
                      <div className="text-muted small">${item.order_item_price} per item</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-primary">Qty to Return: {item.qty}</div>
                      <div className="text-muted small fw-bold">Refund Value: ${(item.qty * item.order_item_price).toFixed(2)}</div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <Form.Group className="mb-4" controlId="adminComment">
              <Form.Label className="fw-bold text-dark small">Admin Processing Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add notes about return packaging, refund verification, etc."
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                style={{ borderRadius: '10px' }}
              />
            </Form.Group>

            {/* Current Request Status Tag */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="small fw-semibold text-muted">Current Status:</span>
              <StatusBadge status={selectedReturn.status} />
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light bg-opacity-50">
            <Button variant="light" onClick={() => setShowDetailModal(false)} className="rounded-3" disabled={submittingAction}>
              Close
            </Button>
            
            {selectedReturn.status === 'pending' && (
              <>
                <Button
                  variant="danger"
                  className="rounded-3 px-3"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={submittingAction}
                >
                  Reject Return
                </Button>
                <Button
                  variant="primary"
                  className="rounded-3 px-3"
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={submittingAction}
                >
                  Approve Return
                </Button>
              </>
            )}

            {selectedReturn.status === 'approved' && (
              <Button
                variant="success"
                className="rounded-3 px-4"
                onClick={() => handleStatusUpdate('completed')}
                disabled={submittingAction}
              >
                Mark Refunded & Complete
              </Button>
            )}

            {selectedReturn.status === 'rejected' && (
              <span className="text-danger small fw-bold">This return request has been rejected.</span>
            )}

            {selectedReturn.status === 'completed' && (
              <span className="text-success small fw-bold">Refund processed & items returned successfully.</span>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </AdminLayout>
  )
}

export default AdminReturns
