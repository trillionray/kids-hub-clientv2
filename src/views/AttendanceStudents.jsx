import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Modal, Form } from "react-bootstrap";
import { Notyf } from "notyf";
import { useParams, useNavigate } from "react-router-dom";

export default function AttendanceStudents() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const navigate = useNavigate();
  const { classId } = useParams(); // ✅ matches your route

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Attendance modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sessionNumber, setSessionNumber] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);

  // View Attendance modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    if (classId) {
      fetchStudents();
    }
  }, [classId]);

  const fetchStudents = () => {
    setLoading(true);
    fetch(`${API_URL}/class/${classId}/students`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStudents(data);
        } else {
          notyf.error(data.message || "Error fetching students");
        }
      })
      .catch(() => notyf.error("Server error"))
      .finally(() => setLoading(false));
  };

  // handle add attendance
  const handleAddAttendance = (student) => {
    setSelectedStudent(student);
    setSessionNumber("");
    setAttendanceDate(new Date().toISOString().split("T")[0]); // reset to today
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
        student_id: selectedStudent._id, // ⚠️ if you changed schema to use studentNumber, update here
        session_number: sessionNumber,
        date: attendanceDate,
        created_by: localStorage.getItem("userId"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.attendance) {
          notyf.success("Attendance added successfully");

          fetch(`${API_URL}/logs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                user: user.id, 
                task: "Add Attendance", 
                documentLog: data
              }) // datetime is automatic in backend
          })
          .then(res => res.json())
          .then(data => {
            console.log(data)
            if (data.log) {
              console.log('Log added successfully:', data.log);
            } else {
              console.error('Error adding log:', data.message);
            }
          })
          .catch(err => {
            console.error('Server error:', err.message);
          });


          setShowAddModal(false);
        } else {
          notyf.error(data.message || "Failed to add attendance");
        }
      })
      .catch(() => notyf.error("Server error"));
  };

  // handle view attendance
  // handle view attendance
  const handleViewAttendance = (student) => {
    setSelectedStudent(student);
    setAttendanceRecords([]);
    setAttendanceLoading(true);
    setShowViewModal(true);

    fetch(`${API_URL}/attendance/student/${student._id}`, {
      method: "POST", // ✅ must be POST because controller expects req.body
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ class_id: classId }), // ✅ send class_id in body
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.attendance && Array.isArray(data.attendance.attendance)) {
          // attendanceDoc.attendance array
          setAttendanceRecords(data.attendance.attendance);
        } else {
          notyf.error(data.message || "No attendance found");
        }
      })
      .catch((err) => {
        console.error(err);
        notyf.error("Server error");
      })
      .finally(() => setAttendanceLoading(false));
  };


  const columns = [
    { name: "ID", selector: (row) => row._id, sortable: true, wrap: true },
    {
      name: "Full Name",
      selector: (row) =>
        `${row.firstName || ""} ${row.middleName || ""} ${row.lastName || ""}`.replace(/\s+/g, " "),
      sortable: true,
      wrap: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button size="sm" variant="info" onClick={() => handleViewAttendance(row)}>
            View Attendance
          </Button>
          <Button size="sm" variant="success" onClick={() => handleAddAttendance(row)}>
            Add Attendance
          </Button>
        </div>
      ),
    },
  ];

  const attendanceColumns = [
    { name: "Session Number", selector: (row) => row.session_number, sortable: true },
    { name: "Date", selector: (row) => new Date(row.date).toLocaleDateString(), sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <Button size="sm" variant="danger" onClick={() => notyf.error("Delete not implemented yet")}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h3 className="mb-3">Students in Class {classId}</h3>

      <DataTable
        columns={columns}
        data={students}
        progressPending={loading}
        pagination
        highlightOnHover
        responsive
        noDataComponent="No students available in this class"
      />

      <div className="mt-3">
        <Button variant="secondary" onClick={() => navigate("/attendance/class")}>
          Back to Classes
        </Button>
      </div>

      {/* Modal for Add Attendance */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Adding attendance for:{" "}
            <strong>
              {selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : ""}
            </strong>
          </p>
          <Form.Group className="mb-3">
            <Form.Label>Session Number</Form.Label>
            <Form.Control
              type="number"
              value={sessionNumber}
              onChange={(e) => setSessionNumber(e.target.value)}
              placeholder="Enter session number"
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

      {/* Modal for View Attendance */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Attendance Records for{" "}
            {selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DataTable
            columns={attendanceColumns}
            data={attendanceRecords}
            progressPending={attendanceLoading}
            pagination
            highlightOnHover
            responsive
            noDataComponent="No attendance records available"
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}
