import { 
  CART_ADD_ITEM, 
  CART_REMOVE_ITEM, 
  SAVE_SHIPPING_ADDRESS,
  SAVE_PAYMENT_METHOD,
  CART_CLEAR_ITEM,
  USER_ADDRESS_LIST_REQUEST,
  USER_ADDRESS_LIST_SUCCESS,
  USER_ADDRESS_LIST_FAIL,
  USER_ADDRESS_LIST_RESET,
  USER_ADDRESS_ADD_REQUEST,
  USER_ADDRESS_ADD_SUCCESS,
  USER_ADDRESS_ADD_FAIL,
  USER_ADDRESS_ADD_RESET,
  USER_ADDRESS_DELETE_REQUEST,
  USER_ADDRESS_DELETE_SUCCESS,
  USER_ADDRESS_DELETE_FAIL,
  USER_ADDRESS_UPDATE_REQUEST,
  USER_ADDRESS_UPDATE_SUCCESS,
  USER_ADDRESS_UPDATE_FAIL,
  USER_ADDRESS_UPDATE_RESET,
} from "../constants/cartConstants";


export const cartReducer = (state = { cartItems: [], shippingAddress: {} }, action) => {
  switch (action.type) {
    case CART_ADD_ITEM:
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.product === item.product);

      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(x =>
            x.product === existItem.product ? item : x
          )
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item]
        };
      }
      
    case CART_REMOVE_ITEM:
      return {
        ...state,
        cartItems: state.cartItems.filter((x) => x.product !== action.payload),
      };

    case SAVE_SHIPPING_ADDRESS:
      return {
        ...state,
        shippingAddress: action.payload,
      };
    case SAVE_PAYMENT_METHOD:
      return {
        ...state,
        paymentMethod: action.payload
      }
    case CART_CLEAR_ITEM:
      return {
        ...state,
        cartItems: []
      }

    default:
      return state;
  }
};


export const userAddressListReducer = (state = { addresses: [] }, action) => {
  switch (action.type) {
    case USER_ADDRESS_LIST_REQUEST:
      return { loading: true, addresses: [] };
    case USER_ADDRESS_LIST_SUCCESS:
      return { loading: false, addresses: action.payload };
    case USER_ADDRESS_LIST_FAIL:
      return { loading: false, error: action.payload };
    case USER_ADDRESS_LIST_RESET:
      return { addresses: [] };
    default:
      return state;
  }
};

export const userAddressAddReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_ADDRESS_ADD_REQUEST:
      return { loading: true };
    case USER_ADDRESS_ADD_SUCCESS:
      return { loading: false, success: true, address: action.payload };
    case USER_ADDRESS_ADD_FAIL:
      return { loading: false, error: action.payload };
    case USER_ADDRESS_ADD_RESET:
      return {};
    default:
      return state;
  }
};

export const userAddressDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_ADDRESS_DELETE_REQUEST:
      return { loading: true };
    case USER_ADDRESS_DELETE_SUCCESS:
      return { loading: false, success: true };
    case USER_ADDRESS_DELETE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const userAddressUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_ADDRESS_UPDATE_REQUEST:
      return { loading: true };
    case USER_ADDRESS_UPDATE_SUCCESS:
      return { loading: false, success: true, address: action.payload };
    case USER_ADDRESS_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    case USER_ADDRESS_UPDATE_RESET:
      return {};
    default:
      return state;
  }
};
