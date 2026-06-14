import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Button, Form, Badge } from 'react-bootstrap'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAdminOrders, updateAdminOrder, getOrderTracking, addOrderTrackingEvent } from '../../actions/adminActions'
import { ADMIN_ORDER_UPDATE_RESET } from '../../constants/adminConstants'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const StatusBadge = ({ isPaid, isDelivered, isCancelled, deliveryFailed }) => {
  if (isCancelled) return <span className="badge rounded-pill" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5' }}>Cancelled</span>
  if (deliveryFailed) return <span className="badge rounded-pill" style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5' }}>Failed</span>
  if (isDelivered) return <span className="badge rounded-pill" style={{ background: '#f0fff4', color: '#16a34a', border: '1px solid #86efac' }}>Delivered</span>
  if (isPaid) return <span className="badge rounded-pill" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>Processing</span>
  return <span className="badge rounded-pill" style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fcd34d' }}>Pending</span>
}

const TRACKING_STATUS_MAP = {
  placed: { label: 'Order Placed', icon: 'fas fa-receipt', color: '#6366f1' },
  confirmed: { label: 'Confirmed', icon: 'fas fa-check-circle', color: '#10b981' },
  processing: { label: 'Processing', icon: 'fas fa-cogs', color: '#8b5cf6' },
  shipped: { label: 'Shipped', icon: 'fas fa-shipping-fast', color: '#3b82f6' },
  out_for_delivery: { label: 'Out for Delivery', icon: 'fas fa-truck', color: '#f59e0b' },
  delivered: { label: 'Delivered', icon: 'fas fa-box-open', color: '#16a34a' },
  cancelled: { label: 'Cancelled', icon: 'fas fa-ban', color: '#ef4444' },
  failed: { label: 'Failed', icon: 'fas fa-times-circle', color: '#ea580c' },
}

const TrackingTimeline = ({ events = [] }) => {
  if (!events.length) {
    return (
      <div className="text-center text-muted p-3" style={{ fontSize: '0.82rem' }}>
        <i className="fas fa-route me-2"></i>No tracking events yet
      </div>
    )
  }
  return (
    <div className="position-relative" style={{ paddingLeft: '32px' }}>
      {/* Vertical line */}
      <div style={{
        position: 'absolute', left: '11px', top: '8px', bottom: '8px',
        width: '2px', background: 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)', borderRadius: '2px'
      }} />
      {events.map((event, i) => {
        const cfg = TRACKING_STATUS_MAP[event.status] || { label: event.status, icon: 'fas fa-circle', color: '#94a3b8' }
        const isLast = i === events.length - 1
        return (
          <div key={event.id || i} className="position-relative mb-3" style={{ minHeight: '40px' }}>
            {/* Dot */}
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
            {/* Content */}
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: cfg.color }}>{cfg.label}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {new Date(event.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {event.note && <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{event.note}</div>}
              <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '1px' }}>by {event.updated_by_name || 'System'}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
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

function AdminOrders() {
  const dispatch = useDispatch()
  const { loading, orders = [], page = 1, pages = 1, count = 0, counts = {}, error } = useSelector(s => s.adminOrders)
  const { loading: updateLoading, success: updateSuccess } = useSelector(s => s.adminOrderUpdate)
  const { events: trackingEvents = [], loading: trackingLoading, addLoading, addSuccess } = useSelector(s => s.adminOrderTracking)

  const [filters, setFilters] = useState({ q: '', isPaid: '', isDelivered: '', status: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [trackingTab, setTrackingTab] = useState('details') // 'details' | 'tracking'
  const [newEvent, setNewEvent] = useState({ status: '', note: '' })
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => { dispatch(getAdminOrders({ ...filters, page: currentPage })) }, [dispatch, filters, currentPage])
  useEffect(() => {
    if (updateSuccess) {
      dispatch({ type: ADMIN_ORDER_UPDATE_RESET })
      setShowModal(false)
      dispatch(getAdminOrders({ ...filters, page: currentPage }))
    }
  }, [updateSuccess, dispatch, filters, currentPage])

  useEffect(() => {
    if (addSuccess) {
      // Refresh tracking events
      if (selected) dispatch(getOrderTracking(selected._id))
    }
  }, [addSuccess])

  useEffect(() => {
    setSelectedIds([])
  }, [filters, currentPage])

  const handleUpdateOrder = (id, payload) => dispatch(updateAdminOrder(id, payload))
  const handlePageChange = (p) => setCurrentPage(p)

  const openModal = (order) => {
    setSelected(order)
    setShowModal(true)
    setTrackingTab('details')
    dispatch(getOrderTracking(order._id))
  }

  const handleAddTrackingEvent = () => {
    if (!newEvent.status || !selected) return
    dispatch(addOrderTrackingEvent(selected._id, newEvent))
    setNewEvent({ status: '', note: '' })
  }

  const getCustomerName = (order) => {
    if (order.shippingAddress && order.shippingAddress.name) {
      return order.shippingAddress.name
    }
    const by = order.createdBy
    if (!by) return 'Guest'
    return by.name || by.first_name || by.email || 'Unknown'
  }

  const handleBulkPrint = () => {
    if (selectedIds.length === 0) return

    const selectedOrders = selectedIds
      .map(id => orders.find(o => o._id === id))
      .filter(Boolean)

    if (selectedOrders.length === 0) return

    const invoiceHTML = selectedOrders.map(order => {
      const statusLabel = order.isCancelled ? 'Cancelled'
        : order.deliveryFailed ? 'Delivery Failed'
        : order.isDelivered ? 'Delivered'
        : order.isPaid ? 'Paid & Processing'
        : 'Payment Pending'

      const statusColor = order.isCancelled ? '#ef4444'
        : order.deliveryFailed ? '#ea580c'
        : order.isDelivered ? '#16a34a'
        : order.isPaid ? '#2563eb'
        : '#d97706'

      const customerName = order.shippingAddress && order.shippingAddress.name
        ? order.shippingAddress.name
        : order.createdBy
          ? (order.createdBy.name || order.createdBy.first_name || order.createdBy.email || 'Unknown')
          : 'Guest'

      const shippingAddr = order.shippingAddress
        ? [
            order.shippingAddress.name ? `Recipient: ${order.shippingAddress.name}` : '',
            order.shippingAddress.address,
            order.shippingAddress.union ? `Union: ${order.shippingAddress.union}` : '',
            order.shippingAddress.policeStation ? `P.S: ${order.shippingAddress.policeStation}` : '',
            order.shippingAddress.district || '',
            order.shippingAddress.division || '',
            order.shippingAddress.postalCode ? `Zip: ${order.shippingAddress.postalCode}` : '',
            order.shippingAddress.country || ''
          ].filter(Boolean).join(', ')
        : 'No address specified'

      const itemsHTML = (order.orderItems || []).map(item => `
        <tr>
          <td style="padding:8px 12px;">
            <img src="${item.image || '/static/placeholder.png'}" alt="${item.name}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #e2e8f0;" />
          </td>
          <td style="padding:8px 12px;font-weight:600;color:#1e293b;font-size:0.85rem;">${item.name}</td>
          <td style="padding:8px 12px;text-align:center;font-size:0.85rem;">$${Number(item.price).toFixed(2)}</td>
          <td style="padding:8px 12px;text-align:center;font-weight:600;font-size:0.85rem;">${item.qty}</td>
          <td style="padding:8px 12px;text-align:right;font-weight:700;color:#1e293b;font-size:0.85rem;">$${(item.qty * item.price).toFixed(2)}</td>
        </tr>
      `).join('')

      const subtotal = (order.orderItems || []).reduce((acc, i) => acc + i.qty * i.price, 0)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '/track-order/' + order._id)}`

      return `
        <div class="invoice-page" style="page-break-after:always;padding:2rem 3rem;font-family:'Outfit',Arial,sans-serif;color:#000;background:#fff;">
          <!-- Header -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #e2e8f0;padding-bottom:20px;margin-bottom:20px;">
            <div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                <h2 style="margin:0;font-size:1.4rem;font-weight:800;color:#0f172a;">DarazShop Invoice</h2>
                <span style="border:1px solid ${statusColor};color:${statusColor};padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:600;">${statusLabel}</span>
              </div>
              <div style="color:#64748b;font-size:0.82rem;"><strong>Invoice Ref:</strong> #${order._id}</div>
              <div style="color:#64748b;font-size:0.82rem;margin-top:2px;"><strong>Placed Date:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <div style="text-align:center;">
              <img src="${qrUrl}" alt="QR" style="width:80px;height:80px;border:1px solid #e2e8f0;padding:4px;border-radius:8px;" />
              <div style="font-size:0.6rem;color:#94a3b8;font-family:monospace;margin-top:4px;letter-spacing:0.05em;font-weight:600;">SCAN TO TRACK</div>
            </div>
          </div>

          <!-- Customer + Shipping -->
          <div style="display:flex;gap:16px;margin-bottom:20px;">
            <div style="flex:1;background:#f8fafc;border-radius:8px;padding:14px;">
              <div style="font-size:0.7rem;color:#64748b;font-weight:600;text-transform:uppercase;margin-bottom:6px;">Customer Info</div>
              <div style="font-weight:700;color:#1e293b;">${customerName}</div>
              <div style="color:#64748b;font-size:0.82rem;margin-top:4px;">Phone: ${order.shippingAddress?.phoneNumber || '—'}</div>
            </div>
            <div style="flex:1;background:#f8fafc;border-radius:8px;padding:14px;">
              <div style="font-size:0.7rem;color:#64748b;font-weight:600;text-transform:uppercase;margin-bottom:6px;">Shipping Destination</div>
              <div style="color:#1e293b;font-size:0.85rem;">${shippingAddr}</div>
              <div style="color:#1e293b;font-size:0.85rem;margin-top:6px;font-weight:700;">Phone: ${order.shippingAddress?.phoneNumber || '—'}</div>
            </div>
          </div>

          <!-- Items Table -->
          <div style="font-size:0.7rem;color:#64748b;font-weight:600;text-transform:uppercase;margin-bottom:8px;">Billing Items</div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:10px 12px;text-align:left;font-size:0.72rem;color:#64748b;text-transform:uppercase;font-weight:600;border-bottom:1px solid #e2e8f0;width:60px;">Item</th>
                <th style="padding:10px 12px;text-align:left;font-size:0.72rem;color:#64748b;text-transform:uppercase;font-weight:600;border-bottom:1px solid #e2e8f0;">Product Details</th>
                <th style="padding:10px 12px;text-align:center;font-size:0.72rem;color:#64748b;text-transform:uppercase;font-weight:600;border-bottom:1px solid #e2e8f0;">Price</th>
                <th style="padding:10px 12px;text-align:center;font-size:0.72rem;color:#64748b;text-transform:uppercase;font-weight:600;border-bottom:1px solid #e2e8f0;">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:0.72rem;color:#64748b;text-transform:uppercase;font-weight:600;border-bottom:1px solid #e2e8f0;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <!-- Totals -->
          <div style="display:flex;justify-content:flex-end;">
            <div style="width:280px;background:#f8fafc;border-radius:8px;padding:14px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.85rem;">
                <span style="color:#64748b;">Items Subtotal:</span>
                <span style="font-weight:600;color:#1e293b;">$${subtotal.toFixed(2)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.85rem;">
                <span style="color:#64748b;">Shipping Cost:</span>
                <span style="font-weight:600;color:#1e293b;">$${Number(order.shippingPrice || 0).toFixed(2)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #e2e8f0;font-size:0.85rem;">
                <span style="color:#64748b;">Estimated Tax:</span>
                <span style="font-weight:600;color:#1e293b;">$${Number(order.taxPrice || 0).toFixed(2)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding-top:4px;">
                <span style="font-weight:700;color:#1e293b;font-size:0.95rem;">Total Cost:</span>
                <span style="font-weight:800;color:#f57224;font-size:1.15rem;">$${Number(order.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:0.72rem;">
            Thank you for your order · DarazShop · Generated on ${new Date().toLocaleString()}
          </div>
        </div>
      `
    }).join('')

    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) {
      alert('Please allow pop-ups to print invoices.')
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - DarazShop</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Outfit', Arial, sans-serif; background: #fff; color: #000; }
          @media print {
            body { margin: 0; padding: 0; }
            .invoice-page { page-break-after: always !important; page-break-inside: avoid !important; }
            .invoice-page:last-child { page-break-after: auto !important; }
            .no-print { display: none !important; }
          }
          img { max-width: 100%; }
          table { border-spacing: 0; }
          td, th { border-bottom: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        ${invoiceHTML}
        <script>
          // Wait for images (QR codes) to load then print
          const images = document.querySelectorAll('img');
          let loaded = 0;
          const totalImages = images.length;
          
          function tryPrint() {
            loaded++;
            if (loaded >= totalImages) {
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }, 300);
            }
          }
          
          if (totalImages === 0) {
            setTimeout(function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }, 300);
          } else {
            images.forEach(function(img) {
              if (img.complete) {
                tryPrint();
              } else {
                img.onload = tryPrint;
                img.onerror = tryPrint;
              }
            });
            // Fallback: print after 3 seconds regardless
            setTimeout(function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }, 3000);
          }
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  const ORDER_STATUS_TABS = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending', color: '#d97706' },
    { value: 'confirmed', label: 'Confirmed', color: '#2563eb' },
    { value: 'shipped', label: 'Shifted', color: '#8b5cf6' },
    { value: 'delivered', label: 'Delivered', color: '#16a34a' },
    { value: 'failed', label: 'Failed', color: '#ef4444' },
    { value: 'returned', label: 'Return Order', color: '#ea580c' },
  ]

  const getTabCount = (tabValue) => {
    if (!counts) return 0
    if (tabValue === '') return counts.all || 0
    if (tabValue === 'pending') return counts.pending || 0
    if (tabValue === 'confirmed') return counts.confirmed || 0
    if (tabValue === 'shipped') return counts.shipped || 0
    if (tabValue === 'delivered') return counts.delivered || 0
    if (tabValue === 'failed') return counts.failed || 0
    if (tabValue === 'returned') return counts.returned || 0
    return 0
  }

  return (
    <AdminLayout title="Orders Management">
      {/* Filters */}
      <div className="rounded-4 p-4 mb-4" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#64748b' }}>Search</label>
            <div className="position-relative">
              <i className="fas fa-search position-absolute text-muted" style={{ top: '11px', left: '12px', fontSize: '0.85rem' }}></i>
              <input type="text" className="form-control shadow-none ps-4 rounded-3"
                placeholder="Order ID, customer name or email..."
                value={filters.q}
                onChange={e => { setFilters(f => ({ ...f, q: e.target.value })); setCurrentPage(1) }}
                style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#64748b' }}>Payment Status Override</label>
            <Form.Select className="shadow-none rounded-3" value={filters.isPaid}
              onChange={e => { setFilters(f => ({ ...f, isPaid: e.target.value })); setCurrentPage(1) }}
              style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
              <option value="">All Payments</option>
              <option value="true">Paid</option>
              <option value="false">Unpaid</option>
            </Form.Select>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#64748b' }}>Delivery Status Override</label>
            <Form.Select className="shadow-none rounded-3" value={filters.isDelivered}
              onChange={e => { setFilters(f => ({ ...f, isDelivered: e.target.value })); setCurrentPage(1) }}
              style={{ border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
              <option value="">All Delivery</option>
              <option value="true">Delivered</option>
              <option value="false">Not Delivered</option>
            </Form.Select>
          </div>
          <div className="col-md-1">
            <button className="btn btn-light rounded-3 w-100" onClick={() => { setFilters({ q: '', isPaid: '', isDelivered: '', status: '' }); setCurrentPage(1) }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="d-flex gap-2 overflow-auto mb-4 pb-2">
        {ORDER_STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => { setFilters(f => ({ ...f, status: tab.value })); setCurrentPage(1) }}
            className="btn btn-sm px-3 py-2 fw-bold border text-nowrap d-flex align-items-center gap-2 rounded-3"
            style={{
              background: filters.status === tab.value ? (tab.color || 'var(--primary-color)') : '#fff',
              color: filters.status === tab.value ? '#fff' : '#64748b',
              borderColor: filters.status === tab.value ? (tab.color || 'var(--primary-color)') : '#e2e8f0',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
            <span
              className="px-2 py-0.5 rounded-pill font-monospace"
              style={{
                fontSize: '0.7rem',
                background: filters.status === tab.value ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                color: filters.status === tab.value ? '#fff' : '#475569'
              }}
            >
              {getTabCount(tab.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-4 overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-3">
          <h6 className="fw-bold mb-0">Orders <span className="text-muted fw-normal">({count})</span></h6>
          {selectedIds.length > 0 && (
            <Button
              variant="primary"
              onClick={handleBulkPrint}
              className="btn-sm rounded-3 shadow-sm d-flex align-items-center gap-2 py-2 px-3 fw-bold"
              style={{ background: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
            >
              <i className="fas fa-print"></i>
              Print Selected Invoices ({selectedIds.length})
            </Button>
          )}
        </div>
        {loading ? <div className="p-4"><Loader /></div> : error ? <div className="p-4"><Message variant="danger">{error}</Message></div> : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-hover mb-0" style={{ fontSize: '0.85rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', border: 'none', width: '48px' }}>
                      <input
                        type="checkbox"
                        className="form-check-input shadow-none cursor-pointer"
                        style={{ width: '16px', height: '16px' }}
                        checked={orders.length > 0 && selectedIds.length === orders.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(orders.map(o => o._id))
                          } else {
                            setSelectedIds([])
                          }
                        }}
                      />
                    </th>
                    {['#', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Delivery', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', border: 'none', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={10} className="text-center p-4 text-muted">No orders found</td></tr>
                  ) : orders.map(order => (
                    <tr key={order._id} style={{ borderTop: '1px solid #f1f5f9', background: selectedIds.includes(order._id) ? '#fff8f4' : 'transparent' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="checkbox"
                          className="form-check-input shadow-none cursor-pointer"
                          style={{ width: '16px', height: '16px' }}
                          checked={selectedIds.includes(order._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(prev => [...prev, order._id])
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== order._id))
                            }
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ color: 'var(--primary-color)' }}>#{order._id}</span>
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=35x35&data=${encodeURIComponent(window.location.origin + '/track-order/' + order._id)}`} 
                            alt="QR" 
                            className="border p-0.5 rounded bg-white"
                            style={{ width: '24px', height: '24px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
                            onClick={() => openModal(order)}
                            title="View Details & QR"
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{getCustomerName(order)}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{order.createdBy?.email || ''}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {order.createdAt?.substring(0, 10) || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {order.orderItems?.length || 0} item(s)
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                        ${Number(order.totalPrice || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ color: order.isPaid ? '#10b981' : '#f59e0b', fontWeight: 600, fontSize: '0.78rem' }}>
                          {order.isPaid ? `✓ ${order.paidAt?.substring(0, 10) || 'Paid'}` : '⏳ Unpaid'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ color: order.isDelivered ? '#10b981' : '#94a3b8', fontWeight: 600, fontSize: '0.78rem' }}>
                          {order.isDelivered ? `✓ ${order.deliveredAt?.substring(0, 10) || 'Delivered'}` : '— Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <StatusBadge isPaid={order.isPaid} isDelivered={order.isDelivered} isCancelled={order.isCancelled} deliveryFailed={order.deliveryFailed} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="d-flex gap-1 flex-wrap">
                          <button
                            className="btn btn-sm btn-light rounded-3 border"
                            title="Edit Order"
                            onClick={() => openModal(order)}
                            style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-light rounded-3 border"
                            title="Print Invoice"
                            onClick={() => {
                              setSelectedIds([order._id])
                              setTimeout(() => {
                                handleBulkPrint()
                              }, 100)
                            }}
                            style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                          >
                            <i className="fas fa-print"></i>
                          </button>
                          {!order.isCancelled && !order.deliveryFailed && (
                            <>
                              {!order.isPaid && (
                                <button
                                  className="btn btn-sm rounded-3 border"
                                  title="Mark as Paid"
                                  onClick={() => handleUpdateOrder(order._id, { isPaid: true })}
                                  style={{ fontSize: '0.78rem', padding: '4px 8px', background: '#f0fff4', color: '#16a34a', borderColor: '#86efac' }}
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                              )}
                              {order.isPaid && !order.isDelivered && (
                                <button
                                  className="btn btn-sm rounded-3 border"
                                  title="Mark as Delivered"
                                  onClick={() => handleUpdateOrder(order._id, { isDelivered: true })}
                                  style={{ fontSize: '0.78rem', padding: '4px 8px', background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}
                                >
                                  <i className="fas fa-truck"></i>
                                </button>
                              )}
                              {!order.isDelivered && (
                                <>
                                  <button
                                    className="btn btn-sm rounded-3 border"
                                    title="Mark Delivery Failed"
                                    onClick={() => handleUpdateOrder(order._id, { deliveryFailed: true })}
                                    style={{ fontSize: '0.78rem', padding: '4px 8px', background: '#fff7ed', color: '#ea580c', borderColor: '#ffedd5' }}
                                  >
                                    <i className="fas fa-times-circle"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm rounded-3 border"
                                    title="Cancel Order"
                                    onClick={() => handleUpdateOrder(order._id, { isCancelled: true })}
                                    style={{ fontSize: '0.78rem', padding: '4px 8px', background: '#fef2f2', color: '#ef4444', borderColor: '#fca5a5' }}
                                  >
                                    <i className="fas fa-ban"></i>
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
          </>
        )}
      </div>

      {/* Order Detail Modal with Tracking */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            Fulfillment Details
          </Modal.Title>
        </Modal.Header>
        {selected && (
          <Modal.Body className="px-4 pb-4">
            {/* Tab Switcher */}
            <div className="d-flex gap-1 mb-4 p-1 rounded-3" style={{ background: '#f1f5f9' }}>
              {[
                { key: 'details', label: 'Order Details', icon: 'fas fa-file-invoice' },
                { key: 'tracking', label: 'Tracking Timeline', icon: 'fas fa-route' },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`btn btn-sm flex-grow-1 rounded-3 fw-semibold`}
                  onClick={() => setTrackingTab(tab.key)}
                  style={{
                    fontSize: '0.82rem', padding: '8px 12px',
                    background: trackingTab === tab.key ? '#fff' : 'transparent',
                    color: trackingTab === tab.key ? '#0f172a' : '#64748b',
                    boxShadow: trackingTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    border: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <i className={`${tab.icon} me-2`}></i>{tab.label}
                </button>
              ))}
            </div>

            {trackingTab === 'details' ? (
              <>
                {/* QR invoice header */}
                <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Invoice Reference</div>
                    <h4 className="fw-extrabold mb-1 mt-0" style={{ color: '#0f172a', fontSize: '1.35rem' }}>Reference: #{selected._id}</h4>
                    <div className="text-muted small">Generated on {selected.createdAt?.substring(0, 10)} at {selected.createdAt?.substring(11, 19)}</div>
                  </div>
                  <div className="text-center d-flex flex-column align-items-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '/track-order/' + selected._id)}`} 
                      alt="Order QR Code" 
                      className="border p-1 bg-white rounded-3 shadow-sm"
                      style={{ width: '80px', height: '80px' }}
                    />
                    <div className="text-muted font-monospace mt-1" style={{ fontSize: '0.62rem', letterSpacing: '0.05em', fontWeight: 600 }}>SCAN TO DISPATCH</div>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Customer Information</div>
                    <div className="p-3 bg-light rounded-3" style={{ fontSize: '0.88rem' }}>
                      <div className="fw-bold text-dark">{getCustomerName(selected)}</div>
                      <div className="text-muted">{selected.createdBy?.email}</div>
                      <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>Username: {selected.createdBy?.username}</div>
                      {selected.shippingAddress?.phoneNumber && (
                        <div className="text-dark fw-bold mt-1" style={{ fontSize: '0.82rem' }}>
                          <i className="fas fa-phone-alt me-1.5 text-muted"></i>Phone: {selected.shippingAddress.phoneNumber}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Shipping Address</div>
                    <div className="p-3 bg-light rounded-3" style={{ fontSize: '0.88rem', minHeight: '84px' }}>
                      {selected.shippingAddress ? (
                        <div>
                          {selected.shippingAddress.name && (
                            <div className="fw-bold text-dark mb-1">
                              Recipient: {selected.shippingAddress.name}
                            </div>
                          )}
                          <div>{selected.shippingAddress.address}</div>
                          <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                            {[
                              selected.shippingAddress.union && `Union: ${selected.shippingAddress.union}`,
                              selected.shippingAddress.policeStation && `P.S: ${selected.shippingAddress.policeStation}`,
                              selected.shippingAddress.district && `${selected.shippingAddress.district}`,
                              selected.shippingAddress.division && `${selected.shippingAddress.division}`,
                            ].filter(Boolean).join(', ')}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                            {selected.shippingAddress.postalCode && `Postal Code: ${selected.shippingAddress.postalCode}`}
                            {selected.shippingAddress.country && ` (${selected.shippingAddress.country})`}
                          </div>
                          {selected.shippingAddress.phoneNumber && (
                            <div className="text-dark fw-semibold mt-1" style={{ fontSize: '0.8rem' }}>
                              <i className="fas fa-phone-alt me-1.5 text-muted"></i>{selected.shippingAddress.phoneNumber}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted italic">No shipping address provided</span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Payment Summary</div>
                    <div className="p-3 bg-light rounded-3" style={{ fontSize: '0.88rem' }}>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Method:</span>
                        <span className="fw-bold text-dark">{selected.paymentMethod}</span>
                      </div>
                      <div className="d-flex justify-content-between mt-1">
                        <span className="text-muted">Status:</span>
                        <span style={{ color: selected.isPaid ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                          {selected.isPaid ? `Paid on ${selected.paidAt?.substring(0, 10)}` : 'Unpaid'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Delivery Details</div>
                    <div className="p-3 bg-light rounded-3" style={{ fontSize: '0.88rem' }}>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Status:</span>
                        <span style={{
                          color: selected.isCancelled ? '#ef4444' : selected.deliveryFailed ? '#ea580c' : selected.isDelivered ? '#10b981' : '#f59e0b',
                          fontWeight: 600
                        }}>
                          {selected.isCancelled ? 'Cancelled' : selected.deliveryFailed ? 'Delivery Failed' : selected.isDelivered ? 'Delivered' : 'Pending Delivery'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mt-1">
                        <span className="text-muted">Date:</span>
                        <span className="fw-bold text-dark">
                          {selected.isDelivered ? selected.deliveredAt?.substring(0, 10) : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items List */}
                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Ordered Items</div>
                <div className="border rounded-3 mb-4 overflow-hidden">
                  <table className="table table-hover mb-0" style={{ fontSize: '0.82rem' }}>
                    <thead className="table-light">
                      <tr>
                        <th style={{ border: 'none' }}>Product</th>
                        <th style={{ border: 'none', textAlign: 'center' }}>Qty</th>
                        <th style={{ border: 'none', textAlign: 'right' }}>Price</th>
                        <th style={{ border: 'none', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.orderItems?.map(item => (
                        <tr key={item._id} style={{ verticalAlign: 'middle' }}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img src={item.image || '/static/placeholder.png'} alt={item.name}
                                style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                              <span className="fw-semibold text-dark" style={{ maxWidth: '220px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>{item.qty}</td>
                          <td style={{ textAlign: 'right' }}>${Number(item.price || 0).toFixed(2)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>${(item.qty * (item.price || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="row justify-content-end mb-4">
                  <div className="col-md-5">
                    <div className="d-flex justify-content-between border-bottom pb-1" style={{ fontSize: '0.82rem' }}>
                      <span className="text-muted">Items Subtotal:</span>
                      <span className="fw-semibold text-dark">
                        ${(selected.orderItems || []).reduce((acc, item) => acc + (item.qty * (item.price || 0)), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between border-bottom py-1" style={{ fontSize: '0.82rem' }}>
                      <span className="text-muted">Shipping:</span>
                      <span className="fw-semibold text-dark">${Number(selected.shippingPrice || 0).toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between border-bottom py-1" style={{ fontSize: '0.82rem' }}>
                      <span className="text-muted">Tax (5%):</span>
                      <span className="fw-semibold text-dark">${Number(selected.taxPrice || 0).toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between pt-2" style={{ fontSize: '1.05rem' }}>
                      <span className="fw-bold text-dark">Total:</span>
                      <span className="fw-extrabold" style={{ color: 'var(--primary-color)' }}>
                        ${Number(selected.totalPrice || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <hr />

                <div className="d-flex gap-3 mt-3 flex-wrap">
                  {!selected.isCancelled && !selected.deliveryFailed && (
                    <>
                      {!selected.isPaid && (
                        <button className="btn btn-sm fw-bold rounded-3 flex-grow-1 py-2"
                          style={{ background: '#f0fff4', color: '#16a34a', border: '1px solid #86efac' }}
                          onClick={() => { handleUpdateOrder(selected._id, { isPaid: true }); setShowModal(false) }}>
                          <i className="fas fa-check me-2"></i>Mark as Paid
                        </button>
                      )}
                      {selected.isPaid && !selected.isDelivered && (
                        <button className="btn btn-sm fw-bold rounded-3 flex-grow-1 py-2"
                          style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
                          onClick={() => { handleUpdateOrder(selected._id, { isDelivered: true }); setShowModal(false) }}>
                          <i className="fas fa-truck me-2"></i>Mark as Delivered
                        </button>
                      )}
                      {!selected.isDelivered && (
                        <>
                          <button className="btn btn-sm fw-bold rounded-3 flex-grow-1 py-2"
                            style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5' }}
                            onClick={() => { handleUpdateOrder(selected._id, { deliveryFailed: true }); setShowModal(false) }}>
                            <i className="fas fa-times-circle me-2"></i>Mark Failed
                          </button>
                          <button className="btn btn-sm fw-bold rounded-3 flex-grow-1 py-2"
                            style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5' }}
                            onClick={() => { handleUpdateOrder(selected._id, { isCancelled: true }); setShowModal(false) }}>
                            <i className="fas fa-ban me-2"></i>Cancel Order
                          </button>
                        </>
                      )}
                    </>
                  )}
                  <button className="btn btn-sm fw-bold rounded-3 flex-grow-1 py-2 btn-outline-primary"
                    onClick={() => {
                      setSelectedIds([selected._id])
                      setTimeout(() => {
                        handleBulkPrint()
                      }, 100)
                    }}>
                    <i className="fas fa-print me-2"></i>Print Invoice
                  </button>
                </div>
              </>
            ) : (
              /* ── Tracking Timeline Tab ── */
              <div>
                {/* Mini order summary */}
                <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="text-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(window.location.origin + '/track-order/' + selected._id)}`} 
                      alt="QR" 
                      className="border p-1 bg-white rounded-3"
                      style={{ width: '56px', height: '56px' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="fw-bold" style={{ color: '#0f172a' }}>Order #{selected._id}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{getCustomerName(selected)} · ${Number(selected.totalPrice || 0).toFixed(2)}</div>
                  </div>
                  <StatusBadge isPaid={selected.isPaid} isDelivered={selected.isDelivered} isCancelled={selected.isCancelled} deliveryFailed={selected.deliveryFailed} />
                </div>

                {/* Timeline */}
                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>
                  <i className="fas fa-history me-1"></i> Tracking History
                </div>
                <div className="p-3 rounded-3 mb-4" style={{ background: '#fafbfc', border: '1px solid #f1f5f9', maxHeight: '300px', overflowY: 'auto' }}>
                  {trackingLoading ? <Loader /> : <TrackingTimeline events={trackingEvents} />}
                </div>

                {/* Add Tracking Event */}
                {!selected.isCancelled && !selected.isDelivered && (
                  <div className="p-3 rounded-3" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0369a1', marginBottom: '8px' }}>
                      <i className="fas fa-plus-circle me-1"></i> Add Tracking Event
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <Form.Select
                        value={newEvent.status}
                        onChange={e => setNewEvent(ev => ({ ...ev, status: e.target.value }))}
                        className="shadow-none rounded-3 flex-grow-1"
                        style={{ border: '1px solid #e2e8f0', fontSize: '0.82rem', minWidth: '160px' }}
                      >
                        <option value="">Select status...</option>
                        <option value="confirmed">✅ Order Confirmed</option>
                        <option value="processing">⚙️ Processing</option>
                        <option value="shipped">🚀 Shipped</option>
                        <option value="out_for_delivery">🚚 Out for Delivery</option>
                        <option value="delivered">📦 Delivered</option>
                      </Form.Select>
                      <input
                        type="text"
                        className="form-control shadow-none rounded-3 flex-grow-1"
                        placeholder="Note (optional)..."
                        value={newEvent.note}
                        onChange={e => setNewEvent(ev => ({ ...ev, note: e.target.value }))}
                        style={{ border: '1px solid #e2e8f0', fontSize: '0.82rem', minWidth: '180px' }}
                      />
                      <button
                        className="btn btn-sm fw-bold rounded-3 px-3"
                        style={{ background: 'var(--primary-color)', color: '#fff', whiteSpace: 'nowrap' }}
                        onClick={handleAddTrackingEvent}
                        disabled={!newEvent.status || addLoading}
                      >
                        {addLoading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-plus me-1"></i>Add</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
        )}
      </Modal>

    </AdminLayout>
  )
}

export default AdminOrders
