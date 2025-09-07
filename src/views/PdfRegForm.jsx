import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";

const PdfRegForm = () => {
  const query = new URLSearchParams(window.location.search);
  const studentId = query.get("studentId");
  const programId = query.get("programId");
  const branchName = query.get("branch"); 
  const academicYearStart = query.get("academicYearStart"); 
  
  const [program, setProgram] = useState(null);
  const [student, setStudent] = useState(null);
  const [branch, setBranch] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (studentId) fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/students/get-student-by-id/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Student not found or unauthorized");
      const data = await res.json();
      setStudent(data);

      const programRes = await fetch(`${import.meta.env.VITE_API_URL}/summary/findprogram/${programId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (programRes.ok) {
        const programData = await programRes.json();
        setProgram(programData);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch student");
    }
  };

  useEffect(() => {
    if (branchName) fetchBranch(branchName);
  }, [branchName]);

  const fetchBranch = async (name) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/branches/findByName/${encodeURIComponent(name)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Branch not found");
      const data = await res.json();
      setBranch(data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatName = (person) => {
    if (!person) return "";
    return `${person.last_name || ""}, ${person.first_name || ""} ${person.middle_name || ""}`.trim();
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.block_or_lot || ""} ${address.street || ""} ${address.barangay || ""} ${address.municipality_or_city || ""}`.trim();
  };

  const computeAge = (birthdate) => {
    if (!birthdate) return "";
    const birth = new Date(birthdate);
    let refDate = academicYearStart ? new Date(academicYearStart) : new Date();
    let age = refDate.getFullYear() - birth.getFullYear();
    const m = refDate.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && refDate.getDate() < birth.getDate())) age--;
    return age;
  };

  const downloadPdf = async () => {
    const element = document.getElementById("pdf-content");
    const btn = document.getElementById("download-btn");
    if (btn) btn.style.display = "none";

    try {
      await html2pdf()
        .set({
          margin: 10,
          filename: "Enrollment_Form.pdf",
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          html2canvas: { scale: 2, useCORS: true, scrollY: 0, windowWidth: element.scrollWidth },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(element)
        .save();
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      if (btn) btn.style.display = "block";
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!student) return <p>Loading...</p>;

  return (
    <div
      style={{
        margin: "20px auto",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        maxWidth: "210mm", // A4 width
      }}
    >
      <div id="pdf-content">
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{ marginRight: "20px" }}>
            <img src="logo.png" crossOrigin="anonymous" alt="KidsHub Logo" style={{ width: "120px" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <h2>KidsHub Playschool and Learning Center</h2>
            {branch ? (
              <p>
                {branch.address}<br />
                CALL: {branch.contact_number} | EMAIL: {branch.email}
              </p>
            ) : (
              <p>Loading branch info...</p>
            )}
            <h1>ENROLLMENT FORM</h1>
          </div>
        </div>

        {/* STUDENT DETAILS */}
        <div style={{ border: "1px solid #000", padding: "15px", marginBottom: "15px", pageBreakInside: "avoid" }}>
          <div style={{ fontWeight: "bold", textDecoration: "underline", marginBottom: "20px" }}>STUDENT'S DETAILS</div>
          <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "10px" }}>
            <div style={{ flex: 3, marginRight: "10px" }}>
              <div style={{ fontWeight: "bold", marginBottom: "6px" }}>NAME OF THE CHILD:
                <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "100%" }}>
                  {formatName(student)}
                </span>
              </div>
              <div style={{ fontWeight: "bold", marginBottom: "6px" }}>COMPLETE ADDRESS:
                <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "100%" }}>
                  {formatAddress(student.address)}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingLeft: "20px" }}>
              <div style={{ fontWeight: "bold" }}>AGE:
                <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "89%" }}>
                  {computeAge(student.birthdate)}
                </span>
              </div>
              <div style={{ fontWeight: "bold" }}>DATE OF BIRTH:
                <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "72%" }}>
                  {student.birthdate || ""}
                </span>
              </div>
              <div style={{ fontWeight: "bold" }}>PROGRAM:
                <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "79%" }}>
                  {program?.name || ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PARENTS DETAILS */}
        <div style={{ border: "1px solid #000", padding: "15px", marginBottom: "15px", pageBreakInside: "avoid" }}>
          <div style={{ fontWeight: "bold", textDecoration: "underline", marginBottom: "20px" }}>PARENTS DETAILS</div>
          {/* Father */}
          <div style={{ marginBottom: "10px" }}>
            <div style={{ fontWeight: "bold" }}>FATHER’S NAME:
              <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "80%" }}>
                {formatName(student.father)}
              </span>
            </div>
            <div style={{ fontWeight: "bold" }}>OCCUPATION:
              <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "70%" }}>
                {student.father?.occupation || ""}
              </span>
            </div>
            <div style={{ fontWeight: "bold" }}>CONTACT NUMBER:
              <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "70%" }}>
                {student.father?.contacts?.mobile_number || ""}
              </span>
            </div>
          </div>

          {/* Mother */}
          <div style={{ marginBottom: "10px" }}>
            <div style={{ fontWeight: "bold" }}>MOTHER’S NAME:
              <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "80%" }}>
                {formatName(student.mother)}
              </span>
            </div>
            <div style={{ fontWeight: "bold" }}>OCCUPATION:
              <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "70%" }}>
                {student.mother?.occupation || ""}
              </span>
            </div>
            <div style={{ fontWeight: "bold" }}>CONTACT NUMBER:
              <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "70%" }}>
                {student.mother?.contacts?.mobile_number || ""}
              </span>
            </div>
          </div>
        </div>

        {/* EMERGENCY CONTACT */}
        <div style={{ border: "1px solid #000", padding: "15px", marginBottom: "15px", pageBreakInside: "avoid" }}>
          <div style={{ fontWeight: "bold", textDecoration: "underline", marginBottom: "20px" }}>EMERGENCY CONTACT DETAILS</div>
          <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "10px" }}>
            <div style={{ flex: 3, marginRight: "10px" }}>
              <div style={{ fontWeight: "bold", marginBottom: "6px" }}>NAME OF CONTACT PERSON:
                <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "100%" }}>
                  {formatName(student.emergency)}
                </span>
              </div>
              <div style={{ fontWeight: "bold", marginBottom: "6px" }}>COMPLETE ADDRESS:
                <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "100%" }}>
                  {formatAddress(student.emergency?.address)}
                </span>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontWeight: "bold" }}>OCCUPATION:
                <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "75%" }}>
                  {student.emergency?.occupation || ""}
                </span>
              </div>
              <div style={{ fontWeight: "bold" }}>CONTACT NUMBER:
                <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "66%" }}>
                  {student.emergency?.contacts?.mobile_number || ""}
                </span>
              </div>
              <div style={{ fontWeight: "bold" }}>MESSENGER ACCOUNT:
                <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: "59%" }}>
                  {student.emergency?.contacts?.messenger_account || ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="footer" style={{ marginTop: "30px", pageBreakInside: "avoid" }}>
          <p>
            I hereby understand the <u>NO REFUND POLICY</u> of any deposits made upon enrollment.
          </p>
          <div className="signature">
            <p>_________________________</p>
            <p>Parent's/Guardian's Signature Over Printed Name</p>
          </div>
        </div>
      </div>

      {/* DOWNLOAD BUTTON */}
      <button
        id="download-btn"
        onClick={downloadPdf}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "12px 20px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        Download PDF
      </button>
    </div>
  );
};

export default PdfRegForm;
