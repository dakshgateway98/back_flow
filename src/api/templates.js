import client from './index';
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from './index';

export const getTemplatesApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_TEMPLATES);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getTemplatesByIDApi = async (id) => {
  try {
    const res = await client.get(`${apiEndPoint.VIEW_TEMPLATES}/${id}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addTemplatesApi = async (postData) => {
  try {
    const res = await client.post(apiEndPoint.ADD_TEMPLATES, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editTemplateApi = async (postData, id) => {
  try {
    const res = await client.put(
      `${apiEndPoint.EDIT_TEMPLATES}/${id}`,
      postData
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};