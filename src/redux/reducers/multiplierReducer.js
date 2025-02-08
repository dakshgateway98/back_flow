import { UPDATE_MULTIPLIER_DATA } from "../constants/constant";

const initialState = {
  multiplierList: [],
};

const multiplierReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case UPDATE_MULTIPLIER_DATA:
      return {
        ...state,
        multiplierList: action.data,
      };

    default:
      return state;
  }
};
export default multiplierReducer;
