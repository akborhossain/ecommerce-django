import React, { useState, useEffect } from 'react'
import { Button, Row, Col, ListGroup, Image, Card, Badge, Modal, Form } from 'react-bootstrap'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { PayPalButton } from 'react-paypal-button-v2'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { getOrderDetails, payOrder, deliverOrder } from '../actions/orderActions'
import { ORDER_PAY_RESET, ORDER_DELIVER_RESET } from '../constants/orderConstants'


function OrderPage() {
  const { id: orderId } = useParams();
  const dispatch = useDispatch()
  const navigate = useNavigate();

  const [sdkReady, setSdkReady] = useState(false)

  // Return request states
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [returnReason, setReturnReason] = useState('defective')
  const [returnReasonDetail, setReturnReasonDetail] = useState('')
  const [returnItems, setReturnItems] = useState({}) // item._id -> qty
  const [submittingReturn, setSubmittingReturn] = useState(false)
  const [returnError, setReturnError] = useState('')

  const orderDetails = useSelector(state => state.orderDetails)
  const { order, error, loading } = orderDetails

  const getEligibleReturnQty = (item) => {
    if (!order) return 0
    const alreadyReturned = (order.return_requests || []).reduce((acc, req) => {
      if (req.status !== 'rejected') {
        const match = req.return_items.find(ri => ri.order_item === item._id)
        if (match) acc += match.qty
      }
      return acc
    }, 0)
    return Math.max(0, item.qty - alreadyReturned)
  }

  const hasEligibleItems = order && order.orderItems.some(item => getEligibleReturnQty(item) > 0)

  const handleReturnSubmit = async (e) => {
    e.preventDefault()
    setReturnError('')
    const selected = Object.entries(returnItems)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ order_item_id: Number(id), qty: Number(qty) }))

    if (selected.length === 0) {
      setReturnError('Please select at least one item to return')
      return
    }

    try {
      setSubmittingReturn(true)
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        }
      }
      await axios.post(
        `/orders/${order._id}/returns/`,
        {
          reason: returnReason,
          reason_detail: returnReasonDetail,
          items: selected
        },
        config
      )
      setSubmittingReturn(false)
      setShowReturnModal(false)
      setReturnReasonDetail('')
      setReturnItems({})
      dispatch(getOrderDetails(orderId))
    } catch (err) {
      setSubmittingReturn(false)
      setReturnError(err.response?.data?.detail || err.message || 'Failed to submit return request')
    }
  }

  const orderPay = useSelector(state => state.orderPay)
  const { loading: loadingPay, success: successPay } = orderPay

  const orderDeliver = useSelector(state => state.orderDeliver)
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver

  const userLogin = useSelector(state => state.userLogin)
  const { userInfo } = userLogin

  if (!loading && !error && order) {
    order.itemsPrice = order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
  }

  const addPayPalScript = () => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://www.paypal.com/sdk/js?client-id=AeDXja18CkwFUkL-HQPySbzZsiTrN52cG13mf9Yz7KiV2vNnGfTDP0wDEN9sGlhZHrbb_USawcJzVDgn'
    script.async = true
    script.onload = () => setSdkReady(true)
    document.body.appendChild(script)
  }

  useEffect(() => {
    if (!userInfo) navigate('/login')

    if (!order || successPay || order._id !== Number(orderId) || successDeliver) {
      dispatch({ type: ORDER_PAY_RESET })
      dispatch({ type: ORDER_DELIVER_RESET })
      dispatch(getOrderDetails(orderId))
    } else if (!order.isPaid) {
      if (!window.paypal) addPayPalScript()
      else setSdkReady(true)
    }
  }, [dispatch, order, orderId, successPay, successDeliver, userInfo, navigate])

  const successPaymentHandler = (paymentResult) => dispatch(payOrder(orderId, paymentResult))
  const deliverHandler = () => dispatch(deliverOrder(order))

  const statusConfig = {
    paid: { bg: '#f0fff4', border: '#86efac', color: '#16a34a', icon: 'fas fa-check-circle' },
    unpaid: { bg: '#fff1f2', border: '#fca5a5', color: '#dc2626', icon: 'fas fa-times-circle' },
    delivered: { bg: '#f0fff4', border: '#86efac', color: '#16a34a', icon: 'fas fa-truck' },
    pending: { bg: '#fffbeb', border: '#fcd34d', color: '#d97706', icon: 'fas fa-clock' },
  }

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : (
    <div className="py-3">
      {/* Order Header */}
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">
            <i className="fas fa-receipt text-primary me-2"></i>
            Order #{order._id}
          </h1>
          <span className="text-muted small">
            <i className="fas fa-calendar-alt me-1"></i>
            Placed on {order.createdAt ? order.createdAt.substring(0, 10) : ''}
          </span>
        </div>
        <div className="d-flex gap-2 flex-wrap align-items-center">
          <Button variant="outline-primary" size="sm" onClick={() => window.print()} className="no-print me-2 rounded-pill px-3 py-2 fw-semibold" style={{ fontSize: '0.8rem' }}>
            <i className="fas fa-print me-1"></i> Print Invoice
          </Button>
          <span
            className="px-3 py-2 rounded-pill fw-semibold small"
            style={{
              background: order.isPaid ? statusConfig.paid.bg : statusConfig.unpaid.bg,
              border: `1px solid ${order.isPaid ? statusConfig.paid.border : statusConfig.unpaid.border}`,
              color: order.isPaid ? statusConfig.paid.color : statusConfig.unpaid.color
            }}
          >
            <i className={`${order.isPaid ? statusConfig.paid.icon : statusConfig.unpaid.icon} me-1`}></i>
            {order.isPaid ? 'Paid' : 'Payment Pending'}
          </span>
          <span
            className="px-3 py-2 rounded-pill fw-semibold small"
            style={{
              background: order.isDelivered ? statusConfig.delivered.bg : statusConfig.pending.bg,
              border: `1px solid ${order.isDelivered ? statusConfig.delivered.border : statusConfig.pending.border}`,
              color: order.isDelivered ? statusConfig.delivered.color : statusConfig.pending.color
            }}
          >
            <i className={`${order.isDelivered ? statusConfig.delivered.icon : statusConfig.pending.icon} me-1`}></i>
            {order.isDelivered ? 'Delivered' : 'Processing'}
          </span>
        </div>
      </div>

      <Row className="g-4">
        <Col md={8}>
          {/* Shipping Info */}
          <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div className="p-4 border-bottom d-flex align-items-center gap-3" style={{ background: 'linear-gradient(135deg, #fff7f0 0%, #fff 100%)' }}>
              <div className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10" style={{ width: '44px', height: '44px' }}>
                <i className="fas fa-map-marker-alt text-primary"></i>
              </div>
              <div>
                <h2 className="h5 fw-bold mb-0">Shipping & Delivery</h2>
                <span className="text-muted small">Customer details and destination</span>
              </div>
            </div>
            <div className="p-4">
              <Row className="g-3">
                <Col md={6}>
                  <div className="text-muted small fw-semibold mb-1 text-uppercase" style={{ letterSpacing: '0.05em' }}>Customer</div>
                  <div className="fw-semibold text-dark">
                    {order.shippingAddress && order.shippingAddress.name ? order.shippingAddress.name : order.createdBy.name}
                  </div>
                  <a href={`mailto:${order.createdBy.email}`} className="text-primary small text-decoration-none">
                    {order.createdBy.email}
                  </a>
                </Col>
                <Col md={6}>
                  <div className="text-muted small fw-semibold mb-1 text-uppercase" style={{ letterSpacing: '0.05em' }}>Delivery Address</div>
                  <div className="text-dark small">
                    {order.shippingAddress.address}, {' '}
                    {[
                      order.shippingAddress.union,
                      order.shippingAddress.policeStation,
                      order.shippingAddress.district,
                      order.shippingAddress.division,
                      order.shippingAddress.postalCode,
                      order.shippingAddress.country
                    ].filter(Boolean).join(', ')}
                  </div>
                </Col>
              </Row>

              <div className="mt-3 pt-3 border-top">
                <div
                  className="px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2"
                  style={{
                    background: order.isDelivered ? statusConfig.delivered.bg : statusConfig.pending.bg,
                    border: `1px solid ${order.isDelivered ? statusConfig.delivered.border : statusConfig.pending.border}`,
                  }}
                >
                  <i
                    className={order.isDelivered ? 'fas fa-check-circle' : 'fas fa-clock'}
                    style={{ color: order.isDelivered ? statusConfig.delivered.color : statusConfig.pending.color }}
                  ></i>
                  <span
                    className="small fw-semibold"
                    style={{ color: order.isDelivered ? statusConfig.delivered.color : statusConfig.pending.color }}
                  >
                    {order.isDelivered
                      ? `Delivered on ${order.deliveredAt?.substring(0, 10)}`
                      : 'Pending — not yet dispatched'
                    }
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Status */}
          <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div className="p-4 border-bottom d-flex align-items-center gap-3" style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #fff 100%)' }}>
              <div className="d-flex align-items-center justify-content-center rounded-3 bg-info bg-opacity-10" style={{ width: '44px', height: '44px' }}>
                <i className="fas fa-credit-card text-info"></i>
              </div>
              <div>
                <h2 className="h5 fw-bold mb-0">Payment Information</h2>
                <span className="text-muted small">Transaction and payment status</span>
              </div>
            </div>
            <div className="p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <div className="text-muted small fw-semibold mb-1 text-uppercase" style={{ letterSpacing: '0.05em' }}>Method</div>
                <div className="fw-semibold text-dark">{order.paymentMethod}</div>
              </div>
              <div
                className="px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2"
                style={{
                  background: order.isPaid ? statusConfig.paid.bg : statusConfig.unpaid.bg,
                  border: `1px solid ${order.isPaid ? statusConfig.paid.border : statusConfig.unpaid.border}`,
                }}
              >
                <i
                  className={order.isPaid ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}
                  style={{ color: order.isPaid ? statusConfig.paid.color : statusConfig.unpaid.color }}
                ></i>
                <span
                  className="small fw-semibold"
                  style={{ color: order.isPaid ? statusConfig.paid.color : statusConfig.unpaid.color }}
                >
                  {order.isPaid
                    ? `Paid on ${order.paidAt?.substring(0, 10)}`
                    : 'Payment not completed'
                  }
                </span>
              </div>
            </div>
          </Card>

          {/* Order Tracking Timeline */}
          {order.tracking && order.tracking.length > 0 && (
            <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
              <div className="p-4 border-bottom d-flex align-items-center gap-3" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #fff 100%)' }}>
                <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: '44px', height: '44px', background: '#f3e8ff' }}>
                  <i className="fas fa-route" style={{ color: '#8b5cf6' }}></i>
                </div>
                <div>
                  <h2 className="h5 fw-bold mb-0">Order Tracking</h2>
                  <span className="text-muted small">Track your order's journey</span>
                </div>
              </div>
              <div className="p-4">
                {/* Visual Stepper */}
                <div className="d-flex justify-content-between mb-4 position-relative" style={{ paddingTop: '8px' }}>
                  {/* Progress Line */}
                  {(() => {
                    const allSteps = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered']
                    const completedStatuses = (order.tracking || []).map(e => e.status)
                    const lastCompleted = allSteps.reduce((last, step, i) => completedStatuses.includes(step) ? i : last, -1)
                    const progressPct = allSteps.length > 1 ? (lastCompleted / (allSteps.length - 1)) * 100 : 0
                    
                    const stepConfig = {
                      placed: { icon: 'fas fa-receipt', label: 'Placed' },
                      confirmed: { icon: 'fas fa-check-circle', label: 'Confirmed' },
                      processing: { icon: 'fas fa-cogs', label: 'Processing' },
                      shipped: { icon: 'fas fa-shipping-fast', label: 'Shipped' },
                      out_for_delivery: { icon: 'fas fa-truck', label: 'Out for Delivery' },
                      delivered: { icon: 'fas fa-box-open', label: 'Delivered' },
                    }
                    
                    // Check for cancelled/failed
                    const isCancelledOrFailed = completedStatuses.includes('cancelled') || completedStatuses.includes('failed')
                    
                    return (
                      <>
                        <div style={{
                          position: 'absolute', top: '22px', left: '32px', right: '32px',
                          height: '3px', background: '#e2e8f0', borderRadius: '2px', zIndex: 0
                        }}>
                          <div style={{
                            height: '100%', borderRadius: '2px',
                            background: isCancelledOrFailed ? '#ef4444' : 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                            width: `${progressPct}%`, transition: 'width 0.5s ease'
                          }} />
                        </div>
                        {allSteps.map((step, i) => {
                          const done = completedStatuses.includes(step)
                          const isCurrent = i === lastCompleted
                          const cfg = stepConfig[step]
                          return (
                            <div key={step} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 1, flex: 1 }}>
                              <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: done ? (isCancelledOrFailed ? '#ef4444' : '#6366f1') : '#fff',
                                border: `2px solid ${done ? (isCancelledOrFailed ? '#ef4444' : '#6366f1') : '#e2e8f0'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: isCurrent ? `0 0 0 4px ${isCancelledOrFailed ? '#fecaca' : '#e0e7ff'}` : 'none',
                                transition: 'all 0.3s ease',
                              }}>
                                <i className={cfg.icon} style={{
                                  fontSize: '0.55rem',
                                  color: done ? '#fff' : '#cbd5e1'
                                }} />
                              </div>
                              <span style={{
                                fontSize: '0.65rem', fontWeight: done ? 700 : 500,
                                color: done ? '#0f172a' : '#94a3b8',
                                marginTop: '6px', textAlign: 'center', lineHeight: 1.2,
                                maxWidth: '70px'
                              }}>
                                {cfg.label}
                              </span>
                            </div>
                          )
                        })}
                      </>
                    )
                  })()}
                </div>

                {/* Event List */}
                <div className="border-top pt-3 mt-2">
                  {order.tracking.slice().reverse().map((event, i) => {
                    const statusLabels = {
                      placed: 'Order Placed', confirmed: 'Order Confirmed', processing: 'Processing',
                      shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
                      cancelled: 'Cancelled', failed: 'Delivery Failed'
                    }
                    const statusColors = {
                      placed: '#6366f1', confirmed: '#10b981', processing: '#8b5cf6',
                      shipped: '#3b82f6', out_for_delivery: '#f59e0b', delivered: '#16a34a',
                      cancelled: '#ef4444', failed: '#ea580c'
                    }
                    return (
                      <div key={event.id || i} className="d-flex gap-3 mb-2" style={{ fontSize: '0.82rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColors[event.status] || '#94a3b8', marginTop: '6px', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-bold" style={{ color: statusColors[event.status] || '#64748b' }}>
                              {statusLabels[event.status] || event.status_display || event.status}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {new Date(event.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {event.note && <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{event.note}</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Order Items */}
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="p-4 border-bottom d-flex align-items-center gap-3" style={{ background: 'linear-gradient(135deg, #f0fff4 0%, #fff 100%)' }}>
              <div className="d-flex align-items-center justify-content-center rounded-3 bg-success bg-opacity-10" style={{ width: '44px', height: '44px' }}>
                <i className="fas fa-box-open text-success"></i>
              </div>
              <div>
                <h2 className="h5 fw-bold mb-0">Ordered Items ({order.orderItems.reduce((a, i) => a + i.qty, 0)})</h2>
                <span className="text-muted small">Items included in this order</span>
              </div>
            </div>

            {order.orderItems.length === 0 ? (
              <div className="p-4"><Message variant='info'>No items in this order</Message></div>
            ) : (
              <ListGroup variant='flush'>
                {order.orderItems.map((item, index) => (
                  <ListGroup.Item key={index} className="px-4 py-3">
                    <Row className="align-items-center g-3">
                      <Col xs={3} md={1}>
                        <Image src={item.image} alt={item.name} fluid rounded className="shadow-sm" style={{ aspectRatio: '1', objectFit: 'cover' }} />
                      </Col>
                      <Col xs={9} md={7}>
                        <Link to={`/product/${item.product}`} className="text-decoration-none fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                          {item.name}
                        </Link>
                        {item.variant_name && (
                          <div className="mt-1">
                            <Badge bg="light" text="dark" className="border" style={{ fontSize: '0.72rem' }}>{item.variant_name}</Badge>
                          </div>
                        )}
                      </Col>
                      <Col md={4} xs={12}>
                        <div className="d-flex align-items-center justify-content-between justify-content-md-end gap-2">
                          <span className="text-muted small">{item.qty} × ${item.price}</span>
                          <span className="fw-bold text-primary">${(item.qty * item.price).toFixed(2)}</span>
                        </div>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card>

          {/* Return Requests List */}
          {order.return_requests && order.return_requests.length > 0 && (
            <Card className="border-0 shadow-sm rounded-4 mt-4 overflow-hidden">
              <div className="p-4 border-bottom d-flex align-items-center gap-3" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fff 100%)' }}>
                <div className="d-flex align-items-center justify-content-center rounded-3 bg-danger bg-opacity-10" style={{ width: '44px', height: '44px' }}>
                  <i className="fas fa-undo text-danger"></i>
                </div>
                <div>
                  <h2 className="h5 fw-bold mb-0">Return Requests</h2>
                  <span className="text-muted small">Status of returned items</span>
                </div>
              </div>
              <ListGroup variant="flush">
                {order.return_requests.map((req) => {
                  const returnStatusColors = {
                    pending: { bg: '#fffbeb', border: '#fcd34d', color: '#d97706', label: 'Return Requested' },
                    approved: { bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb', label: 'Return Approved' },
                    rejected: { bg: '#fef2f2', border: '#fca5a5', color: '#ef4444', label: 'Return Rejected' },
                    completed: { bg: '#f0fff4', border: '#86efac', color: '#16a34a', label: 'Completed & Refunded' }
                  }
                  const st = returnStatusColors[req.status] || { bg: '#f4f4f5', border: '#e4e4e7', color: '#71717a', label: req.status }
                  return (
                    <ListGroup.Item key={req._id} className="p-4">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                        <div>
                          <span className="fw-bold text-dark">Request #{req._id}</span>
                          <span className="text-muted small ms-2">
                            on {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          className="px-3 py-1 rounded-pill fw-semibold small"
                          style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}
                        >
                          {st.label}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted small fw-semibold text-uppercase">Reason:</span>{' '}
                        <span className="fw-semibold text-dark">{req.reason_display}</span>
                        {req.reason_detail && <div className="text-muted small mt-1 bg-light p-2 rounded">{req.reason_detail}</div>}
                      </div>
                      {req.admin_comment && (
                        <div className="mb-3 p-3 rounded-3 border" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                          <span className="small fw-bold text-secondary d-block mb-1">Admin Feedback:</span>
                          <span className="small text-dark">{req.admin_comment}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted small fw-semibold text-uppercase d-block mb-2">Returned Items:</span>
                        <div className="d-flex flex-column gap-2">
                          {req.return_items.map((ri) => (
                            <div key={ri._id} className="d-flex align-items-center justify-content-between bg-light p-2 rounded" style={{ fontSize: '0.88rem' }}>
                              <span className="text-dark fw-medium">{ri.order_item_name}</span>
                              <span className="fw-bold text-secondary">Qty: {ri.qty}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ListGroup.Item>
                  )
                })}
              </ListGroup>
            </Card>
          )}
        </Col>

        {/* Order Summary Sidebar */}
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ position: 'sticky', top: '100px' }}>
            <div className="p-4 border-bottom" style={{ background: 'linear-gradient(135deg, #fff7f0 0%, #fff 100%)' }}>
              <h2 className="h5 fw-bold mb-0">Price Breakdown</h2>
            </div>
            <div className="p-4">
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Subtotal</span>
                <span className="fw-semibold">${order.itemsPrice}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Shipping</span>
                <span className="fw-semibold">${order.shippingPrice}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Tax</span>
                <span className="fw-semibold">${order.taxPrice}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fw-bold h5 mb-0">Total</span>
                <span className="fw-bold h4 mb-0 text-primary">${order.totalPrice}</span>
              </div>

              {/* PayPal Buttons */}
              {!order.isPaid && (
                <div className="mb-3">
                  {loadingPay && <Loader />}
                  {!sdkReady ? (
                    <Loader />
                  ) : (
                    <PayPalButton
                      amount={order.totalPrice}
                      onSuccess={successPaymentHandler}
                    />
                  )}
                </div>
              )}

              {loadingDeliver && <Loader />}

              {/* Admin: Mark Delivered */}
              {userInfo && userInfo.is_staff && order.isPaid && !order.isDelivered && (
                <Button
                  type='button'
                  className='btn btn-dark w-100 py-3 rounded-3 shadow-sm fw-bold'
                  onClick={deliverHandler}
                >
                  <i className="fas fa-truck me-2"></i>
                  Mark As Delivered
                </Button>
              )}

              {/* Already Delivered Success / Return Trigger */}
              {order.isDelivered && (
                <div className="d-flex flex-column gap-2">
                  <div
                    className="p-3 rounded-3 text-center"
                    style={{ background: '#f0fff4', border: '1px solid #86efac' }}
                  >
                    <i className="fas fa-check-circle text-success mb-2" style={{ fontSize: '1.5rem' }}></i>
                    <div className="fw-semibold text-success small">Order Successfully Delivered</div>
                  </div>

                  {hasEligibleItems && !order.isCancelled && (
                    <Button
                      type="button"
                      className="btn btn-outline-danger w-100 py-2.5 rounded-3 fw-bold mt-2"
                      onClick={() => setShowReturnModal(true)}
                    >
                      <i className="fas fa-undo me-2"></i>
                      Request Item Return
                    </Button>
                  )}
                </div>
              )}

              <div className="mt-3 pt-3 border-top text-center">
                <Link to="/profile" className="text-primary small text-decoration-none fw-semibold">
                  <i className="fas fa-list me-1"></i>
                  View All Orders
                </Link>
              </div>
            </div>
          </Card>

          {/* QR Scan Card */}
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden mt-4 text-center p-4 no-print">
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Scan to Track Order</div>
            <div className="d-flex justify-content-center">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.origin + '/track-order/' + order._id)}`} 
                alt="Track QR" 
                className="border p-1 bg-white rounded-3 shadow-sm"
                style={{ width: '100px', height: '100px' }}
              />
            </div>
            <div className="text-muted small mt-2" style={{ fontSize: '0.7rem' }}>Scan using your mobile device's camera to view tracking timeline on-the-go.</div>
          </Card>
        </Col>
      </Row>

      {/* Return Request Modal */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-dark">
            <i className="fas fa-undo text-danger me-2"></i>
            Request Return — Order #{order._id}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReturnSubmit}>
          <Modal.Body className="pt-3">
            {returnError && <Message variant="danger">{returnError}</Message>}
            <p className="text-muted small">Select the items you would like to return and specify the quantities and reason.</p>
            
            <ListGroup variant="flush" className="mb-4 rounded border">
              {order.orderItems.map((item) => {
                const maxReturn = getEligibleReturnQty(item)
                const isEligible = maxReturn > 0
                return (
                  <ListGroup.Item key={item._id} className="py-3 px-3">
                    <Row className="align-items-center">
                      <Col xs={1} className="d-flex align-items-center justify-content-center">
                        <Form.Check
                          type="checkbox"
                          disabled={!isEligible}
                          checked={!!returnItems[item._id]}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setReturnItems(prev => ({ ...prev, [item._id]: 1 }))
                            } else {
                              setReturnItems(prev => {
                                const copy = { ...prev }
                                delete copy[item._id]
                                return copy
                              })
                            }
                          }}
                        />
                      </Col>
                      <Col xs={2} md={1}>
                        <Image src={item.image} alt={item.name} fluid rounded style={{ aspectRatio: '1', objectFit: 'cover' }} />
                      </Col>
                      <Col xs={5} md={7}>
                        <span className="fw-semibold text-dark small d-block">{item.name}</span>
                        <span className="text-muted small">${item.price} each • {item.qty} ordered</span>
                        {!isEligible && <span className="d-block text-danger small mt-1 fw-bold">Fully returned/refunded</span>}
                      </Col>
                      <Col xs={4} md={3}>
                        {isEligible && returnItems[item._id] && (
                          <Form.Group className="d-flex align-items-center gap-2">
                            <Form.Label className="small text-muted mb-0 text-nowrap">Qty:</Form.Label>
                            <Form.Select
                              size="sm"
                              value={returnItems[item._id]}
                              onChange={(e) => {
                                const val = Number(e.target.value)
                                setReturnItems(prev => ({ ...prev, [item._id]: val }))
                              }}
                            >
                              {[...Array(maxReturn).keys()].map((x) => (
                                <option key={x + 1} value={x + 1}>{x + 1}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        )}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )
              })}
            </ListGroup>

            <Form.Group className="mb-3" controlId="returnReason">
              <Form.Label className="fw-bold small text-dark">Reason for Return</Form.Label>
              <Form.Select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              >
                <option value="defective">Defective / Damaged product</option>
                <option value="wrong_item">Received wrong item</option>
                <option value="size_fit">Size or fit issue</option>
                <option value="unsatisfied">Not as expected / unsatisfied</option>
                <option value="other">Other reason</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="returnReasonDetail">
              <Form.Label className="fw-bold small text-dark">Additional Details (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe the issue in detail..."
                value={returnReasonDetail}
                onChange={(e) => setReturnReasonDetail(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="light" onClick={() => setShowReturnModal(false)} className="rounded-3">
              Cancel
            </Button>
            <Button
              variant="danger"
              type="submit"
              disabled={submittingReturn}
              className="rounded-3 px-4"
            >
              {submittingReturn ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Print-friendly style overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          header, footer, .no-print {
            display: none !important;
          }
          body {
            background: #fff !important;
            color: #000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .col-md-8 {
            width: 100% !important;
            flex: 0 0 100% !important;
            max-width: 100% !important;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
        }
      `}} />
    </div>
  )
}

export default OrderPage