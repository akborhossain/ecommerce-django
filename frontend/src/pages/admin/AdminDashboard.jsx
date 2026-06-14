import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAdminDashboard } from '../../actions/adminActions'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const StatCard = ({ label, value, sub, icon, color, to }) => (
  <div
    className="rounded-4 p-4 position-relative overflow-hidden"
    style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: to ? 'pointer' : 'default' }}
    onClick={to ? () => window.location.href = to : undefined}
  >
    <div className="d-flex justify-content-between align-items-start">
      <div>
        <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginTop: '4px' }}>{value}</div>
        {sub && <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '4px' }}>{sub}</div>}
      </div>
      <div
        className="d-flex align-items-center justify-content-center rounded-3"
        style={{ width: '48px', height: '48px', background: color + '18', flexShrink: 0 }}
      >
        <i className={icon} style={{ color, fontSize: '1.3rem' }}></i>
      </div>
    </div>
    <div
      style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', width: '100%', background: color, opacity: 0.5 }}
    />
  </div>
)

const statusStyle = (isPaid, isDelivered) => {
  if (isDelivered) return { bg: '#f0fff4', color: '#16a34a', text: 'Delivered' }
  if (isPaid) return { bg: '#eff6ff', color: '#2563eb', text: 'Processing' }
  return { bg: '#fffbeb', color: '#d97706', text: 'Pending' }
}

function AdminDashboard() {
  const dispatch = useDispatch()
  const { loading, stats, error } = useSelector(s => s.adminDashboard)

  useEffect(() => { dispatch(getAdminDashboard()) }, [dispatch])

  return (
    <AdminLayout title="Dashboard">
      {loading ? <Loader /> : error ? <Message variant="danger">{error}</Message> : stats ? (
        <>
          {/* Stats Grid */}
          <div className="row g-4 mb-4">
            <div className="col-sm-6 col-xl-3">
              <StatCard label="Total Revenue" value={`$${Number(stats.revenue?.total || 0).toFixed(2)}`}
                sub={`$${Number(stats.revenue?.monthly || 0).toFixed(2)} this month`}
                icon="fas fa-dollar-sign" color="#f57224" to="/admin-panel/orders" />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard label="Total Orders" value={stats.orders?.total || 0}
                sub={`${stats.orders?.pending || 0} pending payment`}
                icon="fas fa-shopping-bag" color="#6366f1" to="/admin-panel/orders" />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard label="Products" value={stats.products?.total || 0}
                sub={`${stats.products?.low_stock || 0} low stock`}
                icon="fas fa-box" color="#10b981" to="/admin-panel/products" />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard label="Customers" value={stats.users?.total || 0}
                sub={`${stats.users?.new_this_month || 0} new this month`}
                icon="fas fa-users" color="#ec4899" to="/admin-panel/users" />
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="rounded-4 p-4" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.88rem' }}>Order Status Overview</h6>
                <div className="d-flex flex-column gap-3">
                  {[
                    { label: 'Delivered', value: stats.orders?.delivered, color: '#10b981', icon: 'fas fa-check-circle' },
                    { label: 'Processing', value: (stats.orders?.total || 0) - (stats.orders?.delivered || 0) - (stats.orders?.pending || 0), color: '#6366f1', icon: 'fas fa-spinner' },
                    { label: 'Pending Payment', value: stats.orders?.pending, color: '#f59e0b', icon: 'fas fa-clock' },
                  ].map(item => (
                    <div key={item.label} className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <i className={item.icon} style={{ color: item.color, width: '16px' }}></i>
                        <span style={{ fontSize: '0.85rem', color: '#475569' }}>{item.label}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.value || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="rounded-4 p-4" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.88rem' }}>Product Alerts</h6>
                <div className="d-flex flex-column gap-3">
                  {[
                    { label: 'Total Products', value: stats.products?.total, color: '#6366f1', icon: 'fas fa-box' },
                    { label: 'Low Stock (≤5)', value: stats.products?.low_stock, color: '#f59e0b', icon: 'fas fa-exclamation-triangle' },
                    { label: 'Out of Stock', value: stats.products?.out_of_stock, color: '#ef4444', icon: 'fas fa-times-circle' },
                  ].map(item => (
                    <div key={item.label} className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <i className={item.icon} style={{ color: item.color, width: '16px' }}></i>
                        <span style={{ fontSize: '0.85rem', color: '#475569' }}>{item.label}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.value || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="rounded-4 p-4" style={{ background: 'linear-gradient(135deg, #f57224, #d05b19)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h6 className="fw-bold text-white mb-3" style={{ fontSize: '0.88rem' }}>Quick Actions</h6>
                <div className="d-flex flex-column gap-2">
                  {[
                    { label: 'View All Orders', to: '/admin-panel/orders', icon: 'fas fa-shopping-bag' },
                    { label: 'Manage Products', to: '/admin-panel/products', icon: 'fas fa-box' },
                    { label: 'Manage Users', to: '/admin-panel/users', icon: 'fas fa-users' },
                    { label: 'Manage Roles', to: '/admin-panel/roles', icon: 'fas fa-user-shield' },
                  ].map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="d-flex align-items-center gap-2 text-decoration-none px-3 py-2 rounded-3"
                      style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    >
                      <i className={item.icon} style={{ width: '16px' }}></i>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="rounded-4 overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="p-4 border-bottom d-flex align-items-center justify-content-between">
              <h6 className="fw-bold text-dark mb-0">Recent Orders</h6>
              <Link to="/admin-panel/orders" className="btn btn-sm btn-light rounded-pill px-3" style={{ fontSize: '0.78rem' }}>
                View All <i className="fas fa-arrow-right ms-1"></i>
              </Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-hover mb-0" style={{ fontSize: '0.84rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    {['Order #', 'Customer', 'Date', 'Total', 'Payment', 'Delivery', 'Status'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', border: 'none' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(stats.recent_orders || []).map(order => {
                    const s = statusStyle(order.isPaid, order.isDelivered)
                    return (
                      <tr key={order.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>#{order.id}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{order.customer}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{order.email}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{order.createdAt}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700 }}>${order.total.toFixed(2)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ color: order.isPaid ? '#10b981' : '#f59e0b', fontWeight: 600, fontSize: '0.78rem' }}>
                            {order.isPaid ? '✓ Paid' : '⏳ Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ color: order.isDelivered ? '#10b981' : '#94a3b8', fontWeight: 600, fontSize: '0.78rem' }}>
                            {order.isDelivered ? '✓ Delivered' : '— Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {s.text}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </AdminLayout>
  )
}

export default AdminDashboard
