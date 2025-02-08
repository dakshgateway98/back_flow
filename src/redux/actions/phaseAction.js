import { GET_UPDATE_PHASES } from "../constants/constant";

export const getUpdatePhases = (data) => {
  return {
    type: GET_UPDATE_PHASES,
    data: data,
  };
};
