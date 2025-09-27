import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Form, Spinner } from "react-bootstrap";
import { Notyf } from "notyf";
import { useNavigate } from "react-router-dom";

export default function AttendanceClasses() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = () => {
    setLoading(true);
    fetch(`${API_URL}/class`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClasses(data);
        } else {
          notyf.error(data.message || "Error fetching classes");
        }
      })
      .catch(() => notyf.error("Server error"))
      .finally(() => setLoading(false));
  };

  const columns = [
    {
      name: "ID",
      selector: (row) => row._id,
      sortable: true,
      style: { textAlign: "center", whiteSpace: "nowrap" },
      grow: 1,
    },
    {
      name: "Section Name",
      selector: (row) => row.sectionName,
      sortable: true,
      style: { textAlign: "center", whiteSpace: "nowrap" },
      grow: 2,
    },
    {
      name: "Actions",
      selector: (row) => row._id, // dummy selector
      cell: (row) => (
        <div className="text-center" style={{ padding: "4px 4px" }}>
          <Button
            size="sm"
            variant="primary"
            style={{
              fontSize: "0.8rem",
              padding: "2px 8px",
              width: "auto",
              minWidth: "100px",
            }}
            onClick={() => navigate(`/attendance/class-students/${row._id}`)}
          >
            View
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      style: { textAlign: "center" },
      grow: 0, // prevent stretching
      minWidth: "150px", // ensures header aligns
    },
  ];

  const filteredClasses = classes.filter(
    (c) =>
      c._id?.toLowerCase().includes(filterText.toLowerCase()) ||
      c.sectionName?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: "20px" }}>
      <div className="container border mt-5 p-4 rounded shadow" style={{ backgroundColor: "#ffffff" }}>
        {/* Header with Search */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Select a Class</h3>

          <Form.Control
            type="text"
            placeholder="Search by ID or Section Name"
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
            data={filteredClasses}
            pagination
            highlightOnHover
            striped
            dense
            responsive
            noDataComponent="No classes available"
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
      </div>
    </div>
  );
}
