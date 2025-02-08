import {
  UPDATE_LEVELS_LIST,
  UPDATE_CONFIG_LEVELS,
} from "../constants/constant";

export const getUpdatedLevelList = (data) => {
  return {
    type: UPDATE_LEVELS_LIST,
    data: data,
  };
};

export const getUpdatedConfigLevels = (data) => {
  return {
    type: UPDATE_CONFIG_LEVELS,
    data: data,
  };
};
