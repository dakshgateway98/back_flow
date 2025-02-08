import { UPDATE_VENUE_ROOMS, UPDATE_All_ROOMS } from "../constants/constant";

const initialState = {
  allVenueRooms: {},
  allRooms: {},
};

const venueConfigReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case UPDATE_VENUE_ROOMS:
      return {
        ...state,
        allVenueRooms: action.data,
      };
    case UPDATE_All_ROOMS:
      return {
        ...state,
        allRooms: action.data,
      };

    default:
      return state;
  }
};
export default venueConfigReducer;
