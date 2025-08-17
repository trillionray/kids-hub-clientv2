import { useState, useEffect, useContext } from "react";
import { Button, Modal, Form, InputGroup, Table } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";
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

  function fetchPrograms() {
    setLoading(true);
    fetch(`${API_URL}/programs`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setPrograms(data))
      .catch(() => notyf.error("Failed to fetch programs"))
      .finally(() => setLoading(false));
  }

  function fetchMiscGroups() {
    fetch(`${API_URL}/miscellaneous-package/read`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setMiscGroups(data))
      .catch(() => notyf.error("Failed to fetch miscellaneous groups"));
  }

  function openMiscModal(groupId) {
    const group = miscGroups.find((g) => g._id === groupId);
    if (!group) return;

    // Fetch full miscellaneous items
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
        miscellaneous_group_id: currentProgram.miscellaneous_group_id,
        isActive: currentProgram.isActive,
        updated_by: user.id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
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

  function openEditModal(program) {
    setCurrentProgram({ ...program });
    setShowModal(true);
  }

  if (loading) return <h4>Loading Programs...</h4>;

  const columns = [
    { name: "No.", selector: (row, index) => index + 1, width: "60px", center: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Category", selector: (row) => row.category, sortable: true },
    { name: "Rate", selector: (row) => `₱${row.rate}`, sortable: true },
    {
      name: "Miscellaneous Group",
      selector: (row) => {
        const group = miscGroups.find((g) => g._id === row.miscellaneous_group_id);
        return group ? (
          <Button
            variant="link"
            className="p-0 text-decoration-underline"
            onClick={() => openMiscModal(group._id)}
          >
            {group.package_name}
          </Button>
        ) : (
          "—"
        );
      },
    },
    { name: "Description", selector: (row) => row.description },
    {
      name: "Actions",
      cell: (row) => (
        <Button size="sm" variant="warning" className="me-2" onClick={() => openEditModal(row)}>
          <FeatherIcon icon="edit" size="14" />
        </Button>
      ),
    },
  ];

  const filteredPrograms = programs.filter((item) =>
    item.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="px-5 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Programs</h3>
        <Link to="/programs/add">
          <Button variant="primary" className="rounded-circle p-2 me-3">
            <FeatherIcon icon="plus" size="16" />
          </Button>
        </Link>
      </div>

      {/* Search */}
      <InputGroup className="mb-3">
        <InputGroup.Text>
          <FeatherIcon icon="search" />
        </InputGroup.Text>
        <Form.Control
          placeholder="Search by name..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </InputGroup>

      <DataTable
        columns={columns}
        data={filteredPrograms}
        pagination
        highlightOnHover
        striped
        noDataComponent="No Programs found"
        responsive
      />

      {/* Edit Program Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Program</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateSubmit}>
          <Modal.Body>
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FeatherIcon icon="tag" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                value={currentProgram?.name || ""}
                onChange={(e) => setCurrentProgram((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </InputGroup>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={currentProgram?.category || "short"}
                onChange={(e) => setCurrentProgram((prev) => ({ ...prev, category: e.target.value }))}
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
              />
            </Form.Group>

            <InputGroup className="mb-3">
              <InputGroup.Text>₱</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                value={currentProgram?.rate || ""}
                onChange={(e) => setCurrentProgram((prev) => ({ ...prev, rate: e.target.value }))}
                required
              />
            </InputGroup>

            <Form.Group className="mb-3">
              <Form.Label>Miscellaneous Package</Form.Label>
              <Form.Select
                value={currentProgram?.miscellaneous_group_id || ""}
                onChange={(e) =>
                  setCurrentProgram((prev) => ({ ...prev, miscellaneous_group_id: e.target.value }))
                }
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
                      <td colSpan={2} className="text-end"><strong>Total</strong></td>
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
  );
}
