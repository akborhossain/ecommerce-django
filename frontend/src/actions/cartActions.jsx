import axios from 'axios';
import { 
    CART_ADD_ITEM, 
    CART_REMOVE_ITEM, 
    SAVE_SHIPPING_ADDRESS, 
    SAVE_PAYMENT_METHOD,
    USER_ADDRESS_LIST_REQUEST,
    USER_ADDRESS_LIST_SUCCESS,
    USER_ADDRESS_LIST_FAIL,
    USER_ADDRESS_ADD_REQUEST,
    USER_ADDRESS_ADD_SUCCESS,
    USER_ADDRESS_ADD_FAIL,
    USER_ADDRESS_DELETE_REQUEST,
    USER_ADDRESS_DELETE_SUCCESS,
    USER_ADDRESS_DELETE_FAIL,
    USER_ADDRESS_UPDATE_REQUEST,
    USER_ADDRESS_UPDATE_SUCCESS,
    USER_ADDRESS_UPDATE_FAIL,
} from '../constants/cartConstants';

export const addToCart = (id, qty) => async (dispatch, getState) => {
    const { data } = await axios.get(`/products/${id}/`)

    dispatch({
        type: CART_ADD_ITEM,
        payload: {
            product: data._id,
            name: data.name,
            image: data.image,
            price: data.price,
            countInStock: data.countInStock,
            qty
        }
    })
    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
}

export const removeFromCart = (id) => (dispatch, getState) => {
    dispatch({
        type: CART_REMOVE_ITEM,
        payload: id,
    })

    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
}

export const saveShippingAddress = (data) => (dispatch) => {
    dispatch({
        type: SAVE_SHIPPING_ADDRESS,
        payload: data,
    })

    localStorage.setItem('shippingAddress', JSON.stringify(data))
}

export const savePaymentMethod = (data) => (dispatch) => {
    dispatch({
        type: SAVE_PAYMENT_METHOD,
        payload: data,
    })

    localStorage.setItem('paymentMethod', JSON.stringify(data))
}

export const listUserAddresses = () => async (dispatch, getState) => {
    try {
        dispatch({ type: USER_ADDRESS_LIST_REQUEST })
        
        const { userLogin: { userInfo } } = getState()
        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        
        const { data } = await axios.get('/orders/addresses/', config)
        dispatch({
            type: USER_ADDRESS_LIST_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: USER_ADDRESS_LIST_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const addUserAddress = (addressData) => async (dispatch, getState) => {
    try {
        dispatch({ type: USER_ADDRESS_ADD_REQUEST })
        
        const { userLogin: { userInfo } } = getState()
        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        
        const { data } = await axios.post('/orders/addresses/', addressData, config)
        dispatch({
            type: USER_ADDRESS_ADD_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: USER_ADDRESS_ADD_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const deleteUserAddress = (id) => async (dispatch, getState) => {
    try {
        dispatch({ type: USER_ADDRESS_DELETE_REQUEST })
        
        const { userLogin: { userInfo } } = getState()
        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        
        await axios.delete(`/orders/addresses/${id}/`, config)
        dispatch({
            type: USER_ADDRESS_DELETE_SUCCESS
        })
    } catch (error) {
        dispatch({
            type: USER_ADDRESS_DELETE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const updateUserAddress = (id, addressData) => async (dispatch, getState) => {
    try {
        dispatch({ type: USER_ADDRESS_UPDATE_REQUEST })
        
        const { userLogin: { userInfo } } = getState()
        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        
        const { data } = await axios.put(`/orders/addresses/${id}/`, addressData, config)
        dispatch({
            type: USER_ADDRESS_UPDATE_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: USER_ADDRESS_UPDATE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}