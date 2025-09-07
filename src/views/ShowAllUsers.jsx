import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Notyf } from "notyf";
import { Spinner, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function ShowAllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const navigate = useNavigate();

  // Fetch all users
  useEffect(() => {
    fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          notyf.error(data.message || "Error fetching users");
        }
      })
      .catch(() => notyf.error("Server error"))
      .finally(() => setLoading(false));
  }, []);

  // Table columns
  const columns = [
    {
      name: "ID",
      selector: (row) => row._id,
      sortable: true,
      wrap: true,
    },
    {
      name: "First Name",
      selector: (row) => row.firstName,
      sortable: true,
    },
    {
      name: "Last Name",
      selector: (row) => row.lastName,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      wrap: true,
    },
    {
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div>
          <button className="btn btn-warning btn-sm me-2" disabled>
            Update
          </button>
          <button className="btn btn-danger btn-sm" disabled>
            Delete
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];


  // Filtering
  const filteredUsers = users.filter(
    (user) =>
      user.firstName?.toLowerCase().includes(filterText.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(filterText.toLowerCase()) ||
      user.email?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="container mt-4 px-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/*<h3 className="px-2">All Users</h3>*/}
        <Button variant="primary" onClick={() => navigate("/register")} className="ms-auto">
          Register Employee
        </Button>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          {/* Search box */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search users..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>

          {/* DataTable */}
          <DataTable
            columns={columns}
            data={filteredUsers}
            pagination
            highlightOnHover
            striped
            dense
            responsive
            noDataComponent="No users found"
          />
        </>
      )}
    </div>
  );
}
