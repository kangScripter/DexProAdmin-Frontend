// components/AuthRedirect.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const AuthRedirect = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : children;
};

export default AuthRedirect;
