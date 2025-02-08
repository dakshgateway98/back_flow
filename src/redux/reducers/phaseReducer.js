import { GET_UPDATE_PHASES } from "../constants/constant";

const initialState = {
  phasesList: [],
};

const phaseReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case GET_UPDATE_PHASES:
      return {
        ...state,
        phasesList: action.data,
      };

    default:
      return state;
  }
};
export default phaseReducer;
