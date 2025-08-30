import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Modal, Form } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";

export default function ShowStudents() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();

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
      selector: (row) => row.firstName,
      sortable: true,
    },
    {
      name: "Middle Name",
      selector: (row) => row.middleName,
      sortable: true,
    },
    {
      name: "Last Name",
      selector: (row) => row.lastName,
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
      student.firstName?.toLowerCase().includes(filterText.toLowerCase()) ||
      student.middleName?.toLowerCase().includes(filterText.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="p-5 px-5">
      <h3 className="mb-4">Students</h3>

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
                {selectedStudent.firstName} {selectedStudent.middleName}{" "}
                {selectedStudent.lastName} {selectedStudent.suffix}
              </h5>
              <p><strong>Gender:</strong> {selectedStudent.gender}</p>
              <p><strong>Birthdate:</strong> {selectedStudent.birthdate}</p>
              <p>
                <strong>Address:</strong>{" "}
                {`${selectedStudent.address.street}, ${selectedStudent.address.barangay}, ${selectedStudent.address.city}, ${selectedStudent.address.province}`}
              </p>

              <hr />
              <h6>Contact Persons</h6>
              {selectedStudent.contacts && selectedStudent.contacts.length > 0 ? (
                selectedStudent.contacts.map((contact, idx) => (
                  <div key={idx} className="mb-2 p-2 border rounded">
                    <p>
                      <strong>Name:</strong>{" "}
                      {contact.firstName} {contact.middleName} {contact.lastName} {contact.suffix}
                    </p>
                    <p><strong>Relationship:</strong> {contact.relationship}</p>
                    <p><strong>Contact #:</strong> {contact.contact_number}</p>
                  </div>
                ))
              ) : (
                <p>No contacts available.</p>
              )}
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
