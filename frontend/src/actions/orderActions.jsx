import axios from 'axios';
import {
    ORDER_CREATE_REQUEST,
    ORDER_CREATE_SUCCESS,
    ORDER_CREATE_FAIL
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