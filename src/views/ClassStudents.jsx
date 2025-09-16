import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { Button, Modal, Form } from "react-bootstrap";
import { Notyf } from "notyf";
// import './index.scss';

export default function ClassStudents() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const navigate = useNavigate();
  const { id } = useParams(); // class id

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch students in this class
  const fetchStudents = () => {
  setLoading(true);
  fetch(`${API_URL}/class/${id}/students`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Class students:", data);

      if (Array.isArray(data)) {
        setStudents(data); // ✅ now we directly set full student docs
      } else {
        notyf.error(data.message || "Error fetching students");
      }
    })
    .catch(() => notyf.error("Server error"))
    .finally(() => setLoading(false));
};

  // Fetch all students (for modal)
  const fetchAllStudents = () => {
    fetch(`${API_URL}/students`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("All students:", data);
        if (Array.isArray(data)) {
          setAllStudents(data);
        } else if (Array.isArray(data.students)) {
          setAllStudents(data.students);
        } else {
          notyf.error(data.message || "Error fetching all students");
        }
      })
      .catch(() => notyf.error("Server error"));
  };

  // Assign student to class
  const handleAssignStudent = (student) => {
    fetch(`${API_URL}/class/${id}/students`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        students: [student._id], // ✅ send only array of IDs
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Assign response:", data);
        if (data.class) {
          notyf.success("Student added successfully");
          fetchStudents();
          setShowModal(false);
        } else notyf.error(data.message || "Failed to add student");
      })
      .catch((err) => notyf.error(err || "Server error"));
  };

  // Remove student from class
  const handleRemoveStudent = (studId) => {
    if (!window.confirm("Remove this student?")) return;
    fetch(`${API_URL}/class/${id}/students/${studId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.class) {
          notyf.success("Student removed successfully");
          fetchStudents();
        } else notyf.error(data.message || "Failed to remove student");
      })
      .catch(() => notyf.error("Server error"));
  };

  // If `students` is only an array of IDs, we need to map IDs -> full details from allStudents
  const studentsWithDetails = students.map((id) => {
    const student = allStudents.find((s) => s._id === id);
    return student ? student : { _id: id, firstName: "Unknown", lastName: "" };
  });

  const classColumns = [
    { name: "Student ID", selector: (row) => row._id, sortable: true },
    {
      name: "Name",
      selector: (row) =>
        `${row.firstName || ""} ${row.middleName || ""} ${row.lastName || ""}`.trim(),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <Button size="sm" variant="danger" onClick={() => handleRemoveStudent(row._id)}>
          Remove
        </Button>
      ),
    },
  ];

  const modalColumns = [
    { name: "Student ID", selector: (row) => row._id, sortable: true },
    {
      name: "Name",
      selector: (row) =>
        `${row.firstName || ""} ${row.middleName || ""} ${row.lastName || ""}`.trim(),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <Button size="sm" variant="success" onClick={() => handleAssignStudent(row)}>
          Add
        </Button>
      ),
    },
  ];

  const filteredStudents = allStudents.filter((s) => {
    const fullName = `${s.firstName || ""} ${s.middleName || ""} ${s.lastName || ""}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  return (
    <div className="p-4">
      {/* Top bar with Back button on left and Add Student on right */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button
          variant="secondary"
          onClick={() => navigate("/classes")}
        >
          ← Back
        </Button>
        <h3 className="mb-0">Students in Class</h3>
        <Button
          variant="primary"
          onClick={() => {
            fetchAllStudents();
            setShowModal(true);
          }}
        >
          Add Student
        </Button>
      </div>

      <DataTable
        columns={classColumns}
        data={students}
        progressPending={loading}
        pagination
        highlightOnHover
        responsive
      />

      <div className="mt-3">
        <Button variant="secondary" onClick={() => navigate("/classes")}>
          Back to Classes
        </Button>
      </div>

      {/* Add Student Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Form.Group>
          <DataTable
            columns={modalColumns}
            data={filteredStudents}
            pagination
            highlightOnHover
            responsive
          />
        </Modal.Body>
      </Modal>
    </div>
  );

}
