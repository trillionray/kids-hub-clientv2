import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { Notyf } from "notyf";

export default function ShowAcademicYears() {
  const notyf = new Notyf();
  const [academicYears, setAcademicYears] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchAcademicYears = () => {
    setLoading(true);
    fetch(`${API_URL}/academic-year`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setAcademicYears(data))
      .catch(() => notyf.error("Failed to fetch academic years."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this academic year?")) {
      fetch(`${API_URL}/academic-year/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((res) => res.json())
        .then((data) => {
          notyf.success(data.message);
          fetchAcademicYears();
        })
        .catch(() => notyf.error("Failed to delete academic year."));
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/academic-year/${selectedYear._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ startDate, endDate }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data._id) {
          notyf.success("Academic Year updated successfully!");
          setShowModal(false);
          fetchAcademicYears();
        } else {
          notyf.error(data.message || "Failed to update.");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
  };

  // Columns for DataTable
  const columns = [
    {
      id: "start",
      name: "Start Date",
      selector: (row) => new Date(row.startDate).toLocaleDateString(),
      sortable: true,
      style: { textAlign: "center", whiteSpace: "nowrap" },
    },
    {
      id: "end",
      name: "End Date",
      selector: (row) => new Date(row.endDate).toLocaleDateString(),
      sortable: true,
      style: { textAlign: "center", whiteSpace: "nowrap" },
    },
    {
      id: "createdBy",
      name: "Created By",
      selector: (row) => row.createdBy || "N/A",
      sortable: true,
      style: { textAlign: "center", whiteSpace: "normal", wordBreak: "break-word" },
    },
    {
      id: "creationDate",
      name: "Creation Date",
      selector: (row) => new Date(row.creationDate).toLocaleDateString(),
      sortable: true,
      style: { textAlign: "center", whiteSpace: "nowrap" },
    },
    {
      id: "updatedBy",
      name: "Updated By",
      selector: (row) => row.updatedBy || "N/A",
      sortable: true,
      style: { textAlign: "center", whiteSpace: "normal", wordBreak: "break-word" },
    },
    {
      id: "lastModifiedDate",
      name: "Last Modified",
      selector: (row) => new Date(row.lastModifiedDate).toLocaleDateString(),
      sortable: true,
      style: { textAlign: "center", whiteSpace: "nowrap" },
    },
    {
      id: "actions",
      name: "Actions",
      selector: (row) => row._id, // dummy for header sizing
      cell: (row) => (
        <div className="text-center" style={{ padding: "2px 4px" }}>
          <Button
            size="sm"
            variant="warning"
            className="me-2"
            style={{ minWidth: "80px" }}
            onClick={() => {
              setSelectedYear(row);
              setStartDate(row.startDate.split("T")[0]);
              setEndDate(row.endDate.split("T")[0]);
              setShowModal(true);
            }}
          >
            Update
          </Button>
          <Button
            size="sm"
            variant="danger"
            style={{ minWidth: "70px" }}
            onClick={() => handleDelete(row._id)}
          >
            Delete
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      style: { textAlign: "center" },
      grow: 0,
      minWidth: "180px",
    },
  ];

  const filteredData = academicYears.filter(
    (year) =>
      year.startDate.toLowerCase().includes(filterText.toLowerCase()) ||
      year.endDate.toLowerCase().includes(filterText.toLowerCase()) ||
      (year.createdBy && year.createdBy.toLowerCase().includes(filterText.toLowerCase())) ||
      (year.updatedBy && year.updatedBy.toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: "20px" }}>
      <div className="container border mt-5 p-4 rounded shadow" style={{ backgroundColor: "#ffffff" }}>
        {/* Header and Search */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Academic Years</h3>
          <Form.Control
            type="text"
            placeholder="Search..."
            style={{ maxWidth: "250px" }}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            striped
            dense
            responsive
            noDataComponent="No academic years found."
            customStyles={{
              table: {
                style: {
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
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
                  whiteSpace: "normal",
                  wordBreak: "break-word",
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
        )}

        {/* Update Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Academic Year</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleUpdate}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary">
                Update
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
