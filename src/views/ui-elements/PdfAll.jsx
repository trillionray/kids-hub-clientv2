import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import html2pdf from "html2pdf.js";
import PdfRegForm from "./PdfRegForm.jsx";
import PdfBreakdown from "./PdfBreakdown.jsx";
import PdfAcknowledgementConsent from "./PdfAcknowledgementConsent.jsx";

export default function PdfAll() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  // Reconstruct enrollment object from query params
  const enrollment = {
    student_id: query.get("studentId"),
    program_id: query.get("programId"),
    branch: query.get("branch"),
    academic_year_name: query.get("academicYearStart"),
    student_name: query.get("studentName"),
    guardian_name: query.get("guardianName"),
    misc_package_name: query.get("miscId"),
    date: query.get("date"),
  };

  useEffect(() => {
    const element = document.getElementById("combined-pdf");
    if (!element) return;

    html2pdf()
      .set({
        margin: 10,
        filename: `${enrollment.student_name}-all.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save()
      .then(() => {
        window.close(); // close tab automatically after download
      });
  }, []);

  return (
    <div id="combined-pdf">
      <PdfRegForm enrollment={enrollment} />
      <PdfBreakdown enrollment={enrollment} />
      <PdfAcknowledgementConsent enrollment={enrollment} />
    </div>
  );
}
