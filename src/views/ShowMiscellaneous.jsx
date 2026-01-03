import { useState, useEffect, useContext } from "react";
import { Button, Modal, Form } from "react-bootstrap";
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
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [currentMisc, setCurrentMisc] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchMiscellaneous(), fetchSchoolYear()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMiscellaneous = async () => {
    const res = await fetch(`${API_URL}/miscellaneous`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setMiscList(data.result || data || []);
  };

  const fetchSchoolYear = async () => {
    const res = await fetch(`${API_URL}/academic-years`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();

    if (!Array.isArray(data)) return;

    const formatted = data.map((y) => {
      const start = new Date(y.startDate).getFullYear();
      const end = new Date(y.endDate).getFullYear();
      return { ...y, name: `${start} - ${end}` };
    });

    setAcademicYears(formatted);
    // ❌ no auto-select to avoid empty results
  };

  const openEditModal = (misc) => {
    setCurrentMisc({ ...misc });
    setShowModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!currentMisc?._id) return;

    const payload = {
      name: currentMisc.name,
      price: currentMisc.price,
      school_year_id:
        currentMisc.school_year_id?._id || currentMisc.school_year_id,
      is_active: currentMisc.is_active,
      last_updated_by: user?.username || "system",
    };

    const res = await fetch(`${API_URL}/miscellaneous/${currentMisc._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success !== false) {
      notyf.success("Updated successfully");
      setShowModal(false);
      fetchMiscellaneous();
    } else {
      notyf.error(data.message || "Update failed");
    }
  };

  const filteredData = miscList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      String(item.price).includes(search);

    const matchesYear =
      !selectedYear ||
      item.school_year_id?._id === selectedYear ||
      item.school_year_id === selectedYear;

    return matchesSearch && matchesYear;
  });

  const columns = [
    {
      name: "No.",
      selector: (_, i) => i + 1,
      width: "80px",
      center: true,
    },
    { name: "Name", selector: (row) => row.name, sortable: true },
    {
      name: "Academic Year",
      selector: (row) =>
        row.school_year_id?.startDate
          ? `${new Date(row.school_year_id.startDate).getFullYear()} - ${new Date(
              row.school_year_id.endDate
            ).getFullYear()}`
          : "N/A",
      center: true,
    },
    {
      name: "Price",
      selector: (row) => `₱${Number(row.price).toLocaleString()}`,
    },
    {
      name: "Status",
      selector: (row) => (row.is_active ? "Active" : "Inactive"),
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <Button size="sm" variant="warning" onClick={() => openEditModal(row)}>
          <FeatherIcon icon="edit" size="14" />
        </Button>
      ),
      center: true,
      width: "120px",
    },
  ];

  if (loading) return <h4>Loading Miscellaneous...</h4>;

  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: 20 }}>
      <h3 className="text-white">MISCELLANEOUS LIST</h3>

      <div className="container bg-white rounded shadow p-4">
        <div className="d-flex justify-content-between mb-3">
          <Link to="/miscellaneous/add">
            <Button>Add Miscellaneous</Button>
          </Link>

          <div className="d-flex gap-2">
            <Form.Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ width: 220 }}
            >
              <option value="">All Academic Years</option>
              {academicYears.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.name}
                </option>
              ))}
            </Form.Select>

            <Form.Control
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          striped
          dense
          noDataComponent="No Miscellaneous found"
        />

        {/* Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Miscellaneous</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleUpdateSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={currentMisc?.name || ""}
                  onChange={(e) => setCurrentMisc((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Academic Year</Form.Label>
                <Form.Select
                  value={
                    currentMisc?.school_year_id?._id ||
                    currentMisc?.school_year_id ||
                    ""
                  }
                  onChange={(e) =>
                    setCurrentMisc((prev) => ({
                      ...prev,
                      school_year_id: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map((year) => (
                    <option key={year._id} value={year._id}>
                      {new Date(year.startDate).getFullYear()} - {new Date(year.endDate).getFullYear()}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Price (₱)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={currentMisc?.price || ""}
                  onChange={(e) => setCurrentMisc((prev) => ({ ...prev, price: e.target.value }))}
                  disabled
                  required

                />
              </Form.Group>
              <Form.Check
                type="checkbox"
                label="Is Active"
                checked={currentMisc?.is_active || false}
                onChange={(e) => setCurrentMisc((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
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
