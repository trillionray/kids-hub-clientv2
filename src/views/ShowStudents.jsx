import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Modal, Form } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";
import { useNavigate } from "react-router-dom";

export default function ShowStudents() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    setLoading(true);
    fetch(`${API_URL}/students`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.students) {
          setStudents(data.students);
        } else {
          notyf.error("Failed to load students");
        }
        setLoading(false);
      })
      .catch(() => {
        notyf.error("Failed to fetch students");
        setLoading(false);
      });
  };

  const handleShowDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  // Columns for DataTable
  const columns = [
    {
      name: "ID",
      selector: (row) => row._id,
      sortable: true,
      wrap: true,
    },
    {
      name: "First Name",
      selector: (row) => row.first_name,
      sortable: true,
    },
    {
      name: "Middle Name",
      selector: (row) => row.middle_name,
      sortable: true,
    },
    {
      name: "Last Name",
      selector: (row) => row.last_name,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <Button
          size="sm"
          variant="info"
          onClick={() => handleShowDetails(row)}
        >
          <FeatherIcon icon="eye" size="14" /> Details
        </Button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // Filtering
  const filteredStudents = students.filter(
    (student) =>
      student._id?.toLowerCase().includes(filterText.toLowerCase()) ||
      student.first_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      student.middle_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="p-5 px-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Students</h3>
       {/* <Button variant="primary" onClick={() => navigate("/register")}>
          <FeatherIcon icon="user-plus" size="16" /> Register Student
        </Button>*/}
      </div>

      {/* Search box */}
      <Form.Control
        type="text"
        placeholder="Search by ID, First, Middle, or Last Name"
        className="mb-3"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        progressPending={loading}
        pagination
        highlightOnHover
        striped
        dense
        responsive
        noDataComponent="No students found"
      />

      {/* Modal for Student Details */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Student Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <>
              <h5>
                {selectedStudent.first_name} {selectedStudent.middle_name}{" "}
                {selectedStudent.last_name} {selectedStudent.suffix}
              </h5>
              <p><strong>Gender:</strong> {selectedStudent.gender}</p>
              <p><strong>Birthdate:</strong> {selectedStudent.birthdate}</p>
              <p>
                <strong>Address:</strong>{" "}
                {`${selectedStudent.address?.street || ""}, 
                  ${selectedStudent.address?.barangay || ""}, 
                  ${selectedStudent.address?.municipality_or_city || ""}`}
              </p>

              <hr />
              <h6>Mother</h6>
              <p>
                {selectedStudent.mother?.first_name}{" "}
                {selectedStudent.mother?.middle_name}{" "}
                {selectedStudent.mother?.last_name}
              </p>
              <p><strong>Occupation:</strong> {selectedStudent.mother?.occupation}</p>
              <p><strong>Mobile:</strong> {selectedStudent.mother?.contacts?.mobile_number}</p>

              <hr />
              <h6>Father</h6>
              <p>
                {selectedStudent.father?.first_name}{" "}
                {selectedStudent.father?.middle_name}{" "}
                {selectedStudent.father?.last_name}
              </p>
              <p><strong>Occupation:</strong> {selectedStudent.father?.occupation}</p>
              <p><strong>Mobile:</strong> {selectedStudent.father?.contacts?.mobile_number}</p>

              <hr />
              <h6>Emergency Contact</h6>
              <p>
                {selectedStudent.emergency?.first_name}{" "}
                {selectedStudent.emergency?.middle_name}{" "}
                {selectedStudent.emergency?.last_name}
              </p>
              <p><strong>Occupation:</strong> {selectedStudent.emergency?.occupation}</p>
              <p><strong>Mobile:</strong> {selectedStudent.emergency?.contacts?.mobile_number}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
