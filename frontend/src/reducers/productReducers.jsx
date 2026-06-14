import {
    PRODUCT_LIST_REQUEST,
    PRODUCT_LIST_SUCCESS,
    PRODUCT_LIST_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    PRODUCT_CREATE_REVIEW_REQUEST,
    PRODUCT_CREATE_REVIEW_SUCCESS,
    PRODUCT_CREATE_REVIEW_FAIL,
    PRODUCT_CREATE_REVIEW_RESET,
    PRODUCT_CATEGORY_LIST_REQUEST,
    PRODUCT_CATEGORY_LIST_SUCCESS,
    PRODUCT_CATEGORY_LIST_FAIL,
    PRODUCT_CATEGORY_LIST_RESET,
    PRODUCT_TOP_REQUEST,
    PRODUCT_TOP_SUCCESS,
    PRODUCT_TOP_FAIL,
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
        const isPaginated = action.payload && action.payload.results !== undefined;
        return {
          loading: false,
          products: isPaginated ? action.payload.results : action.payload,
          count: isPaginated ? action.payload.count : (action.payload ? action.payload.length : 0),
          next: isPaginated ? action.payload.next : null,
          previous: isPaginated ? action.payload.previous : null,
          error: null
        };
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

  export const productReviewCreateReducer = (state = {}, action) => {
    switch (action.type) {
      case PRODUCT_CREATE_REVIEW_REQUEST:
        return { loading: true };
      case PRODUCT_CREATE_REVIEW_SUCCESS:
        return { loading: false, success: true };
      case PRODUCT_CREATE_REVIEW_FAIL:
        return { loading: false, error: action.payload };
      case PRODUCT_CREATE_REVIEW_RESET:
        return {};
      default:
        return state;
    }
  };

  export const productCategoryListReducer = (state = { categories: [] }, action) => {
    switch (action.type) {
      case PRODUCT_CATEGORY_LIST_REQUEST:
        return { loading: true, categories: [] };
      case PRODUCT_CATEGORY_LIST_SUCCESS:
        return { loading: false, categories: action.payload };
      case PRODUCT_CATEGORY_LIST_FAIL:
        return { loading: false, error: action.payload };
      case PRODUCT_CATEGORY_LIST_RESET:
        return { categories: [] };
      default:
        return state;
    }
  };

  export const productTopRatedReducer = (state = { products: [] }, action) => {
    switch (action.type) {
      case PRODUCT_TOP_REQUEST:
        return { loading: true, products: [] };
      case PRODUCT_TOP_SUCCESS:
        return { loading: false, products: action.payload };
      case PRODUCT_TOP_FAIL:
        return { loading: false, error: action.payload };
      default:
        return state;
    }
  };
  