import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Modal, Form } from "react-bootstrap";
import { Notyf } from "notyf";
import { useNavigate } from "react-router-dom";

export default function Classes() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showClassModal, setShowClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  // Teachers list
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  useEffect(() => {
    // Load both classes and teachers on mount so names can be shown
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = () => {
    setLoading(true);
    fetch(`${API_URL}/class`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClasses(data);
        else notyf.error(data.message || "Error fetching classes");
      })
      .catch(() => notyf.error("Server error"))
      .finally(() => setLoading(false));
  };

  // Fetch teachers (also used by modal)
  const fetchTeachers = () => {
    fetch(`${API_URL}/users/teachers`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTeachers(data);
        else notyf.error(data.message || "Error fetching teachers");
      })
      .catch(() => notyf.error("Server error"));
  };

  // Build a map: teacherId -> "First Middle Last"
  const teacherMap = useMemo(() => {
    const format = (t) =>
      `${t.firstName || ""} ${t.middleName || ""} ${t.lastName || ""}`
        .replace(/\s+/g, " ")
        .trim();
    return Object.fromEntries(teachers.map((t) => [t._id, format(t)]));
  }, [teachers]);

  // Derive rows with a display name so DataTable shows names (and updates when teachers load)
  const classesWithTeacherName = useMemo(() => {
    return classes.map((c) => ({
      ...c,
      teacherName: c.teacher_id ? (teacherMap[c.teacher_id] || c.teacher_id) : "Not Assigned",
    }));
  }, [classes, teacherMap]);

  // Add new class
  const handleCreateClass = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/class/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ sectionName: newClassName }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.class) {
          notyf.success("Class created successfully");
          setShowClassModal(false);
          setNewClassName("");
          fetchClasses();
        } else notyf.error(data.message || "Failed to create class");
      })
      .catch(() => notyf.error("Server Error"));
  };

  // Assign teacher (send only teacher_id)
  const handleAssignTeacher = (e) => {
    e.preventDefault();
    if (!selectedTeacher) return notyf.error("Please select a teacher");

    fetch(`${API_URL}/class/${selectedClassId}/teacher`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ teacher_id: selectedTeacher }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.class) {
          notyf.success("Teacher assigned successfully");
          setShowTeacherModal(false);
          setSelectedTeacher("");
          setSelectedClassId(null);
          fetchClasses();
          fetchTeachers(); // refresh names if needed
        } else notyf.error(data.message || "Failed to assign teacher");
      })
      .catch(() => notyf.error("Server Error"));
  };

  // Remove teacher
  const handleRemoveTeacher = (classId) => {
    if (!window.confirm("Remove assigned teacher from this class?")) return;
    fetch(`${API_URL}/class/${classId}/teacher`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.class) {
          notyf.success("Teacher removed successfully");
          fetchClasses();
        } else notyf.error(data.message || "Failed to remove teacher");
      })
      .catch((err) => notyf.error(err?.message || "Server Error"));
  };

  const columns = [
    { name: "ID", selector: (row) => row._id, sortable: true, wrap: true },
    { name: "Section Name", selector: (row) => row.sectionName, sortable: true },
    {
      name: "Teacher",
      selector: (row) => row.teacherName, // <-- now uses derived name
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="info"
            onClick={() => navigate(`/classes/${row._id}/students`)}
          >
            Show Students
          </Button>

          {!row.teacher_id && (
            <Button
              size="sm"
              variant="success"
              onClick={() => {
                setSelectedClassId(row._id);
                fetchTeachers(); // ensure latest
                setShowTeacherModal(true);
              }}
            >
              Assign Teacher
            </Button>
          )}

          {row.teacher_id && (
            <>
              <Button
                size="sm"
                variant="warning"
                onClick={() => {
                  setSelectedClassId(row._id);
                  fetchTeachers();
                  setShowTeacherModal(true);
                }}
              >
                Re-Assign Teacher
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleRemoveTeacher(row._id)}
              >
                Remove Teacher
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>All Classes</h3>
        <Button variant="primary" onClick={() => setShowClassModal(true)}>
          New Class
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={classesWithTeacherName} // <-- derived rows with names
        progressPending={loading}
        pagination
        highlightOnHover
        responsive
      />

      {/* Modal for adding new class */}
      <Modal show={showClassModal} onHide={() => setShowClassModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Class</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateClass}>
            <Form.Group className="mb-3">
              <Form.Label>Section Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter section name"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowClassModal(false)} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal for assigning teacher */}
      <Modal show={showTeacherModal} onHide={() => setShowTeacherModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Assign Teacher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAssignTeacher}>
            <Form.Group className="mb-3">
              <Form.Label>Select Teacher</Form.Label>
              <Form.Select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                required
              >
                <option value="">-- Select Teacher --</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.firstName} {t.middleName || ""} {t.lastName} ({t.username})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowTeacherModal(false)} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Assign
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
