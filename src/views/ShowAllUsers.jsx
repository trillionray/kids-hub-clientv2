import { useEffect, useState } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import { Notyf } from "notyf";

export default function ShowAllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();

  // Fetch all users
  useEffect(() => {
    fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          notyf.error(data.message || "Error fetching users");
        }
      })
      .catch(() => notyf.error("Server error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="px-5">All Users</h3>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <div style={{ overflowX: "auto" }} className="px-4">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th> {/* Added ID column */}
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td style={{ whiteSpace: "normal", wordBreak: "break-word", maxWidth: "220px" }}>
                      {user._id}
                    </td>
                    <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{user.firstName}</td>
                    <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{user.lastName}</td>
                    <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{user.username}</td>
                    <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {user.updatedAt
                        ? new Date(user.updatedAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        disabled
                      >
                        Update
                      </Button>
                      <Button variant="danger" size="sm" disabled>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
