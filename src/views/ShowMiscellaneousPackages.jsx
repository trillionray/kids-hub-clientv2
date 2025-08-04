import { useState, useEffect, useContext } from "react";
import { Table, Button, Modal, Form, InputGroup } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";
import UserContext from "../context/UserContext";

export default function ShowMiscellaneousPackages() {
  const { user } = useContext(UserContext);
  const notyf = new Notyf();
  const API_URL = import.meta.env.VITE_API_URL;

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  function fetchPackages() {
    setLoading(true);
    fetch(`${API_URL}/miscellaneous-package`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setPackages(data);
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

    fetch(`${API_URL}/miscellaneous-package/${id}`, {
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

    fetch(`${API_URL}/miscellaneous-package/${currentPackage._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        package_name: currentPackage.package_name,
        package_description: currentPackage.package_description,
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
    setShowModal(true);
  }

  if (loading) return <h4>Loading Packages...</h4>;

  return (
    <div className="p-3">
      <h3 className="mb-4">Miscellaneous Packages</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Package Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Misc Items</th>
            <th>Is Active</th>
            <th>Created By</th>
            <th>Last Updated By</th>
            {/*<th>Actions</th>*/}
          </tr>
        </thead>
        <tbody>
          {packages.length > 0 ? (
            packages.map((pkg) => (
              <tr key={pkg._id}>
                <td>{pkg.package_name}</td>
                <td style={{ maxWidth: "200px", whiteSpace: "normal", wordBreak: "break-word" }}>
                  {pkg.package_description}
                </td>
                <td>₱{pkg.package_price}</td>
                <td style={{ maxWidth: "200px", whiteSpace: "normal", wordBreak: "break-word" }}>
                  {pkg.miscs && pkg.miscs.length > 0 ? pkg.miscs.join(", ") : "No items"}
                </td>
                <td>{pkg.is_active ? "Yes" : "No"}</td>
                <td style={{ maxWidth: "150px", whiteSpace: "normal", wordBreak: "break-word" }}>
                  {pkg.created_by}
                </td>
                <td style={{ maxWidth: "150px", whiteSpace: "normal", wordBreak: "break-word" }}>
                  {pkg.last_updated_by}
                </td>
                {/*<td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => openEditModal(pkg)}
                  >
                    <FeatherIcon icon="edit" size="14" />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(pkg._id)}
                  >
                    <FeatherIcon icon="trash-2" size="14" />
                  </Button>
                </td>*/}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No Packages found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

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
                  setCurrentPackage((prev) => ({ ...prev, package_name: e.target.value }))
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
