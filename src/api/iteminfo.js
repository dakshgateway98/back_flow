import client from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";

export const getAllItemInfoByDaysApi = async (date, days) => {
  try {
    const res = await client.get(
      `${apiEndPoint.VIEW_ITEM_INFO}/?date=${date}&days=${days}`
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getItemsInfoByOrderApi = async (postData) => {
  try {
    const res = await client.post(apiEndPoint.VIEW_ITEM_INFO, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editItemInfoApi = async (postData, id) => {
  try {
    const res = await client.patch(
      `${apiEndPoint.EDIT_ITEM_INFO}/${id}`,
      postData
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
export const editMulItemInfoApi = async (postData) => {
  try {
    const res = await client.patch(apiEndPoint.EDIT_ITEM_INFO, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
