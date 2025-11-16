import { useState, useEffect, useContext } from "react";
import { Button, Modal, Form, Table } from "react-bootstrap";
import { Notyf } from "notyf";
import UserContext from "../context/UserContext";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";

export default function ShowPrograms() {
  const { user } = useContext(UserContext);
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();

  const [programs, setPrograms] = useState([]);
  const [miscGroups, setMiscGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);

  const [showMiscModal, setShowMiscModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    fetchPrograms();
    fetchMiscGroups();
  }, []);

  // Fetch programs
  function fetchPrograms() {
    setLoading(true);
    fetch(`${API_URL}/programs`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setPrograms(data.programs || []))
      .catch(() => notyf.error("Failed to fetch programs"))
      .finally(() => setLoading(false));
  }

  // Fetch miscellaneous groups
  function fetchMiscGroups() {
    fetch(`${API_URL}/miscellaneous-package/read`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setMiscGroups(data))
      .catch(() => notyf.error("Failed to fetch miscellaneous groups"));
  }

  // Open Misc Package modal
  function openMiscModal(groupId) {
    const group = miscGroups.find((g) => g._id === groupId);
    if (!group) return;

    fetch(`${API_URL}/miscellaneous/getSpecificMiscs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ ids: group.miscs }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.miscs)) {
          setSelectedGroup({ ...group, miscs: data.miscs });
          setShowMiscModal(true);
        } else {
          notyf.error(data.message || "Failed to fetch miscellaneous items");
        }
      })
      .catch(() => notyf.error("Server error"));
  }

  // Delete program
  function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this program?")) return;

    fetch(`${API_URL}/programs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          notyf.success(data.message);
          fetchPrograms();
        } else {
          notyf.error(data.message || "Delete failed");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
  }

  // Update program
  function handleUpdateSubmit(e) {
    e.preventDefault();

    fetch(`${API_URL}/programs/${currentProgram._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name: currentProgram.name,
        category: currentProgram.category,
        description: currentProgram.description,
        rate: currentProgram.rate,
        down_payment: currentProgram.down_payment,
        capacity: currentProgram.capacity, // ✅ Added capacity
        miscellaneous_group_id: currentProgram.miscellaneous_group_id,
        isActive: currentProgram.isActive,
        updated_by: user.id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (data.success) {
          notyf.success(data.message);
          setShowModal(false);
          fetchPrograms();
        } else {
          notyf.error(data.message || "Update failed");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
  }

  // Open edit modal
  function openEditModal(program) {
    setCurrentProgram({ ...program });
    setShowModal(true);
  }

  if (loading) return <h4>Loading Programs...</h4>;

  const columns = [
    { name: "No.", selector: (row, index) => index + 1, width: "80px", center: true, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Category", selector: (row) => {
      const type = row.category;
      if (type === "short") return "Short Program";
      if (type === "long") return "Full Program"; 
    }, 
    sortable: true },
    //{ name: "Rate", selector: (row) => `₱${row.rate}`, sortable: true },
    //{ name: "Down Payment", selector: (row) => (row.down_payment ? `₱${row.down_payment}` : "₱0"), sortable: true },
    // {
    //   name: "Misc Group Amount",
    //   cell: (row) => {
    //     const group = row.miscellaneous_group;
    //     return group ? (
    //       <Button variant="link" className="p-0 text-decoration-underline" onClick={() => openMiscModal(group._id)}>
    //         ₱{group.miscs_total}
    //       </Button>
    //     ) : (
    //       "₱0"
    //     );
    //   },
    // },
    { name: "Capacity", selector: (row) => row.capacity || 0, sortable: true }, // ✅ NEW column
    //{ name: "Description", selector: (row) => row.description },
    { name: "Total", selector: (row) => `₱${row.total}`, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <Button size="sm" variant="warning" className="me-2" onClick={() => openEditModal(row)}>
            Edit
          </Button>
          {/*<Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
            Delete
          </Button>*/}
        </>
      ),
      width: "160px",
      center: true,
    },
  ];

  const filteredPrograms = programs.filter((item) => {
    const miscAmount = item.miscellaneous_group?.miscs_total || 0;
    const total = item.total || 0;

    return (
      item.name?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.category?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.description?.toLowerCase().includes(filterText.toLowerCase()) ||
      String(item.rate).includes(filterText) ||
      String(item.down_payment).includes(filterText) ||
      String(item.capacity).includes(filterText) || // ✅ searchable capacity
      String(miscAmount).includes(filterText) ||
      String(total).includes(filterText)
    );
  });

  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: "20px" }}>
      <h3 className="text-white text-bolder">PROGRAMS</h3>
      <div className="container border rounded shadow p-4" style={{ backgroundColor: "#ffffff" }}>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Link to="/programs/add">
            <Button variant="primary" className="p-2 me-2">
              Add Program
            </Button>
          </Link>
          <Form.Control
            type="text"
            style={{ maxWidth: "300px" }}
            placeholder="Search by name..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredPrograms}
          pagination
          highlightOnHover
          striped
          dense
          responsive
          noDataComponent="No classes found"
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
                textAlign: "center",
              },
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

        {/* Edit Program Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>

          <Modal.Header closeButton>
            <Modal.Title>Edit Program</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleUpdateSubmit}>
            <Modal.Body>
              <div className="text-danger mb-3 fw-bold">
                NOTE: Only capacity and activeness are allowed to edit to not effect other enrollment data
              </div>
              <Form.Group className="mb-3">
                <Form.Label>Program Name</Form.Label>
                <Form.Control
                  type="text"
                  value={currentProgram?.name || ""}
                  onChange={(e) => setCurrentProgram((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  disabled
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={currentProgram?.category || "short"}
                  onChange={(e) => setCurrentProgram((prev) => ({ ...prev, category: e.target.value }))}
                  disabled
                >
                  <option value="short">Short</option>
                  <option value="long">Long</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={currentProgram?.description || ""}
                  onChange={(e) => setCurrentProgram((prev) => ({ ...prev, description: e.target.value }))}
                  disabled                
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rate (₱)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={currentProgram?.rate || ""}
                  onChange={(e) => setCurrentProgram((prev) => ({ ...prev, rate: e.target.value }))}
                  required
                  disabled
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Down Payment (₱)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={currentProgram?.down_payment || ""}
                  onChange={(e) => setCurrentProgram((prev) => ({ ...prev, down_payment: e.target.value }))}
                  disabled
                />
              </Form.Group>

              {/* ✅ Capacity Field */}
              <Form.Group className="mb-3">
                <Form.Label>Capacity (Max Enrollees)</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={currentProgram?.capacity || ""}
                  onChange={(e) => setCurrentProgram((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Miscellaneous Package</Form.Label>
                <Form.Select
                  value={currentProgram?.miscellaneous_group_id || ""}
                  onChange={(e) => setCurrentProgram((prev) => ({ ...prev, miscellaneous_group_id: e.target.value }))}
                  disabled
                >
                  <option value="">Select a group</option>
                  {miscGroups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.package_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Check
                type="checkbox"
                label="Active"
                checked={currentProgram?.isActive || false}
                onChange={(e) => setCurrentProgram((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Misc Package Modal */}
        <Modal show={showMiscModal} onHide={() => setShowMiscModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Miscellaneous Package Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedGroup ? (
              <>
                <h5>{selectedGroup.package_name}</h5>
                {selectedGroup.miscs && selectedGroup.miscs.length > 0 ? (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Name</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGroup.miscs.map((item, idx) => (
                        <tr key={item._id}>
                          <td>{idx + 1}</td>
                          <td>{item.name}</td>
                          <td>₱{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2} className="text-end">
                          <strong>Total</strong>
                        </td>
                        <td>
                          <strong>
                            ₱{selectedGroup.miscs.reduce((sum, item) => sum + Number(item.price), 0)}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </Table>
                ) : (
                  <p>No items found in this package.</p>
                )}
              </>
            ) : (
              <p>Loading...</p>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
