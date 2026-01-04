import { useEffect, useMemo, useState, useContext } from "react";
import DataTable from "react-data-table-component";
import { Button, Modal, InputGroup, Spinner, Form } from "react-bootstrap";
import { Notyf } from "notyf";
import { useNavigate } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import UserContext from "../context/UserContext";

export default function Classes() {
  const { user } = useContext(UserContext);
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

  //School year list
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  // Program List
  const [programs, setPrograms] = useState([]);
  const [SelectedProgram, setSelectedProgram] = useState("");

  //Update Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  //Filtering columns
  const [filterProgramName, setFilterProgramName] = useState("");
  const [filterProgramType, setFilterProgramType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchPrograms();
    fetchSchoolYear();
  }, []);


  const fetchSchoolYear = () => {
    setLoading(true);
    fetch(`${API_URL}/academic-years`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Format each academic year for easy display
          const formatted = data.map((y) => {
            const start = new Date(y.startDate);
            const end = new Date(y.endDate);
            return {
              _id: y._id,
              name: `${start.getFullYear()} - ${end.getFullYear()}`,
              startDate: y.startDate,
              endDate: y.endDate,
            };
          });

          // Sort so the most recent or current year appears first
          const today = new Date();
          formatted.sort((a, b) => {
            const isCurrentA = today >= new Date(a.startDate) && today <= new Date(a.endDate);
            const isCurrentB = today >= new Date(b.startDate) && today <= new Date(b.endDate);
            if (isCurrentA && !isCurrentB) return -1;
            if (!isCurrentA && isCurrentB) return 1;
            return new Date(b.startDate) - new Date(a.startDate);
          });

          setAcademicYears(formatted);

          // Auto-select the current or latest year
          if (formatted.length > 0) setSelectedYear(formatted[0]._id);
        } else {
          notyf.error(data.message || "Error fetching academic years");
        }
      })
      .catch(() => notyf.error("Server error while fetching academic years"))
      .finally(() => setLoading(false));
  };

  const fetchClasses = () => {
    setLoading(true);
    fetch(`${API_URL}/class`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (Array.isArray(data)) {
          setClasses(data);
          setFilteredClasses(data); // 
        } else notyf.error(data.message || "Error fetching classes");
      })
      .catch(() => notyf.error("Server error"))
      .finally(() => setLoading(false));
  };

  //Fetch teachers
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

  //Fetch Programs
  const fetchPrograms = () => {
    fetch(`${API_URL}/programs/getPrgrams`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        
        if (Array.isArray(data)) setPrograms(data);
        
        else notyf.error(data.message || "Error fetching programs");
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
      body: JSON.stringify({ 
        sectionName: newClassName,
        teacher_id: selectedTeacher,
        program_id: SelectedProgram
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.class) {
          notyf.success("Class created successfully");
          setShowClassModal(false);
          setNewClassName("");   
          setSelectedTeacher(""); 
          setSelectedProgram("");

          fetch(`${API_URL}/logs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                user: user.id, 
                task: "Add Class", 
                documentLog: data
              }) // datetime is automatic in backend
          })
          .then(res => res.json())
          .then(data => {
            console.log(data);
            if (data.log) {
              console.log('Log added successfully:', data.log);
            } else {
              console.error('Error adding log:', data.message);
            }
          })
          .catch(err => {
            console.error('Server error:', err.message);
          });


          fetchClasses();

          


        } else notyf.error(data.message || "Failed to create class");
      })
      .catch(() => notyf.error("Server Error"));
  };

  const handleUpdateClass = (e) => {
    e.preventDefault();

    if (!selectedClass || !selectedClass._id) {
      notyf.error("No class selected to update");
      return;
    }

    fetch(`${API_URL}/class/${selectedClass._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        sectionName: selectedClass.sectionName,
        teacher_id: selectedClass.teacher_id?._id || selectedClass.teacher_id,
        program_id: selectedClass.program_id?._id || selectedClass.program_id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.class) {
          notyf.success("Class updated successfully");
          setShowUpdateModal(false);
          setSelectedClass(null);
          fetchClasses();
        } else {
          notyf.error(data.message || "Failed to update class");
        }
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
        //console.log(data)
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


  useEffect(() => {
    let filtered = classesWithTeacherName;

    // Filter by Program Name dropdown
    if (filterProgramName) {
      filtered = filtered.filter(
        (c) => c.program_id?.name === filterProgramName
      );
    }

    // Filter by Program Type dropdown
    if (filterProgramType) {
      filtered = filtered.filter(
        (c) => c.program_id?.category === filterProgramType
      );
    }

    // Filter by School Year dropdown
    if (selectedYear) {
      filtered = filtered.filter(
        (c) => c.school_year_id?._id === selectedYear
      );
    }

    setFilteredClasses(filtered);
  }, [filterProgramName, filterProgramType, selectedYear, classesWithTeacherName]);
  const columns = [
    // {
    //   name: "Academic Year",
    //   selector: (row) => {
    //     console.log(row)
    //     const start = row.school_year_id?.startDate
    //       ? new Date(row.school_year_id.startDate).toLocaleDateString("en-US", {
    //           month: "numeric",
    //           year: "numeric",
    //         })
    //       : "N/A";

    //     const end = row.school_year_id?.endDate
    //       ? new Date(row.school_year_id.endDate).toLocaleDateString("en-US", {
    //           month: "numeric",
    //           year: "numeric",
    //         })
    //       : "N/A";

    //     return `${start} - ${end}`;
    //   },
    //   sortable: true,
    //   width: "20%",
    //   center: true,
    // },
    {
      name: "Section",
      width: "25%",
      selector: (row) => row.sectionName,
      sortable: true,
    },
    {
      name: "Teacher",
      width: "20%",
      selector: (row) => row.teacherName,
      sortable: true,
      cell: (row) => (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-${row._id}`}>{row.teacherName}</Tooltip>}
        >
          <span
            style={{
              display: "inline-block",
              maxWidth: "150px",      // 👈 adjust to your table width
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {row.teacherName}
          </span>
        </OverlayTrigger>
      ),
      
      center: true,
    },
    {
      name: "Program",
      width: "20%",
      selector: (row) => row.program_id.name,
      sortable: true,
      cell: (row) => (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-program-${row._id}`}>{row.program_id?.name}</Tooltip>}
        >
          <span
            style={{
              display: "inline-block",
              maxWidth: "150px",      // 👈 adjust width as needed
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {row.program_id?.name || "—"}
          </span>
        </OverlayTrigger>
      ),
      
      center: true,
    },
    // {
    //   name: "Type",
    //   selector: (row) => {
    //     const type = row.program_id?.category;
    //     if (type === "short") return "Short Program";
    //     if (type === "long") return "Full Program";
    //     return "N/A";
    //   },
    //   sortable: true,
    //   width: "15%",
    //   center: true,
    // },
    {
      name: "Students No.",
      width: "15%",       // ✅ fixed column width
      selector: (row) => row.studentCount,
      sortable: true,
      
      center: true,        // ✅ centers the number
    },
    { 
      name: "Actions",
      width: "20%",
      cell: (row) => (
        <div className="d-flex gap-2 justify-content-center">
          <Button
            size="sm"
            variant="info"
            onClick={() => {
              const start = row.school_year_id?.startDate
                ? new Date(row.school_year_id.startDate).toLocaleDateString("en-US", {
                    month: "numeric",
                    year: "numeric",
                  })
                : "";

              const end = row.school_year_id?.endDate
                ? new Date(row.school_year_id.endDate).toLocaleDateString("en-US", {
                    month: "numeric",
                    year: "numeric",
                  })
                : "";

              navigate(
                `/classes/${row._id}/students?program=${row.program_id?._id}` +
                `&academicYear=${row.school_year_id?._id}` +
                `&section=${encodeURIComponent(row.sectionName)}` +
                `&programName=${encodeURIComponent(row.program_id?.name)}` +
                `&startDate=${encodeURIComponent(start)}` +
                `&endDate=${encodeURIComponent(end)}`
              );
            }}
          >
            Students
          </Button>


          <Button
                size="sm"
                variant="warning"
                onClick={() => {
                  setSelectedClass({ ...row });
                  setShowUpdateModal(true);  
                }}
              >
                Update
          </Button>

          {/* {row.teacher_id && (
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
          )} */}
        </div>
      ),
             // ✅ fixed column width
      center: true,        // ✅ centers the number
    },
  ];

  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: "20px" }}>
      <h3 className="text-white text-bolder">CLASSES</h3>
      <div
        className="container border p-4 rounded shadow"
        style={{ backgroundColor: "#fff" }}
      >
        <div className="mt-2">
          {/* Header with button + search */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Button variant="primary" onClick={() => setShowClassModal(true)} className="w-25">
              New Class
            </Button>
            {/* 🧩 Program Name Filter */}
            <div  style={{ width: "23%" }}></div>
            
            <div className="d-flex align-items-center gap-3">
              <Form.Select
                value={filterProgramName}
                onChange={(e) => setFilterProgramName(e.target.value)}
                style={{ width: "200px" }}
              >
                <option value="">All Programs</option>
                {Array.from(new Set(programs.map((p) => p.name))).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Form.Select>

              <Form.Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ width: "200px" }}
              >
                <option value="">All Academic Years</option>
                {academicYears.map((year) => (
                  <option key={year._id} value={year._id}>
                    {year.name}
                  </option>
                ))}
              </Form.Select>

              <Form.Select
                value={filterProgramType}
                onChange={(e) => setFilterProgramType(e.target.value)}
                style={{ width: "200px" }}
              >
                <option value="">All Types</option>
                {Array.from(new Set(programs.map((p) => p.category))).map((type) => {
                  let label = type;

                  if (type === "long") label = "Full Program";
                  else if (type === "short") label = "Short Program";

                  return (
                    <option key={type} value={type}>
                      {label}
                    </option>
                  );
                })}
              </Form.Select>


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
          <Form onSubmit={handleCreateClass} >
            <div className="d-flex flex-column gap-3">
              <Form.Group>
                <Form.Label>Section Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter section name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                />
              </Form.Group>

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

              <Form.Label>Select Program</Form.Label>
              <Form.Select
                value={SelectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                required
              >
                <option value="">-- Select Program --</option>
                {programs.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} 
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="d-flex justify-content-end mt-4">
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

      {/* ✅ Safe Update Modal */}
      <Modal
        show={showUpdateModal}
        onHide={() => {
          setShowUpdateModal(false);
          setSelectedClass(null); // reset after closing
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Class</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClass ? (
            <Form onSubmit={handleUpdateClass}>
              <Form.Group className="mb-3">
                <Form.Label>Section Name</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedClass.sectionName || ""}
                  onChange={(e) =>
                    setSelectedClass((prev) => ({
                      ...prev,
                      sectionName: e.target.value,
                    }))
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teacher</Form.Label>
                <Form.Select
                  value={
                    selectedClass.teacher_id?._id ||
                    selectedClass.teacher_id ||
                    ""
                  }
                  onChange={(e) =>
                    setSelectedClass((prev) => ({
                      ...prev,
                      teacher_id: e.target.value,
                    }))
                  }
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Program</Form.Label>
                <Form.Select
                  value={
                    selectedClass.program_id?._id ||
                    selectedClass.program_id ||
                    ""
                  }
                  onChange={(e) =>
                    setSelectedClass((prev) => ({
                      ...prev,
                      program_id: e.target.value,
                    }))
                  }
                >
                  <option value="">-- Select Program --</option>
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedClass(null);
                  }}
                  className="me-2"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            </Form>
          ) : (
            <p className="text-center text-muted">Loading class details...</p>
          )}
        </Modal.Body>
      </Modal>


    </div>
  );
}
