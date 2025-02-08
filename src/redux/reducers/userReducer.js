import {
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT,
  UPDATE_DATE_TIME,
} from "../constants/constant";

const initialState = {
  data: {},
  userList: [],
  error: "",
  token: "",
  isLoggedIn: false,
  dateTime: "",
};

const UserReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        data: action.data,
        token: action.token,
        isLoggedIn: true,
        error: "",
      };
    case LOGIN_FAIL:
      return {
        ...state,
        data: {},
        error: action.error,
        isLoggedIn: false,
      };
    case LOGOUT:
      return {
        ...state,
        data: {},
        error: "",
        token: "",
        isLoggedIn: false,
        dateTime: "",
      };
    case UPDATE_DATE_TIME:
      return {
        ...state,
        dateTime: action.dateTime,
      };
    default:
      return state;
  }
};
export default UserReducer;
