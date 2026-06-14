import axios from 'axios'
import * as C from '../constants/adminConstants'
import { logout } from './userAction'

const getConfig = (getState) => {
  const { userLogin: { userInfo } } = getState()
  return { headers: { Authorization: `Bearer ${userInfo.token}` } }
}

const BASE = '/admin-panel'

// ── Dashboard ──────────────────────────────────────────────────
export const getAdminDashboard = () => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_DASHBOARD_REQUEST })
    const { data } = await axios.get(`${BASE}/dashboard/`, getConfig(getState))
    dispatch({ type: C.ADMIN_DASHBOARD_SUCCESS, payload: data })
  } catch (e) {
    if (e.response?.status === 401) {
      dispatch(logout())
    }
    dispatch({ type: C.ADMIN_DASHBOARD_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

// ── Orders ──────────────────────────────────────────────────────
export const getAdminOrders = (filters = {}) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_ORDERS_REQUEST })
    const params = new URLSearchParams(filters).toString()
    const { data } = await axios.get(`${BASE}/orders/?${params}`, getConfig(getState))
    dispatch({
      type: C.ADMIN_ORDERS_SUCCESS,
      payload: {
        orders: data.data || [],
        page: data.page || 1,
        pages: data.pages || 1,
        count: data.count || 0,
        counts: data.counts || {},
      }
    })
  } catch (e) {
    if (e.response?.status === 401) {
      dispatch(logout())
    }
    dispatch({ type: C.ADMIN_ORDERS_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const updateAdminOrder = (id, payload) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_ORDER_UPDATE_REQUEST })
    const { data } = await axios.put(`${BASE}/orders/${id}/`, payload, getConfig(getState))
    dispatch({ type: C.ADMIN_ORDER_UPDATE_SUCCESS, payload: data.data })
  } catch (e) {
    dispatch({ type: C.ADMIN_ORDER_UPDATE_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

// ── Products ────────────────────────────────────────────────────
export const getAdminProducts = (filters = {}) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_PRODUCTS_REQUEST })
    const params = new URLSearchParams(filters).toString()
    const { data } = await axios.get(`${BASE}/products/?${params}`, getConfig(getState))
    dispatch({
      type: C.ADMIN_PRODUCTS_SUCCESS,
      payload: {
        products: data.data || [],
        page: data.page || 1,
        pages: data.pages || 1,
        count: data.count || 0,
      }
    })
  } catch (e) {
    if (e.response?.status === 401) {
      dispatch(logout())
    }
    dispatch({ type: C.ADMIN_PRODUCTS_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const createAdminProduct = (formData) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_PRODUCT_CREATE_REQUEST })
    const { data } = await axios.post(`${BASE}/products/`, formData, {
      ...getConfig(getState),
      headers: { ...getConfig(getState).headers, 'Content-Type': 'multipart/form-data' }
    })
    dispatch({ type: C.ADMIN_PRODUCT_CREATE_SUCCESS, payload: data.data })
  } catch (e) {
    dispatch({ type: C.ADMIN_PRODUCT_CREATE_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const updateAdminProduct = (id, formData) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_PRODUCT_UPDATE_REQUEST })
    const { data } = await axios.put(`${BASE}/products/${id}/`, formData, {
      ...getConfig(getState),
      headers: { ...getConfig(getState).headers, 'Content-Type': 'multipart/form-data' }
    })
    dispatch({ type: C.ADMIN_PRODUCT_UPDATE_SUCCESS, payload: data.data })
  } catch (e) {
    dispatch({ type: C.ADMIN_PRODUCT_UPDATE_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const deleteAdminProduct = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_PRODUCT_DELETE_REQUEST })
    await axios.delete(`${BASE}/products/${id}/`, getConfig(getState))
    dispatch({ type: C.ADMIN_PRODUCT_DELETE_SUCCESS, payload: id })
  } catch (e) {
    dispatch({ type: C.ADMIN_PRODUCT_DELETE_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const updateProductStock = (id, countInStock) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_STOCK_UPDATE_REQUEST })
    const { data } = await axios.put(`${BASE}/products/${id}/stock/`, { countInStock }, getConfig(getState))
    dispatch({ type: C.ADMIN_STOCK_UPDATE_SUCCESS, payload: { id, countInStock: data.countInStock } })
  } catch (e) {
    dispatch({ type: C.ADMIN_STOCK_UPDATE_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

// ── Users ───────────────────────────────────────────────────────
export const getAdminUsers = (filters = {}) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_USERS_REQUEST })
    const params = new URLSearchParams(filters).toString()
    const { data } = await axios.get(`${BASE}/users/?${params}`, getConfig(getState))
    dispatch({ type: C.ADMIN_USERS_SUCCESS, payload: data.data || [] })
  } catch (e) {
    if (e.response?.status === 401) {
      dispatch(logout())
    }
    dispatch({ type: C.ADMIN_USERS_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const getAdminUserDetail = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_USER_DETAIL_REQUEST })
    const { data } = await axios.get(`${BASE}/users/${id}/`, getConfig(getState))
    dispatch({ type: C.ADMIN_USER_DETAIL_SUCCESS, payload: data.data })
  } catch (e) {
    dispatch({ type: C.ADMIN_USER_DETAIL_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const updateAdminUser = (id, payload) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_USER_UPDATE_REQUEST })
    const { data } = await axios.put(`${BASE}/users/${id}/`, payload, getConfig(getState))
    dispatch({ type: C.ADMIN_USER_UPDATE_SUCCESS, payload: data.data })
  } catch (e) {
    dispatch({ type: C.ADMIN_USER_UPDATE_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const assignRoleToUser = (userId, roleId) => async (dispatch, getState) => {
  await axios.post(`${BASE}/users/${userId}/roles/`, { role_id: roleId }, getConfig(getState))
}

export const removeRoleFromUser = (userId, roleId) => async (dispatch, getState) => {
  await axios.delete(`${BASE}/users/${userId}/roles/${roleId}/`, getConfig(getState))
}

export const assignPermissionToUser = (userId, permId) => async (dispatch, getState) => {
  await axios.post(`${BASE}/users/${userId}/permissions/`, { permission_id: permId }, getConfig(getState))
}

export const removePermissionFromUser = (userId, permId) => async (dispatch, getState) => {
  await axios.delete(`${BASE}/users/${userId}/permissions/${permId}/`, getConfig(getState))
}

// ── Roles ───────────────────────────────────────────────────────
export const getAdminRoles = () => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_ROLES_REQUEST })
    const { data } = await axios.get(`${BASE}/roles/`, getConfig(getState))
    dispatch({ type: C.ADMIN_ROLES_SUCCESS, payload: data.data || [] })
  } catch (e) {
    if (e.response?.status === 401) {
      dispatch(logout())
    }
    dispatch({ type: C.ADMIN_ROLES_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const createAdminRole = (payload) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_ROLE_CREATE_REQUEST })
    const { data } = await axios.post(`${BASE}/roles/`, payload, getConfig(getState))
    dispatch({ type: C.ADMIN_ROLE_CREATE_SUCCESS, payload: data.data })
  } catch (e) {
    dispatch({ type: C.ADMIN_ROLE_CREATE_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const updateAdminRole = (id, payload) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_ROLE_UPDATE_REQUEST })
    await axios.put(`${BASE}/roles/${id}/`, payload, getConfig(getState))
    dispatch({ type: C.ADMIN_ROLE_UPDATE_SUCCESS })
  } catch (e) {
    dispatch({ type: C.ADMIN_ROLE_UPDATE_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const deleteAdminRole = (id) => async (dispatch, getState) => {
  await axios.delete(`${BASE}/roles/${id}/`, getConfig(getState))
  dispatch({ type: C.ADMIN_ROLE_DELETE_SUCCESS, payload: id })
}

export const addPermissionToRole = (roleId, permId) => async (dispatch, getState) => {
  await axios.post(`${BASE}/roles/${roleId}/permissions/`, { permission_id: permId }, getConfig(getState))
}

export const removePermissionFromRole = (roleId, permId) => async (dispatch, getState) => {
  await axios.delete(`${BASE}/roles/${roleId}/permissions/${permId}/`, getConfig(getState))
}

// ── Permissions ─────────────────────────────────────────────────
export const getAdminPermissions = () => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_PERMISSIONS_REQUEST })
    const { data } = await axios.get(`${BASE}/permissions/`, getConfig(getState))
    dispatch({ type: C.ADMIN_PERMISSIONS_SUCCESS, payload: data.data || [] })
  } catch (e) {
    if (e.response?.status === 401) {
      dispatch(logout())
    }
    dispatch({ type: C.ADMIN_PERMISSIONS_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const createAdminPermission = (payload) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_PERMISSION_CREATE_REQUEST })
    const { data } = await axios.post(`${BASE}/permissions/`, payload, getConfig(getState))
    dispatch({ type: C.ADMIN_PERMISSION_CREATE_SUCCESS, payload: data.data })
  } catch (e) {
    dispatch({ type: C.ADMIN_PERMISSION_CREATE_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const updateAdminPermission = (id, payload) => async (dispatch, getState) => {
  const { data } = await axios.put(`${BASE}/permissions/${id}/`, payload, getConfig(getState))
  dispatch({ type: C.ADMIN_PERMISSION_UPDATE_SUCCESS, payload: data.data })
}

export const deleteAdminPermission = (id) => async (dispatch, getState) => {
  await axios.delete(`${BASE}/permissions/${id}/`, getConfig(getState))
  dispatch({ type: C.ADMIN_PERMISSION_DELETE_SUCCESS, payload: id })
}

// ── Current User Permissions ─────────────────────────────────────
export const getMyPermissions = () => async (dispatch, getState) => {
  try {
    dispatch({ type: C.MY_PERMISSIONS_REQUEST })
    const { data } = await axios.get(`${BASE}/me/`, getConfig(getState))
    dispatch({ type: C.MY_PERMISSIONS_SUCCESS, payload: data })
  } catch (e) {
    if (e.response?.status === 401) {
      dispatch(logout())
    }
    dispatch({ type: C.MY_PERMISSIONS_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

// ── Categories ──────────────────────────────────────────────────
export const getAdminCategories = () => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_CATEGORIES_REQUEST })
    const { data } = await axios.get(`${BASE}/categories/`, getConfig(getState))
    dispatch({ type: C.ADMIN_CATEGORIES_SUCCESS, payload: data.data || [] })
  } catch (e) {
    if (e.response?.status === 401) {
      dispatch(logout())
    }
    dispatch({ type: C.ADMIN_CATEGORIES_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const createAdminCategory = (payload) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_CATEGORY_CREATE_REQUEST })
    const { data } = await axios.post(`${BASE}/categories/`, payload, getConfig(getState))
    dispatch({ type: C.ADMIN_CATEGORY_CREATE_SUCCESS, payload: data.data })
  } catch (e) {
    if (e.response?.status === 401) {
      dispatch(logout())
    }
    dispatch({ type: C.ADMIN_CATEGORY_CREATE_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const updateAdminCategory = (id, payload) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_CATEGORY_UPDATE_REQUEST })
    const { data } = await axios.put(`${BASE}/categories/${id}/`, payload, getConfig(getState))
    dispatch({ type: C.ADMIN_CATEGORY_UPDATE_SUCCESS, payload: data.data })
  } catch (e) {
    if (e.response?.status === 401) {
      dispatch(logout())
    }
    dispatch({ type: C.ADMIN_CATEGORY_UPDATE_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const deleteAdminCategory = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_CATEGORY_DELETE_REQUEST })
    await axios.delete(`${BASE}/categories/${id}/`, getConfig(getState))
    dispatch({ type: C.ADMIN_CATEGORY_DELETE_SUCCESS, payload: id })
  } catch (e) {
    if (e.response?.status === 401) {
      dispatch(logout())
    }
    dispatch({ type: C.ADMIN_CATEGORY_DELETE_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

// ── Order Tracking ──────────────────────────────────────────────
export const getOrderTracking = (orderId) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_ORDER_TRACKING_REQUEST })
    const { data } = await axios.get(`${BASE}/orders/${orderId}/tracking/`, getConfig(getState))
    dispatch({ type: C.ADMIN_ORDER_TRACKING_SUCCESS, payload: data.data || [] })
  } catch (e) {
    dispatch({ type: C.ADMIN_ORDER_TRACKING_FAIL, payload: e.response?.data?.detail || e.message })
  }
}

export const addOrderTrackingEvent = (orderId, payload) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.ADMIN_ORDER_TRACKING_ADD_REQUEST })
    const { data } = await axios.post(`${BASE}/orders/${orderId}/tracking/`, payload, getConfig(getState))
    dispatch({ type: C.ADMIN_ORDER_TRACKING_ADD_SUCCESS, payload: data.data })
  } catch (e) {
    dispatch({ type: C.ADMIN_ORDER_TRACKING_ADD_FAIL, payload: e.response?.data?.detail || e.message })
  }
}
