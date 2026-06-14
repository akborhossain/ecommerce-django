import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, ListGroup, Image, Badge, Form, Table } from 'react-bootstrap'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Loader from '../components/Loader'
import Message from '../components/Message'

function TrackOrderPage() {
  const { id: orderId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)
  
  // Status update states
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  
  // Timeline update states
  const [timelineStatus, setTimelineStatus] = useState('')
  const [timelineNote, setTimelineNote] = useState('')
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [timelineError, setTimelineError] = useState('')

  const { userInfo } = useSelector(state => state.userLogin)

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError('')
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: userInfo ? `Bearer ${userInfo.token}` : ''
        }
      }
      const { data } = await axios.get(`/orders/${orderId}/`, config)
      setOrder(data.data)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.detail || err.message || 'Failed to retrieve order details')
    }
  }

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId, userInfo])

  const handleUpdateStatus = async (statusPayload) => {
    try {
      setActionLoading(true)
      setActionError('')
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        }
      }
      await axios.put(`/admin-panel/orders/${orderId}/`, statusPayload, config)
      setActionLoading(false)
      fetchOrderDetails()
    } catch (err) {
      setActionLoading(false)
      setActionError(err.response?.data?.detail || err.message || 'Failed to update order status')
    }
  }

  const handleAddTimelineEvent = async (e) => {
    e.preventDefault()
    if (!timelineStatus) return
    try {
      setTimelineLoading(true)
      setTimelineError('')
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        }
      }
      await axios.post(
        `/admin-panel/orders/${orderId}/tracking/`,
        {
          status: timelineStatus,
          note: timelineNote
        },
        config
      )
      setTimelineLoading(false)
      setTimelineStatus('')
      setTimelineNote('')
      fetchOrderDetails()
    } catch (err) {
      setTimelineLoading(false)
      setTimelineError(err.response?.data?.detail || err.message || 'Failed to add timeline event')
    }
  }

  const getStatusDisplay = () => {
    if (order.isCancelled) return { label: 'Cancelled', bg: '#fef2f2', border: '#fca5a5', color: '#ef4444' }
    if (order.deliveryFailed) return { label: 'Delivery Failed', bg: '#fff7ed', border: '#ffedd5', color: '#ea580c' }
    if (order.isDelivered) return { label: 'Delivered', bg: '#f0fff4', border: '#86efac', color: '#16a34a' }
    if (order.isPaid) return { label: 'Paid & Processing', bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb' }
    return { label: 'Payment Pending', bg: '#fffbeb', border: '#fcd34d', color: '#d97706' }
  }

  if (loading) return <Container className="py-5 text-center"><Loader /></Container>
  if (error) return <Container className="py-5"><Message variant="danger">{error}</Message></Container>
  if (!order) return <Container className="py-5"><Message variant="info">Order not found.</Message></Container>

  const status = getStatusDisplay()
  const isStaff = userInfo && userInfo.is_staff

  return (
    <Container className="py-4">
      {/* Print-only CSS layout injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full-width {
            width: 100% !important;
            flex: 0 0 100% !important;
            max-width: 100% !important;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          #printable-invoice {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}} />

      {/* Navigation and Actions Row */}
      <div className="d-flex justify-content-between align-items-center mb-4 no-print flex-wrap gap-2">
        <Link to={isStaff ? "/admin-panel/orders" : "/profile"} className="btn btn-outline-secondary rounded-3">
          <i className="fas fa-arrow-left me-2"></i>
          {isStaff ? 'Back to Admin Orders' : 'Back to My Orders'}
        </Link>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => window.print()} className="rounded-3">
            <i className="fas fa-print me-2"></i>
            Print Invoice
          </Button>
        </div>
      </div>

      <Row className="g-4">
        {/* Main Invoice Section */}
        <Col lg={isStaff ? 8 : 12} className="print-full-width">
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4" id="printable-invoice">
            {/* Invoice Header */}
            <div className="p-4 border-bottom bg-white d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <h2 className="h4 fw-bold text-dark mb-0">DarazShop Invoice</h2>
                  <Badge bg="none" className="rounded-pill" style={{ background: status.bg, border: `1px solid ${status.border}`, color: status.color, fontSize: '0.8rem', padding: '6px 12px' }}>
                    {status.label}
                  </Badge>
                </div>
                <div className="text-muted small">
                  <strong>Invoice Ref:</strong> #{order._id}
                </div>
                <div className="text-muted small mt-1">
                  <strong>Placed Date:</strong> {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-end text-sm-start no-print">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(window.location.origin + '/track-order/' + order._id)}`} 
                  alt="QR" 
                  className="border p-1 bg-white rounded-3 shadow-sm"
                  style={{ width: '84px', height: '84px' }}
                />
                <div className="small text-muted font-monospace mt-1" style={{ fontSize: '0.62rem', letterSpacing: '0.05em' }}>SCAN TO TRACK</div>
              </div>
            </div>

            {/* Customer & Address Details */}
            <Card.Body className="p-4">
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <div className="text-muted small fw-semibold text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>Customer Info</div>
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="fw-bold text-dark">
                      {order.shippingAddress?.name || order.createdBy?.name || 'Walk-in Customer'}
                    </div>
                    <div className="text-muted small mt-1">Email: {order.createdBy?.email}</div>
                    <div className="text-muted small">Username: {order.createdBy?.username}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-muted small fw-semibold text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>Shipping Destination</div>
                  <div className="p-3 bg-light rounded-3 h-100">
                    {order.shippingAddress ? (
                      <div className="small text-dark">
                        <div>{order.shippingAddress.address}</div>
                        <div className="text-muted mt-1">
                          {[
                            order.shippingAddress.union && `Union: ${order.shippingAddress.union}`,
                            order.shippingAddress.policeStation && `P.S: ${order.shippingAddress.policeStation}`,
                            order.shippingAddress.district,
                            order.shippingAddress.division,
                            order.shippingAddress.postalCode && `Zip: ${order.shippingAddress.postalCode}`,
                            order.shippingAddress.country
                          ].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted small">No address specified</span>
                    )}
                  </div>
                </Col>
              </Row>

              {/* Items List Table */}
              <div className="text-muted small fw-semibold text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>Billing Items</div>
              <div className="table-responsive mb-4 rounded-3 border">
                <Table className="align-middle mb-0" hover>
                  <thead className="table-light small text-uppercase">
                    <tr>
                      <th className="px-3" style={{ width: '60px' }}>Item</th>
                      <th>Product Details</th>
                      <th className="text-center">Price</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-end px-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item) => (
                      <tr key={item._id}>
                        <td className="px-3">
                          <Image src={item.image} alt={item.name} fluid rounded className="shadow-sm" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                        </td>
                        <td>
                          <div className="fw-bold text-dark" style={{ fontSize: '0.88rem' }}>{item.name}</div>
                          {item.variant_name && <Badge bg="light" text="dark" className="border mt-1">{item.variant_name}</Badge>}
                        </td>
                        <td className="text-center small">${Number(item.price).toFixed(2)}</td>
                        <td className="text-center small fw-semibold">{item.qty}</td>
                        <td className="text-end px-3 fw-bold text-dark">${(item.qty * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pricing Breakdown */}
              <Row className="justify-content-end">
                <Col md={6} lg={5}>
                  <div className="p-3 bg-light rounded-3" style={{ fontSize: '0.88rem' }}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Items Subtotal:</span>
                      <span className="fw-semibold text-dark">${order.orderItems.reduce((acc, i) => acc + i.qty * i.price, 0).toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Shipping Cost:</span>
                      <span className="fw-semibold text-dark">${Number(order.shippingPrice || 0).toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                      <span className="text-muted">Estimated Tax (5%):</span>
                      <span className="fw-semibold text-dark">${Number(order.taxPrice || 0).toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between pt-1 align-items-center">
                      <span className="fw-bold text-dark" style={{ fontSize: '1rem' }}>Total Cost:</span>
                      <span className="fw-extrabold h5 text-primary mb-0">${Number(order.totalPrice || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Tracking Timeline */}
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4 print-full-width">
            <div className="p-4 border-bottom bg-white d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10" style={{ width: '40px', height: '40px' }}>
                <i className="fas fa-route text-primary"></i>
              </div>
              <div>
                <h3 className="h5 fw-bold mb-0">Delivery Tracking Timeline</h3>
                <span className="text-muted small">Tracking updates and logistics timeline</span>
              </div>
            </div>
            <Card.Body className="p-4">
              {order.tracking && order.tracking.length > 0 ? (
                <div className="position-relative" style={{ paddingLeft: '32px' }}>
                  {/* Vertical Stepper line */}
                  <div style={{
                    position: 'absolute', left: '11px', top: '8px', bottom: '8px',
                    width: '2px', background: 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)', borderRadius: '2px'
                  }} />
                  {order.tracking.map((event, i) => {
                    const statusConfig = {
                      placed: { label: 'Order Placed', icon: 'fas fa-receipt', color: '#6366f1' },
                      confirmed: { label: 'Confirmed', icon: 'fas fa-check-circle', color: '#10b981' },
                      processing: { label: 'Processing', icon: 'fas fa-cogs', color: '#8b5cf6' },
                      shipped: { label: 'Shipped', icon: 'fas fa-shipping-fast', color: '#3b82f6' },
                      out_for_delivery: { label: 'Out for Delivery', icon: 'fas fa-truck', color: '#f59e0b' },
                      delivered: { label: 'Delivered', icon: 'fas fa-box-open', color: '#16a34a' },
                      cancelled: { label: 'Cancelled', icon: 'fas fa-ban', color: '#ef4444' },
                      failed: { label: 'Failed', icon: 'fas fa-times-circle', color: '#ea580c' },
                    }
                    const cfg = statusConfig[event.status] || { label: event.status_display, icon: 'fas fa-circle', color: '#94a3b8' }
                    const isLast = i === order.tracking.length - 1
                    return (
                      <div key={event.id || i} className="position-relative mb-3" style={{ minHeight: '40px' }}>
                        {/* Circle Dot */}
                        <div style={{
                          position: 'absolute', left: '-28px', top: '2px',
                          width: '22px', height: '22px', borderRadius: '50%',
                          background: isLast ? cfg.color : '#fff',
                          border: `2px solid ${cfg.color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          zIndex: 2,
                          boxShadow: isLast ? `0 0 0 4px ${cfg.color}22` : 'none',
                        }}>
                          <i className={cfg.icon} style={{ fontSize: '0.55rem', color: isLast ? '#fff' : cfg.color }} />
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: cfg.color }}>{cfg.label}</span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {event.note && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{event.note}</div>}
                          <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '1px' }}>updated by {event.updated_by_name || 'System'}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center text-muted py-3">No tracking events recorded.</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Admin status update sidebar */}
        {isStaff && (
          <Col lg={4} className="no-print">
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4 position-sticky" style={{ top: '24px' }}>
              <div className="p-4 border-bottom bg-white d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-3 bg-danger bg-opacity-10" style={{ width: '40px', height: '40px' }}>
                  <i className="fas fa-sliders-h text-danger"></i>
                </div>
                <div>
                  <h3 className="h5 fw-bold mb-0">Admin Controls</h3>
                  <span className="text-muted small">Update status & logs</span>
                </div>
              </div>
              <Card.Body className="p-4">
                {actionError && <Message variant="danger">{actionError}</Message>}

                <div className="d-flex flex-column gap-2.5 mb-4">
                  <span className="small fw-semibold text-secondary text-uppercase mb-1">Quick Actions</span>
                  {!order.isCancelled && !order.deliveryFailed && (
                    <>
                      {!order.isPaid && (
                        <Button variant="success" onClick={() => handleUpdateStatus({ isPaid: true })} disabled={actionLoading} className="rounded-3 py-2.5 fw-bold">
                          <i className="fas fa-check-circle me-2"></i>Mark as Paid
                        </Button>
                      )}
                      {order.isPaid && !order.isDelivered && (
                        <Button variant="primary" onClick={() => handleUpdateStatus({ isDelivered: true })} disabled={actionLoading} className="rounded-3 py-2.5 fw-bold">
                          <i className="fas fa-shipping-fast me-2"></i>Mark as Delivered
                        </Button>
                      )}
                      {!order.isDelivered && (
                        <>
                          <Button variant="warning" onClick={() => handleUpdateStatus({ deliveryFailed: true })} disabled={actionLoading} className="rounded-3 py-2.5 text-white fw-bold">
                            <i className="fas fa-exclamation-triangle me-2"></i>Mark Failed
                          </Button>
                          <Button variant="danger" onClick={() => handleUpdateStatus({ isCancelled: true })} disabled={actionLoading} className="rounded-3 py-2.5 fw-bold">
                            <i className="fas fa-ban me-2"></i>Cancel Order
                          </Button>
                        </>
                      )}
                    </>
                  )}
                  {(order.isCancelled || order.deliveryFailed || order.isDelivered) && (
                    <div className="p-3 bg-light rounded-3 text-center border">
                      <i className="fas fa-info-circle text-muted mb-1" style={{ fontSize: '1.2rem' }}></i>
                      <div className="small text-muted fw-bold">No further status updates possible</div>
                    </div>
                  )}
                </div>

                <hr className="my-4" />

                {/* Add tracking timeline logs */}
                {!order.isCancelled && !order.isDelivered && (
                  <Form onSubmit={handleAddTimelineEvent}>
                    <span className="small fw-semibold text-secondary text-uppercase d-block mb-2">Log Logistic Update</span>
                    {timelineError && <Message variant="danger">{timelineError}</Message>}

                    <Form.Group className="mb-3" controlId="timelineStatus">
                      <Form.Label className="small fw-bold text-dark">Logistic Status</Form.Label>
                      <Form.Select
                        value={timelineStatus}
                        onChange={e => setTimelineStatus(e.target.value)}
                        className="rounded-3"
                        required
                      >
                        <option value="">Select status...</option>
                        <option value="confirmed">Order Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="timelineNote">
                      <Form.Label className="small fw-bold text-dark">Description Log</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. Dispatched from Dhaka hub..."
                        value={timelineNote}
                        onChange={e => setTimelineNote(e.target.value)}
                        className="rounded-3"
                      />
                    </Form.Group>

                    <Button type="submit" variant="dark" disabled={timelineLoading || !timelineStatus} className="w-100 py-2.5 rounded-3 fw-bold">
                      {timelineLoading ? 'Posting...' : 'Add Logistics Event'}
                    </Button>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  )
}

export default TrackOrderPage
