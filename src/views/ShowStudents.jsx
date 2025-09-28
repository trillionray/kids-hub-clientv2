import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Modal, Spinner, Form } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";
import { useNavigate } from "react-router-dom";

export default function ShowStudents() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/students`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.students)) {
          setStudents(data.students);
          setFilteredStudents(data.students);
        } else {
          notyf.error("Failed to load students");
        }
      })
      .catch(() => notyf.error("Failed to fetch students"))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      id: "id",
      name: "ID",
      selector: (row) => row._id,
      sortable: true,
      style: { textAlign: "center", whiteSpace: "nowrap" },
    },
    {
      id: "name",
      name: "Name",
      selector: (row) => {
        const middleInitial = row.middle_name
          ? `${row.middle_name.charAt(0).toUpperCase()}.`
          : "";
        const suffix = row.suffix ? ` ${row.suffix}` : "";
        return `${row.last_name || ""}, ${row.first_name || ""} ${middleInitial}${suffix}`.trim();
      },
      sortable: true,
      style: { textAlign: "center", whiteSpace: "nowrap" },
    },
    {
      id: "gender",
      name: "Gender",
      selector: (row) => row.gender,
      sortable: true,
      style: { textAlign: "center", whiteSpace: "nowrap" },
    },
    {
      id: "birthdate",
      name: "Birthdate",
      selector: (row) => row.birthdate,
      sortable: true,
      style: { textAlign: "center", whiteSpace: "nowrap" },
    },
    {
      id: "actions",
      name: "Actions",
      cell: (row) => (
        <div className="d-flex justify-content-center gap-2">
          {/* 👁 View Button */}
          <Button
            size="sm"
            onClick={() => {
              setSelectedStudent(row);
              setShowModal(true);
            }}
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "0.25rem",
            }}
            onMouseEnter={(e) => {
              const icon = e.currentTarget.querySelector("svg");
              if (icon) icon.style.color = "#0dcaf0";
            }}
            onMouseLeave={(e) => {
              const icon = e.currentTarget.querySelector("svg");
              if (icon) icon.style.color = "#6c757d";
            }}
          >
            <FeatherIcon icon="eye" size={14} style={{ color: "#6c757d" }} />
          </Button>

          {/* ✏️ Edit Button */}
          <Button
            size="sm"
            onClick={() => navigate(`/students/edit/${row._id}`)}
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "0.25rem",
            }}
            onMouseEnter={(e) => {
              const icon = e.currentTarget.querySelector("svg");
              if (icon) icon.style.color = "#ffc107";
            }}
            onMouseLeave={(e) => {
              const icon = e.currentTarget.querySelector("svg");
              if (icon) icon.style.color = "#6c757d";
            }}
          >
            <FeatherIcon icon="edit-2" size={14} style={{ color: "#6c757d" }} />
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      style: { textAlign: "center" },
    },
  ];


  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: "20px" }}>
      <div className="container border mt-5 p-4 rounded shadow" style={{ backgroundColor: "#ffffffff" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Students</h3>

          <input
            type="text"
            className="form-control"
            style={{ maxWidth: "250px" }}
            placeholder="Search students..."
            onChange={(e) => {
              const search = e.target.value.toLowerCase();
              setFilteredStudents(
                students.filter(
                  (s) =>
                    `${s.last_name}, ${s.first_name}`.toLowerCase().includes(search) ||
                    s.middle_name?.toLowerCase().includes(search) ||
                    s.gender?.toLowerCase().includes(search) ||
                    s.birthdate?.toLowerCase().includes(search)
                )
              );
            }}
          />
        </div>

        {loading ? (
          <Spinner animation="border" />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={filteredStudents}
              pagination
              highlightOnHover
              striped
              dense
              responsive
              noDataComponent="No students found"
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

            {/* Student Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Student Details</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {selectedStudent ? (
                  <>
                    <h5>
                      {selectedStudent.first_name} {selectedStudent.middle_name}{" "}
                      {selectedStudent.last_name} {selectedStudent.suffix}
                    </h5>
                    <p><strong>Gender:</strong> {selectedStudent.gender}</p>
                    <p><strong>Birthdate:</strong> {selectedStudent.birthdate}</p>
                    <p>
                      <strong>Address:</strong>{" "}
                      {`${selectedStudent.address?.street || ""}, 
                        ${selectedStudent.address?.barangay || ""}, 
                        ${selectedStudent.address?.municipality_or_city || ""}`}
                    </p>

                    <hr />
                    <h6>Mother</h6>
                    <p>{selectedStudent.mother?.first_name} {selectedStudent.mother?.middle_name} {selectedStudent.mother?.last_name}</p>
                    <p><strong>Occupation:</strong> {selectedStudent.mother?.occupation}</p>
                    <p><strong>Mobile:</strong> {selectedStudent.mother?.contacts?.mobile_number}</p>

                    <hr />
                    <h6>Father</h6>
                    <p>{selectedStudent.father?.first_name} {selectedStudent.father?.middle_name} {selectedStudent.father?.last_name}</p>
                    <p><strong>Occupation:</strong> {selectedStudent.father?.occupation}</p>
                    <p><strong>Mobile:</strong> {selectedStudent.father?.contacts?.mobile_number}</p>

                    <hr />
                    <h6>Emergency Contact</h6>
                    <p>{selectedStudent.emergency?.first_name} {selectedStudent.emergency?.middle_name} {selectedStudent.emergency?.last_name}</p>
                    <p><strong>Occupation:</strong> {selectedStudent.emergency?.occupation}</p>
                    <p><strong>Mobile:</strong> {selectedStudent.emergency?.contacts?.mobile_number}</p>
                  </>
                ) : (
                  <p>No student selected</p>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        )}
      </div>
    </div>
  );
}
