import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const isLoggedIn = localStorage.getItem("qfs_logged_in") === "true";
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}

