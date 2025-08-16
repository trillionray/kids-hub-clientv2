import { useState, useEffect, useContext } from "react";
import { Button, Modal, Form, InputGroup } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";
import UserContext from "../context/UserContext";
import DataTable from "react-data-table-component";
import { format } from "date-fns";

export default function ShowMiscellaneous() {
  const { user } = useContext(UserContext);
  const notyf = new Notyf();
  const API_URL = import.meta.env.VITE_API_URL;

  const [miscList, setMiscList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [currentMisc, setCurrentMisc] = useState(null);

  useEffect(() => {
    fetchMiscellaneous();
  }, []);

  function fetchMiscellaneous() {
    setLoading(true);
    fetch(`${API_URL}/miscellaneous`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setMiscList(data);
        setLoading(false);
      })
      .catch(() => {
        notyf.error("Failed to fetch Miscellaneous data");
        setLoading(false);
      });
  }

  // Handle delete
  function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    fetch(`${API_URL}/miscellaneous/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          notyf.success(data.message);
          fetchMiscellaneous();
        } else {
          notyf.error(data.message || "Delete failed");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
  }

  // Handle update submit
  function handleUpdateSubmit(e) {
    e.preventDefault();

    fetch(`${API_URL}/miscellaneous/${currentMisc._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        name: currentMisc.name,
        price: currentMisc.price,
        effective_date: currentMisc.effective_date,
        is_active: currentMisc.is_active,
        created_by: currentMisc.created_by,
        last_updated_by: user.username
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          notyf.success(data.message);
          setShowModal(false);
          fetchMiscellaneous();
        } else {
          notyf.error(data.message || "Update failed");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
  }

  // Open modal
  function openEditModal(misc) {
    setCurrentMisc({ ...misc });
    setShowModal(true);
  }

  if (loading) return <h4>Loading Miscellaneous...</h4>;

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
      sortable: true
    },
    {
      name: "Price",
      selector: (row) => `₱${row.price}`,
      sortable: true
    },
    {
      name: "Effective Date",
      selector: (row) => row.effective_date,
      cell: (row) => format(new Date(row.effective_date), "MMMM dd, yyyy"),
      sortable: true,
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
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row._id)}
          >
            <FeatherIcon icon="trash-2" size="14" />
          </Button>
        </>
      )
    }
  ];

  // Filter the data based on search
  const filteredData = miscList.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    String(item.price).includes(search)
  );

  return (
    <div className="p-3">
      <h3 className="mb-4">Miscellaneous List</h3>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search..."
        className="form-control mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        progressPending={loading}
        pagination
        highlightOnHover
        striped
        responsive
        noDataComponent="No Miscellaneous found"
      />

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Miscellaneous</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateSubmit}>
          <Modal.Body>
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FeatherIcon icon="tag" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                value={currentMisc?.name || ""}
                onChange={(e) =>
                  setCurrentMisc((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </InputGroup>

            <InputGroup className="mb-3">
              <InputGroup.Text>
                ₱
              </InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                value={currentMisc?.price || ""}
                onChange={(e) =>
                  setCurrentMisc((prev) => ({ ...prev, price: e.target.value }))
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
                  currentMisc?.effective_date
                    ? new Date(currentMisc.effective_date)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setCurrentMisc((prev) => ({
                    ...prev,
                    effective_date: e.target.value
                  }))
                }
                required
              />
            </InputGroup>

            <Form.Group>
              <Form.Check
                type="checkbox"
                label="Is Active"
                checked={currentMisc?.is_active || false}
                onChange={(e) =>
                  setCurrentMisc((prev) => ({
                    ...prev,
                    is_active: e.target.checked
                  }))
                }
              />
            </Form.Group>
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
