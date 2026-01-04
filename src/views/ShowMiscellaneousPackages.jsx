import { useState, useEffect, useContext } from "react";
import { Button, Modal, Form, InputGroup, Spinner } from "react-bootstrap";
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

  const [showModal, setShowModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [miscs, setMiscs] = useState([]);
  const [selectedMiscs, setSelectedMiscs] = useState([]);
  const [packagePrice, setPackagePrice] = useState(0);

  // Auto-calc package price from selected miscs
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

  async function fetchMiscNames(ids) {
    if (!ids || ids.length === 0) return [];
    const res = await fetch(`${API_URL}/miscellaneous/getSpecificMiscs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ ids }),
    });
    const data = await res.json();
    if (data.success) return data.miscs.map((m) => m.name);
    return [];
  }

  function fetchPackages() {
    setLoading(true);
    fetch(`${API_URL}/miscellaneous-package/read`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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

  function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    fetch(`${API_URL}/miscellaneous-package/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          notyf.success(data.message);

          fetch(`${API_URL}/logs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                user: user.id, 
                task: "Delete Miscellaneous Package", 
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


          fetchPackages();
        } else {
          notyf.error(data.message || "Delete failed");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
  }

  function handleUpdateSubmit(e) {
    e.preventDefault();
    fetch(`${API_URL}/miscellaneous-package/update/${currentPackage._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        package_name: currentPackage.package_name,
        package_description: currentPackage.package_description,
        package_price: packagePrice,
        miscs: selectedMiscs,
        is_active: currentPackage.is_active,
        last_updated_by: user.username,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          notyf.success(data.message);
          setShowModal(false);

          fetch(`${API_URL}/logs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                user: user.id, 
                task: "Edit Miscellaneous Package", 
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

          fetchPackages();
        } else {
          notyf.error(data.message || "Update failed");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
  }

  function openEditModal(pkg) {
    setCurrentPackage({ ...pkg });
    fetch(`${API_URL}/miscellaneous`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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

  const columns = [
    {
      name: "No.",
      selector: (row, index) => index + 1,
      width: "100px",  // ✅ wider
      center: true,
      sortable: true,
    },
    {
      name: "Package Name",
      selector: (row) => row.package_name,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.package_description || "—",
      sortable: true,
      wrap: true,
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
      wrap: true,
    },
    {
      name: "Price",
      selector: (row) => `₱${Number(row.package_price).toLocaleString()}`,
      sortable: true,
      width: "140px", // ✅ smaller
      right: true,
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <Button
          size="sm"
          variant="warning"
          className="me-2"
          onClick={() => openEditModal(row)}
        >
          <FeatherIcon icon="edit" size="14" />
        </Button>
      ),
      width: "120px",
      center: true,
    },
  ];


  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.package_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      pkg.package_description?.toLowerCase().includes(searchText.toLowerCase())
  );


  const formatSchoolYear = (schoolYear) => {
  if (!schoolYear) return "No SY";

  // populated object
  if (schoolYear.startDate && schoolYear.endDate) {
    return `${new Date(schoolYear.startDate).getFullYear()} - ${new Date(
      schoolYear.endDate
    ).getFullYear()}`;
  }

  return "Unknown SY";
};

  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: "20px" }}>
      <h3 className="text-white text-bolder">MISCELLANEOUS PACKAGES</h3>
      <div className="container border p-4 rounded shadow" style={{ backgroundColor: "#ffffff" }}>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Link to="/miscellaneous-package/add">
            <Button variant="primary" className="p-2">
              Add Package
            </Button>
          </Link>

          <input
            type="text"
            placeholder="Search packages..."
            className="form-control"
            style={{ maxWidth: "300px" }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>


        {loading ? (
          <div className="text-center"><Spinner animation="border" /></div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredPackages}
            pagination
            highlightOnHover
            striped
            dense
            responsive
            noDataComponent="No packages found"
            customStyles={{
              table: { style: { borderRadius: "10px", overflow: "hidden", border: "1px solid #dee2e6", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" } },
              headRow: { style: { backgroundColor: "#f8f9fa", fontSize: "1rem", fontWeight: "bold", textTransform: "uppercase", borderBottom: "2px solid #dee2e6", textAlign: "center" } },
              headCells: { style: { justifyContent: "center", textAlign: "center", paddingTop: "12px", paddingBottom: "12px", borderRight: "1px solid #dee2e6" } },
              rows: { style: { fontSize: "0.95rem", paddingTop: "10px", paddingBottom: "10px", borderBottom: "1px solid #e9ecef", textAlign: "center" }, highlightOnHoverStyle: { backgroundColor: "#eaf4fb", borderBottomColor: "#89C7E7", outline: "none" } },
              cells: { style: { justifyContent: "center", textAlign: "center", borderRight: "1px solid #dee2e6" } },
              pagination: { style: { borderTop: "1px solid #dee2e6", paddingTop: "4px", justifyContent: "center" } },
            }}
          />
        )}

        {/* Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Miscellaneous Package</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleUpdateSubmit}>
            <Modal.Body>
              <InputGroup className="mb-3">
                <InputGroup.Text><FeatherIcon icon="tag" /></InputGroup.Text>
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
                <InputGroup.Text><FeatherIcon icon="file-text" /></InputGroup.Text>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={currentPackage?.package_description || ""}
                  onChange={(e) =>
                    setCurrentPackage((prev) => ({ ...prev, package_description: e.target.value }))
                  }
                  required
                />
              </InputGroup>

              <Form.Group className="mb-3">
                <Form.Label>Select Miscellaneous Items</Form.Label>
                <div className="border rounded p-2" style={{ maxHeight: "200px", overflowY: "auto", textAlign: "left" }}>
                  {miscs.length === 0 ? (
                    <p>No miscellaneous items available</p>
                  ) : (
                    miscs.map((misc) => (
                      <Form.Check
                        key={misc._id}
                        type="checkbox"
                        label={`${misc.name} - ₱${Number(misc.price).toLocaleString()}`}
                        checked={selectedMiscs.includes(misc._id)}
                        onChange={() => handleMiscSelection(misc._id)}
                        disabled
                      />
                    ))
                  )}
                </div>
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Total Price: ₱{packagePrice.toLocaleString()}</Form.Label>
              </Form.Group>

              <Form.Group>
                <Form.Check
                  type="checkbox"
                  label="Is Active"
                  checked={currentPackage?.is_active || false}
                  onChange={(e) =>
                    setCurrentPackage((prev) => ({ ...prev, is_active: e.target.checked }))
                  }
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Changes</Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </div>
  );
}




