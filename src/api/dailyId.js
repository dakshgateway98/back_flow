import client from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";

// Daily Ids

export const getDailyIdsApi = async (date) => {
  try {
    const res = await client.get(`${apiEndPoint.VIEW_DAILY_IDS}/${date}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addDailyIdsApi = async (date, postData) => {
  try {
    const res = await client.post(
      `${apiEndPoint.ADD_DAILY_IDS}/${date}`,
      postData
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteDailyIdsApi = async (date) => {
  try {
    const res = await client.delete(`${apiEndPoint.DELETE_DAILY_IDS}/${date}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

// Daily Sort

export const getDailySortApi = async (date) => {
  try {
    const res = await client.get(`${apiEndPoint.VIEW_DAILY_SORT}/${date}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addDailySortApi = async (date, postData) => {
  try {
    const res = await client.post(
      `${apiEndPoint.ADD_DAILY_SORT}/${date}`,
      postData
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteDailySortApi = async (date) => {
  try {
    const res = await client.delete(`${apiEndPoint.DELETE_DAILY_SORT}/${date}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
