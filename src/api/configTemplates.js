import client from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";

export const getTemplatesConfigApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_TEMPLATES_CONFIG);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addTemplatesConfigApi = async (postData) => {
  try {
    const res = await client.post(apiEndPoint.ADD_TEMPLATES_CONFIG, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editTemplateConfigApi = async (postData, id) => {
  try {
    const res = await client.put(
      `${apiEndPoint.EDIT_TEMPLATES_CONFIG}/${id}`,
      postData
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
