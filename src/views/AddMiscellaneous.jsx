import { useState, useEffect, useContext } from "react";
import { Card, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";
import UserContext from "../context/UserContext";

export default function AddMiscellaneous() {
  const { user } = useContext(UserContext);
  const notyf = new Notyf();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  // Validate fields
  const [isActiveForm, setIsActiveForm] = useState(false);
  useEffect(() => {
    if (name && price && effectiveDate) {
      setIsActiveForm(true);
    } else {
      setIsActiveForm(false);
    }
  }, [name, price, effectiveDate]);

  function handleSubmit(e) {
    e.preventDefault();

    fetch(`${API_URL}/miscellaneous`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        name,
        price,
        effective_date: effectiveDate,
        is_active: isActive,
        created_by: user.id,
        last_updated_by: user.id
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          notyf.success(data.message);
          setName("");
          setPrice("");
          setEffectiveDate("");
          setIsActive(true);
        } else {
          notyf.error(data.message || "Something went wrong");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
  }

  return (
    <div className="auth-wrapper pt-4">
      <div className="auth-content ">
        <Card className="borderless">
          <Row className="align-items-center">
            <Col>
              <Card.Body className="card-body">
                <h4 className="mb-3 f-w-400 text-center">Add Miscellaneous</h4>
                <Form onSubmit={handleSubmit}>
                  {/* Name */}
                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="tag" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Miscellaneous Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </InputGroup>

                  {/* Price */}
                  <InputGroup className="mb-3">
                    <InputGroup.Text style={{ fontSize: "1.2rem" }}>₱</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </InputGroup>

                  {/* Effective Date */}

               
                  <label className="text-start">Effective Date</label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="calendar" />
                    </InputGroup.Text>
                    <Form.Control
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      required
                    />
                  </InputGroup>


                  {/* Active Status */}
                  <Form.Group className="mb-3 text-left">
                    <Form.Check
                      type="checkbox"
                      label="Is Active?"
                      checked={isActive}
                      onChange={() => setIsActive(!isActive)}
                    />
                  </Form.Group>

                  <div className="text-center mb-0 pb-0">
                  	<Button
                  	  type="submit"
                  	  className="btn btn-block btn-primary"
                  	  disabled={!isActiveForm}
                  	>
                  	  Add Miscellaneous
                  	</Button>
                  </div>
                  
                </Form>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
