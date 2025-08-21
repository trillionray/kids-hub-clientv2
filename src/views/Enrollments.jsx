import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Modal } from "react-bootstrap";
import { Notyf } from "notyf";

export default function Enrollments() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = () => {
    setLoading(true);
    fetch(`${API_URL}/enrollments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEnrollments(data);
        } else {
          notyf.error("Invalid response from server");
        }
        setLoading(false);
      })
      .catch(() => {
        notyf.error("Failed to fetch enrollments");
        setLoading(false);
      });
  };

  const openDetails = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowModal(true);
  };

  // Columns for DataTable
  const columns = [
    {
      name: "Student ID",
      selector: (row) => row.student_id,
      sortable: true,
    },
    {
      name: "Program ID",
      selector: (row) => row.program_id,
      sortable: true,
    },
    {
      name: "Branch",
      selector: (row) => row.branch,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: "Total (₱)",
      selector: (row) => row.total,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <Button size="sm" variant="info" onClick={() => openDetails(row)}>
          Show Details
        </Button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // Filtering
  const filteredData = enrollments.filter(
    (enroll) =>
      enroll.student_id?.toLowerCase().includes(filterText.toLowerCase()) ||
      enroll.program_id?.toLowerCase().includes(filterText.toLowerCase()) ||
      enroll.branch?.toLowerCase().includes(filterText.toLowerCase()) ||
      enroll.status?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="p-4 px-5">
      <h3 className="mb-3">Enrollments</h3>

      {/* Search box */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search enrollments..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredData}
        progressPending={loading}
        pagination
        highlightOnHover
        striped
        dense
        responsive
        noDataComponent="No enrollments found"
      />

      {/* Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enrollment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEnrollment && (
            <div>
              <p><strong>Branch:</strong> {selectedEnrollment.branch}</p>
              <p><strong>Student ID:</strong> {selectedEnrollment.student_id}</p>
              <p><strong>Program ID:</strong> {selectedEnrollment.program_id}</p>
              <p><strong>Number of Sessions:</strong> {selectedEnrollment.num_of_sessions || "N/A"}</p>
              <p><strong>Duration:</strong> {selectedEnrollment.duration}</p>
              <p><strong>Academic Year ID:</strong> {selectedEnrollment.academic_year_id || "N/A"}</p>
              <p><strong>Miscellaneous Package ID:</strong> {selectedEnrollment.miscellaneous_group_id}</p>
              <p><strong>Status:</strong> {selectedEnrollment.status}</p>
              <p><strong>Total:</strong> ₱{selectedEnrollment.total}</p>
              <hr />
              <p><strong>Created By:</strong> {selectedEnrollment.created_by}</p>
              <p><strong>Created Date:</strong> {new Date(selectedEnrollment.creation_date).toLocaleString()}</p>
              <p><strong>Updated By:</strong> {selectedEnrollment.updated_by}</p>
              <p><strong>Last Modified:</strong> {new Date(selectedEnrollment.last_modified_date).toLocaleString()}</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
