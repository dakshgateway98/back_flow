import client from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";

export const getCalcSettingsApi = async () => {
  try {
    const res = await client.get(apiEndPoint.GET_CALC_SETTING);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addCalcSettingsApi = async (postData) => {
  try {
    const res = await client.post(apiEndPoint.ADD_CALC_SETTING, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
export const editCalcSettingsApi = async (postData, id) => {
  try {
    const res = await client.put(
      `${apiEndPoint.EDIT_CALC_SETTING}/${id}`,
      postData
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteCalcSettingsApi = async (id) => {
  try {
    const res = await client.delete(`${apiEndPoint.DELETE_CALC_SETTING}/${id}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
