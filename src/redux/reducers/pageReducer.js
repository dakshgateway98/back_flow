import {
  UPDATE_HOME_PAGE_DATA,
  UPDATE_ALL_PAGES,
  UPDATE_PAGES,
} from "../constants/constant";

const initialState = {
  homePages: [],
  allPages: [],
  pages: [],
};

const pageReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case UPDATE_HOME_PAGE_DATA:
      return {
        ...state,
        homePages: action.data,
      };
    case UPDATE_ALL_PAGES:
      return {
        ...state,
        allPages: action.data,
      };
    case UPDATE_PAGES:
      return {
        ...state,
        pages: action.data,
      };
    default:
      return state;
  }
};
export default pageReducer;
