import client from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";

// Text Messages Setting Apis

export const getTextMessagesApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_TEXTMESSAGES);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addTextMessageslApi = async (postData) => {
  try {
    const res = await client.post(apiEndPoint.ADD_TEXTMESSAGES, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editTextMessagesApi = async (postData, id) => {
  try {
    const res = await client.put(
      `${apiEndPoint.EDIT_TEXTMESSAGES}/${id}`,
      postData
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

// APP SETTINGS APIS

export const getAppSettingApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_APPSETTING);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getAppSettingByIDApi = async (id) => {
  try {
    const res = await client.get(`${apiEndPoint.VIEW_APPSETTING}/${id}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editAppSettingApi = async (postData, id) => {
  try {
    const res = await client.put(
      `${apiEndPoint.EDIT_APPSETTING}/${id}`,
      postData
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

// VIEW Print Setting APIs

export const getPrintSettingApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_PRINTSETTINGS);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

// ADD setting API

export const addAppSettingApi = async (postData) => {
  try {
    const res = await client.post(`${apiEndPoint.ADD_APPSETTING}`, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
