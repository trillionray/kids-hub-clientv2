import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Notyf } from "notyf";
import { Spinner, Button, Modal } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

export default function TuitionFees() {
  const [tuitionFees, setTuitionFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTuition, setSelectedTuition] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();

  const fetchTuitionFees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tuition-fees`);
      const data = await res.json();
      console.log(data)
      if (Array.isArray(data)) {
        setTuitionFees(data);
      } else {
        notyf.error(data.message || "Error fetching tuition fees");
      }
    } catch {
      notyf.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const generateTuition = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tuition-fees/generate-tuition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      notyf.success(`${data.created_count} data added.`);
      fetchTuitionFees();
    } catch (err) {
      notyf.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredFees = tuitionFees.filter(
    (t) =>
      t.enrollment_id?._id?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      t.total_tuition_fee.toString().includes(globalSearch) ||
      t.recurring_fee.toString().includes(globalSearch) ||
      t.total_amount_paid.toString().includes(globalSearch)
  );

  const columns = [
    {
      id: "enrollment",
      name: "Enrollment ID",
      selector: (row) => row.enrollment_id?._id || row.enrollment_id,
      sortable: true,
      center: true,
    },
    {
      id: "student",
      name: "Student ID",
      selector: (row) => row.enrollment_id.student_id?._id || row.student_id,
      sortable: true,
      center: true,
    },
    {
      id: "student",
      name: "Student Name",
      selector: (row) => (row.enrollment_id.student_id.first_name + " " + row.enrollment_id.student_id.middle_name + " " + row.enrollment_id.student_id.last_name) || row.student_id,
      sortable: true,
      center: true,
    },
    {
      id: "total",
      name: "Total Tuition",
      selector: (row) => row.total_tuition_fee,
      sortable: true,
      center: true,
    },
    // {
    //   id: "recurring",
    //   name: "Recurring Fee",
    //   selector: (row) => row.recurring_fee,
    //   sortable: true,
    //   center: true,
    // },
    {
      id: "paid",
      name: "Total Paid",
      selector: (row) => row.total_amount_paid,
      sortable: true,
      center: true,
    },
    // {
    //   id: "due",
    //   name: "Due Date",
    //   selector: (row) => row.due_date,
    //   sortable: true,
    //   center: true,
    // },
    {
      id: "actions",
      name: "Actions",
      cell: (row) => (
        <div className="text-center">
          <Button
            size="sm"
            onClick={() => {
              setSelectedTuition(row);
              setShowModal(true);
            }}
            style={{ border: "none", padding: "0.25rem" }}
          >
            <FeatherIcon icon="info" />
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      center: true,
    },
  ];

  useEffect(() => {
  	generateTuition();
    fetchTuitionFees();
  }, []);

  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: "20px" }}>
      <h3 className="text-white">FEES</h3>
      <div className="container border mt-2 p-4 rounded shadow" style={{ backgroundColor: "#fff" }}>
        <div className="d-flex justify-content-between mb-3">
          {/*<Button variant="primary" onClick={generateTuition} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Generate Tuition"}
          </Button>*/}

          <input
            type="text"
            className="form-control"
            style={{ maxWidth: "250px" }}
            placeholder="Search..."
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <Spinner animation="border" />
        ) : (
          <DataTable
            columns={columns}
            data={filteredFees}
            pagination
            highlightOnHover
            striped
            dense
            responsive
            noDataComponent="No tuition fees found"
            customStyles={{
              table: {
                style: { borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
              },
              headRow: { style: { backgroundColor: "#f8f9fa", fontWeight: "bold", textAlign: "center" } },
              headCells: { style: { justifyContent: "center", textAlign: "center" } },
              rows: { style: { textAlign: "center" } },
              cells: { style: { justifyContent: "center", textAlign: "center" } },
              pagination: { style: { justifyContent: "center" } },
            }}
          />
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Tuition Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedTuition ? (
              <div>
                <p><strong>ID:</strong> {selectedTuition._id}</p>
                <p><strong>Enrollment ID:</strong> {selectedTuition.enrollment_id?._id}</p>
                <p><strong>Total Tuition:</strong> {selectedTuition.total_tuition_fee}</p>
                <p><strong>Recurring Fee:</strong> {selectedTuition.recurring_fee}</p>
                <p><strong>Total Paid:</strong> {selectedTuition.total_amount_paid}</p>
                <p><strong>Due Date:</strong> {selectedTuition.due_date}</p>
              </div>
            ) : (
              <p>No tuition selected</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
