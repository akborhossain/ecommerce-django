import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { productListReducer, productDetailsReducer, productReviewCreateReducer, productCategoryListReducer, productTopRatedReducer } from './reducers/productReducers';
import { cartReducer, userAddressListReducer, userAddressAddReducer, userAddressDeleteReducer, userAddressUpdateReducer } from './reducers/cartReducers'
import {userLoginReducer, userRegisterReducer, userDetailsReducer, userUpdateProfileReducer} from './reducers/userReducers'
import {orderCreateReducer, orderDetailsReducer, orderPayReducer, orderListMyReducer, orderDeliverReducer} from './reducers/orderReducers'
import {
  adminDashboardReducer, adminOrdersReducer, adminOrderUpdateReducer,
  adminProductsReducer, adminProductCreateReducer,
  adminUsersReducer, adminUserDetailReducer,
  adminRolesReducer, adminPermissionsReducer, myPermissionsReducer,
  adminCategoriesReducer, adminOrderTrackingReducer
} from './reducers/adminReducers'

const reducer = combineReducers({
  productList: productListReducer,
  productDetails: productDetailsReducer,
  productReviewCreate: productReviewCreateReducer,
  productCategoryList: productCategoryListReducer,
  productTopRated: productTopRatedReducer,
  cart: cartReducer,
  userAddressList: userAddressListReducer,
  userAddressAdd: userAddressAddReducer,
  userAddressDelete: userAddressDeleteReducer,
  userAddressUpdate: userAddressUpdateReducer,
  userLogin: userLoginReducer,
  userRegister: userRegisterReducer,
  userDetails: userDetailsReducer,
  userUpdateProfile: userUpdateProfileReducer,
  orderCreate: orderCreateReducer,
  orderDetails: orderDetailsReducer,
  orderPay: orderPayReducer,
  orderListMy: orderListMyReducer,
  orderDeliver: orderDeliverReducer,
  // Admin Panel
  adminDashboard: adminDashboardReducer,
  adminOrders: adminOrdersReducer,
  adminOrderUpdate: adminOrderUpdateReducer,
  adminProducts: adminProductsReducer,
  adminProductCreate: adminProductCreateReducer,
  adminUsers: adminUsersReducer,
  adminUserDetail: adminUserDetailReducer,
  adminRoles: adminRolesReducer,
  adminPermissions: adminPermissionsReducer,
  myPermissions: myPermissionsReducer,
  adminCategories: adminCategoriesReducer,
  adminOrderTracking: adminOrderTrackingReducer,
});
const cartItemsFromStorage=localStorage.getItem('cartItems')?
  JSON.parse(localStorage.getItem('cartItems')):[]

const userInfoFromStorage=localStorage.getItem('userInfo')?
  JSON.parse(localStorage.getItem('userInfo')):null

const shippingAddressFromStorage=localStorage.getItem('shippingAddress')?
  JSON.parse(localStorage.getItem('shippingAddress')):{ }

const initialState = {
  cart:{
    cartItems: cartItemsFromStorage,
    shippingAddress:shippingAddressFromStorage,
  },
  userLogin:{userInfo: userInfoFromStorage}
};
const middleware = [thunk];

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
