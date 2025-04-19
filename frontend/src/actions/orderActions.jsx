import axios from 'axios';
import {
    ORDER_CREATE_REQUEST,
    ORDER_CREATE_SUCCESS,
    ORDER_CREATE_FAIL,
    ORDER_DETAILS_REQUEST,
    ORDER_DETAILS_SUCCESS,
    ORDER_DETAILS_FAIL,
    ORDER_PAY_RESET,
    ORDER_PAY_REQUEST,
    ORDER_PAY_SUCCESS,
    ORDER_PAY_FAIL
} from '../constants/orderConstants'

import { CART_CLEAR_ITEM } from '../constants/cartConstants'

export const createOrder = (order) => async (dispatch, getState) => {
    try {
        dispatch({
            type: ORDER_CREATE_REQUEST
        })
        const { userLogin: { userInfo }, } = getState()
        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        const { data, status } = await axios.post(
            `orders/`,
            order,
            config
        )
        if (status === 200) {
            dispatch({
                type: ORDER_CREATE_SUCCESS,
                payload: data.data,
            });
            dispatch({
                type: CART_CLEAR_ITEM,
                payload: data.data,
            });
            localStorage.removeItem('cartItems')
        }
        else {
            dispatch({
                type: ORDER_CREATE_FAIL,
                payload: data.detail || 'Order failed.',
            });
        }

    } catch (error) {
        dispatch({
            type: ORDER_CREATE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });

    }
}


export const getOrderDetails = (id) => async (dispatch, getState) => {
    try {
        dispatch({
            type: ORDER_DETAILS_REQUEST
        })
        const { userLogin: { userInfo }, } = getState()
        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        const { data, status } = await axios.get(
            `orders/${id}`,
            config
        )
        if (status === 200) {
            dispatch({
                type: ORDER_DETAILS_SUCCESS,
                payload: data.data,
            });

        }
        else {
            dispatch({
                type: ORDER_DETAILS_FAIL,
                payload: data.detail || 'Order failed.',
            });
        }

    } catch (error) {
        dispatch({
            type: ORDER_DETAILS_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });

    }
}

export const payOrder = (id, method) => async (dispatch, getState) => {
    try {
        dispatch({
            type: ORDER_PAY_REQUEST
        })
        const { userLogin: { userInfo }, } = getState()
        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        const { data, status } = await axios.put(
            `orders/${id}`,
            method,
            config
        )
        if (status === 200) {
            dispatch({
                type: ORDER_PAY_SUCCESS,
                payload: data.data,
            });

        }
        else {
            dispatch({
                type: ORDER_PAY_FAIL,
                payload: data.detail || 'Order failed.',
            });
        }

    } catch (error) {
        dispatch({
            type: ORDER_PAY_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });

    }
}