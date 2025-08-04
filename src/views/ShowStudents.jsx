import { useState, useEffect } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";

export default function ShowStudents() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, students]);

  const fetchStudents = () => {
    setLoading(true);
    fetch(`${API_URL}/students`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        setStudents(data.students);
        setFilteredStudents(data.students);
        setLoading(false);
      })
      .catch(() => {
        notyf.error("Failed to fetch students");
        setLoading(false);
      });
  };

  const handleSearch = () => {
    const term = searchTerm.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student._id.toLowerCase().includes(term) ||
        student.firstName.toLowerCase().includes(term) ||
        student.middleName.toLowerCase().includes(term) ||
        student.lastName.toLowerCase().includes(term)
    );
    setFilteredStudents(filtered);
  };

  const handleShowDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  if (loading) return <h4>Loading students...</h4>;

  return (
    <div className="p-5 px-5">
      <h3 className="mb-4">Students</h3>

      <Form.Control
        type="text"
        placeholder="Search by ID, First, Middle, or Last Name"
        className="mb-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Middle Name</th>
            <th>Last Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <tr key={student._id}>
                <td>{student._id}</td>
                <td>{student.firstName}</td>
                <td>{student.middleName}</td>
                <td>{student.lastName}</td>
                <td>
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() => handleShowDetails(student)}
                  >
                    <FeatherIcon icon="eye" size="14" /> Details
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No students found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

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
              <h6>Contact Person</h6>
              <p>
                <strong>Name:</strong>{" "}
                {selectedStudent.contact.firstName}{" "}
                {selectedStudent.contact.middleName}{" "}
                {selectedStudent.contact.lastName}{" "}
                {selectedStudent.contact.suffix}
              </p>
              <p>
                <strong>Relationship:</strong>{" "}
                {selectedStudent.contact.relationship}
              </p>
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
