import { useState, useEffect, useContext } from "react";
import { Button, Modal, Form, InputGroup, Table } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";
import UserContext from "../context/UserContext";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";

export default function ShowMiscellaneous() {
  const { user } = useContext(UserContext);
  const notyf = new Notyf();
  const API_URL = import.meta.env.VITE_API_URL;

  const [miscList, setMiscList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [currentMisc, setCurrentMisc] = useState(null);

  useEffect(() => {
    fetchMiscellaneous();
  }, []);

  function fetchMiscellaneous() {
    setLoading(true);
    fetch(`${API_URL}/miscellaneous`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setMiscList(data.result || data);
        setLoading(false);
      })
      .catch(() => {
        notyf.error("Failed to fetch Miscellaneous data");
        setLoading(false);
      });
  }

  function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    fetch(`${API_URL}/miscellaneous/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success !== false) {
          notyf.success(data.message || "Deleted successfully");
          fetchMiscellaneous();
        } else {
          notyf.error(data.message || "Delete failed");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
  }

  function handleUpdateSubmit(e) {
    e.preventDefault();

    fetch(`${API_URL}/miscellaneous/${currentMisc._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name: currentMisc.name,
        price: currentMisc.price,
        is_active: currentMisc.is_active,
        created_by: currentMisc.created_by,
        last_updated_by: user?.username || "system",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success !== false) {
          notyf.success(data.message || "Updated successfully");
          setShowModal(false);
          fetchMiscellaneous();
        } else {
          notyf.error(data.message || "Update failed");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
  }

  function openEditModal(misc) {
    setCurrentMisc({ ...misc });
    setShowModal(true);
  }

  if (loading) return <h4>Loading Miscellaneous...</h4>;

  const columns = [
    { name: "No.", selector: (row, i) => i + 1, width: "80px", center: true, sortable: true  },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Price", selector: (row) => `₱${Number(row.price).toLocaleString()}`, sortable: true},
    { name: "Status", selector: (row) => (row.is_active ? "Active" : "Inactive"), sortable: true, center: true },
    {
      name: "Actions",
      cell: (row) => (
        <Button size="sm" variant="warning" className="me-2" onClick={() => openEditModal(row)}>
          <FeatherIcon icon="edit" size="14" />
        </Button>
      ),
      width: "120px",
      center: true,
    },
  ];

  const filteredData = miscList.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      String(item.price).includes(search)
  );

  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: "20px" }}>
      <h3 className="text-white text-bolder">MISCELLANEOUS LIST</h3>
      <div className="container border rounded shadow p-4" style={{ backgroundColor: "#ffffff" }}>
        {/* Header */}
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          
          <Link to="/miscellaneous/add">
            <Button variant="primary" className="p-2 me-2">
              Add Miscellaneous
            </Button>
          </Link>

          <Form.Control
            type="text"
            style={{ maxWidth: "250px" }}
            placeholder="Search classes..."
            value={search}
            onChange={(e) => {
              const val = e.target.value.toLowerCase();
              setSearch(val);
              setFilteredClasses(
                classesWithTeacherName.filter(
                  (c) =>
                    String(c._id).toLowerCase().includes(val) ||
                    String(c.sectionName).toLowerCase().includes(val) ||
                    String(c.teacherName).toLowerCase().includes(val)
                )
              );
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault(); // Prevents page refresh / 404
            }}
          />

        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          striped
          dense
          responsive
          noDataComponent="No Miscellaneous found"
          customStyles={{
            table: { 
              style: { 
                borderRadius: "10px", 
                overflow: "hidden", 
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                border: "1px solid #dee2e6" 
              } 
            },
            headRow: { 
              style: { 
                backgroundColor: "#f8f9fa", 
                fontSize: "1rem",
                fontWeight: "bold", 
                textTransform: "uppercase",
                borderBottom: "2px solid #dee2e6" ,
                textAlign: "center"
              } 
            },
            headCells: { 
              style: { 
                justifyContent: "center", 
                textAlign: "center", 
                paddingTop: "12px", 
                paddingBottom: "12px",
                borderRight: "1px solid #dee2e6",
              } 
            },
            rows: {
              style: {
                fontSize: "0.95rem",
                paddingTop: "10px",
                paddingBottom: "10px",
                borderBottom: "1px solid #e9ecef",
                textAlign: "center",
              },
              highlightOnHoverStyle: {
                backgroundColor: "#eaf4fb",
                borderBottomColor: "#89C7E7",
                outline: "none",
              },
            },
            cells: { 
              style: { 
                justifyContent: "center", 
                textAlign: "center",
                borderRight: "1px solid #dee2e6",
              } 
            },
            pagination: { 
              style: { 
                borderTop: "1px solid #dee2e6", 
                paddingTop: "4px", 
                justifyContent: "center" 
              } 
            },
          }}
          conditionalRowStyles={[
            {
              when: (row) => row.is_active === false,
              style: { backgroundColor: "#f8f9fa", color: "#6c757d", textDecoration: "line-through", fontStyle: "italic" },
            },
          ]}
        />

        {/* Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Miscellaneous</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleUpdateSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={currentMisc?.name || ""}
                  onChange={(e) => setCurrentMisc((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Price (₱)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={currentMisc?.price || ""}
                  onChange={(e) => setCurrentMisc((prev) => ({ ...prev, price: e.target.value }))}
                  required
                />
              </Form.Group>
              <Form.Check
                type="checkbox"
                label="Is Active"
                checked={currentMisc?.is_active || false}
                onChange={(e) => setCurrentMisc((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Changes</Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
