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

export const addSingleOrderDetail = (data) => {
  return {
    type: ADD_SINGLE_ORDER_DETAIL,
    data: data,
  };
};

export const removeSingleOrderDetail = () => {
  return {
    type: REMOVE_SINGLE_ORDER_DETAIL,
    data: {},
  };
};

export const addProductCategories = (data) => {
  return {
    type: ADD_PRODUCT_CATEGORIES,
    data: data,
  };
};

export const addSingleOrderInfoDetail = (data) => {
  return {
    type: ADD_SINGLE_ORDER_INFO_DETAIL,
    data: data,
  };
};

export const removeSingleOrderInfoDetail = () => {
  return {
    type: REMOVE_SINGLE_ORDER_INFO_DETAIL,
    data: {},
  };
};

export const addOrderItemsInfoDetail = (data, flag) => {
  return {
    type: ADD_ORDER_ITEMS_INFO_DETAILS,
    data: data,
    flag: flag,
  };
};

export const removeOrderItemsInfoDetail = () => {
  return {
    type: REMOVE_ORDER_ITEMS_INFO_DETAILS,
    data: {},
    flag: 0,
  };
};

export const removeOrderOverviewModal = () => {
  return {
    type: REMOVE_ORDER_OVERVIEW_MODAL,
  };
};
