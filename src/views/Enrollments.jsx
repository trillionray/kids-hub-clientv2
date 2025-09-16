import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Modal } from "react-bootstrap";
import { Notyf } from "notyf";
import html2pdf from "html2pdf.js";

export default function Enrollments() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
 
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    console.log("fetchEnrollments called");
    setLoading(true);

    try {
      // 1. Fetch raw enrollments
      const res = await fetch(`${API_URL}/enrollments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      console.log("Raw enrollments:", data);

      if (!Array.isArray(data)) {
        notyf.error("Invalid response from server");
        return;
      }

      // 2. Collect unique IDs
      const studentIds = [...new Set(data.map(e => e.student_id))];
      const programIds = [...new Set(data.map(e => e.program_id))];
      const academicIds = [...new Set(data.map(e => e.academic_year_id))];
      const miscIds = [...new Set(data.map(e => e.miscellaneous_group_id))].filter(Boolean);

      // 3. Fetch students
      const studentsArray = await Promise.all(
        studentIds.map(async (sid) => {
          const res = await fetch(`${API_URL}/summary/findstudent/${sid}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const studentData = await res.json();
          console.log("Student response:", studentData);
          return { _id: sid, ...studentData };
        })
      );

      // 4. Fetch programs
      const programsArray = await Promise.all(
        programIds.map(async (pid) => {
          const res = await fetch(`${API_URL}/summary/findprogram/${pid}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const programData = await res.json();
          console.log(`Program ${pid}:`, programData);
          return programData;
        })
      );

      // 5. Fetch academic years individually
      const academicYearsArray = await Promise.all(
        academicIds.map(async (aid) => {
          const res = await fetch(`${API_URL}/summary/findacademicyear/${aid}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const academicData = await res.json();
          console.log(`AcademicYear ${aid}:`, academicData);
          return { _id: aid, result: academicData.result || "N/A" };
        })
      );

      // 6. Fetch miscellaneous packages
      const miscPackages = miscIds.length
        ? await Promise.all(
            miscIds.map(async (mid) => {
              const res = await fetch(`${API_URL}/summary/findmisc/miscPackages/${mid}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              });
              const miscData = await res.json();
              console.log(`Misc ${mid}:`, miscData);
              return { _id: mid, result: miscData.result || "N/A" };
            })
          )
        : [];

      // 7. Build lookup maps
      const studentMap = {};
      studentsArray.forEach(s => {
        if (s && s.success) studentMap[s._id] = s.fullName || "Unknown Student";
      });

      const programMap = {};
      programsArray.forEach(p => {
        if (p) programMap[p._id] = p.name || "Unknown Program";
      });

      const academicMap = {};
      academicYearsArray.forEach(a => {
        academicMap[a._id] = a.result || "N/A";
      });

      const miscMap = {};
      miscPackages.forEach(m => {
        // Use package_name instead of the entire object
        miscMap[m._id] = m.result?.package_name || "N/A";
      });


      // 8. Enrich enrollments
      const enriched = data.map(e => ({
        ...e,
        student_name: studentMap[e.student_id] || e.student_id,
        program_name: programMap[e.program_id] || e.program_id,
        academic_year_name: academicMap[e.academic_year_id] || "N/A",
        misc_package_name: miscMap[e.miscellaneous_group_id] || "N/A",
      }));

      console.log("Enriched enrollments:", enriched);
      setEnrollments(enriched);

    } catch (err) {
      console.error("fetchEnrollments error:", err);
      notyf.error("Failed to fetch enrollments");
    }

    setLoading(false);
  };


  const openDetails = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowModal(true);
  };

  const handleDownloadCombined = () => {
    if (!selectedEnrollment) return;

    const element = document.getElementById("combined-pdf");
    html2pdf().set({
      margin: 10,
      filename: `${selectedEnrollment.student_name}-all.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    }).from(element).save();
  };


  // Columns for DataTable
  const columns = [
    {
      name: "Student",
      selector: (row) => row.student_name || row.student_id,
      sortable: true,
    },
    {
      name: "Program",
      selector: (row) => row.program_name || row.program_id,
      sortable: true,
    },
    {
      name: "Branch",
      selector: (row) => row.branch,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: "Total (₱)",
      selector: (row) => row.total,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <Button size="sm" variant="info" onClick={() => openDetails(row)}>
          Show Details
        </Button>
      ),
      // Only keep column-level props, remove anything invalid
      ignoreRowClick: true,
      allowOverflow: true, // this is fine if used as a column prop, not on Button
    },
  ];


  // Filtering
  const filteredData = enrollments.filter(
    (enroll) =>
      enroll.student_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      enroll.program_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      enroll.branch?.toLowerCase().includes(filterText.toLowerCase()) ||
      enroll.status?.toLowerCase().includes(filterText.toLowerCase())
  );


  const handleDownloadAll = () => {
    if (!selectedEnrollment) return;

    const studentId = selectedEnrollment.student_id;
    const programId = selectedEnrollment.program_id;
    const miscId = selectedEnrollment.miscellaneous_group_id;
    const branchName = encodeURIComponent(selectedEnrollment.branch);

    let academicYearStart = "";
    if (selectedEnrollment.academic_year_name) {
      academicYearStart = selectedEnrollment.academic_year_name.split(" to ")[0];
    }

    const studentName = encodeURIComponent(selectedEnrollment.student_name);
    const guardianName = encodeURIComponent(selectedEnrollment.guardian_name || "Guardian");
    const date = encodeURIComponent(new Date().toLocaleDateString());

    // Sequentially open pages with delays to ensure each one loads
    const openPDF = (url, delay) => {
      return new Promise((resolve) => {
        const win = window.open(url, "_blank");
        setTimeout(() => {
          win?.close();
          resolve();
        }, delay);
      });
    };

    (async () => {
      // Open registration form (wait 4s)
      await openPDF(
        `/pdf-reg-form?studentId=${studentId}&programId=${programId}&branch=${branchName}&academicYearStart=${encodeURIComponent(academicYearStart)}`,
        4000
      );

      // Open breakdown (wait 4s)
      await openPDF(
        `/pdf-breakdown?programId=${programId}&miscId=${miscId}`,
        4000
      );

      // Open acknowledgement & consent (wait 4s)
      await openPDF(
        `/pdf-acknowledgement-consent?studentName=${studentName}&guardianName=${guardianName}&date=${date}`,
        4000
      );
    })();
  };




  return (
    <div className="p-4 px-5">
      <h3 className="mb-3">Enrollments</h3>

      {/* Search box */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search enrollments..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredData}
        progressPending={loading}
        pagination
        highlightOnHover
        striped
        dense
        responsive
        noDataComponent="No enrollments found"
      />

      {/* Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enrollment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEnrollment && (
            <div>
              <p><strong>Branch:</strong> {selectedEnrollment.branch}</p>
              <p><strong>Student:</strong> {selectedEnrollment.student_name}</p>
              <p><strong>Program:</strong> {selectedEnrollment.program_name}</p>
              <p><strong>Number of Sessions:</strong> {selectedEnrollment.num_of_sessions || "N/A"}</p>
              <p><strong>Duration:</strong> {selectedEnrollment.duration}</p>
              <p><strong>Academic Year:</strong> {selectedEnrollment.academic_year_name || "N/A"}</p>
              <p><strong>Miscellaneous Package:</strong> {selectedEnrollment.misc_package_name}</p>
              <p><strong>Status:</strong> {selectedEnrollment.status}</p>
              <p><strong>Total:</strong> ₱{selectedEnrollment.total}</p>
              <hr />
              <p><strong>Created By:</strong> {selectedEnrollment.created_by_name}</p>
              <p><strong>Created Date:</strong> {new Date(selectedEnrollment.creation_date).toLocaleString()}</p>
              <p><strong>Updated By:</strong> {selectedEnrollment.updated_by_name}</p>
              <p><strong>Last Modified:</strong> {new Date(selectedEnrollment.last_modified_date).toLocaleString()}</p>
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
                    `/pdf-reg-form?studentId=${studentId}&programId=${programId}&branch=${branchName}&academicYearStart=${encodeURIComponent(academicYearStart)}`,
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
                    `/pdf-breakdown?programId=${programId}&miscId=${miscId}`,
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
                  const studentName = encodeURIComponent(selectedEnrollment.student_name);
                  const guardianName = encodeURIComponent(selectedEnrollment.guardian_name || "Guardian");
                  const date = encodeURIComponent(new Date().toLocaleDateString());

                  window.open(
                    `/pdf-acknowledgement-consent?studentName=${studentName}&guardianName=${guardianName}&date=${date}`,
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
            className="w-100"
            onClick={() => {
              const studentId = selectedEnrollment.student_id;
              const programId = selectedEnrollment.program_id;
              const branchName = encodeURIComponent(selectedEnrollment.branch);
              const miscId = selectedEnrollment.miscellaneous_group_id;
              const studentName = encodeURIComponent(selectedEnrollment.student_name);
              const guardianName = encodeURIComponent(selectedEnrollment.guardian_name || "Guardian");
              const academicYearStart = selectedEnrollment.academic_year_name?.split(" to ")[0] || "";
              const date = encodeURIComponent(new Date().toLocaleDateString());

              window.open(
                `/pdf-all?studentId=${studentId}&programId=${programId}&branch=${branchName}&miscId=${miscId}&studentName=${studentName}&guardianName=${guardianName}&academicYearStart=${encodeURIComponent(academicYearStart)}&date=${date}`,
                "_blank"
              );
            }}
          >
            All Files
          </Button>
        </Modal.Footer>

 
      </Modal>
    </div>
  );
}
