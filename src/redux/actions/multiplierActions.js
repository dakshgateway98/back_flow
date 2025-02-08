import { UPDATE_MULTIPLIER_DATA } from "../constants/constant";

export const updateMultiplier = (data) => {
  return {
    type: UPDATE_MULTIPLIER_DATA,
    data: data,
  };
};
