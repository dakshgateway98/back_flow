import client from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";

export const getUsersApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_USERS);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
export const getUsersByIdApi = async (id) => {
  try {
    const res = await client.get(`${apiEndPoint.VIEW_USERS}/${id}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getActiveUsersApi = async () => {
  try {
    const res = await client.get(apiEndPoint.ACTIVE_USERS);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
export const getInActiveUsersApi = async () => {
  try {
    const res = await client.get(apiEndPoint.INACTIVE_USERS);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addUserApi = async (postData) => {
  try {
    const res = await client.post(apiEndPoint.ADD_USER, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editUserApi = async (postData, id) => {
  try {
    const res = await client.put(`${apiEndPoint.EDIT_USER}/${id}`, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
