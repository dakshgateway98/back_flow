import client from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";

export const getAllHomeConfigPagesApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_ALL_HOME_CONFIG_PAGES);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getAllHomeConfigSectionsApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_ALL_HOME_CONFIG_SECTIONS);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getHomeConfigPageByIDApi = async (id) => {
  try {
    const res = await client.get(`${apiEndPoint.VIEW_HOME_CONFIG_PAGES}/${id}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addHomeConfigPagesApi = async (postData) => {
  try {
    const res = await client.post(apiEndPoint.ADD_HOME_CONFIG_PAGES, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editHomeConfigPagesApi = async (postData, id) => {
  try {
    const res = await client.put(
      `${apiEndPoint.EDIT_HOME_CONFIG_PAGES}/${id}`,
      postData
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteHomeConfigPagesApi = async (id) => {
  try {
    const res = await client.delete(
      `${apiEndPoint.DELETE_HOME_CONFIG_PAGES}/${id}`
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
