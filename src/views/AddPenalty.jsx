import { useState, useContext } from "react";
import { Card, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";
import UserContext from "../context/UserContext";
import { useNavigate } from "react-router-dom"; // <-- import


export default function AddPenalty() {
  const { user } = useContext(UserContext);
  const notyf = new Notyf();
  const navigate = useNavigate(); // <-- initialize

  const [penalty_name, setPenaltyName] = useState("");
  const [penalty_description, setPenaltyDescription] = useState("");
  const [program_type, setProgramType] = useState("");
  const [due_date, setDueDate] = useState("");
  const [penalty_amount, setPenaltyAmount] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  function handleSubmit(e) {
    e.preventDefault();

    fetch(`${API_URL}/penalty`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        penalty_name,
        penalty_description,
        program_type,
        due_date,
        penalty_amount
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message == "Penalty added successfully") {
          notyf.success("Penalty added successfully!");
          

          setPenaltyName("");
          setPenaltyDescription("");
          setProgramType("");
          setDueDate("");
          setPenaltyAmount("");


          fetch(`${API_URL}/logs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                user: user.id, 
                task: "Add Penalty", 
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



          navigate("/penalties"); // <-- redirect
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
                <h4 className="mb-3 f-w-400">Add Penalty</h4>
                <Form onSubmit={handleSubmit}>

                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="file-text" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Penalty Name"
                      value={penalty_name}
                      onChange={(e) => setPenaltyName(e.target.value)}
                      required
                    />
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="clipboard" />
                    </InputGroup.Text>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Penalty Description (optional)"
                      value={penalty_description}
                      onChange={(e) => setPenaltyDescription(e.target.value)}
                    />
                  </InputGroup>

                  <InputGroup className="mb-3">
                   <InputGroup.Text>
                     <FeatherIcon icon="list" />
                   </InputGroup.Text>

                   <Form.Select
                     value={program_type}
                     onChange={(e) => setProgramType(e.target.value)}
                     required
                   >
                     <option value="">Select Program Type</option>
                     <option value="full">Full Program</option>
                     <option value="short">Short Program</option>
                   </Form.Select>
                 </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="clock" />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      placeholder="Due Date (days)"
                      value={due_date}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={1}   // numeric values in JSX
                      max={28}  // numeric values in JSX
                    />
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="dollar-sign" />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      placeholder="Penalty Amount"
                      value={penalty_amount}
                      onChange={(e) => setPenaltyAmount(e.target.value)}
                    />
                  </InputGroup>

                  <Button
                    type="submit"
                    className="btn btn-block btn-primary"
                  >
                    Add Penalty
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
