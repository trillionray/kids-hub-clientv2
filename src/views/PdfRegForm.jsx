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

    const opt = {
      margin: 10,
      filename: "Enrollment_Form.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 1, useCORS: true, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    await html2pdf().set(opt).from(element).save();

    if (btn) btn.style.display = "block";
  };


  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!student) return <p>Loading...</p>;

  return (
    <div
      style={{
        width: "794px",  // EXACT A4 width in px at 96dpi
        minHeight: "1123px", // A4 height in px
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        margin: "0 auto",
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
        <div style={{ border: "1px solid #000", padding: "10px", marginBottom: "10px", pageBreakInside: "avoid", fontSize: "12px" }}>
        <div style={{ fontWeight: "bold", textDecoration: "underline", marginBottom: "10px", fontSize: "11px" }}>STUDENT'S DETAILS</div>
        
        {/* TWO-COLUMN LAYOUT */}
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          
          {/* LEFT COLUMN (NAME + ADDRESS) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
            
            {/* NAME OF THE CHILD */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ fontWeight: "bold", marginRight: "5px", fontSize: "10px" }}>NAME OF THE CHILD:</div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", borderBottom: "1px solid #000", paddingBottom: "1px", gap: "3px" }}>
                  <span style={{ flex: 1, textAlign: "center" }}>{student.last_name}</span>
                  <span style={{ flex: 1, textAlign: "center" }}>{student.first_name}</span>
                  <span style={{ flex: 1, textAlign: "center" }}>{student.middle_name}</span>
                </div>
                <div style={{ display: "flex", marginTop: "1px", fontSize: "8px", color: "#555", letterSpacing: "1px", gap: "3px" }}>
                  <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Last Name</span>
                  <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>First Name</span>
                  <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Middle Name</span>
                </div>
              </div>
            </div>

            {/* COMPLETE ADDRESS */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ fontWeight: "bold", marginRight: "5px", fontSize: "10px" }}>COMPLETE ADDRESS:</div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", borderBottom: "1px solid #000", paddingBottom: "1px", gap: "5px" }}>
                  <span style={{ flex: 1, textAlign: "center" }}>{student.address?.block_or_lot || ""}</span>
                  <span style={{ flex: 1, textAlign: "center" }}>{student.address?.street || ""}</span>
                  <span style={{ flex: 1, textAlign: "center" }}>{student.address?.barangay || ""}</span>
                  <span style={{ flex: 1, textAlign: "center" }}>{student.address?.municipality_or_city || ""}</span>
                </div>
                <div style={{ display: "flex", marginTop: "1px", fontSize: "8px", color: "#555", letterSpacing: "1px", gap: "5px" }}>
                  <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Blk/Lot</span>
                  <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Street</span>
                  <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Brgy.</span>
                  <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Municipality/City</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (AGE, DOB, PROGRAM) */}
          <div style={{ width: "250px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ fontWeight: "bold", marginRight: "5px", whiteSpace: "nowrap", fontSize: "10px" }}>AGE:</div>
              <div style={{ flex: 1, borderBottom: "1px solid #000", paddingBottom: "1px", textAlign: "center" }}>{computeAge(student.birthdate)}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ fontWeight: "bold", marginRight: "5px", whiteSpace: "nowrap", fontSize: "10px" }}>DATE OF BIRTH:</div>
              <div style={{ flex: 1, borderBottom: "1px solid #000", paddingBottom: "1px", textAlign: "center" }}>{student.birthdate || ""}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ fontWeight: "bold", marginRight: "5px", whiteSpace: "nowrap", fontSize: "10px" }}>PROGRAM:</div>
              <div style={{ flex: 1, borderBottom: "1px solid #000", paddingBottom: "1px", textAlign: "center" }}>{student.program || ""}</div>
            </div>
          </div>
        </div>
        </div>

        {/* PARENT'S DETAILS */}
        <div style={{ border: "1px solid #000", padding: "10px", marginBottom: "10px", pageBreakInside: "avoid", fontSize: "12px" }}>
            <div style={{ fontWeight: "bold", textDecoration: "underline", marginBottom: "10px", fontSize: "11px" }}>PARENT'S DETAILS</div>

            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              {/* LEFT SIDE: Names + Addresses */}
              <div style={{ flex: "0 0 66%", display: "flex", flexDirection: "column", gap: "10px" }}>
                
                {/* NAME OF THE MOTHER */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ fontWeight: "bold", marginRight: "5px", whiteSpace: "nowrap", fontSize: "10px" }}>NAME OF MOTHER:</div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #000", paddingBottom: "1px", gap: "5px" }}>
                      <span style={{ flex: 1, textAlign: "center" }}>{student.mother?.last_name || ""}</span>
                      <span style={{ flex: 1, textAlign: "center" }}>{student.mother?.first_name || ""}</span>
                      <span style={{ flex: 1, textAlign: "center" }}>{student.mother?.middle_name || ""}</span>
                    </div>
                    <div style={{ display: "flex", marginTop: "1px", fontSize: "8px", color: "#555", letterSpacing: "1px", gap: "5px" }}>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Last Name</span>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>First Name</span>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Middle Name</span>
                    </div>
                  </div>
                </div>

                {/* COMPLETE ADDRESS MOTHER */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ fontWeight: "bold", marginRight: "5px", whiteSpace: "nowrap", fontSize: "10px" }}>COMPLETE ADDRESS:</div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #000", paddingBottom: "1px", gap: "5px" }}>
                      <span style={{ flex: 1, textAlign: "center" }}>{student.mother?.address?.block_or_lot || ""}</span>
                      <span style={{ flex: 1, textAlign: "center" }}>{student.mother?.address?.street || ""}</span>
                      <span style={{ flex: 1, textAlign: "center" }}>{student.mother?.address?.barangay || ""}</span>
                      <span style={{ flex: 1, textAlign: "center" }}>{student.mother?.address?.municipality_or_city || ""}</span>
                    </div>
                    <div style={{ display: "flex", marginTop: "1px", fontSize: "8px", color: "#555", letterSpacing: "1px", gap: "5px" }}>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Blk/Lot</span>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Street</span>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Brgy.</span>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Municipality/City</span>
                    </div>
                  </div>
                </div>

                {/* NAME OF THE FATHER */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ fontWeight: "bold", marginRight: "5px", whiteSpace: "nowrap", fontSize: "10px" }}>NAME OF FATHER:</div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #000", paddingBottom: "1px", gap: "5px" }}>
                      <span style={{ flex: 1, textAlign: "center" }}>{student.father?.last_name || ""}</span>
                      <span style={{ flex: 1, textAlign: "center" }}>{student.father?.first_name || ""}</span>
                      <span style={{ flex: 1, textAlign: "center" }}>{student.father?.middle_name || ""}</span>
                    </div>
                    <div style={{ display: "flex", marginTop: "1px", fontSize: "8px", color: "#555", letterSpacing: "1px", gap: "5px" }}>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Last Name</span>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>First Name</span>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Middle Name</span>
                    </div>
                  </div>
                </div>

                {/* COMPLETE ADDRESS FATHER */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ fontWeight: "bold", marginRight: "5px", whiteSpace: "nowrap", fontSize: "10px" }}>COMPLETE ADDRESS:</div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #000", paddingBottom: "1px", gap: "5px" }}>
                      <span style={{ flex: 1, textAlign: "center" }}>{student.father?.address?.block_or_lot || ""}</span>
                      <span style={{ flex: 1, textAlign: "center" }}>{student.father?.address?.street || ""}</span>
                      <span style={{ flex: 1, textAlign: "center" }}>{student.father?.address?.barangay || ""}</span>
                      <span style={{ flex: 1, textAlign: "center" }}>{student.father?.address?.municipality_or_city || ""}</span>
                    </div>
                    <div style={{ display: "flex", marginTop: "1px", fontSize: "8px", color: "#555", letterSpacing: "1px", gap: "5px" }}>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Blk/Lot</span>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Street</span>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Brgy.</span>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Municipality/City</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (Occupation, Contact, FB) */}
              <div style={{ width: "250px", display: "flex", flexDirection: "column", gap: "8px", marginTop:"8px" }}>
                {[
                  { label: "OCCUPATION", value: student.mother?.occupation },
                  { label: "CONTACT NUMBER", value: student.mother?.contacts?.mobile_number },
                  { label: "FB ACCOUNT", value: student.mother?.contacts?.messenger_account },
                  { label: "OCCUPATION", value: student.father?.occupation },
                  { label: "CONTACT NUMBER", value: student.father?.contacts?.mobile_number },
                  { label: "FB ACCOUNT", value: student.father?.contacts?.messenger_account },
                ].map((item, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ fontWeight: "bold", marginRight: "5px", whiteSpace: "nowrap", fontSize: "10px" }}>{item.label}:</div>
                    <div style={{ flex: 1, borderBottom: "1px solid #000", paddingBottom: "1px", textAlign: "center" }}>{item.value || ""}</div>
                  </div>
                ))}
              </div>
            </div>
        </div>

        {/* EMERGENCY CONTACT */}
        <div style={{ border: "1px solid #000", padding: "10px", marginBottom: "10px", pageBreakInside: "avoid", fontSize: "12px" }}>
          <div style={{ fontWeight: "bold", textDecoration: "underline", marginBottom: "10px", fontSize: "11px" }}>EMERGENCY CONTACT DETAILS</div>
          
          {/* TWO-COLUMN LAYOUT */}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            
            {/* LEFT COLUMN (NAME + ADDRESS) */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
              
              {/* NAME OF THE CHILD */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontWeight: "bold", marginRight: "5px", fontSize: "10px" }}>NAME OF CONTACT PERSON:</div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", borderBottom: "1px solid #000", paddingBottom: "1px", gap: "3px" }}>
                    <span style={{ flex: 1, textAlign: "center" }}>{student.emergency?.last_name || ""}</span>
                    <span style={{ flex: 1, textAlign: "center" }}>{student.emergency?.first_name || ""}</span>
                    <span style={{ flex: 1, textAlign: "center" }}>{student.emergency?.middle_name || ""}</span>
                  </div>
                  <div style={{ display: "flex", marginTop: "1px", fontSize: "8px", color: "#555", letterSpacing: "1px", gap: "3px" }}>
                    <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Last Name</span>
                    <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>First Name</span>
                    <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Middle Name</span>
                  </div>
                </div>
              </div>

              {/* COMPLETE ADDRESS */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontWeight: "bold", marginRight: "5px", fontSize: "10px" }}>COMPLETE ADDRESS:</div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", borderBottom: "1px solid #000", paddingBottom: "1px", gap: "5px" }}>
                    <span style={{ flex: 1, textAlign: "center" }}>{student.emergency?.address.block_or_lot || ""}</span>
                    <span style={{ flex: 1, textAlign: "center" }}>{student.emergency?.address.street || ""}</span>
                    <span style={{ flex: 1, textAlign: "center" }}>{student.emergency?.address.barangay || ""}</span>
                    <span style={{ flex: 1, textAlign: "center" }}>{student.emergency?.address.municipality_or_city || ""}</span>
                  </div>
                  <div style={{ display: "flex", marginTop: "1px", fontSize: "8px", color: "#555", letterSpacing: "1px", gap: "5px" }}>
                    <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Blk/Lot</span>
                    <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Street</span>
                    <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Brgy.</span>
                    <span style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Municipality/City</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (AGE, DOB, PROGRAM) */}
            <div style={{ width: "250px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontWeight: "bold", marginRight: "5px", whiteSpace: "nowrap", fontSize: "10px" }}>OCCUPATION:</div>
                <div style={{ flex: 1, borderBottom: "1px solid #000", paddingBottom: "1px", textAlign: "center" }}>{student.emergency?.occupation || ""}</div>
              </div>

              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontWeight: "bold", marginRight: "5px", whiteSpace: "nowrap", fontSize: "10px" }}>CONTACT NUMBER:</div>
                <div style={{ flex: 1, borderBottom: "1px solid #000", paddingBottom: "1px", textAlign: "center" }}>{student.emergency?.contacts.mobile_number || ""}</div>
              </div>

              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontWeight: "bold", marginRight: "5px", whiteSpace: "nowrap", fontSize: "10px" }}>FB ACCOUNT:</div>
                <div style={{ flex: 1, borderBottom: "1px solid #000", paddingBottom: "1px", textAlign: "center" }}>{student.emergency?.contacts.messenger_account || ""}</div>
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
