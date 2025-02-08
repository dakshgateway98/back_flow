import { toast } from "react-toastify";

// Display toast
export const displayErrorToast = (message, time) => {
  toast.error(message, {
    position: "top-center",
    autoClose: time || 1500,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const displayInfoToast = (message, time) => {
  toast.info(message, {
    position: "top-center",
    autoClose: time || 1500,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const displaySuccessToast = (message, time) => {
  toast.success(message, {
    position: "top-center",
    autoClose: time || 1500,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};
