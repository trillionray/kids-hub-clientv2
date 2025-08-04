import { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { Notyf } from "notyf";

export default function ShowAcademicYears() {
  const notyf = new Notyf();
  const [academicYears, setAcademicYears] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchAcademicYears = () => {
    fetch(`${API_URL}/academic-year`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setAcademicYears(data))
      .catch(() => notyf.error("Failed to fetch academic years."));
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this academic year?")) {
      fetch(`${API_URL}/academic-year/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
        .then(res => res.json())
        .then(data => {
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
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ startDate, endDate })
    })
      .then(res => res.json())
      .then(data => {
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

  return (
    <div className="mx-5 my-5">
      <h3 className="mb-3">Academic Years</h3>
      <Table
        striped
        bordered
        hover
        responsive
        style={{ tableLayout: "fixed", width: "100%", wordWrap: "break-word" }}
      >
        <thead>
          <tr>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Created By</th>
            <th className="d-none d-md-table-cell">Creation Date</th>
            <th>Updated By</th>
            <th className="d-none d-md-table-cell">Last Modified</th>
            
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {academicYears.length > 0 ? (
            academicYears.map((year) => (
              <tr key={year._id}>
                <td>{new Date(year.startDate).toLocaleDateString()}</td>
                <td>{new Date(year.endDate).toLocaleDateString()}</td>
                <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                  {year.createdBy || "N/A"}
                </td>
                <td className="d-none d-md-table-cell">
                  {new Date(year.creationDate).toLocaleDateString()}
                </td>
                
                <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                  {year.updatedBy || "N/A"}
                </td>
                <td className="d-none d-md-table-cell">
                  {new Date(year.lastModifiedDate).toLocaleDateString()}
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => {
                      setSelectedYear(year);
                      setStartDate(year.startDate.split("T")[0]);
                      setEndDate(year.endDate.split("T")[0]);
                      setShowModal(true);
                    }}
                  >
                    Update
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(year._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No academic years found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

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
  );
}
