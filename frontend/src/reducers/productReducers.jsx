import {
    PRODUCT_LIST_REQUEST,
    PRODUCT_LIST_SUCCESS,
    PRODUCT_LIST_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
  } from '../constants/productConstants';
  
  const initialProductListState = {
    products: [],
    loading: false,
    error: null,
  };
  
  export const productListReducer = (state = initialProductListState, action) => {
    switch (action.type) {
      case PRODUCT_LIST_REQUEST:
        return { ...state, loading: true };
      case PRODUCT_LIST_SUCCESS:
        return { loading: false, products: action.payload, error: null };
      case PRODUCT_LIST_FAIL:
        return { loading: false, error: action.payload, products: [] };
      default:
        return state;
    }
  };
  
  const initialProductDetailsState = {
    product: { reviews: [] },
    loading: false,
    error: null,
  };
  
  export const productDetailsReducer = (state = initialProductDetailsState, action) => {
    switch (action.type) {
      case PRODUCT_DETAILS_REQUEST:
        return { ...state, loading: true };
      case PRODUCT_DETAILS_SUCCESS:
        return { loading: false, product: action.payload, error: null };
      case PRODUCT_DETAILS_FAIL:
        return { loading: false, error: action.payload, product: { reviews: [] } };
      default:
        return state;
    }
  };
  