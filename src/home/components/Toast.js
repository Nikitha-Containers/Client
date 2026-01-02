import React from "react";
import { ToastContainer, Zoom } from "react-toastify";

function Toast() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={2000}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      theme="colored"
      transition={Zoom}
    />
  );
}

export default Toast;
