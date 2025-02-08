import { UPDATE_SUB_PAGE_CONFIG } from "../constants/constant";

const initialState = {
  allSubPagesConfig: [],
};

const subPageConfigReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case UPDATE_SUB_PAGE_CONFIG:
      return {
        ...state,
        allSubPagesConfig: action.data,
      };

    default:
      return state;
  }
};
export default subPageConfigReducer;
