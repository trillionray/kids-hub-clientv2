import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { Notyf } from "notyf";

import { useContext } from "react";
import UserContext from "../context/UserContext";


export default function ClassStudents() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const navigate = useNavigate();
  const { id: classId } = useParams(); // class ID

  const { user } = useContext(UserContext);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal for assigning students
  const [showModal, setShowModal] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [search, setSearch] = useState("");

  // Add Attendance modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sessionNumber, setSessionNumber] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);

  // View Attendance modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    console.log(user)
    fetchStudents();
  }, [classId]);

  // Fetch students in this class
  const fetchStudents = () => {
    setLoading(true);
    fetch(`${API_URL}/class/${classId}/students`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (Array.isArray(data)) {
          setStudents(data);
        } else {
          notyf.error(data.message || "Error fetching students");
        }
      })
      .catch(() => notyf.error("Server error"))
      .finally(() => setLoading(false));
  };

  // Fetch all students (for Add Student modal)
  const fetchAllStudents = () => {
    fetch(`${API_URL}/students`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (Array.isArray(data)) setAllStudents(data);
        else if (Array.isArray(data.students)) setAllStudents(data.students);
        else notyf.error(data.message || "Error fetching all students");
      })
      .catch(() => notyf.error("Server error"));
  };

  // Assign student to class
  const handleAssignStudent = (student) => {
    console.log("classId:", classId);

    console.log(API_URL)
    fetch(`${API_URL}/class/${classId}/students`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ students: [student._id] }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.class) {
          notyf.success("Student added successfully");
          fetchStudents();
          setShowModal(false);
        } else notyf.error(data.message || "Failed to add student");
      })
      .catch((err) => {
        console.log(err);
        notyf.error("Server error")});
  };

  // Remove student from class
  const handleRemoveStudent = (studId) => {
    if (!window.confirm("Remove this student?")) return;
    fetch(`${API_URL}/class/${classId}/students/${studId}`, {
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

  // 📌 Attendance: Add
  const handleAddAttendance = (student) => {
    setSelectedStudent(student);
    setSessionNumber("");
    setAttendanceDate(new Date().toISOString().split("T")[0]);
    setShowAddModal(true);
  };

  const handleSubmitAttendance = () => {

    if (!sessionNumber) {
      notyf.error("Please enter session number");
      return;
    }

    fetch(`${API_URL}/attendance/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        class_id: classId,
        student_id: selectedStudent._id,
        session_number: sessionNumber,
        date: attendanceDate,
        created_by: user.id
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (data.attendance) {
          notyf.success("Attendance added successfully");
          setShowAddModal(false);
        } else {
          notyf.error(data.message || "Failed to add attendance");
        }
      })
      .catch(() => notyf.error("Server error"));
  };

  // 📌 Attendance: View
  const handleViewAttendance = (student) => {
    setSelectedStudent(student);
    setAttendanceRecords([]);
    setAttendanceLoading(true);
    setShowViewModal(true);

    fetch(`${API_URL}/attendance/student/${student._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ class_id: classId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.attendance && Array.isArray(data.attendance.attendance)) {
          setAttendanceRecords(data.attendance.attendance);
        } else {
          notyf.error(data.message || "No attendance found");
        }
      })
      .catch(() => notyf.error("Server error"))
      .finally(() => setAttendanceLoading(false));
  };

  // 🧭 Table columns
  const columns = [
    { 
      name: "ID", 
      width: "150px", 
      selector: (row) => row._id, 
      sortable: true, 
      wrap: true 
    },
    {
      name: "Name",
      selector: (row) =>
        `${row.first_name || ""} ${row.middle_name || ""} ${row.last_name || ""}`.trim(),
      sortable: true,
    },
    {
      name: "Attendance",
      width: "250px",
      cell: (row) => (
        <div className="d-flex gap-2 justify-content-center">
          <Button size="sm" variant="info" onClick={() => handleViewAttendance(row)}>
            View
          </Button>
          <Button size="sm" variant="success" onClick={() => handleAddAttendance(row)}>
            Add
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "Actions",
      width: "180px",
      cell: (row) => (
        <div className="d-flex gap-2 justify-content-center">
          <Button 
            size="sm" 
            variant="danger" 
            onClick={() => handleRemoveStudent(row._id)}
          >
            Remove
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];


  // 📝 Attendance table columns
  const attendanceColumns = [
    { name: "Session", selector: (row) => row.session_number, sortable: true },
    { name: "Date", selector: (row) => new Date(row.date).toLocaleDateString(), sortable: true },
  ];

  const filteredStudents = allStudents.filter((s) => {
    const fullName = `${s.firstName || ""} ${s.middleName || ""} ${s.lastName || ""}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  return (
    <div className="p-4">
      {/* Top bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="secondary" onClick={() => navigate("/classes")}>
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
        columns={columns}
        data={students}
        progressPending={loading}
        pagination
        highlightOnHover
        responsive
        noDataComponent="No students available"
      />

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
            columns={[
              { name: "ID", selector: (row) => row._id, sortable: true },
              {
                name: "Name",
                selector: (row) =>
                  `${row.first_name || ""} ${row.middle_name || ""} ${row.last_name || ""}`.trim(),
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
            ]}
            data={filteredStudents}
            pagination
            highlightOnHover
            responsive
          />
        </Modal.Body>
      </Modal>

      {/* Add Attendance Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Adding for:{" "}
            <strong>
              {selectedStudent
                ? `${selectedStudent.firstName || selectedStudent.first_name} ${selectedStudent.lastName || selectedStudent.last_name}`
                : ""}
            </strong>
          </p>
          <Form.Group className="mb-3">
            <Form.Label>Session Number</Form.Label>
            <Form.Control
              type="number"
              value={sessionNumber}
              onChange={(e) => setSessionNumber(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmitAttendance}>
            Save Attendance
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Attendance Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Attendance for{" "}
            {selectedStudent
              ? `${selectedStudent.firstName || selectedStudent.first_name} ${selectedStudent.lastName || selectedStudent.last_name}`
              : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {attendanceLoading ? (
            <div className="text-center p-3">
              <Spinner animation="border" />
            </div>
          ) : (
            <DataTable
              columns={attendanceColumns}
              data={attendanceRecords}
              pagination
              highlightOnHover
              responsive
              noDataComponent="No attendance records available"
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
