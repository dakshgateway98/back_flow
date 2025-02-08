import client from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";

// SUB_PAGE CONFIG APIS

export const getAllSubPagesConfigApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_SUB_PAGE_CONFIG);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getSubPageConfigByIDApi = async (id) => {
  try {
    const res = await client.get(`${apiEndPoint.VIEW_SUB_PAGE_CONFIG}/${id}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addSubPageConfigApi = async (postData) => {
  try {
    const res = await client.post(apiEndPoint.ADD_SUB_PAGE_CONFIG, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editSubPageConfigApi = async (postData, id) => {
  try {
    const res = await client.put(
      `${apiEndPoint.EDIT_SUB_PAGE_CONFIG}/${id}`,
      postData
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteSubPageConfigApi = async (id) => {
  try {
    const res = await client.delete(
      `${apiEndPoint.DELETE_SUB_PAGE_CONFIG}/${id}`
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

// SUB_PAGE DINING CONFIG APIS

export const getAllSubPagesDiningConfigApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_SUB_PAGE_OPTIONS_CONFIG);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getSubPageDiningConfigByIDApi = async (id) => {
  try {
    const res = await client.get(
      `${apiEndPoint.VIEW_SUB_PAGE_OPTIONS_CONFIG}/${id}`
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addSubPageDiningConfigApi = async (postData) => {
  try {
    const res = await client.post(
      apiEndPoint.ADD_SUB_PAGE_OPTIONS_CONFIG,
      postData
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editSubPageDiningConfigApi = async (postData, id) => {
  try {
    const res = await client.put(
      `${apiEndPoint.EDIT_SUB_PAGE_OPTIONS_CONFIG}/${id}`,
      postData
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteSubPageDiningConfigApi = async (id) => {
  try {
    const res = await client.delete(
      `${apiEndPoint.DELETE_SUB_PAGE_OPTIONS_CONFIG}/${id}`
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
