import { useState, useEffect, useContext } from "react";
import { Card, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";
import UserContext from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function AddMiscellaneous() {
  const { user } = useContext(UserContext);
  const notyf = new Notyf();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  // Validate fields
  const [isActiveForm, setIsActiveForm] = useState(false);
  useEffect(() => {
    if (name && price) {
      setIsActiveForm(true);
    } else {
      setIsActiveForm(false);
    }
  }, [name, price]);

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
        is_active: true,
        created_by: user.id,
        last_updated_by: user.id
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          notyf.success(data.message);
          navigate("/miscellaneous"); // ✅ redirect after success
        } else {
          notyf.error(data.message || "Something went wrong");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
  }

  return (
    <div className="auth-wrapper pt-4">
      <div className="auth-content">
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

                  {/* Buttons */}
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      type="submit"
                      className="btn btn-primary rounded-pill px-4"
                      disabled={!isActiveForm}
                    >
                      <FeatherIcon icon="plus-circle" size="16" className="me-1" /> Add
                    </Button>

                    <Button
                      className="btn btn-danger ms-auto rounded-pill px-4"
                      onClick={() => navigate("/miscellaneous")} // ✅ Cancel goes back
                    >
                      <FeatherIcon icon="x-circle" size="16" className="me-1" /> Cancel
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
