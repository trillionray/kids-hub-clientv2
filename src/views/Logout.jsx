import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import UserContext from "../context/UserContext";

export default function Logout() {
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    localStorage.removeItem("token");
    setUser({}); // Clear user state
  }, []);

  return <Navigate to="/login" replace />;
}
