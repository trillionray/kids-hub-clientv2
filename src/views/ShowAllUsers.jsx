import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Notyf } from "notyf";
import { Spinner, Button, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";

export default function ShowAllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState([
    "id",
    "name",
    "email",
    "role",
    "actions"
  ]);
  const [globalSearch, setGlobalSearch] = useState(""); // ✅ Single search
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const navigate = useNavigate();

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

  const allColumns = [
    {
      id: "id",
      name: "ID",
      selector: (row) => row._id,
      sortable: true,
      style: { textAlign: "center", whiteSpace: "nowrap" }
    },
    {
      id: "name",
      name: "Name",
      selector: (row) => {
        const middleInitial = row.middleName
          ? `${row.middleName.charAt(0).toUpperCase()}.`
          : "";
        const suffix = row.suffix ? ` ${row.suffix}` : "";
        return `${row.lastName || ""}, ${row.firstName || ""} ${middleInitial}${suffix}`.trim();
      },
      sortable: true,
      style: { textAlign: "center", whiteSpace: "nowrap" }
    },
    {
      id: "email",
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      style: { textAlign: "center", whiteSpace: "nowrap" }
    },
    {
      id: "role",
      name: "Role",
      selector: (row) => toTitleCase(row.role),
      sortable: true,
      style: { textAlign: "center", whiteSpace: "nowrap" }
    },
    {
      id: "actions",
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
              backgroundColor: "transparent",
              border: "none",
              padding: "0.25rem"
            }}
            onMouseEnter={(e) => {
              const icon = e.currentTarget.querySelector("svg");
              if (icon) icon.style.color = "#0dcaf0";
            }}
            onMouseLeave={(e) => {
              const icon = e.currentTarget.querySelector("svg");
              if (icon) icon.style.color = "#6c757d";
            }}
          >
            <FeatherIcon icon="eye" size={14} style={{ color: "#6c757d" }} />
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      style: { textAlign: "center" }
    }
  ];

  const toggleColumn = (id) => {
    setVisibleColumns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const columns = allColumns.filter((col) => visibleColumns.includes(col.id));

  // ⬆️ At the top of your component, add this new state:
  const [filteredUsers, setFilteredUsers] = useState([]);

  // After fetching users, also set filteredUsers:
  useEffect(() => {
    fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
          setFilteredUsers(data); // ✅ Keep filteredUsers in sync initially
        } else {
          notyf.error(data.message || "Error fetching users");
        }
      })
      .catch(() => notyf.error("Server error"))
      .finally(() => setLoading(false));
  }, []);


  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: "20px" }}>
      <div className="container border mt-5 p-4 rounded shadow" style={{ backgroundColor: "#ffffffff"}}>
        {/* Removed inner container, just use a div for spacing */}
        <div className="mt-2">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Button
              variant="primary"
              onClick={() => navigate("/register")}
            >
              Register Employee
            </Button>

            <input
              type="text"
              className="form-control"
              style={{ maxWidth: "250px" }}
              placeholder="Search users..."
              onChange={(e) => {
                const search = e.target.value.toLowerCase();
                setFilteredUsers(
                  users.filter(
                    (u) =>
                      `${u.lastName}, ${u.firstName}`.toLowerCase().includes(search) ||
                      u.email.toLowerCase().includes(search) ||
                      u.role.toLowerCase().includes(search)
                  )
                );
              }}
            />
            
          </div>

          {loading ? (
            <Spinner animation="border" />
          ) : (
            <>
              <DataTable
                columns={columns}
                data={filteredUsers}
                pagination
                highlightOnHover
                striped
                dense
                responsive
                noDataComponent="No users found"
                customStyles={{
                  table: {
                    style: {
                      borderRadius: "10px",
                      overflow: "hidden",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #dee2e6",
                    },
                  },
                  headRow: {
                    style: {
                      backgroundColor: "#f8f9fa",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      borderBottom: "2px solid #dee2e6",
                      textAlign: "center", // ✅ Ensures header row centers its content
                    },
                  },
                  headCells: {
                    style: {
                      justifyContent: "center", // ✅ Centers header text
                      textAlign: "center",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      borderRight: "1px solid #dee2e6",
                    },
                  },
                  rows: {
                    style: {
                      fontSize: "0.95rem",
                      paddingTop: "10px",
                      paddingBottom: "10px",
                      borderBottom: "1px solid #e9ecef",
                      textAlign: "center", // ✅ Ensures row cells are centered
                    },
                    highlightOnHoverStyle: {
                      backgroundColor: "#eaf4fb",
                      borderBottomColor: "#89C7E7",
                      outline: "none",
                    },
                  },
                  cells: {
                    style: {
                      justifyContent: "center", // ✅ Centers cell content
                      textAlign: "center",
                      borderRight: "1px solid #dee2e6",
                    },
                  },
                  pagination: {
                    style: {
                      borderTop: "1px solid #dee2e6",
                      paddingTop: "4px",
                      justifyContent: "center",
                    },
                  },
                }}
              />

              {/* 🔹 User Details Modal */}
              <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                  <Modal.Title>User Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedUser ? (
                    <div>
                      <p><strong>ID:</strong> {selectedUser._id}</p>
                      <p><strong>First Name:</strong> {selectedUser.firstName}</p>
                      <p><strong>Middle Name:</strong> {selectedUser.middleName}</p>
                      <p><strong>Last Name:</strong> {selectedUser.lastName}</p>
                      <p><strong>Suffix:</strong> {selectedUser.suffix || "-"}</p>
                      <p><strong>Email:</strong> {selectedUser.email}</p>
                      <p><strong>Role:</strong> {toTitleCase(selectedUser.role)}</p>
                      <p><strong>Status:</strong> {selectedUser.status}</p>
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
      </div>
    </div>



  );


}
