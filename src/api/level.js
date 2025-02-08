import client from './index';
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from './index';

export const getLevelsApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_LEVELS);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addLevelApi = async (postData) => {
  try {
    const res = await client.post(apiEndPoint.ADD_LEVEL, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editLevelApi = async (postData, id) => {
  try {
    const res = await client.put(`${apiEndPoint.EDIT_LEVEL}/${id}`, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};