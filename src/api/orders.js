import client from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";

export const getAllOrdersApi = async (date) => {
  try {
    const res = await client.get(
      `${apiEndPoint.VIEW_ALL_ORDERS}/?date=${date}`
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
export const getAllOrdersByDaysApi = async (date, days) => {
  try {
    const res = await client.get(
      `${apiEndPoint.VIEW_ALL_ORDERS}/?date=${date}&days=${days}`
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getProductsCategoriesIdApi = async () => {
  try {
    const res = await client.get(`${apiEndPoint.VIEW_PRODUCT_CATEGORIES_ID}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
export const getProductsCategoriesParentApi = async () => {
  try {
    const res = await client.get(
      `${apiEndPoint.VIEW_PRODUCT_CATEGORIES_Parent}`
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
export const getModifiersByIdApi = async () => {
  try {
    const res = await client.get(`${apiEndPoint.VIEW_MODIFIERS}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getOrderInfoApi = async (date, days) => {
  try {
    const res = await client.get(
      `${apiEndPoint.ORDER_INFO}/?date=${date}${days ? `&days=${days}` : ``}`
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
export const getSingleOrderInfoApi = async (id) => {
  try {
    const res = await client.get(`${apiEndPoint.ORDER_INFO}/${id}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editOrderInfoApi = async (postData, id) => {
  try {
    const res = await client.patch(`${apiEndPoint.ORDER_INFO}/${id}`, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
export const editMultipleOrderInfoApi = async (postData) => {
  try {
    const res = await client.patch(apiEndPoint.ORDER_INFO, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getSingleOrderByAPI = async (id) => {
  try {
    const res = await client.get(`${apiEndPoint.VIEW_ALL_ORDERS}/${id}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
