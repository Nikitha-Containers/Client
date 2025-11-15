import React from "react";
import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../home/pages/login/checkToken.js";

const PrivateRouter = ({ children }) => {
  const token = sessionStorage.getItem("token");
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn || !token) {
    return <Navigate to="/login" replace />;
  }

  if (isTokenExpired(token)) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("adminID");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRouter;
