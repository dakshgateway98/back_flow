import { UPDATE_TEMPLATES } from "../constants/constant";

export const updateAllTemplates = (data) => {
  return {
    type: UPDATE_TEMPLATES,
    data: data,
  };
};
