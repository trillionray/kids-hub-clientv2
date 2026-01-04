import { useState, useEffect, useContext } from "react";
import DataTable from "react-data-table-component";
import { Button, Form, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Notyf } from "notyf";
import UserContext from "../context/UserContext";

export default function Penalties() {
  const { user } = useContext(UserContext);
  const notyf = new Notyf();

  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchPenalties = () => {
    setLoading(true);
    fetch(`${API_URL}/penalty`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPenalties(data.data || data);
        } else {
          notyf.error(data.message || "Failed to fetch penalties");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPenalties();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "70px",
      center: true,
    },
    {
      name: "Penalty Name",
      selector: (row) => row.penalty_name,
      sortable: true,
      center: true,
    },
    {
      name: "Description",
      selector: (row) => row.penalty_description || "—",
      wrap: true,
      center: true,
    },
    {
      name: "Program Type",
      selector: (row) => row.program_type,
      sortable: true,
      center: true,
    },
    {
      name: "Due Date (Days)",
      selector: (row) => row.due_date,
      sortable: true,
      center: true,
    },
    {
      name: "Amount",
      selector: (row) => `₱${Number(row.penalty_amount).toLocaleString()}`,
      sortable: true,
      center: true,
    },
    {
      name: "Active",
      selector: (row) => (row.active ? "Yes" : "No"),
      sortable: true,
      center: true,
    },
  ];

  const filteredData = penalties.filter(
    (p) =>
      p.penalty_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      p.penalty_description?.toLowerCase().includes(filterText.toLowerCase()) ||
      p.program_type?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: "20px" }}>
      <h3 className="text-white fw-bold">PENALTIES</h3>

      <div className="container border p-4 rounded shadow bg-white">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Link to="/penalties/add">
            <Button variant="primary">Add Penalty</Button>
          </Link>

          <Form.Control
            type="text"
            placeholder="Search..."
            style={{ maxWidth: "250px" }}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            striped
            dense
            responsive
            noDataComponent="No penalties found."
            customStyles={{
              table: {
                style: {
                  borderRadius: "10px",
                  border: "1px solid #dee2e6",
                },
              },
              headRow: {
                style: {
                  backgroundColor: "#f8f9fa",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                },
              },
              headCells: {
                style: {
                  justifyContent: "center",
                  textAlign: "center",
                },
              },
              rows: {
                style: {
                  textAlign: "center",
                },
              },
              cells: {
                style: {
                  justifyContent: "center",
                  textAlign: "center",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                },
              },
              pagination: {
                style: {
                  borderTop: "1px solid #dee2e6",
                  justifyContent: "center",
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
