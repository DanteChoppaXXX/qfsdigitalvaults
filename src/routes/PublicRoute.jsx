import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function PublicRoute() {
  const isLoggedIn = localStorage.getItem("qfs_logged_in") === "true";
  
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

