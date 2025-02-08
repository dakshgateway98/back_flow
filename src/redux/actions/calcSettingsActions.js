import { GET_UPDATED_CALC_SETTING } from "../constants/constant";

export const getUpdatedCalcSetting = (data) => {
  return {
    type: GET_UPDATED_CALC_SETTING,
    data: data,
  };
};
