import { useContext, useEffect } from "react";
import UserContext from "../context/UserContext";

export default function Home() {
  const { user } = useContext(UserContext);

  const allowedRoles = ["admin", "teacher", "cashier"];
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    console.log("user context:", user);
    console.log("stored user:", storedUser);
  }, [storedUser, user]);

  if (user?.role == null) {
    window.location.replace("/login");
  }

  if (user.status == "initial"){
    window.location.replace("/profile/change-password")
  }

  return (


    <div className="mt-5 p-6">
      {/* System Title */}
      <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-700">
        Kids Hub Enrollment System
      </h1>

      {/* Get Started Button */}
      <div className="mt-5 text-center">
        <a
          href="/students/add"
          className="px-5 py-3 bg-green-600 text-white text-lg font-medium rounded-lg shadow hover:bg-green-700 transition"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
