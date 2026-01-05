import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Table, Card, Spinner } from "react-bootstrap";
import html2pdf from "html2pdf.js";

export default function PdfBreakdown() {
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();

  const [program, setProgram] = useState(null);
  const [miscPackage, setMiscPackage] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const programId = queryParams.get("programId");
  const miscId = queryParams.get("miscId");
  const discountId = queryParams.get("discountId"); // NEW

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!programId) return;

        const resProgram = await fetch(`${API_URL}/summary/findprogram/${programId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const dataProgram = await resProgram.json();
        console.log(dataProgram)
        setProgram(dataProgram);

        if (miscId != "undefined") {
          const resMisc = await fetch(`${API_URL}/miscellaneous-package/${miscId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const dataMisc = await resMisc.json();
          setMiscPackage(dataMisc);
        }

        if (discountId) {
          const resDiscount = await fetch(`${API_URL}/discounts/${discountId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const dataDiscount = await resDiscount.json();
          console.log(dataDiscount)
          setDiscount(dataDiscount.data);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, programId, miscId, discountId]);

  // Compute base total
  const baseTotal =
    program?.rate && miscPackage?.miscs_total
      ? program.rate + miscPackage.miscs_total
      : program?.rate || 0;

  // Apply discount if present
  const discountedAmount = discount ? (program.rate * (discount.percentage / 100)) : 0;
  const grandTotal = baseTotal - discountedAmount;

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
          useCORS: true,
          allowTaint: true,
        },
      })
      .from(element)
      .save();
  };

  useEffect(() => {
    if (program) {
      const timer = setTimeout(() => {
        downloadPdf();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [program]);

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
                {/*<tr>
                  <th>Item</th>
                  <th className="text-end">Price (₱)</th>
                </tr>*/}
              </thead>
              <tbody>
                <tr>
                  <td>{program?.name || "-"}</td>
                  <td className="text-end">{program?.rate.toLocaleString()}</td>
                </tr>


              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Misc Package Table */}
        {miscPackage && (
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">Miscellaneous</h5>
              <Table striped bordered hover size="sm">
                <thead>
                  {/*<tr>
                    <th>Item</th>
                    <th className="text-end">Price (₱)</th>
                  </tr>*/}
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

        {/* Discount Section */}
        {discount && (

          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">Discount</h5>

              <Table striped bordered hover size="sm">
                <tbody>
                  <tr>
                    <td>{discount.discount_name} ({discount.percentage}%)</td>
                    <td className="text-end">-₱{discountedAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>

        )}

        {/* Grand Total */}
        <Card bg="light" className="fw-bold fs-5 text-end p-3 mb-3">
          Grand Total: ₱{grandTotal.toLocaleString()}
        </Card>


      {/* 

          {program?.initial_evaluation_price !== undefined && program.category !== "long" && (
            <Card bg="light" className="fs-5 text-end mb-3">
             Initial Evaluation: ₱{Number(program.initial_evaluation_price).toLocaleString()}
            </Card>
          )}
          
      */}

        {/* Down Payment */}
        {program?.down_payment !== undefined && (
          <Card bg="light" className="fs-5 text-end mb-3">
            Down Payment: ₱{program.down_payment.toLocaleString()}
          </Card>
        )}

       
        {/* Monthly Payment */}
        {program?.down_payment !== undefined && (
          <Card bg="light" className="fs-6 text-end">
            Monthly Payment (10 mos): ₱{((grandTotal - program.down_payment) / 10).toLocaleString()}
          </Card>
        )}
      </div>
    </div>
  );
}
