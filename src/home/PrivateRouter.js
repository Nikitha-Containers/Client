import React from "react";
import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../home/pages/login/checkToken.js";
import { clearSession } from "./pages/login/authSession.js";

const PrivateRouter = ({ children }) => {
  const token = sessionStorage.getItem("token");
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn || !token) {
    return <Navigate to="/login" replace />;
  }

  if (isTokenExpired(token)) {
    clearSession()
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRouter;
