import client from "./index";
import { handleError } from "./index";
import { apiEndPoint } from "./apiEndPoint";

export const sendMessageApi = async (postData) => {
  try {
    const res = await client.post(apiEndPoint.SEND_MESSAGE, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const checkMessageApi = async (orderID) => {
  try {
    const res = await client.get(`${apiEndPoint.CHECK_MESSAGE}/${orderID}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
