import { useState, useEffect, useContext } from "react";
import { Card, Table, Button, Spinner } from "react-bootstrap";
import { Notyf } from "notyf";
import UserContext from "../context/UserContext";

export default function Penalties() {
  const { user } = useContext(UserContext);
  const notyf = new Notyf();

  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch all penalties
  const fetchPenalties = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/penalty`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      console.log(data)
      if (data.success) {
        setPenalties(data.data || data); // depending on backend structure
      } else {
        notyf.error(data.message || "Failed to fetch penalties");
      }
    } catch (err) {
      console.error(err);
      notyf.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalties();
  }, []);

  return (
    <div className="auth-wrapper py-3 d-flex justify-content-center">
      <div className="auth-content w-100" style={{ maxWidth: "1000px" }}>
        <Card className="borderless shadow-lg">
          <Card.Body>
            <h3 className="mb-4 text-center">All Penalties</h3>

            {loading ? (
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Penalty Name</th>
                    <th>Description</th>
                    <th>Program Type</th>
                    <th>Due Date (days)</th>
                    <th>Amount</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {penalties.length > 0 ? (
                    penalties.map((penalty, index) => (
                      <tr key={penalty._id}>
                        <td>{index + 1}</td>
                        <td>{penalty.penalty_name}</td>
                        <td>{penalty.penalty_description}</td>
                        <td>{penalty.program_type}</td>
                        <td>{penalty.due_date}</td>
                        <td>{penalty.penaly_amount}</td>
                        <td>{penalty.active ? "Yes" : "No"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No penalties found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
