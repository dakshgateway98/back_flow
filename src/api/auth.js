import client, { removeToken } from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";

export const signInAPI = async (postData) => {
  try {
    removeToken();
    const res = await client.post(apiEndPoint.LOGIN_ENDPOINT, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
