import client from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";

export const addBakerCalcApi = async (postData) => {
  try {
    const res = await client.post(`${apiEndPoint.ADD_BAKER_CALC}`, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getAllBakerCalcByDateApi = async (date, days) => {
  try {
    const res = await client.get(
      `${apiEndPoint.VIEW_BAKER_CALC}/?date=${date}&days=${days}`
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
