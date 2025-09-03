import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Modal, ModalFooter } from "react-bootstrap";
import { Notyf } from "notyf";

export default function Enrollments() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [enrollDetails, setEnrollDetails] = useState("");

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

  const openDetails = async (enrollment) => {
    // collect ids
    const createdBy = enrollment.created_by;
    const updatedBy = enrollment.updated_by;
    const studentId = enrollment.student_id;
    const programId = enrollment.program_id;
    const academicyearId = enrollment.academic_year_id;

    // plain JS maps (no types)
    let userMapCB = {};
    let userMapUB = {};
    let studentMap = {};
    let programMap = {};
    let academicyearMap = {};

    // fetch created_by
    if (createdBy) {
      const res = await fetch(`${API_URL}/summary/findname/users?ids=${createdBy}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) {
        data.results.forEach(u => {
          userMapCB['created_by_name'] = u.name;
        });
      }
    }

    // fetch updated_by
    if (updatedBy) {
      const res = await fetch(`${API_URL}/summary/findname/users?ids=${updatedBy}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) {
        data.results.forEach(u => {
          userMapUB['updated_by_name'] = u.name;
        });
      }
    }

    // fetch student name
    if (studentId) {
      const res = await fetch(`${API_URL}/summary/findname/students?ids=${studentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) {
        data.results.forEach(u => {
          studentMap['student_name'] = u.name;
        });
      }
    }

    // fetch program name
    if (programId) {
      const res = await fetch(`${API_URL}/summary/findprogram/programs?ids=${programId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) {
        data.results.forEach(u => {
          programMap['program_name'] = u.name;
        });
      }
    }

    // fetch academic year
    if (academicyearId) {
      const res = await fetch(`${API_URL}/summary/academicyear/academicYears?ids=${academicyearId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) {
        academicyearMap['academic_year'] = data.results.map(u => u.name).join(", ");
      }


    }

    //merge all info into enriched enrollment
    const enriched = {
      ...enrollment,
      created_by_name: userMapCB.created_by_name || "N/A",
      updated_by_name: userMapUB.updated_by_name || "N/A",
      student_name: studentMap.student_name || "N/A",
      program_name: programMap.program_name || "N/A",
      academicyear: academicyearMap.academic_year || "N/A"
    };

    console.log(academicyearMap)
    setSelectedEnrollment(enriched);
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
              <p><strong>Student Name:</strong> {selectedEnrollment.student_name}</p>
              <p><strong>Program Name:</strong> {selectedEnrollment.program_name}</p>
              <p><strong>Number of Sessions:</strong> {selectedEnrollment.num_of_sessions || "N/A"}</p>
              <p><strong>Duration:</strong> {selectedEnrollment.duration}</p>
              <p><strong>Academic Year:</strong> {selectedEnrollment.academicyear || "N/A"}</p>
              <p><strong>Miscellaneous Package ID:</strong> {selectedEnrollment.miscellaneous_group_id}</p>
              <p><strong>Status:</strong> {selectedEnrollment.status}</p>
              <p><strong>Total:</strong> ₱{selectedEnrollment.total}</p>
              <hr />
              <p><strong>Created By:</strong> {selectedEnrollment.created_by_name}</p>
              <p><strong>Created Date:</strong> {new Date(selectedEnrollment.creation_date).toLocaleString()}</p>
              <p><strong>Updated By:</strong> {selectedEnrollment.updated_by_name}</p>
              <p><strong>Last Modified:</strong> {new Date(selectedEnrollment.last_modified_date).toLocaleString()}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-primary"
            onClick={() => window.open("http://localhost:5000/pdf/download/123", "_blank")}
          >
            Download PDF
          </button>

        </Modal.Footer>
      </Modal>
    </div>
  );
}
