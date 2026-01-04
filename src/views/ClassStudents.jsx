import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const programId = queryParams.get("program");
  const academicYearId = queryParams.get("academicYear");
  const sectionName = queryParams.get("section");
  const programName = queryParams.get("programName");


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
  const [attendanceStatus, setAttendanceStatus] = useState("Present"); // default
  const [attendanceNotes, setAttendanceNotes] = useState(""); // optional notes

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
  // Fetch all students (for Add Student modal)
  const fetchAllStudents = () => {
    fetch(`${API_URL}/enrollments/by-program/${programId}/year/${academicYearId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.enrollments)) {
          const enrollees = data.enrollments;

          // push full student object
          const students = enrollees.map(enrollee => enrollee.student_id);

          setAllStudents(students);
        } else {
          notyf.error(data.message || "Error fetching all students");
        }
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

          fetch(`${API_URL}/logs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                user: user.id, 
                task: "Remove Student", 
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
  setAttendanceStatus("Present");  // reset status
  setAttendanceNotes("");          // reset notes
  setShowAddModal(true);
};

  const handleSubmitAttendance = () => {
    if (!sessionNumber) return notyf.error("Please enter session number");

    const payload = {
      class_id: classId,
      student_id: selectedStudent.studentId || selectedStudent._id, // ensure correct ID
      session_number: Number(sessionNumber),
      date: attendanceDate,
      status: attendanceStatus,
      notes: attendanceNotes || "",
      created_by: user.id
    };

    console.log("Submitting attendance payload:", payload); // ✅ debug

    fetch(`${API_URL}/attendance/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.attendance) {
          notyf.success("Attendance added successfully");
          setShowAddModal(false);

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
  // 📝 Attendance table columns
  const attendanceColumns = [
    { name: "Session", selector: (row) => row.session_number, sortable: true },
    { name: "Date", selector: (row) => new Date(row.date).toLocaleDateString(), sortable: true },
    { name: "Status", selector: (row) => row.status || "—", sortable: true }, // ✅ added
    { name: "Notes", selector: (row) => row.notes || "—", wrap: true },       // ✅ added
  ];


  const filteredStudents = allStudents.filter((s) => {
    const fullName = `${s.firstName || ""} ${s.middleName || ""} ${s.lastName || ""}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });


  // implement - select student checkbox
  // State to track selected students
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Toggle a single student
  const handleToggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Toggle all students
  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s._id));
    }
  };

  // Assign selected students to class
  const handleAssignSelectedStudents = async () => {
    if (selectedStudents.length === 0) {
      return notyf.error("Please select at least one student");
    }

    // Loop through each selected student and send a request
    for (const studentId of selectedStudents) {
      try {
        const res = await fetch(`${API_URL}/class/${classId}/students`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ students: [studentId] }),
        });

        const data = await res.json();
        console.log(data)

        if (data.message && data.message.includes("already added")) {
           notyf.error("Student already exists in the class.");
           setShowModal(false);
           return;
        }

        if (!data.class) {
          notyf.error(data.message || `Failed to add student ${studentId}`);
        }
      } catch (err) {
        console.error(err);
        notyf.error(`Server error adding student ${studentId}`);
      }
    }

    notyf.success("Selected students added successfully");
    fetchStudents();
    setShowModal(false);
    setSelectedStudents([]);
  };



  return (
    <div className="p-4">
      {/* Top bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="secondary" onClick={() => navigate("/classes")}>
          ← Back
        </Button>
        <h3 className="mb-0">{sectionName} - {programName}</h3>
        <Button
          variant="primary"
          onClick={() => {
            fetchAllStudents();
            setShowModal(true);
          }}
        >
          Add Student/s
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
          <Modal.Title>Select Student ({programName} - AY {queryParams.get("startDate")} {queryParams.get("endDate")})</Modal.Title>

        </Modal.Header>
        <Modal.Body>
          <p>Students enrolled in same program and academic year</p>
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
              {
                name: (
                  <Form.Check
                    type="checkbox"
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={handleSelectAll}
                  />
                ),
                width: "50px",
                cell: (row) => (
                  <Form.Check
                    type="checkbox"
                    checked={selectedStudents.includes(row._id)}
                    onChange={() => handleToggleStudent(row._id)}
                  />
                ),
              },
              { name: "ID", selector: (row) => row._id, sortable: true },
              {
                name: "Name",
                selector: (row) =>
                  `${row.firstName || row.first_name || ""} ${row.middleName || row.middle_name || ""} ${row.lastName || row.last_name || ""}`.trim(),
                sortable: true,
              }

            ]}
            data={filteredStudents}
            pagination
            highlightOnHover
            responsive
          />
          <Button
            variant="success"
            className="mt-3"
            onClick={handleAssignSelectedStudents}
          >
            ✅ Add Selected
          </Button>

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
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={attendanceStatus}
              onChange={(e) => setAttendanceStatus(e.target.value)}
            >
              <option value="Present">Present</option>
              <option value="Excused">Excused</option>
              <option value="Absent">Absent</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={attendanceNotes}
              onChange={(e) => setAttendanceNotes(e.target.value)}
              placeholder="Optional notes..."
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
