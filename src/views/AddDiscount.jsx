import { useState, useContext } from "react";
import { Card, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";
import UserContext from "../context/UserContext";

export default function AddDiscount() {
  const { user } = useContext(UserContext);
  const notyf = new Notyf();

  const [discount_name, setDiscountName] = useState("");
  const [description, setDescription] = useState("");
  const [percentage, setPercentage] = useState("");
  const [is_active, setIsActive] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  function handleSubmit(e) {
    e.preventDefault();

    fetch(`${API_URL}/discounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        discount_name,
        description,
        percentage,
        is_active : true
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Discount created successfully") {
          notyf.success("Discount added successfully!");

          setDiscountName("");
          setDescription("");
          setPercentage("");
          setIsActive(true);

          fetch(`${API_URL}/logs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                user: user.id, 
                task: "Add Discount", 
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
                <h4 className="mb-3 f-w-400">Add Discount</h4>
                <Form onSubmit={handleSubmit}>

                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="tag" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Discount Name"
                      value={discount_name}
                      onChange={(e) => setDiscountName(e.target.value)}
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
                      placeholder="Description (optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="percent" />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      placeholder="Percentage (0-100)"
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value)}
                      required
                    />
                  </InputGroup>

                  {/*<div className="mb-3 text-start">
                    <Form.Check
                      type="checkbox"
                      label="Active Discount"
                      checked={is_active}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                  </div>*/}

                  <Button
                    type="submit"
                    className="btn btn-block btn-primary"
                  >
                    Add Discount
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
