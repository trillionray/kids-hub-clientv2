import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import UserContext from "../../../context/UserContext";

export default function Dashboard() {
  const { user } = useContext(UserContext);

  if (!user?.id) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
