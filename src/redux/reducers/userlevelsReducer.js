import {
  UPDATE_LEVELS_LIST,
  UPDATE_CONFIG_LEVELS,
} from "../constants/constant";

const initialState = {
  configLevels: [],
  levelList: [],
};

const UserlevelsReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case UPDATE_LEVELS_LIST:
      return {
        ...state,
        levelList: action.data,
      };
    case UPDATE_CONFIG_LEVELS:
      return {
        ...state,
        configLevels: action.data,
      };

    default:
      return state;
  }
};
export default UserlevelsReducer;
