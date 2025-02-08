import { GET_BAKER_CALC_SELECTION } from "../constants/constant";

export const getBakerCalcSelection = (data) => {
  return {
    type: GET_BAKER_CALC_SELECTION,
    data: data,
  };
};
