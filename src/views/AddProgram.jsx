import { useState, useContext } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { Notyf } from "notyf";
import { useNavigate } from "react-router-dom";  // ✅ import navigate hook
import UserContext from "../context/UserContext";

export default function AddProgram() {
  const { user } = useContext(UserContext);
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const navigate = useNavigate();  // ✅ initialize

  const [name, setName] = useState("");
  const [category, setCategory] = useState("short");
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`${API_URL}/programs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        name,
        category,
        description,
        rate,
        isActive
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          notyf.success("Program added successfully!");
          navigate("/programs"); // ✅ redirect after success
        } else {
          notyf.error(data.message || "Failed to add program");
        }
      })
      .catch(() => notyf.error("Server error"));
  };

  return (
    <div className="auth-wrapper pt-3 pb-5">
      <div className="auth-content text-center">
        <div className="p-5 bg-white">
          <h3 className="mb-4">Add Program</h3>
          <Form onSubmit={handleSubmit}>
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FeatherIcon icon="tag" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Program Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </InputGroup>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="short">Short</option>
                <option value="long">Long</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <InputGroup className="mb-3">
              <InputGroup.Text>
                <span>₱</span>
              </InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                placeholder="Rate"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                required
              />
            </InputGroup>

            {/* If you don’t want to toggle active, you can keep this removed */}
            {/* 
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </Form.Group>
            */}

            <Button variant="primary" type="submit">
              Save Program
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
