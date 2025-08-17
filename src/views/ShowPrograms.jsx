import { useState, useEffect, useContext } from "react";
import { Button, Modal, Form, InputGroup } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";
import UserContext from "../context/UserContext";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom"; // ⬅️ add this import


export default function ShowPrograms() {
  const { user } = useContext(UserContext);
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

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

  // DataTable Columns
  const columns = [
    {
      name: "No.",
      selector: (row, index) => index + 1 + " )",
      width: "60px",
      center: true,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
    },
    {
      name: "Rate",
      selector: (row) => `₱${row.rate}`,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description,
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <Button
            size="sm"
            variant="warning"
            className="me-2"
            onClick={() => openEditModal(row)}
          >
            <FeatherIcon icon="edit" size="14" />
          </Button>
          {/*<Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row._id)}
          >
            <FeatherIcon icon="trash-2" size="14" />
          </Button>*/}
        </>
      ),
    },
  ];

  // Filtered data
  const filteredPrograms = programs.filter((item) =>
    item.name && item.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="px-5 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        
        <h3 className="mb-0">Programs</h3>
        
        <Link to="/programs/add">

          <Button variant="primary" className="rounded-circle p-2 me-3">
            <FeatherIcon icon="plus" size="16" className="" />
          </Button>

        </Link>

      </div>

      {/* Search Bar */}
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

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredPrograms}
        pagination
        highlightOnHover
        striped
        noDataComponent="No Programs found"
        responsive
      />

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
                  setCurrentProgram((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
              />
            </InputGroup>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={currentProgram?.category || "short"}
                onChange={(e) =>
                  setCurrentProgram((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
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
