import { GET_UPDATED_CALC_SETTING } from "../constants/constant";

const initialState = {
  calcSettingsList: [],
};

const calcSettingsReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case GET_UPDATED_CALC_SETTING:
      return {
        ...state,
        calcSettingsList: action.data,
      };

    default:
      return state;
  }
};

export default calcSettingsReducer;
