import React, { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";

export default function ShowBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch all branches
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/branches/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) setBranches(data.branches);
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
      } else {
        alert("Branch not found");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch branch");
    }
  };

  // Handle edit form submit
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
        fetchBranches();
        setShowEditModal(false);
      } else {
        alert("Failed to update branch");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update branch");
    }
  };

  return (
    <div className="p-4">
      <h3>Branches</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr
                   key={b._id}
                   style={{
                     color: b.is_active ? "inherit" : "#999", // grey text if inactive
                     textDecoration: b.is_active ? "none" : "line-through", // strike-through if inactive
                     backgroundColor: b.is_active ? "inherit" : "#f5f5f5", // optional light grey background
                   }}
                 >
                <td>{b.branch_name}</td>
                <td>{b.address}</td>
                <td>{b.contact_number}</td>
                <td>{b.email}</td>
                <td>{b.is_active ? "Yes" : "No"}</td>
                <td>
                  <Button size="sm" onClick={() => openEditModal(b._id)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
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

              <Button type="submit">Save Changes</Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
