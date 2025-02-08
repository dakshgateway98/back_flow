import {
  GET_MESSAGE_HISTORY,
  GET_UPDATE_SETTINGS_MESSAGE,
  REMOVE_MESSAGE_HISTORY,
  UPDATE_PRINT_SETTING,
  UPDATE_BOARD_SIZES,
  UPDATE_BAKERS_CALC,
} from "../constants/constant";

const initialState = {
  settingsMessageList: [],
  messageHistory: [],
  messageHistoryFlag: 0,
  currentPrintSetting: {},
  boardSizes: {},
  bakerCalcSetting: [],
};

const settingsReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case GET_UPDATE_SETTINGS_MESSAGE:
      return {
        ...state,
        settingsMessageList: action.data,
      };
    case GET_MESSAGE_HISTORY:
      return {
        ...state,
        messageHistory: action.data,
        messageHistoryFlag: action.flag,
      };
    case REMOVE_MESSAGE_HISTORY:
      return {
        ...state,
        messageHistory: action.data,
        messageHistoryFlag: action.flag,
      };
    case UPDATE_PRINT_SETTING:
      return {
        ...state,
        currentPrintSetting: action.data,
      };
    case UPDATE_BOARD_SIZES:
      return {
        ...state,
        boardSizes: action.data,
      };
    case UPDATE_BAKERS_CALC:
      return {
        ...state,
        bakerCalcSetting: action.data,
      };

    default:
      return state;
  }
};
export default settingsReducer;
