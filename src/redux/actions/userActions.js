import {
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT,
  UPDATE_DATE_TIME,
} from "../constants/constant";

export const loginSucces = (data, token) => {
  return {
    type: LOGIN_SUCCESS,
    data: data,
    token: token,
  };
};

export const updateDateTime = (dateTime) => {
  return {
    type: UPDATE_DATE_TIME,
    dateTime,
  };
};

export const logout = () => {
  return {
    type: LOGOUT,
  };
};

export const loginFail = (error) => {
  return {
    type: LOGIN_FAIL,
    error,
  };
};
