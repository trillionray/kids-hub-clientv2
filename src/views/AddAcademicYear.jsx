import { useState, useEffect, useContext } from "react";
import { Card, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";
import UserContext from "../context/UserContext";

export default function AddAcademicYear() {
  const { user } = useContext(UserContext);
  const notyf = new Notyf();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (startDate && endDate && new Date(startDate) < new Date(endDate)) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [startDate, endDate]);

  function handleSubmit(e) {
    e.preventDefault();

    fetch(`${API_URL}/academic-year`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ startDate, endDate })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data._id) {
          notyf.success("Academic Year created successfully!");
          setStartDate("");
          setEndDate("");

          fetch(`${API_URL}/logs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                user: user.id, 
                task: "Add Academic Year", 
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
        } else {
          notyf.error(data.message || "Something went wrong.");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-content text-center">
        <Card className="borderless">
          <Row className="align-items-center text-center">
            <Col>
              <Card.Body className="card-body">
                <h4 className="mb-3 f-w-400">Add Academic Year</h4>
                <Form onSubmit={handleSubmit}>
                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="calendar" />
                    </InputGroup.Text>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="calendar" />
                    </InputGroup.Text>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </InputGroup>

                  <Button
                    type="submit"
                    className="btn btn-block btn-primary"
                    disabled={!isActive}
                  >
                    Add Academic Year
                  </Button>
                </Form>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
