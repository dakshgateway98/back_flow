
import client from './index';
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from './index';

export const getPhasesApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_PHASES);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addPhasesApi = async (postData) => {
  try {
    const res = await client.post(apiEndPoint.ADD_PHASES, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editPhasesApi = async (postData, id) => {
  try {
    const res = await client.put(`${apiEndPoint.EDIT_PHASES}/${id}`, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
