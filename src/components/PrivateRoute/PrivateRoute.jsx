// src/components/PrivateRoute.js

import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "../../stores/userStore";

export const PrivateRoute = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated); // Ambil isAuthenticated dari global state


  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
