import * as C from '../constants/adminConstants'

// ── Dashboard ──────────────────────────────────────────────────
export const adminDashboardReducer = (state = { stats: null }, action) => {
  switch (action.type) {
    case C.ADMIN_DASHBOARD_REQUEST: return { loading: true, stats: null }
    case C.ADMIN_DASHBOARD_SUCCESS: return { loading: false, stats: action.payload }
    case C.ADMIN_DASHBOARD_FAIL:    return { loading: false, error: action.payload }
    default: return state
  }
}

// ── Orders (with pagination) ────────────────────────────────────
export const adminOrdersReducer = (state = { orders: [], page: 1, pages: 1, count: 0, counts: {} }, action) => {
  switch (action.type) {
    case C.ADMIN_ORDERS_REQUEST: return { ...state, loading: true }
    case C.ADMIN_ORDERS_SUCCESS: return {
      loading: false,
      orders: action.payload.orders,
      page: action.payload.page,
      pages: action.payload.pages,
      count: action.payload.count,
      counts: action.payload.counts,
    }
    case C.ADMIN_ORDERS_FAIL: return { ...state, loading: false, error: action.payload }
    default: return state
  }
}

export const adminOrderUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case C.ADMIN_ORDER_UPDATE_REQUEST: return { loading: true }
    case C.ADMIN_ORDER_UPDATE_SUCCESS: return { loading: false, success: true, order: action.payload }
    case C.ADMIN_ORDER_UPDATE_FAIL:    return { loading: false, error: action.payload }
    case C.ADMIN_ORDER_UPDATE_RESET:   return {}
    default: return state
  }
}

// ── Order Tracking ──────────────────────────────────────────────
export const adminOrderTrackingReducer = (state = { events: [], addLoading: false }, action) => {
  switch (action.type) {
    case C.ADMIN_ORDER_TRACKING_REQUEST: return { ...state, loading: true }
    case C.ADMIN_ORDER_TRACKING_SUCCESS: return { ...state, loading: false, events: action.payload }
    case C.ADMIN_ORDER_TRACKING_FAIL:    return { ...state, loading: false, error: action.payload }
    case C.ADMIN_ORDER_TRACKING_ADD_REQUEST: return { ...state, addLoading: true }
    case C.ADMIN_ORDER_TRACKING_ADD_SUCCESS: return {
      ...state, addLoading: false, addSuccess: true,
      events: [...state.events, action.payload]
    }
    case C.ADMIN_ORDER_TRACKING_ADD_FAIL: return { ...state, addLoading: false, addError: action.payload }
    default: return state
  }
}

// ── Products (with pagination) ──────────────────────────────────
export const adminProductsReducer = (state = { products: [], page: 1, pages: 1, count: 0 }, action) => {
  switch (action.type) {
    case C.ADMIN_PRODUCTS_REQUEST: return { ...state, loading: true }
    case C.ADMIN_PRODUCTS_SUCCESS: return {
      loading: false,
      products: action.payload.products,
      page: action.payload.page,
      pages: action.payload.pages,
      count: action.payload.count,
    }
    case C.ADMIN_PRODUCTS_FAIL: return { ...state, loading: false, error: action.payload }
    case C.ADMIN_PRODUCT_DELETE_SUCCESS:
      return { ...state, products: state.products.filter(p => p._id !== action.payload) }
    case C.ADMIN_STOCK_UPDATE_SUCCESS:
      return {
        ...state,
        products: state.products.map(p =>
          p._id === action.payload.id
            ? { ...p, countInStock: action.payload.countInStock }
            : p
        )
      }
    default: return state
  }
}

export const adminProductCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case C.ADMIN_PRODUCT_CREATE_REQUEST: return { loading: true }
    case C.ADMIN_PRODUCT_CREATE_SUCCESS: return { loading: false, success: true, product: action.payload }
    case C.ADMIN_PRODUCT_CREATE_FAIL:    return { loading: false, error: action.payload }
    case C.ADMIN_PRODUCT_CREATE_RESET:   return {}
    default: return state
  }
}

// ── Users ───────────────────────────────────────────────────────
export const adminUsersReducer = (state = { users: [] }, action) => {
  switch (action.type) {
    case C.ADMIN_USERS_REQUEST: return { loading: true, users: [] }
    case C.ADMIN_USERS_SUCCESS: return { loading: false, users: action.payload }
    case C.ADMIN_USERS_FAIL:    return { loading: false, error: action.payload, users: [] }
    case C.ADMIN_USER_UPDATE_SUCCESS:
      return {
        ...state,
        users: state.users.map(u => u.id === action.payload.id ? action.payload : u)
      }
    default: return state
  }
}

export const adminUserDetailReducer = (state = { user: null }, action) => {
  switch (action.type) {
    case C.ADMIN_USER_DETAIL_REQUEST: return { loading: true, user: null }
    case C.ADMIN_USER_DETAIL_SUCCESS: return { loading: false, user: action.payload }
    case C.ADMIN_USER_DETAIL_FAIL:    return { loading: false, error: action.payload, user: null }
    default: return state
  }
}

// ── Roles ───────────────────────────────────────────────────────
export const adminRolesReducer = (state = { roles: [] }, action) => {
  switch (action.type) {
    case C.ADMIN_ROLES_REQUEST: return { loading: true, roles: [] }
    case C.ADMIN_ROLES_SUCCESS: return { loading: false, roles: action.payload }
    case C.ADMIN_ROLES_FAIL:    return { loading: false, error: action.payload, roles: [] }
    case C.ADMIN_ROLE_CREATE_SUCCESS:
      return { ...state, roles: [...state.roles, action.payload] }
    case C.ADMIN_ROLE_DELETE_SUCCESS:
      return { ...state, roles: state.roles.filter(r => r.id !== action.payload) }
    default: return state
  }
}

// ── Permissions ─────────────────────────────────────────────────
export const adminPermissionsReducer = (state = { permissions: [] }, action) => {
  switch (action.type) {
    case C.ADMIN_PERMISSIONS_REQUEST: return { loading: true, permissions: [] }
    case C.ADMIN_PERMISSIONS_SUCCESS: return { loading: false, permissions: action.payload }
    case C.ADMIN_PERMISSIONS_FAIL:    return { loading: false, error: action.payload, permissions: [] }
    case C.ADMIN_PERMISSION_CREATE_SUCCESS:
      return { ...state, permissions: [...state.permissions, action.payload] }
    case C.ADMIN_PERMISSION_UPDATE_SUCCESS:
      return {
        ...state,
        permissions: state.permissions.map(p => p.id === action.payload.id ? action.payload : p)
      }
    case C.ADMIN_PERMISSION_DELETE_SUCCESS:
      return { ...state, permissions: state.permissions.filter(p => p.id !== action.payload) }
    default: return state
  }
}

// ── Current User Permissions ─────────────────────────────────────
export const myPermissionsReducer = (state = { permissions: [], roles: [] }, action) => {
  switch (action.type) {
    case C.MY_PERMISSIONS_REQUEST: return { loading: true, permissions: [], roles: [] }
    case C.MY_PERMISSIONS_SUCCESS: return { loading: false, ...action.payload }
    case C.MY_PERMISSIONS_FAIL:    return { loading: false, error: action.payload, permissions: [], roles: [] }
    default: return state
  }
}

// ── Categories ──────────────────────────────────────────────────
export const adminCategoriesReducer = (state = { categories: [] }, action) => {
  switch (action.type) {
    case C.ADMIN_CATEGORIES_REQUEST: return { loading: true, categories: [] }
    case C.ADMIN_CATEGORIES_SUCCESS: return { loading: false, categories: action.payload }
    case C.ADMIN_CATEGORIES_FAIL:    return { loading: false, error: action.payload, categories: [] }
    case C.ADMIN_CATEGORY_CREATE_SUCCESS:
      return { ...state, categories: [...state.categories, action.payload] }
    case C.ADMIN_CATEGORY_UPDATE_SUCCESS:
      return {
        ...state,
        categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c)
      }
    case C.ADMIN_CATEGORY_DELETE_SUCCESS:
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) }
    default: return state
  }
}
