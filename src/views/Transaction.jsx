import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Spinner } from "react-bootstrap";
import { Notyf } from "notyf";

export default function Transactions() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();

  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    setLoading(true);
    fetch(`${API_URL}/transactions`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (Array.isArray(data)) {
          setTransactions(data);
          setFilteredTransactions(data);
        } else {
          notyf.error(data.message || "Failed to fetch transactions");
        }
      })
      .catch(() => notyf.error("Server error"))
      .finally(() => setLoading(false));
  };

  const columns = [
    {
      name: "Reference No",
      selector: (row) => row.reference_no,
      sortable: true,
      center: true,
    },
    {
      name: "Transaction Type",
      selector: (row) => row.transaction_type,
      sortable: true,
      center: true,
    },
    {
      name: "Amount",
      selector: (row) => `₱${row.amount}`,
      sortable: true,
      center: true,
    },
    {
      name: "Payment Mode",
      selector: (row) => row.mode_payment,
      center: true,
    },
    {
      name: "Payment Status",
      selector: (row) => row.payment_status,
      center: true,
    },
    {
      name: "Receipt Date",
      selector: (row) =>
        row.receipt_date
          ? new Date(row.receipt_date).toLocaleDateString()
          : "—",
      center: true,
    },
    {
      name: "Actions",
      cell: (row) =>
        row.picture_file_path ? (
          <Button
            size="sm"
            variant="info"
            onClick={() =>
              window.open(`${API_URL}${row.picture_file_path}`, "_blank")
            }
          >
            View Receipt
          </Button>
        ) : (
          "—"
        ),
      center: true,
    },
  ];

  return (
    <div style={{ backgroundColor: "#89C7E7", minHeight: "100vh", padding: "20px" }}>
      <h3 className="text-white fw-bold">TRANSACTIONS</h3>

      <div
        className="container border p-4 rounded shadow"
        style={{ backgroundColor: "#fff" }}
      >
        <div className="d-flex justify-content-end mb-3">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: "250px" }}
            placeholder="Search transactions..."
            onChange={(e) => {
              const search = e.target.value.toLowerCase();
              setFilteredTransactions(
                transactions.filter(
                  (t) =>
                    t.reference_no?.toLowerCase().includes(search) ||
                    t.transaction_type?.toLowerCase().includes(search) ||
                    t.mode_payment?.toLowerCase().includes(search)
                )
              );
            }}
          />
        </div>

        {loading ? (
          <Spinner animation="border" />
        ) : (
          <DataTable
            columns={columns}
            data={filteredTransactions}
            pagination
            highlightOnHover
            striped
            dense
            responsive
            noDataComponent="No transactions found"
          />
        )}
      </div>
    </div>
  );
}
