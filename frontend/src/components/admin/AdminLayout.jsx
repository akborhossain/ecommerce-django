import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getMyPermissions } from '../../actions/adminActions'

const navItems = [
  { path: '/admin-panel', label: 'Dashboard',   icon: 'fas fa-chart-line',   perm: 'manage_dashboard' },
  { path: '/admin-panel/orders', label: 'Orders', icon: 'fas fa-shopping-bag', perm: 'manage_orders' },
  { path: '/admin-panel/returns', label: 'Returns', icon: 'fas fa-undo',       perm: 'manage_orders' },
  { path: '/admin-panel/products', label: 'Products', icon: 'fas fa-box',     perm: 'manage_products' },
  { path: '/admin-panel/categories', label: 'Categories', icon: 'fas fa-tags', perm: 'manage_products' },
  { path: '/admin-panel/stock', label: 'Stock',   icon: 'fas fa-warehouse',   perm: 'manage_stock' },
  { path: '/admin-panel/users', label: 'Users',   icon: 'fas fa-users',       perm: 'manage_users' },
  { path: '/admin-panel/roles', label: 'Roles',   icon: 'fas fa-user-shield', perm: 'manage_roles' },
  { path: '/admin-panel/permissions', label: 'Permissions', icon: 'fas fa-key', perm: 'manage_permissions' },
]

function AdminLayout({ children, title }) {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { userInfo } = useSelector(s => s.userLogin)
  const { permissions = [], roles = [], is_superuser } = useSelector(s => s.myPermissions)

  useEffect(() => {
    if (!userInfo) { navigate('/login?redirect=/admin-panel'); return }
    dispatch(getMyPermissions())
  }, [dispatch, userInfo, navigate])

  const hasAccess = (perm) => is_superuser || permissions.includes(perm)

  const visibleNav = navItems.filter(item => hasAccess(item.perm))

  return (
    <div className="admin-layout-wrapper" style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* ── Sidebar ──────────────────────────────────── */}
      <div
        className="admin-sidebar no-print"
        style={{
          width: sidebarOpen ? '260px' : '72px',
          background: '#0f172a',
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 100,
          overflowX: 'hidden',
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{ width: '36px', height: '36px', background: 'var(--primary-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <i className="fas fa-store" style={{ color: '#fff', fontSize: '1rem' }}></i>
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>DarazShop</div>
              <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Admin Panel</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
          >
            <i className={`fas ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`} style={{ fontSize: '0.85rem' }}></i>
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {visibleNav.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin-panel' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  textDecoration: 'none',
                  background: isActive ? 'var(--primary-color)' : 'transparent',
                  color: isActive ? '#fff' : '#94a3b8',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <i className={item.icon} style={{ fontSize: '1rem', width: '20px', textAlign: 'center', flexShrink: 0 }}></i>
                {sidebarOpen && <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Info at bottom */}
        {sidebarOpen && userInfo && (
          <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--primary-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0
              }}>
                {userInfo.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userInfo.name}
                </div>
                <div style={{ color: '#475569', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {is_superuser ? 'Superuser' : roles.map(r => r.role__name).join(', ') || 'Staff'}
                </div>
              </div>
            </div>
            <Link
              to="/"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.8rem', textDecoration: 'none' }}
            >
              <i className="fas fa-arrow-left"></i> Back to Store
            </Link>
          </div>
        )}
      </div>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="admin-content-wrapper" style={{ marginLeft: sidebarOpen ? '260px' : '72px', flex: 1, transition: 'margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header Bar */}
        <header className="no-print" style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{title || 'Admin Panel'}</h1>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {location.pathname.replace('/admin-panel', 'Admin').replace(/\//g, ' › ')}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/" className="btn btn-sm btn-light rounded-pill px-3" style={{ fontSize: '0.8rem' }}>
              <i className="fas fa-store me-1"></i> View Store
            </Link>
            {userInfo && (
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--primary-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
              }}>
                {userInfo.name?.[0]?.toUpperCase() || 'A'}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
