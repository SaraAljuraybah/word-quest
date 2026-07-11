import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AuthLoadingScreen } from "./AuthLoadingScreen";

export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (user) {
    return <Navigate to="/stages" replace />;
  }

  return children;
}
