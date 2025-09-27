import DataTable from "react-data-table-component";
import { Spinner } from "react-bootstrap";
import { useState } from "react";

export default function TableLayout({ title, columns, data, loading, children }) {
  const [filterText, setFilterText] = useState("");

  const filteredData =
    data?.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(filterText.toLowerCase())
    ) || [];

  return (
    <div className="p-4" style={{ backgroundColor: "#89C7E7", minHeight: "100vh" }}>
      <div className="container bg-white rounded shadow p-4">
        {title && <h3 className="text-center mb-4">{title}</h3>}

        <div className="d-flex justify-content-end align-items-center mb-3">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: "250px" }}
            placeholder="Search..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              highlightOnHover
              striped
              dense
              responsive
              noDataComponent="No records found"
              customStyles={{
                table: {
                  style: {
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid #dee2e6",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  },
                },
                headRow: {
                  style: {
                    backgroundColor: "#f8f9fa",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    borderBottom: "2px solid #dee2e6",
                  },
                },
                headCells: {
                  style: {
                    justifyContent: "center",
                    textAlign: "center",
                    paddingTop: "14px",
                    paddingBottom: "14px",
                    borderRight: "1px solid #dee2e6",
                  },
                },
                rows: {
                  style: {
                    fontSize: "0.95rem",
                    textAlign: "center",
                    borderBottom: "1px solid #e9ecef",
                    minHeight: "50px",
                  },
                  highlightOnHoverStyle: {
                    backgroundColor: "#eaf4fb",
                    transition: "background-color 0.2s ease-in-out",
                  },
                },
                cells: {
                  style: {
                    justifyContent: "center",
                    textAlign: "center",
                    borderRight: "1px solid #dee2e6",
                  },
                },
                pagination: {
                  style: {
                    borderTop: "1px solid #dee2e6",
                    paddingTop: "6px",
                    justifyContent: "center",
                  },
                },
              }}
            />
            {/* ✅ Render modal or any extra content */}
            {children}
          </>
        )}
      </div>
    </div>
  );
}
