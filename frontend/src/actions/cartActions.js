import axios from 'axios';
import { CART_ADD_ITEM } from '../constants/cartConstants';

export const addToCart = (id, qty) => async (dispatch, getState) => {
    try {
        const { data } = await axios.get(`/products/${id}`);

        dispatch({
            type: CART_ADD_ITEM,
            payload: {
                product: data._id,
                name: data.name,
                image: data.image,
                price: data.price,
                countInStock: data.countInStock,
                qty,
            },
        });

        localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
    } catch (error) {
        console.error('Error adding to cart:', error);
        // Handle the error (e.g., dispatch an error action, show a message to the user)
    }
};
