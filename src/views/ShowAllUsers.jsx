import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Notyf } from "notyf";
import { Spinner, Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";

export default function ShowAllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const navigate = useNavigate();

  // Fetch all users
  useEffect(() => {
    fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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

  const toTitleCase = (str) =>
    str?.charAt(0).toUpperCase() + str?.slice(1).toLowerCase();

  // Table columns
  const columns = [
    {
      name: "ID",
      selector: (row) => row._id,
      sortable: true,
      wrap: false,
      style: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: "center",
      },
    },
    {
      name: "Name",
      selector: (row) => {
        const middleInitial = row.middleName
          ? `${row.middleName.charAt(0).toUpperCase()}.`
          : "";
        const suffix = row.suffix ? ` ${row.suffix}` : "";
        return `${row.lastName || ""}, ${row.firstName || ""} ${middleInitial}${suffix}`.trim();
      },
      sortable: true,
      wrap: false,
      style: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: "center",
      },
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      wrap: false,
      style: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: "center",
      },
    },
    {
      name: "Role",
      selector: (row) => toTitleCase(row.role),
      sortable: true,
      wrap: false,
      width: "120px",
      style: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: "center",
      },
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="text-center">
          <Button
            size="sm"
            onClick={() => {
              setSelectedUser(row);
              setShowModal(true);
            }}
            style={{
              backgroundColor: "transparent", // no background
              border: "none",
              padding: "0.25rem", // optional: make it smaller
            }}
            onMouseEnter={(e) => {
              const icon = e.currentTarget.querySelector("svg");
              if (icon) icon.style.color = "#0dcaf0"; // info color on hover
            }}
            onMouseLeave={(e) => {
              const icon = e.currentTarget.querySelector("svg");
              if (icon) icon.style.color = "#6c757d"; // grey color initially
            }}
          >
            <FeatherIcon icon="eye" size={14} style={{ color: "#6c757d" }} />
          </Button>





        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      wrap: false,
      style: { textAlign: "center" },
    }

  ];

  // Filtering
  const filteredUsers = users.filter(
    (user) =>
      user.firstName?.toLowerCase().includes(filterText.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(filterText.toLowerCase()) ||
      user.email?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="container mt-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button
          variant="primary"
          onClick={() => navigate("/register")}
          className="ms-auto"
        >
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

          {/* User Details Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>User Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedUser ? (
                <div>
                  <p>
                    <strong>ID:</strong> {selectedUser._id}
                  </p>
                  <p>
                    <strong>First Name:</strong> {selectedUser.firstName}
                  </p>
                  <p>
                    <strong>Middle Name:</strong> {selectedUser.middleName}
                  </p>
                  <p>
                    <strong>Last Name:</strong> {selectedUser.lastName}
                  </p>
                  <p>
                    <strong>Suffix:</strong> {selectedUser.suffix || "-"}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {toTitleCase(selectedUser.role)}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedUser.status}
                  </p>
                </div>
              ) : (
                <p>No user selected</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
