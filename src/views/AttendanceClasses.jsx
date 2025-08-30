import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Form } from "react-bootstrap";
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
    { name: "ID", selector: (row) => row._id, sortable: true, wrap: true },
    { name: "Section Name", selector: (row) => row.sectionName, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <Button
          size="sm"
          variant="primary"
          onClick={() => navigate(`/attendance/class-students/${row._id}`)}
        >
          View Attendance
        </Button>
      ),
    },
  ];

  // Filter classes based on search
  const filteredClasses = classes.filter(
    (c) =>
      c._id?.toLowerCase().includes(filterText.toLowerCase()) ||
      c.sectionName?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="p-4">
      <h3 className="mb-3">Select a Class</h3>

      {/* Search box */}
      <Form.Control
        type="text"
        placeholder="Search by ID or Section Name"
        className="mb-3"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      <DataTable
        columns={columns}
        data={filteredClasses}
        progressPending={loading}
        pagination
        highlightOnHover
        responsive
        noDataComponent="No classes available"
      />
    </div>
  );
}
