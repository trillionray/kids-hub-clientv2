
import DataTable from "react-data-table-component";
import { Notyf } from "notyf";
import { Spinner, Button, Modal } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

import { useState, useEffect, useContext } from "react";
import UserContext from "../context/UserContext";


export default function TuitionFees() {
  const { user } = useContext(UserContext);

  const [tuitionFees, setTuitionFees] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [selectedTuition, setSelectedTuition] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const token = localStorage.getItem("token");

  const fetchTuitionFees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tuition-fees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const fetchPenalties = async () => {
    try {
      const res = await fetch(`${API_URL}/penalties`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setPenalties(data.data || []);
    } catch {
      notyf.error("Failed to load penalties.");
    }
  };

  const generateTuition = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tuition-fees/generate-tuition`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  const updatePenalty = async (penaltyId) => {
    try {
      const res = await fetch(`${API_URL}/tuition-fees/attach-penalty`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tuition_id: selectedTuition._id,
          penalty_id: penaltyId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      notyf.success("Penalty attached successfully.");

      fetch(`${API_URL}/logs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                user: user.id, 
                task: "Attach Penalty", 
                documentLog: data
              }) // datetime is automatic in backend
          })
          .then(res => res.json())
          .then(data => {
            console.log(data)
            if (data.log) {
              console.log('Log added successfully:', data.log);
            } else {
              console.error('Error adding log:', data.message);
            }
          })
          .catch(err => {
            console.error('Server error:', err.message);
          });

      fetchTuitionFees();
      setShowPenaltyModal(false);
    } catch (err) {
      notyf.error(err.message);
    }
  };

  const filteredFees = tuitionFees.filter((t) =>
    (t.enrollment_id?._id || "")
      .toLowerCase()
      .includes(globalSearch.toLowerCase()) ||
    t.total_tuition_fee.toString().includes(globalSearch) ||
    t.total_amount_paid.toString().includes(globalSearch)
  );

  const columns = [
    { id: "enrollment", name: "Enrollment ID", selector: (row) => row.enrollment_id?._id || "", sortable: true, center: true },
    { id: "student", name: "Student ID", selector: (row) => row.enrollment_id?.student_id?._id || "", sortable: true, center: true },
    { id: "studentname", name: "Student Name", selector: (row) => row.enrollment_id?.student_id ? `${row.enrollment_id.student_id.first_name} ${row.enrollment_id.student_id.middle_name} ${row.enrollment_id.student_id.last_name}` : "", sortable: true, center: true },
    { id: "total", name: "Total Tuition", selector: (row) => row.total_tuition_fee, sortable: true, center: true },
    { id: "paid", name: "Total Paid", selector: (row) => row.total_amount_paid, sortable: true, center: true },
    {
      id: "penalty",
      name: "Penalty",
      cell: (row) => {
        const penalty = row.penalty_id;

        return (
          <div>
            <span>
              {penalty?.penalty_name || "None"},
              {" "}P{penalty?.penalty_amount || "0"}
              {" "}after {penalty?.due_date || "N/A"}
            </span>
            <br />
            <Button
              size="sm"
              variant="link"
              onClick={() => {
                setSelectedTuition(row);
                fetchPenalties();
                setShowPenaltyModal(true);
              }}
            >
              <FeatherIcon icon="edit" size={14} />
            </Button>
          </div>
        );
      },
      center: true,
    },
    {
      id: "actions",
      name: "Actions",
      cell: (row) => (
        <Button size="sm" onClick={() => { setSelectedTuition(row); setShowDetailsModal(true); }} style={{ border: "none", padding: "0.25rem" }}>
          <FeatherIcon icon="info" />
        </Button>
      ),
      ignoreRowClick: true,
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
          <input type="text" className="form-control" style={{ maxWidth: "250px" }} placeholder="Search..." onChange={(e) => setGlobalSearch(e.target.value)} />
        </div>

        {loading ? (
          <Spinner animation="border" />
        ) : (
          <DataTable columns={columns} data={filteredFees} pagination highlightOnHover striped dense responsive noDataComponent="No tuition fees found" />
        )}

        {/* DETAILS MODAL */}
        <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
          <Modal.Header closeButton><Modal.Title>Tuition Details</Modal.Title></Modal.Header>
          <Modal.Body>
            {selectedTuition ? (
              <div>
                <p><strong>ID:</strong> {selectedTuition._id}</p>
                <p><strong>Enrollment ID:</strong> {selectedTuition.enrollment_id?._id}</p>
                <p><strong>Total Tuition:</strong> {selectedTuition.total_tuition_fee}</p>
                <p><strong>Total Paid:</strong> {selectedTuition.total_amount_paid}</p>
                <p><strong>Penalty:</strong> {selectedTuition.penalty_id?.penalty_name || "None"}</p>
              </div>
            ) : <p>No tuition selected</p>}
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Close</Button></Modal.Footer>
        </Modal>

        {/* PENALTY MODAL */}
        <Modal show={showPenaltyModal} onHide={() => setShowPenaltyModal(false)} centered>
          <Modal.Header closeButton><Modal.Title>Select Penalty</Modal.Title></Modal.Header>
          <Modal.Body>
            {penalties.length === 0 ? <p>No penalties found.</p> : penalties.map((p) => (
              <Button key={p._id} className="w-100 mb-2" onClick={() => updatePenalty(p._id)}>
                {p.penalty_name} — ₱{p.penalty_amount}
              </Button>
            ))}
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
