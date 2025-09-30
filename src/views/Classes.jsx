import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Modal, InputGroup, Spinner, Form } from "react-bootstrap";
import { Notyf } from "notyf";
import { useNavigate } from "react-router-dom";

export default function Classes() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]); // ✅ for search
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
        if (Array.isArray(data)) {
          setClasses(data);
          setFilteredClasses(data); // ✅ Keep filtered data in sync
        } else notyf.error(data.message || "Error fetching classes");
      })
      .catch(() => notyf.error("Server error"))
      .finally(() => setLoading(false));
  };

  const fetchTeachers = () => {
    fetch(`${API_URL}/users/teachers`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (Array.isArray(data)) setTeachers(data);
        else notyf.error(data.message || "Error fetching teachers");
      })
      .catch(() => notyf.error("Server error"));
  };

  const teacherMap = useMemo(() => {
    const format = (t) =>
      `${t.firstName || ""} ${t.middleName || ""} ${t.lastName || ""}`
        .replace(/\s+/g, " ")
        .trim();
    return Object.fromEntries(teachers.map((t) => [t._id, format(t)]));
  }, [teachers]);

  const classesWithTeacherName = useMemo(() => {
    return classes.map((c) => ({
      ...c,
      teacherName: c.teacher_id
        ? teacherMap[c.teacher_id] || c.teacher_id
        : "Not Assigned",
    }));
  }, [classes, teacherMap]);

  useEffect(() => {
    setFilteredClasses(classesWithTeacherName);
  }, [classesWithTeacherName]);


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
        console.log(data)
        if (data.class) {
          notyf.success("Teacher assigned successfully");
          setShowTeacherModal(false);
          setSelectedTeacher("");
          setSelectedClassId(null);
          fetchClasses();
          fetchTeachers();
        } else notyf.error(data.message || "Failed to assign teacher");
      })
      .catch(() => notyf.error("Server Error"));
  };

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
    {
      name: "ID",
      width: "130px",
      sortable: true,
      cell: (row) => (
        <span title={row._id}>
          {row._id.length > 12
            ? `${row._id.slice(0, 8)}...`
            : row._id}
        </span>
      ),
    },
    {
      name: "Section",
      width: "150px",
      selector: (row) => row.sectionName,
      sortable: true,
    },
    {
      name: "Teacher",
      width: "150px",
      selector: (row) => row.teacherName,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2 justify-content-center">
          <Button
            size="sm"
            variant="info"
            onClick={() => navigate(`/classes/${row._id}/students`)}
          >
            Students
          </Button>

          {!row.teacher_id && (
            <Button
              size="sm"
              variant="success"
              onClick={() => {
                setSelectedClassId(row._id);
                fetchTeachers();
                setShowTeacherModal(true);
              }}
            >
              Teacher
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
                Teacher
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleRemoveTeacher(row._id)}
              >
                Unassign
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];


  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: "20px" }}>
      <div
        className="container border mt-5 p-4 rounded shadow"
        style={{ backgroundColor: "#fff" }}
      >
        <div className="mt-2">
          {/* Header with button + search */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Button variant="primary" onClick={() => setShowClassModal(true)}>
              New Class
            </Button>

            <input
              type="text"
              className="form-control"
              style={{ maxWidth: "250px" }}
              placeholder="Search classes..."
              onChange={(e) => {
                const search = e.target.value.toLowerCase();
                setFilteredClasses(
                  classesWithTeacherName.filter(
                    (c) =>
                      String(c._id).toLowerCase().includes(search) ||
                      String(c.sectionName).toLowerCase().includes(search) ||
                      String(c.teacherName).toLowerCase().includes(search)
                  )
                );
              }}
            />
            
          </div>

          {loading ? (
            <Spinner animation="border" />
          ) : (
            <DataTable
              columns={columns}
              data={filteredClasses}
              pagination
              highlightOnHover
              striped
              dense
              responsive
              noDataComponent="No classes found"
              customStyles={{
                table: {
                  style: {
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #dee2e6",
                  },
                },
                headRow: {
                  style: {
                    backgroundColor: "#f8f9fa",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    borderBottom: "2px solid #dee2e6",
                    textAlign: "center",
                  },
                },
                headCells: {
                  style: {
                    justifyContent: "center",
                    textAlign: "center",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    borderRight: "1px solid #dee2e6",
                  },
                },
                rows: {
                  style: {
                    fontSize: "0.95rem",
                    paddingTop: "10px",
                    paddingBottom: "10px",
                    borderBottom: "1px solid #e9ecef",
                    textAlign: "center",
                  },
                  highlightOnHoverStyle: {
                    backgroundColor: "#eaf4fb",
                    borderBottomColor: "#89C7E7",
                    outline: "none",
                  },
                },
                cells: {
                  style: {
                    justifyContent: "center",
                    textAlign: "center",
                    borderRight: "1px solid #dee2e6",
                  },
                },
                pagination: {
                  style: {
                    borderTop: "1px solid #dee2e6",
                    paddingTop: "4px",
                    justifyContent: "center",
                  },
                },
              }}
            />
          )}
        </div>
      </div>

      {/* Add Class Modal */}
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
              <Button
                variant="secondary"
                onClick={() => setShowClassModal(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Assign Teacher Modal */}
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
              <Button
                variant="secondary"
                onClick={() => setShowTeacherModal(false)}
                className="me-2"
              >
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
