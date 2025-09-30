import React, { useRef, useState, useEffect } from "react";
import PdfRegForm from "./PdfRegForm.jsx";
import PdfBreakdown from "./PdfBreakdown.jsx";
import PdfAcknowledgementConsent from "./PdfAcknowledgementConsent.jsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";

export default function PdfAll() {
  const combinedRef = useRef();
  const [contentReady, setContentReady] = useState(false);

  // ✅ Mark content as ready after all components have rendered
  useEffect(() => {
    // Let the browser finish rendering first
    const timer = setTimeout(() => {
      setContentReady(true);
    }, 300); // small delay ensures children fully render

    return () => clearTimeout(timer);
  }, []);

  // ✅ Show Swal only after content is ready
  useEffect(() => {
    if (contentReady) {
      Swal.fire({
        title: "Downloading",
        text: "This page will automatically close",
        icon: "info",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      }).then((result) => {
        // if (result.isConfirmed) {
        //   window.close();
        // }
      });
    }

    setTimeout(() => {
        window.close();  // 👈 This will close the tab if it was JS-opened
      }, 10000);


  }, [contentReady]);

  const downloadPdf = async () => {
    const element = combinedRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
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
      <div
        ref={combinedRef}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
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
    </div>
  );
}
