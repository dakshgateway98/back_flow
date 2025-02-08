import client from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";

export const getAllModifierAPI = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_APP_SETTING_ID);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
