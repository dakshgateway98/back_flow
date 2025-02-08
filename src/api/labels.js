import client from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";

export const editLabelApi = async (postData) => {
  try {
    const res = await client.patch(`${apiEndPoint.EDIT_LABELS}`, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
