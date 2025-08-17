import { useState, useEffect, useContext } from "react";
import { Table, Button, Modal, Form, InputGroup } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";
import UserContext from "../context/UserContext";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";

export default function ShowMiscellaneousPackages() {
  const { user } = useContext(UserContext);
  const notyf = new Notyf();
  const API_URL = import.meta.env.VITE_API_URL;

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  // Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [miscs, setMiscs] = useState([]);
  const [selectedMiscs, setSelectedMiscs] = useState([]);
  const [packagePrice, setPackagePrice] = useState(0);

  useEffect(() => {
    if (!miscs.length) return;
    const total = selectedMiscs.reduce((sum, id) => {
      const misc = miscs.find((m) => String(m._id) === String(id));
      return sum + (misc ? parseFloat(misc.price) || 0 : 0);
    }, 0);
    setPackagePrice(total);
  }, [selectedMiscs, miscs]);

  useEffect(() => {
    fetchPackages();
  }, []);

  function handleMiscSelection(miscId) {
    setSelectedMiscs((prev) =>
      prev.includes(miscId)
        ? prev.filter((id) => id !== miscId)
        : [...prev, miscId]
    );
  }

  // 🔹 Helper to fetch misc names by IDs
  async function fetchMiscNames(ids) {
    if (!ids || ids.length === 0) return [];

    const res = await fetch(`${API_URL}/miscellaneous/getSpecificMiscs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ ids })
    });

    const data = await res.json();
    if (data.success) {
      return data.names;
    }
    return [];
  }

  // Fetch all packages + resolve misc names
  function fetchPackages() {
    setLoading(true);
    fetch(`${API_URL}/miscellaneous-package/read`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (Array.isArray(data)) {
          const packagesWithNames = await Promise.all(
            data.map(async (pkg) => {
              const miscNames = await fetchMiscNames(pkg.miscs);
              return { ...pkg, miscNames };
            })
          );
          setPackages(packagesWithNames);
        } else {
          notyf.error("Failed to fetch Packages data");
        }
        setLoading(false);
      })
      .catch(() => {
        notyf.error("Failed to fetch Packages data");
        setLoading(false);
      });
  }

  // Handle delete
  function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this package?")) return;

    fetch(`${API_URL}/miscellaneous-package/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          notyf.success(data.message);
          fetchPackages();
        } else {
          notyf.error(data.message || "Delete failed");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
  }

  // Handle update submit
  function handleUpdateSubmit(e) {
    e.preventDefault();

    fetch(`${API_URL}/miscellaneous-package/update/${currentPackage._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        package_name: currentPackage.package_name,
        package_description: currentPackage.package_description,
        package_price: packagePrice,
        miscs: selectedMiscs,
        is_active: currentPackage.is_active,
        last_updated_by: user.username
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          notyf.success(data.message);
          setShowModal(false);
          fetchPackages();
        } else {
          notyf.error(data.message || "Update failed");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
  }

  // Open modal
  function openEditModal(pkg) {
    setCurrentPackage({ ...pkg });

    fetch(`${API_URL}/miscellaneous`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMiscs(data);
          setSelectedMiscs(pkg.miscs);
          setShowModal(true);
        } else {
          notyf.error(data.message || "Error fetching miscellaneous items");
        }
      })
      .catch(() => notyf.error("Server error"));
  }

  if (loading) return <h4>Loading Packages...</h4>;

  const columns = [
    {
      name: "No.",
      selector: (row, index) => index + 1 + " )",
      width: "60px",
      center: true
    },
    {
      name: "Package Name",
      selector: (row) => row.package_name,
      sortable: true
    },
    {
      name: "Misc Items",
      cell: (row) =>
        row.miscNames && row.miscNames.length > 0 ? (
          <ul className="mb-0 ps-3">
            {row.miscNames.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        ) : (
          "No items"
        ),
      wrap: true
    },
    {
      name: "Price",
      selector: (row) => `₱${row.package_price}`,
      sortable: true
    },
    {
      name: "Description",
      selector: (row) => row.package_description,
      wrap: true
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
        </>
      )
    }
  ];

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.package_name.toLowerCase().includes(searchText.toLowerCase()) ||
      pkg.package_description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="p-0">Miscellaneous Packages</h3>

        <Link to="/miscellaneous-package/add">
          <Button variant="primary" className="p-2 rounded-circle me-5">
            <FeatherIcon icon="plus" size="1" className="" />
          </Button>
        </Link>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search..."
        className="form-control mb-3"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <DataTable
        columns={columns}
        data={filteredPackages}
        progressPending={loading}
        pagination
        highlightOnHover
        striped
        responsive
        conditionalRowStyles={[
          {
            when: row => row.is_active === false,
            style: {
              backgroundColor: "#f0f0f0",
              color: "#6c757d",
              textDecoration: "line-through",
              fontStyle: "italic"
            }
          }
        ]}
        customStyles={{
          rows: {
            style: {
              paddingTop: "12px",
              paddingBottom: "12px",
            },
          },
        }}
      />

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Miscellaneous Package</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateSubmit}>
          <Modal.Body>
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FeatherIcon icon="tag" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                value={currentPackage?.package_name || ""}
                onChange={(e) =>
                  setCurrentPackage((prev) => ({
                    ...prev,
                    package_name: e.target.value
                  }))
                }
                required
              />
            </InputGroup>

            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FeatherIcon icon="file-text" />
              </InputGroup.Text>
              <Form.Control
                as="textarea"
                rows={2}
                value={currentPackage?.package_description || ""}
                onChange={(e) =>
                  setCurrentPackage((prev) => ({
                    ...prev,
                    package_description: e.target.value
                  }))
                }
                required
              />
            </InputGroup>

            {/* Checkbox list for miscs */}
            <Form.Group className="mb-3">
              <Form.Label>Select Miscellaneous Items</Form.Label>
              <div
                className="border rounded p-2"
                style={{ maxHeight: "200px", overflowY: "auto", textAlign: "left" }}
              >
                {miscs.length === 0 ? (
                  <p>No miscellaneous items available</p>
                ) : (
                  miscs.map((misc) => (
                    <Form.Check
                      key={misc._id}
                      type="checkbox"
                      label={`${misc.name} - ₱${misc.price}`}
                      checked={selectedMiscs.includes(misc._id)}
                      onChange={() => handleMiscSelection(misc._id)}
                    />
                  ))
                )}
              </div>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Total Price: ₱{packagePrice.toFixed(2)}</Form.Label>
            </Form.Group>

            <Form.Group>
              <Form.Check
                type="checkbox"
                label="Is Active"
                checked={currentPackage?.is_active || false}
                onChange={(e) =>
                  setCurrentPackage((prev) => ({
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