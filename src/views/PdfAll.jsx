import React, { useRef } from "react";
import PdfRegForm from "./PdfRegForm.jsx";
import PdfBreakdown from "./PdfBreakdown.jsx";
import PdfAcknowledgementConsent from "./PdfAcknowledgementConsent.jsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PdfAll() {
  const combinedRef = useRef();

  const downloadPdf = async () => {
    const element = combinedRef.current;
    if (!element) return;

    try {
      // Render the whole div as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY, // avoid cropping
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgAspect = imgProps.width / imgProps.height;

      let height = pageHeight;
      let width = height * imgAspect;

      if (width > pageWidth) {
        width = pageWidth;
        height = width / imgAspect;
      }

      pdf.addImage(imgData, "PNG", (pageWidth - width) / 2, 0, width, height);
      pdf.save("Full_Enrollment_PDF.pdf");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div ref={combinedRef} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ margin: 0, padding: 0 }}>
          <PdfRegForm />
        </div>
        <div style={{ marginTop: "-500px", padding: 0 }}>
          <PdfBreakdown />
        </div>
        <div style={{ margin: 0, padding: 0 }}>
          <PdfAcknowledgementConsent />
        </div>
      </div>


      {/*<button
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
        Download Full PDF
      </button>*/}
    </div>
  );
}
