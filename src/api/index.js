import axios from "axios";
import { displayErrorToast } from "../global/displayToast";
import { print_key } from "../utils/StaticData";

// import { addUser } from "../redux/actions/userActions";

//This is throwing an error in our build step.
export const baseURL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const printHeader = axios.create({
  headers: {
    "Content-Type": "application/json",
    "x-api-key": print_key,
  },
});

export const setToken = (token) => {
  api.defaults.headers.common = {
    Authorization: "Bearer " + token,
  };
};

export const removeToken = () => {
  api.defaults.headers.common = {
    Authorization: "",
  };
};

// API error handling For token based APIs
export const handleError = async (error) => {
  if (
    error.response &&
    error.response.status !== 200 &&
    error.response.status !== 404 &&
    error.response.status !== 401
  ) {
    displayErrorToast(error.response.data.message);
    // display toast regarding Error msg
  } else if (error.response && error.response.status === 401) {
    localStorage.removeItem("persist:patty-cakes");
    sessionStorage.removeItem("persist:patty-cakes");
    displayErrorToast(error.response.data.message);
    window.location.reload();
    // Redirect to login  clear all storage
  }
};

export default api;
