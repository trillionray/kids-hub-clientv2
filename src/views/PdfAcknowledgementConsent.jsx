import React, { useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";

export default function PdfAcknowledgementConsent() {
  const contentRef = useRef();
  const query = new URLSearchParams(window.location.search);
  // Example dynamic values (can be fetched via API/props later)
  const guardianName = "Juan Dela Cruz";
  const studentName = "Maria Dela Cruz";
  const date = new Date().toLocaleDateString();

  const downloadPdf = () => {
    const element = contentRef.current;
    html2pdf()
      .set({
        margin: [10, 10, 10, 10], // top, right, bottom, left
        filename: `${query.get("fileName")}_AcknowledgementConsent.pdf`,
        pagebreak: { mode: "avoid-all" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  useEffect(() => {
      // Slight delay to ensure DOM is fully rendered
      setTimeout(() => {
        downloadPdf();
      }, 500);
    }, []);


  return (
    <div className="container d-flex justify-content-center my-4">
      {/* Content to export */}
      <div
        ref={contentRef}
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          lineHeight: "1.6",
          backgroundColor: "#fff",
        }}
        className="shadow border rounded"
      >
        {/* First Block */}
        <div style={{ marginBottom: "40px" }}>
          <p
            style={{
              fontSize: "20px",
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Acknowledgement and Consent:
          </p>
          <p>
            I, ___________________________ parent/guardian of
            _____________________________, hereby give permission for my child
            to participate in all class activities associated with the course
            mentioned above. I understand that participation in these activities
            may involve some level of physical activity, and I acknowledge the
            risks associated with such participation. I confirm that my child is
            in good health and able to participate in these activities.
          </p>
          <p>
            I waive any right to bring legal action against the teacher and the
            educational facility for injuries sustained by my child while
            participating in these activities. I also agree to notify the
            teacher immediately of any special medical conditions or concerns
            related to my child.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "30px",
            }}
          >
            <div
              style={{
                width: "60%",
                borderTop: "1px solid #000",
                textAlign: "center",
                paddingTop: "5px",
              }}
            >
              PARENT SIGNATURE OVER PRINTED NAME
            </div>
            <div
              style={{
                width: "30%",
                borderTop: "1px solid #000",
                textAlign: "center",
                paddingTop: "5px",
              }}
            >
              DATE
            </div>
          </div>
        </div>

        {/* Second Block (Dynamic) */}
        <div style={{ marginBottom: "40px" }}>
          <p
            style={{
              fontSize: "20px",
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Acknowledgement and Consent:
          </p>
          <p>
            I, <b>{guardianName}</b> parent/guardian of <b>{studentName}</b>,
            hereby give permission for my child to participate in all class
            activities associated with the course mentioned above.
          </p>
          <p>
            I waive any right to bring legal action against the teacher and the
            educational facility for injuries sustained by my child while
            participating in these activities. I also agree to notify the
            teacher immediately of any special medical conditions or concerns
            related to my child.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "30px",
            }}
          >
            <div
              style={{
                width: "60%",
                borderTop: "1px solid #000",
                textAlign: "center",
                paddingTop: "5px",
              }}
            >
              PARENT SIGNATURE OVER PRINTED NAME
            </div>
            <div
              style={{
                width: "30%",
                borderTop: "1px solid #000",
                textAlign: "center",
                paddingTop: "5px",
              }}
            >
              {date}
            </div>
          </div>
        </div>

        {/* Third Block */}
        <div style={{ marginBottom: "40px" }}>
          <p
            style={{
              fontSize: "20px",
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Acknowledgement and Consent:
          </p>
          <p>
            I, ___________________________ parent/guardian of
            _____________________________, hereby give permission for my child
            to participate in all class activities associated with the course
            mentioned above. I understand that participation in these activities
            may involve some level of physical activity, and I acknowledge the
            risks associated with such participation. I confirm that my child is
            in good health and able to participate in these activities.
          </p>
          <p>
            I waive any right to bring legal action against the teacher and the
            educational facility for injuries sustained by my child while
            participating in these activities. I also agree to notify the
            teacher immediately of any special medical conditions or concerns
            related to my child.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "30px",
            }}
          >
            <div
              style={{
                width: "60%",
                borderTop: "1px solid #000",
                textAlign: "center",
                paddingTop: "5px",
              }}
            >
              PARENT SIGNATURE OVER PRINTED NAME
            </div>
            <div
              style={{
                width: "30%",
                borderTop: "1px solid #000",
                textAlign: "center",
                paddingTop: "5px",
              }}
            >
              DATE
            </div>
          </div>
        </div>
      </div>

      {/* Floating Download Button */}
      <button
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
}
