import {
  ADD_SINGLE_ORDER_DETAIL,
  ADD_PRODUCT_CATEGORIES,
  ADD_SINGLE_ORDER_INFO_DETAIL,
  REMOVE_SINGLE_ORDER_DETAIL,
  REMOVE_SINGLE_ORDER_INFO_DETAIL,
  ADD_ORDER_ITEMS_INFO_DETAILS,
  REMOVE_ORDER_ITEMS_INFO_DETAILS,
  REMOVE_ORDER_OVERVIEW_MODAL,
} from "../constants/constant";

const initialState = {
  orderDetail: {},
  orderInfoDetail: {},
  productCategories: {},
  orderItemsInfo: {},
  orderItemsInfoFlag: 0,
};

const orderReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case ADD_SINGLE_ORDER_DETAIL:
      return {
        ...state,
        orderDetail: action.data,
      };
    case ADD_PRODUCT_CATEGORIES:
      return {
        ...state,
        productCategories: action.data,
      };
    case REMOVE_SINGLE_ORDER_DETAIL:
      return {
        ...state,
        orderDetail: action.data,
      };
    case ADD_SINGLE_ORDER_INFO_DETAIL:
      return {
        ...state,
        orderInfoDetail: action.data,
      };
    case REMOVE_SINGLE_ORDER_INFO_DETAIL:
      return {
        ...state,
        orderInfoDetail: action.data,
      };
    case ADD_ORDER_ITEMS_INFO_DETAILS:
      return {
        ...state,
        orderItemsInfo: action.data,
        orderItemsInfoFlag: action.flag,
      };
    case REMOVE_ORDER_ITEMS_INFO_DETAILS:
      return {
        ...state,
        orderItemsInfo: action.data,
        orderItemsInfoFlag: action.flag,
      };
    case REMOVE_ORDER_OVERVIEW_MODAL: {
      return {
        ...state,
        orderDetail: {},
        orderInfoDetail: {},
        orderItemsInfo: {},
        orderItemsInfoFlag: 0,
      };
    }
    default:
      return state;
  }
};
export default orderReducer;
