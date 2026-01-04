import { useEffect, useState, useContext } from "react";
import DataTable from "react-data-table-component";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { Notyf } from "notyf";
import UserContext from "../context/UserContext";
import { Link } from "react-router-dom";

export default function DiscountList() {
  const notyf = new Notyf();
  const { user } = useContext(UserContext);

  const [discounts, setDiscounts] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchDiscounts = () => {
    setLoading(true);
    fetch(`${API_URL}/discounts`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setDiscounts(data.data);
        } else {
          notyf.error("Failed to load discount list");
        }
      })
      .catch(() => notyf.error("Server error or unauthorized"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "70px",
      center: true,
    },
    {
      name: "Discount Name",
      selector: (row) => row.discount_name,
      sortable: true,
      center: true,
    },
    {
      name: "Description",
      selector: (row) => row.description || "N/A",
      center: true,
      wrap: true,
    },
    {
      name: "Percentage",
      selector: (row) => `${row.percentage}%`,
      sortable: true,
      center: true,
    },
    {
      name: "Active",
      selector: (row) => (row.is_active ? "Yes" : "No"),
      sortable: true,
      center: true,
    },
    {
      name: "Created At",
      selector: (row) =>
        new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      center: true,
    },
  ];

  const filteredData = discounts.filter(
    (d) =>
      d.discount_name.toLowerCase().includes(filterText.toLowerCase()) ||
      (d.description &&
        d.description.toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: "20px" }}>
      <h3 className="text-white fw-bold">DISCOUNT LIST</h3>

      <Container className="border p-4 rounded shadow bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">

          <Link to="/discounts/add">
              <Button variant="primary" className="p-2">
                Add Discount
              </Button>
            </Link>


          <Form.Control
            type="text"
            placeholder="Search..."
            style={{ maxWidth: "250px" }}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

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
            noDataComponent="No discounts found."
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
            }}
          />
        )}
      </Container>
    </div>
  );
}
