import { useState, useEffect } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import { Notyf } from "notyf";

export default function Enrollments() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = () => {
    setLoading(true);
    fetch(`${API_URL}/enrollments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setEnrollments(data);
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

  if (loading) return <h4>Loading Enrollments...</h4>;

  return (
    <div className="p-4 px-5">
      <h3 className="mb-4">Enrollments</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Program ID</th>
            <th>Branch</th>
            <th>Status</th>
            <th>Total (₱)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.length > 0 ? (
            enrollments.map((enroll) => (
              <tr key={enroll._id}>
                <td>{enroll.student_id}</td>
                <td>{enroll.program_id}</td>
                <td>{enroll.branch}</td>
                <td>{enroll.status}</td>
                <td>{enroll.total}</td>
                <td>
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() => openDetails(enroll)}
                  >
                    Show Details
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No enrollments found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

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
