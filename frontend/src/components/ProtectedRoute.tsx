import React from "react";
import { Navigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { isAuthenticated } from "../store/atom"; // Recoil atom for authentication state

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useRecoilValue(isAuthenticated);

  if (!auth) {
   
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
