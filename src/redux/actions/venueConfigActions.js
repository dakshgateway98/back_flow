import { UPDATE_VENUE_ROOMS, UPDATE_All_ROOMS } from "../constants/constant";

export const updateVenueRooms = (data) => {
  return {
    type: UPDATE_VENUE_ROOMS,
    data: data,
  };
};
export const updatedAllRooms = (data) => {
  return {
    type: UPDATE_All_ROOMS,
    data: data,
  };
};
