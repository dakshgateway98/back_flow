import { UPDATE_TEMPLATES } from "../constants/constant";

const initialState = {
  allTemplates: [],
};

const templateReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case UPDATE_TEMPLATES:
      return {
        ...state,
        allTemplates: action.data,
      };

    default:
      return state;
  }
};
export default templateReducer;
