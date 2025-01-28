import axios from 'axios'
import { 
    USER_LOGIN_REQUEST, 
    USER_LOGIN_SUCCESS, 
    USER_LOGIN_FAIL,

    USER_REGISTER_REQUEST, 
    USER_REGISTER_SUCCESS, 
    USER_REGISTER_FAIL,

    USER_DETAILS_REQUEST, 
    USER_DETAILS_SUCCESS, 
    USER_DETAILS_FAIL,
    USER_DETAILS_RESET,

    USER_UPDATE_PROFILE_REQUEST, 
    USER_UPDATE_PROFILE_SUCCESS, 
    USER_UPDATE_PROFILE_FAIL,
    USER_UPDATE_PROFILE_RESET,

    USER_LOGOUT } from '../constants/userConstants'

export const login = (email, password) => async (dispatch) => {
    try {
        dispatch({
            type: USER_LOGIN_REQUEST
        })
        const config = {
            headers: {
                'Content-type': 'application/json'
            }
        }
        const { data } = await axios.post(
            '/users/login/',
            { 'username': email, 'password': password },
            config
        )
        dispatch({
            type: USER_LOGIN_SUCCESS,
            payload: data
        })
        
        localStorage.setItem('userInfo', JSON.stringify(data))
    
    } catch (error) {
        dispatch({
            type: USER_LOGIN_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.datail
                : error.message,
        })
    }
}

export const logout=()=>(dispatch)=>{
    localStorage.removeItem('userInfo')
    dispatch({
        type: USER_LOGOUT
    })
    dispatch({
        type: USER_DETAILS_RESET
    })
}

export const register = (first_name, last_name, email, password) => async (dispatch) => {
    try {
        dispatch({
            type: USER_REGISTER_REQUEST
        })
        const config = {
            headers: {
                'Content-type': 'application/json'
            }
        }
        const { data } = await axios.post(
            'users/register/',
            { 'first_name':first_name, 'last_name':last_name, 'email': email, 'password': password },
            config
        )
        if (data.status === 200) {
            dispatch({
                type: USER_REGISTER_SUCCESS,
                payload: data.data,
            });
            dispatch({
                type: USER_LOGIN_SUCCESS,
                payload: data.data
            });
            
            localStorage.setItem('userInfo', JSON.stringify(data));
        } else {
            dispatch({
                type: USER_REGISTER_FAIL,
                payload: data.detail || 'Registration failed.',
            });
        }     
    
    } catch (error) {
        dispatch({
            type: USER_REGISTER_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
        
    }
}



export const getUserDetails = (id) => async (dispatch,getState) => {
    try {
        dispatch({
            type: USER_DETAILS_REQUEST
        })
        const {userLogin: {userInfo},}=getState()
        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        const { data } = await axios.get(
            `users/${id}/`,
            config
        )
        if (data.status === 200) {
            dispatch({
                type: USER_DETAILS_SUCCESS,
                payload: data.data,
            });          
        } else {
            dispatch({
                type: USER_DETAILS_FAIL,
                payload: data.detail || 'Failed to get user profile!',
            });
        }     
    
    } catch (error) {
        dispatch({
            type: USER_DETAILS_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
        
    }
}




export const updateUserProfile = (user) => async (dispatch,getState) => {
    try {
        dispatch({
            type: USER_UPDATE_PROFILE_REQUEST
        })
        const {userLogin: {userInfo},}=getState()
        const config = {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        const { data } = await axios.put(
            `users/profile/`,
            user,
            config
        )
        if (data.status === 200) {
            dispatch({
                type: USER_UPDATE_PROFILE_SUCCESS,
                payload: data.data,
            });
            dispatch({
                type: USER_LOGIN_SUCCESS,
                payload: data.data
            });
            localStorage.setItem('userInfo', JSON.stringify(data));
        } else {
            dispatch({
                type: USER_UPDATE_PROFILE_FAIL,
                payload: data.detail || 'Profile update failed.',
            });
        }     
    
    } catch (error) {
        dispatch({
            type: USER_UPDATE_PROFILE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
        
    }
}