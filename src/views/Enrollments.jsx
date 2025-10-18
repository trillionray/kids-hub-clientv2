import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Modal } from "react-bootstrap";
import { Notyf } from "notyf";
import { useNavigate } from "react-router-dom"; // ✅ added
import { startTransition } from "react";

export default function Enrollments() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const navigate = useNavigate(); // ✅ added


  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [branches, setBranches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [searchText, setSearchText] = useState("");
  // Automatically select the latest academic year
    useEffect(() => {
      if (academicYears.length > 0) {
        setSelectedYear(academicYears[0]._id); // 👈 select the latest automatically
      }
    }, [academicYears]);


  useEffect(() => {
    fetchFilters();
    fetchEnrollments();
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [selectedBranch, selectedYear, selectedProgram, searchText]);

  const fetchFilters = async () => {
    try {
      // Fetch branches from enrollments
      const res = await fetch(`${API_URL}/enrollments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      console.log(data)
      // console.log(data);

      if (Array.isArray(data)) {
        setBranches([...new Set(data.map((e) => e.branch))]);
      }

      // Fetch academic years separately
      const yearRes = await fetch(`${API_URL}/academic-years`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const yearsData = await yearRes.json();
      if (Array.isArray(yearsData)) {
        const formattedYears = yearsData.map((y) => ({
          _id: y._id,
          name: `${new Date(y.startDate).getFullYear()} - ${new Date(y.endDate).getFullYear()}`,
        }));
        console.log(formattedYears);
        setAcademicYears(formattedYears);
      }

      // ✅ Fetch all programs from Program collection
      const progRes = await fetch(`${API_URL}/programs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const progData = await progRes.json();
      if (Array.isArray(progData)) {
        setPrograms(progData); // store full program objects
      }
    } catch (err) {
      console.error("fetchFilters error:", err);
    }
  };

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const body = {
        branch: selectedBranch || undefined,
        academic_year_id: selectedYear || undefined,
        program_id: selectedProgram || undefined,
        student_name: searchText || undefined,
        student_id: searchText || undefined, // 🔹 new
      };

      const res = await fetch(`${API_URL}/enrollments/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!Array.isArray(data)) {
        notyf.error("Invalid response from server");
        return;
      }

      // force sort client-side
      const sortedData = data.sort(
        (a, b) => new Date(b.last_modified_date) - new Date(a.last_modified_date)
      );

      setEnrollments(sortedData);

      // 🔹 Build unique programs list from enrollments
      const uniquePrograms = [];
      const seen = new Set();
      data.forEach((e) => {
        if (e.program && !seen.has(e.program._id)) {
          uniquePrograms.push(e.program);
          seen.add(e.program._id);
        }
      });
      setPrograms(uniquePrograms);

    } catch (err) {
      console.error("fetchEnrollments error:", err);
      notyf.error("Failed to fetch enrollments");
    }
    setLoading(false);
  };

  const handleEdit = (id) => {
    startTransition(() => {
      navigate(`/enrollments/update/${id}`);
    });
  };

  const openDetails = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowModal(true);
  };

  const columns = [
    { 
      name: "ID", 
      width: "10%", 
      selector: (row) => row.student_id, 
      sortable: true 
    },
    {
      name: "Student",
      width: "20%", 
      selector: (row) =>
        row.student
          ? `${row.student.first_name} ${row.student.middle_name || ""} ${row.student.last_name}`.trim()
          : "N/A",
      sortable: true,
    },
    {
      name: "Program",
      width: "20%", 
      selector: (row) => (row.program ? row.program.name : "N/A"),
      sortable: true,
    },
    { 
      name: "Branch", 
      width: "15%", 
      selector: (row) => row.branch, 
      sortable: true 
    },
    { 
      name: "Status", 
      width: "15%", 
      selector: (row) => row.status, 
      sortable: true 
    },
    {
      name: "Actions",
      width: "20%",  // ⬅️ widened a bit to fit the new button
      cell: (row) => (
        <div className="d-flex gap-1 justify-content-center">
          <Button size="sm" variant="info" onClick={() => openDetails(row)}>
            Files
          </Button>

          <Button
            size="sm"
            variant="warning"
            onClick={() => navigate(`/students/edit/${row.student_id}`)} // ⬅️ NEW
          >
            Student Info
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];


  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: "20px" }}>
      <h3 className="text-white text-bolder">ENROLLMENTS</h3>
      <div className="container border mt-2 p-4 rounded shadow" style={{ backgroundColor: "#fff" }}>
      
        {/* Filters */}
        <div className="mb-3 d-flex justify-content-end gap-2 flex-wrap">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <select
              className="form-select w-auto"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              className="form-select w-auto"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">All Academic Years</option>
              {academicYears.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.name}
                </option>
              ))}
            </select>

            <select
              className="form-select w-auto"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              <option value="">All Programs</option>
              {programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="form-control w-auto"
              style={{ minWidth: "220px" }}
              placeholder="Student ID / Student Name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={enrollments}
          pagination
          highlightOnHover
          striped
          dense
          responsive
          noDataComponent="No users found"
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
                textAlign: "center", // ✅ Ensures header row centers its content
              },
            },
            headCells: {
              style: {
                justifyContent: "center", // ✅ Centers header text
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
                textAlign: "center", // ✅ Ensures row cells are centered
              },
              highlightOnHoverStyle: {
                backgroundColor: "#eaf4fb",
                borderBottomColor: "#89C7E7",
                outline: "none",
              },
            },
            cells: {
              style: {
                justifyContent: "center", // ✅ Centers cell content
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

        {/* Details Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          
          <Modal.Header closeButton>
            <Modal.Title>Enrollment Details</Modal.Title>
          </Modal.Header>
        
          <Modal.Body>
            {selectedEnrollment && (
              <div>
                <p>
                  <strong>Student:</strong>{" "}
                  {`${selectedEnrollment.student.first_name} ${selectedEnrollment.student.middle_name || ""} ${selectedEnrollment.student.last_name}`.trim()}
                </p>
                <p><strong>Program:</strong> {selectedEnrollment.program?.name || "N/A"}</p>
                <p><strong>Branch:</strong> {selectedEnrollment.branch}</p>
                <p><strong>Number of Sessions:</strong> {selectedEnrollment.num_of_sessions || "N/A"}</p>
                <p><strong>Duration:</strong> {selectedEnrollment.duration}</p>
                <p><strong>Academic Year:</strong> {selectedEnrollment.academic_year_name}</p>

                <p><strong>Miscellaneous Package:</strong> {selectedEnrollment.misc_package_name}</p>
                <p><strong>Status:</strong> {selectedEnrollment.status}</p>
                <p><strong>Total:</strong> ₱{selectedEnrollment.total.toLocaleString()}</p>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
              {selectedEnrollment && (
                <div className="d-flex w-100 gap-2">
                  <Button
                    className="flex-fill"
                    variant="primary"
                    onClick={() => {
                      const studentId = selectedEnrollment.student_id;
                      const programId = selectedEnrollment.program_id;
                      const branchName = encodeURIComponent(selectedEnrollment.branch);

                      let academicYearStart = "";
                      if (selectedEnrollment.academic_year_name) {
                        academicYearStart = selectedEnrollment.academic_year_name.split(" to ")[0];
                      }

                      window.open(
                        `/pdf-reg-form?studentId=${studentId}&programId=${programId}&branch=${branchName}&academicYearStart=${encodeURIComponent(academicYearStart)}&fileName=${selectedEnrollment.student.last_name}_${selectedEnrollment.student.first_name}`,
                        "_blank"
                      );
                    }}
                  >
                    Registration Form
                  </Button>

                  <Button
                    className="flex-fill"
                    variant="primary"
                    onClick={() => {
                      const programId = selectedEnrollment.program_id;
                      const miscId = selectedEnrollment.miscellaneous_group_id;

                      window.open(
                        `/pdf-breakdown?programId=${programId}&miscId=${miscId}&fileName=${selectedEnrollment.student.last_name}_${selectedEnrollment.student.first_name}`,
                        "_blank"
                      );
                    }}
                  >
                    Breakdown
                  </Button>

                  <Button
                    className="flex-fill"
                    variant="primary"
                    onClick={() => {
                      const studentName = encodeURIComponent(
                        `${selectedEnrollment.student.first_name} ${selectedEnrollment.student.middle_name || ""} ${selectedEnrollment.student.last_name}`.trim()
                      );
                      const guardianName = encodeURIComponent(selectedEnrollment.guardian_name || "Guardian");
                      const date = encodeURIComponent(new Date().toLocaleDateString());

                      window.open(
                        `/pdf-acknowledgement-consent?studentName=${studentName}&guardianName=${guardianName}&date=${date}&fileName=${selectedEnrollment.student.last_name}_${selectedEnrollment.student.first_name}`,
                        "_blank"
                      );
                    }}
                  >
                    Ack & Consent
                  </Button>
                </div>
              )}

              <Button
                variant="success"
                className="w-100 mt-2"
                onClick={() => {
                  const studentId = selectedEnrollment.student_id;
                  const programId = selectedEnrollment.program_id;
                  const branchName = encodeURIComponent(selectedEnrollment.branch);
                  const miscId = selectedEnrollment.miscellaneous_group_id;
                  const studentName = encodeURIComponent(
                    `${selectedEnrollment.student.first_name} ${selectedEnrollment.student.middle_name || ""} ${selectedEnrollment.student.last_name}`.trim()
                  );
                  const guardianName = encodeURIComponent(selectedEnrollment.guardian_name || "Guardian");
                  const academicYearStart = selectedEnrollment.academic_year_name?.split(" to ")[0] || "";
                  const date = encodeURIComponent(new Date().toLocaleDateString());

                  window.open(
                    `/pdf-all?studentId=${studentId}&programId=${programId}&branch=${branchName}&miscId=${miscId}&studentName=${studentName}&guardianName=${guardianName}&academicYearStart=${encodeURIComponent(academicYearStart)}&date=${date}&fileName=${selectedEnrollment.student.last_name}_${selectedEnrollment.student.first_name}`,
                    "_blank"
                  );
                }}
              >
                All Files
              </Button>
            </Modal.Footer>

        </Modal>
      </div>
    </div>
    
  );
}
