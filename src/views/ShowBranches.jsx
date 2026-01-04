import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import DataTable from "react-data-table-component";

export default function ShowBranches() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Fetch all branches
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/branches/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) {
        setBranches(data.branches);
        setFilteredBranches(data.branches);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch branches");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Open edit modal
  const openEditModal = async (id) => {
    try {
      const res = await fetch(`${API_URL}/branches/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedBranch(data.branch);
        setShowEditModal(true);
      } else alert("Branch not found");
    } catch (err) {
      console.error(err);
      alert("Failed to fetch branch");
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/branches/edit/${selectedBranch._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(selectedBranch),
      });
      const data = await res.json();
      if (data.success) {

        fetch(`${API_URL}/logs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                user: user.id, 
                task: "Edit Branch", 
                documentLog: data
              }) // datetime is automatic in backend
          })
          .then(res => res.json())
          .then(data => {
            console.log(data)
            if (data.log) {
              console.log('Log added successfully:', data.log);
            } else {
              console.error('Error adding log:', data.message);
            }
          })
          .catch(err => {
            console.error('Server error:', err.message);
          });

        fetchBranches();
        setShowEditModal(false);
      } else alert("Failed to update branch");
    } catch (err) {
      console.error(err);
      alert("Failed to update branch");
    }
  };

  // Search filter
  const handleSearch = (text) => {
    setSearchText(text);
    setFilteredBranches(
      branches.filter(
        (b) =>
          b.branch_name.toLowerCase().includes(text.toLowerCase()) ||
          (b.address || "").toLowerCase().includes(text.toLowerCase()) ||
          (b.contact_number || "").toLowerCase().includes(text.toLowerCase()) ||
          (b.email || "").toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  // Columns
  const columns = useMemo(() => [
    { name: "Name", selector: (row) => row.branch_name, sortable: true },
    { name: "Address", selector: (row) => row.address, sortable: true },
    { name: "Contact", selector: (row) => row.contact_number, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    {
      name: "Active",
      selector: (row) => (row.is_active ? "Yes" : "No"),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <Button size="sm" onClick={() => openEditModal(row._id)}>
          Edit
        </Button>
      ),
    },
  ], [branches]);

  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: "20px" }}>
      <h3 className="text-white text-bolder">SHOW BRANCHES</h3>
      <div className="container border p-4 rounded shadow" style={{ backgroundColor: "#fff" }}>
        <div className="d-flex justify-content-end align-items-center mb-3">
          <Form.Control
            type="text"
            placeholder="Search branches..."
            style={{ maxWidth: "300px" }}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
          />
        </div>

        {loading ? (
          <Spinner animation="border" />
        ) : (
          <DataTable
            columns={columns}
            data={filteredBranches}
            pagination
            highlightOnHover
            striped
            dense
            responsive
            noDataComponent="No branches found"
            customStyles={{
              table: { 
                style: { 
                  borderRadius: "10px", 
                  overflow: "hidden", 
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)", 
                  border: "1px solid #dee2e6" 
                } 
              },
              headRow: { 
                style: { 
                  backgroundColor: "#f8f9fa", 
                  fontSize: "1rem",
                  fontWeight: "bold", 
                  textTransform: "uppercase",
                  borderBottom: "2px solid #dee2e6",
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
                },
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
        )}
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Branch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBranch && (
            <Form onSubmit={handleEditSubmit}>
              <Form.Group className="mb-2">
                <Form.Label>Branch Name</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedBranch.branch_name}
                  onChange={(e) =>
                    setSelectedBranch({ ...selectedBranch, branch_name: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedBranch.address || ""}
                  onChange={(e) =>
                    setSelectedBranch({ ...selectedBranch, address: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Contact Number</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedBranch.contact_number || ""}
                  onChange={(e) =>
                    setSelectedBranch({ ...selectedBranch, contact_number: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={selectedBranch.email || ""}
                  onChange={(e) =>
                    setSelectedBranch({ ...selectedBranch, email: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Check
                  type="checkbox"
                  label="Active"
                  checked={selectedBranch.is_active}
                  onChange={(e) =>
                    setSelectedBranch({ ...selectedBranch, is_active: e.target.checked })
                  }
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
