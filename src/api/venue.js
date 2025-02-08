import client from "./index";
import { apiEndPoint } from "./apiEndPoint";
import { handleError } from "./index";

export const getVenueRoomsApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_VENUE_ROOMS);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
export const getAllRoomsApi = async () => {
  try {
    const res = await client.get(apiEndPoint.VIEW_ALL_ROOMS);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getVenueRoomByIDApi = async (id) => {
  try {
    const res = await client.get(`${apiEndPoint.VIEW_VENUE_ROOMS}/${id}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addVenueRoomsApi = async (postData) => {
  try {
    const res = await client.post(apiEndPoint.ADD_VENUE_ROOMS, postData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const editVenueRoomsApi = async (postData, id) => {
  try {
    const res = await client.put(
      `${apiEndPoint.EDIT_VENUE_ROOMS}/${id}`,
      postData
    );
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteVenueRoomsApi = async (id) => {
  try {
    const res = await client.delete(`${apiEndPoint.DELETE_VENUE_ROOMS}/${id}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
