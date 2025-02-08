import client from './index';
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from './index';

export const getConfigLevelsApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_CONFIG_LEVELS);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addConfigLevelApi = async (postData) => {
  try {
    const res = await client.post(apiEndPoint.ADD_CONFIG_LEVEL, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editConfigLevelApi = async (postData, id) => {
  try {
    const res = await client.put(
      `${apiEndPoint.EDIT_CONFIG_LEVEL}/${id}`,
      postData
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};