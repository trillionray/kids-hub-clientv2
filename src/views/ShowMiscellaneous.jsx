import { useState, useEffect, useContext } from "react";
import { Button, Modal, Form, InputGroup } from "react-bootstrap";
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
        console.log(data);
        // handle both { result: [] } and [] directly
        setMiscList(data.result || data);
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
        if (data.success !== false) {
          notyf.success(data.message || "Deleted successfully");
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
        is_active: currentMisc.is_active,
        created_by: currentMisc.created_by,
        last_updated_by: user?.username || "system"
      })
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

  // Open modal
  function openEditModal(misc) {
    setCurrentMisc({ ...misc });
    setShowModal(true);
  }

  if (loading) return <h4>Loading Miscellaneous...</h4>;

  const columns = [
    {
      name: "No.",
      selector: (row, index) => index + 1,
      width: "70px",
      center: true,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true
    },
    {
      name: "Price",
      selector: (row) => `₱${Number(row.price).toLocaleString()}`,
      sortable: true,
      right: true,
    },
    {
      name: "Status",
      selector: (row) => (row.is_active ? "Active" : "Inactive"),
      sortable: true,
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <Button
          size="sm"
          variant="warning"
          className="me-2 rounded-pill"
          onClick={() => openEditModal(row)}
        >
          <FeatherIcon icon="edit" size="14" />
        </Button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    }
  ];


  // Filter the data based on search
  const filteredData = miscList.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    String(item.price).includes(search)
  );

  return (
    <div className="p-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Miscellaneous List</h3>
        <Link to="/miscellaneous/add">
          <Button variant="primary" className="p-2 rounded-pill">
            <FeatherIcon icon="plus" size="16" className="me-1" />
            Add Miscellaneous
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name or price..."
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
        paginationPerPage={10}
        highlightOnHover
        striped
        responsive
        noDataComponent="No Miscellaneous found"
        conditionalRowStyles={[
          {
            when: row => row.is_active === false,
            style: {
              backgroundColor: "#f8f9fa",
              color: "#6c757d",
              textDecoration: "line-through",
              fontStyle: "italic"
            }
          }
        ]}
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
              <InputGroup.Text>₱</InputGroup.Text>
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
            <Button
              variant="secondary"
              className="rounded-pill"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="rounded-pill">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
