import client from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";

export const getAllPagesApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_ALL_PAGES);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getPagesApi = async () => {
  try {
    const res = await client.get(`${apiEndPoint.VIEW_PAGES}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getPagesByIDApi = async (id) => {
  try {
    const res = await client.get(`${apiEndPoint.VIEW_PAGES}/${id}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getAllParentsPagesApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_ALL_PARENTS_PAGES);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getChildrenPagesByParentIDApi = async (id) => {
  try {
    const res = await client.get(
      `${apiEndPoint.VIEW_CHILDREN_FOR_PARENTS}/${id}`
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addPagesApi = async (postData) => {
  try {
    const res = await client.post(apiEndPoint.ADD_PAGES, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editPagesApi = async (postData, id) => {
  try {
    const res = await client.put(`${apiEndPoint.EDIT_PAGES}/${id}`, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deletePagesApi = async (id) => {
  try {
    const res = await client.delete(`${apiEndPoint.DELETE_PAGES}/${id}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
