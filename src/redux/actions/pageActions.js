import {
  UPDATE_HOME_PAGE_DATA,
  UPDATE_ALL_PAGES,
  UPDATE_PAGES,
} from "../constants/constant";

export const updateHomePage = (data) => {
  return {
    type: UPDATE_HOME_PAGE_DATA,
    data: data,
  };
};

export const updateAllPages = (data) => {
  return {
    type: UPDATE_ALL_PAGES,
    data: data,
  };
};
export const updatePages = (data) => {
  return {
    type: UPDATE_PAGES,
    data: data,
  };
};
