import React, { useEffect, useState } from "react";
// import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas"; // ✅ Add this

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
      console.log(data)
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
    console.log("Raw birthdate:", birthdate);
    console.log("Academic year start:", academicYearStart);

    if (!birthdate) return "";

    const birth = new Date(birthdate);
    if (isNaN(birth)) {
      console.warn("Invalid birthdate format:", birthdate);
      return "";
    }

    let refDate = academicYearStart ? new Date(academicYearStart) : new Date();
    if (isNaN(refDate)) {
      console.warn("Invalid academicYearStart format:", academicYearStart);
      refDate = new Date();
    }

    let age = refDate.getFullYear() - birth.getFullYear();
    const m = refDate.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && refDate.getDate() < birth.getDate())) age--;

    return age;
  };


  const downloadPdf = async () => {
    const element = document.getElementById("pdf-content");
    const btn = document.getElementById("download-btn");

    if (!element) return;
    if (btn) btn.style.display = "none";

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgAspect = imgProps.width / imgProps.height;

      const margin = 5; // left/right margins
      const gap = 2;    // vertical gap between copies

      // Maximum height per copy (half page minus gap and margins)
      const maxCopyHeight = (pageHeight - 2 * margin - gap) / 2;

      let copyHeight = maxCopyHeight;
      let copyWidth = copyHeight * imgAspect;

      // If width exceeds page, scale down to fit width
      if (copyWidth > pageWidth - 2 * margin) {
        copyWidth = pageWidth - 2 * margin;
        copyHeight = copyWidth / imgAspect;
      }

      const xOffset = (pageWidth - copyWidth) / 2;

      // First copy
      let yOffset = margin;
      pdf.addImage(imgData, "PNG", xOffset, yOffset, copyWidth, copyHeight);
      pdf.setLineWidth(0.5);
      pdf.rect(xOffset, yOffset, copyWidth, copyHeight);

      // Second copy
      yOffset = copyHeight + margin + gap;
      pdf.addImage(imgData, "PNG", xOffset, yOffset, copyWidth, copyHeight);
      pdf.rect(xOffset, yOffset, copyWidth, copyHeight);

      pdf.save(`${query.get("fileName")}_EnrollmentForm.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      if (btn) btn.style.display = "block";
    }
  };


  useEffect(() => {
    if (student) {
      // slight delay to ensure DOM is fully rendered
      setTimeout(() => {
        downloadPdf();
      }, 500);
    }
  }, [student]);















  const formatDateToWords = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };





  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!student) return <p>Loading...</p>;

  return (
    <div
      style={{
        width: "794px",  // EXACT A4 width in px at 96dpi
        minHeight: "1123px", // A4 height in px
        fontFamily: "'Century Gothic', CenturyGothic, AppleGothic, sans-serif",
        fontSize: "12px",
        margin: "0 auto",
      }}
    >
      <div id="pdf-content">
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0px" }}>
          <div style={{ marginRight: "20px" }}>
            <img src={`${window.location.origin}/logo.png`} crossOrigin="anonymous" alt="KidsHub Logo" className="rounded-circle" style={{ width: "80px" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <h4 className="fw-bolder" >KidsHub Playschool and Learning Center</h4>
            {branch ? (
              <p className="p-0 m-0" style={{ fontSize: "12px"}}>
                {branch.address}<br />
                CALL: {branch.contact_number} | EMAIL: {branch.email}
              </p>
            ) : (
              <p>Loading branch info...</p>
            )}
            
          </div>
        </div>

        <h4 className="text-center fw-bolder" style={{ marginTop: "0px"}}>ENROLLMENT FORM</h4>

        {/* STUDENT DETAILS */}
        <div style={{ border: "1px solid #000", padding: "5px", marginBottom: "5px", pageBreakInside: "avoid", fontSize: "12px" }}>
        <div style={{ fontWeight: "bold", textDecoration: "underline", marginBottom: "0px", fontSize: "11px" }}>STUDENT'S DETAILS</div>
        
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
                <div
                  style={{
                    display: "flex",
                    borderBottom: "1px solid #000",
                    paddingBottom: "1px",
                    gap: "5px",
                    alignItems: "flex-end", // ✅ align text to bottom
                  }}
                >
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
              <div style={{ flex: 1, borderBottom: "1px solid #000", paddingBottom: "1px", textAlign: "center" }}>{formatDateToWords(student.birthdate)}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ fontWeight: "bold", marginRight: "5px", whiteSpace: "nowrap", fontSize: "10px" }}>PROGRAM:</div>
              <div style={{ flex: 1, borderBottom: "1px solid #000", paddingBottom: "1px", textAlign: "center" }}>{program?.name || ""}</div>
            </div>
          </div>
        </div>
        </div>

        {/* PARENT'S DETAILS */}
        <div style={{ border: "1px solid #000", padding: "5px", marginBottom: "5px", pageBreakInside: "avoid", fontSize: "12px" }}>
            <div style={{ fontWeight: "bold", textDecoration: "underline", marginBottom: "0px", fontSize: "11px" }}>PARENT'S DETAILS</div>

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
                  <div style={{ fontWeight: "bold", marginRight: "5px", whiteSpace: "nowrap", fontSize: "10px", alignItems: "flex-end" }}>COMPLETE ADDRESS:</div>
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
                  <div style={{ fontWeight: "bold", marginRight: "5px", whiteSpace: "nowrap", fontSize: "10px", alignItems: "flex-end" }}>COMPLETE ADDRESS:</div>
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
        <div style={{ border: "1px solid #000", padding: "5px", marginBottom: "5px", pageBreakInside: "avoid", fontSize: "12px" }}>
          <div style={{ fontWeight: "bold", textDecoration: "underline", marginBottom: "0px", fontSize: "11px" }}>EMERGENCY CONTACT DETAILS</div>
          
          {/* TWO-COLUMN LAYOUT */}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            
            {/* LEFT COLUMN (NAME + ADDRESS) */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
              
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontWeight: "bold", marginRight: "5px", fontSize: "10px" }}>NAME OF CONTACT PERSON:</div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", borderBottom: "1px solid #000", paddingBottom: "1px", gap: "3px"}}>
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
                  <div style={{ display: "flex", borderBottom: "1px solid #000", paddingBottom: "1px", gap: "5px", alignItems: "flex-end" }}>
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
        <div className="footer ps-2" style={{ marginTop: "5px", pageBreakInside: "avoid" }}>
          <p>
            I hereby understand the <u className="fw-bolder">NO REFUND POLICY</u> of any deposits made upon enrollment. 
          </p>
          <div style={{ textAlign: "right", marginTop: "-30px"}} className="pe-2">
            __________________________________
          </div>
          <div style={{ textAlign: "right" }} className="pe-2">
            <p>Signature Over Printed Name</p>
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
