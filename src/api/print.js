import client from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";
import { printHeader } from "./index";

export const getbarcodeApi = async (postData) => {
  try {
    const res = await printHeader.post(apiEndPoint.GET_BARCODE, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getPdfApi = async (postData) => {
  try {
    const res = await printHeader.post(apiEndPoint.HTML_TO_PDF, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const postPrintOrderApi = async (postData) => {
  try {
    const res = await client.post(apiEndPoint.PRINT_ORDER, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getPrintDetailsApi = async (OrderId) => {
  try {
    const res = await client.get(`${apiEndPoint.VIEW_PRINT_ORDER}/${OrderId}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
