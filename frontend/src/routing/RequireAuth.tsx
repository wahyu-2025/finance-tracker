import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ReactNode } from "react";
import { ScreenLoader } from "@/components/screen-loader";

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        {/* <LoaderCircle className="animate-spin" /> Loading... */}
        <ScreenLoader />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
