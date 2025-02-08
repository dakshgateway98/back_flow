import { UPDATE_SUB_PAGE_CONFIG } from "../constants/constant";

export const updateAllSubPageConfig = (data) => {
  return {
    type: UPDATE_SUB_PAGE_CONFIG,
    data: data,
  };
};
