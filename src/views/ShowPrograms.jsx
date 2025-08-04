import { useState, useEffect, useContext } from "react";
import { Table, Button, Modal, Form, InputGroup } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";
import UserContext from "../context/UserContext";

export default function ShowPrograms() {
  const { user } = useContext(UserContext);
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  function fetchPrograms() {
    setLoading(true);
    fetch(`${API_URL}/programs`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPrograms(data);
        setLoading(false);
      })
      .catch(() => {
        notyf.error("Failed to fetch programs");
        setLoading(false);
      });
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
        effective_date: currentProgram.effective_date,
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

  return (
    <div className="px-5 py-4">
      <h3 className="mb-4">Programs</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Rate</th>
            <th>Effective Date</th>
            <th>Active</th>
            <th>Created By</th>
            <th>Updated By</th>
            <th>Last Modified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {programs.length > 0 ? (
            programs.map((prog) => (
              <tr key={prog._id}>
                <td>{prog.name}</td>
                <td>{prog.category}</td>
                <td style={{ whiteSpace: "normal" }}>{prog.description}</td>
                <td>₱{prog.rate}</td>
                <td>{new Date(prog.effective_date).toLocaleDateString()}</td>
                <td>{prog.isActive ? "Yes" : "No"}</td>
                <td style={{ maxWidth: "150px", wordBreak: "break-word" }}>
                  {prog.created_by}
                </td>
                <td style={{ maxWidth: "150px", wordBreak: "break-word" }}>
                  {prog.updated_by}
                </td>
                <td>
                  {prog.last_modified_date
                    ? new Date(prog.last_modified_date).toLocaleString()
                    : "N/A"}
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => openEditModal(prog)}
                  >
                    <FeatherIcon icon="edit" size="14" />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(prog._id)}
                  >
                    <FeatherIcon icon="trash-2" size="14" />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center">
                No Programs found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Edit Modal */}
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
                onChange={(e) =>
                  setCurrentProgram((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </InputGroup>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={currentProgram?.category || "short"}
                onChange={(e) =>
                  setCurrentProgram((prev) => ({ ...prev, category: e.target.value }))
                }
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
                onChange={(e) =>
                  setCurrentProgram((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </Form.Group>

            <InputGroup className="mb-3">
              <InputGroup.Text>₱</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                value={currentProgram?.rate || ""}
                onChange={(e) =>
                  setCurrentProgram((prev) => ({
                    ...prev,
                    rate: e.target.value,
                  }))
                }
                required
              />
            </InputGroup>

            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FeatherIcon icon="calendar" />
              </InputGroup.Text>
              <Form.Control
                type="date"
                value={
                  currentProgram?.effective_date
                    ? new Date(currentProgram.effective_date)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setCurrentProgram((prev) => ({
                    ...prev,
                    effective_date: e.target.value,
                  }))
                }
                required
              />
            </InputGroup>

            <Form.Check
              type="checkbox"
              label="Active"
              checked={currentProgram?.isActive || false}
              onChange={(e) =>
                setCurrentProgram((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }))
              }
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
    </div>
  );
}
