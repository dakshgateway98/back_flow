import { GET_BAKER_CALC_SELECTION } from "../constants/constant";

const initialState = {
  bakerCalcSelectionList: [],
};

const bakerCalcSelectionReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case GET_BAKER_CALC_SELECTION:
      return {
        ...state,
        bakerCalcSelectionList: action.data,
      };

    default:
      return state;
  }
};

export default bakerCalcSelectionReducer;
