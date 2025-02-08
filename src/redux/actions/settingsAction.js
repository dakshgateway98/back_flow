import {
  GET_MESSAGE_HISTORY,
  GET_UPDATE_SETTINGS_MESSAGE,
  REMOVE_MESSAGE_HISTORY,
  UPDATE_PRINT_SETTING,
  UPDATE_BOARD_SIZES,
  UPDATE_BAKERS_CALC,
} from "../constants/constant";

export const updateSettingsMessage = (data) => {
  return {
    type: GET_UPDATE_SETTINGS_MESSAGE,
    data: data,
  };
};

export const getMessageHistory = (data, flag) => {
  return {
    type: GET_MESSAGE_HISTORY,
    data: data,
    flag: flag,
  };
};

export const removeMessageHistory = () => {
  return {
    type: REMOVE_MESSAGE_HISTORY,
    data: [],
    flag: 0,
  };
};

export const updateCurrentPrintSetting = (data) => {
  return {
    type: UPDATE_PRINT_SETTING,
    data: data,
  };
};

export const updateBoardSizes = (data) => {
  return {
    type: UPDATE_BOARD_SIZES,
    data: data,
  };
};

export const updateBakersCalculator = (data) => {
  return {
    type: UPDATE_BAKERS_CALC,
    data: data,
  };
};
