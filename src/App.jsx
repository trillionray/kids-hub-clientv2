import { useState, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "routes";
import { UserProvider } from "./context/UserContext";
import "notyf/notyf.min.css";

export default function App() {
  
  const [user, setUser] = useState({
    id: null,
    role: null,
  });

  function unsetUser() {
    localStorage.clear();
    setUser({ id: null, role: null });
  }

  // Check token and fetch user details on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser({ id: null, role: null });
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/users/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data._id) {
          setUser({ id: data._id, role: data.role });
        } else {
          setUser({ id: null, role: null });
        }
      })
      .catch((error) => {
        console.error(error);
        setUser({ id: null, role: null });
      });
  }, []);

  // Debugging
  useEffect(() => {
    console.log("User:", user);
    console.log("LocalStorage:", localStorage);
  }, [user]);

  return (
    <UserProvider value={{ user, setUser, unsetUser }}>
      <RouterProvider router={router} />
    </UserProvider>
  );
}
