import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Table, Card, Spinner } from "react-bootstrap";
import html2pdf from "html2pdf.js";

export default function PdfBreakdown() {
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();

  const [program, setProgram] = useState(null);
  const [miscPackage, setMiscPackage] = useState(null);
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const programId = queryParams.get("programId");
  const miscId = queryParams.get("miscId");

  // Fetch program & misc package data
  useEffect(() => {
    console.log(queryParams.get("fileName"))
    const fetchData = async () => {
      try {
        if (!programId) return;

        const resProgram = await fetch(`${API_URL}/summary/findprogram/${programId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const dataProgram = await resProgram.json();
        setProgram(dataProgram);

        if (miscId) {
          const resMisc = await fetch(`${API_URL}/miscellaneous-package/${miscId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const dataMisc = await resMisc.json();
          setMiscPackage(dataMisc);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, programId, miscId]);

  const grandTotal =
    program?.rate && miscPackage?.miscs_total
      ? program.rate + miscPackage.miscs_total
      : program?.rate || null;

  const downloadPdf = () => {
    const element = document.getElementById("pdf-breakdown-content");
    if (!element) return;

    html2pdf()
      .set({
        margin: [10, 0],
        filename: `${queryParams.get("fileName")}_ProgramBreakdown.pdf`,
        pagebreak: { mode: "avoid-all" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        html2canvas: {
          scale: 2,
          useCORS: true,            // 👈 allow cross-origin
          allowTaint: true,         // 👈 handle images without CORS headers
        },
      })
      .from(element)
      .save();
  };

  // Auto-download when data is ready AND DOM has rendered
  useEffect(() => {
    if (program) {
      const timer = setTimeout(() => {
        downloadPdf();
      }, 1500); // 👈 give more time in prod for render

      // setTimeout(() => {
      //   window.close();  // 👈 This will close the tab if it was JS-opened
      // }, 5000);

      return () => clearTimeout(timer);
    }
  }, [program]);


  // Auto-download PDF when program data is ready
  // useEffect(() => {
  //   if (program) {
  //     setTimeout(() => downloadPdf(), 500);
  //   }
  // }, [program]);

  // Show loader while fetching
  if (loading) {
    return (
      <div className="p-4 text-center">
        <Spinner animation="border" /> Loading...
      </div>
    );
  }

  if (!program) {
    return <div className="p-4 text-center">Program not found</div>;
  }

  return (
    <div className="container d-flex justify-content-center my-4">
      <div
        id="pdf-breakdown-content"
        style={{ maxWidth: "600px", width: "50%", margin: "0 auto" }}
        className="shadow-lg border border-2 rounded p-4 mb-5 bg-white"
      >
        <h2 className="my-3 text-center">Program Breakdown</h2>

        {/* Program Table */}
        <Card className="mb-4">
          <Card.Body>
            <h5 className="mb-3">Program</h5>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-end">Price (₱)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{program?.name || "-"}</td>
                  <td className="text-end">{program?.rate.toLocaleString() || 0}</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Misc Package Table */}
        {miscPackage && (
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">
                Miscellaneous
              </h5>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="text-end">Price (₱)</th>
                  </tr>
                </thead>
                <tbody>
                  {miscPackage.miscs?.map((misc) => (
                    <tr key={misc._id}>
                      <td>{misc.name}</td>
                      <td className="text-end">{misc.price.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="fw-bold table-light">
                    <td>Misc Total</td>
                    <td className="text-end">₱{miscPackage.miscs_total.toLocaleString()}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        {/* Grand Total */}
        {grandTotal !== null && (
          <Card bg="light" className="fw-bold fs-5 text-end p-3 mb-3">
            Grand Total: ₱{grandTotal.toLocaleString()}
          </Card>
        )}

        {/* Down Payment */}
        {program?.down_payment !== undefined && (
          <Card bg="light" className="fs-5 text-end mb-3">
            Down Payment: ₱{program.down_payment.toLocaleString()}
          </Card>
        )}

        {/* Monthly Payment */}
        {program?.down_payment !== undefined && grandTotal !== null && (
          <Card bg="light" className="fs-6 text-end">
            Monthly Payment (10 mos): ₱{((grandTotal - program.down_payment) / 10).toLocaleString()}
          </Card>
        )}
      </div>

      {/* Floating Download Button */}
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
        Download PDF
      </button>*/}
    </div>
  );
}
