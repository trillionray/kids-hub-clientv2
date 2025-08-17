import { useState, useEffect, useContext } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { Notyf } from "notyf";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";

export default function AddProgram() {
  const { user } = useContext(UserContext);
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("short");
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [miscGroupId, setMiscGroupId] = useState(""); // ✅ required field
  const [miscGroups, setMiscGroups] = useState([]);   // for dropdown options

  // Fetch Miscellaneous Groups for dropdown
  useEffect(() => {
    fetch(`${API_URL}/miscellaneous-package/read`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => res.json())
      .then((data) => setMiscGroups(data))
      .catch(() => notyf.error("Failed to load miscellaneous groups"));
  }, []);

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
        isActive,
        miscellaneous_group_id: miscGroupId // ✅ must be included
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          notyf.success("Program added successfully!");
          navigate("/programs");
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
            
            {/* Program Name */}
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

            {/* Category */}
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

            {/* Description */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            {/* Rate */}
            <InputGroup className="mb-3">
              <InputGroup.Text>₱</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                placeholder="Rate"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                required
              />
            </InputGroup>

            {/* Miscellaneous Group Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Miscellaneous Group</Form.Label>
              <Form.Select
                value={miscGroupId}
                onChange={(e) => setMiscGroupId(e.target.value)}
                
              >
                <option value="">-- Select Group --</option>
                {miscGroups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.package_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Save Button */}
            <Button variant="primary" type="submit">
              Save Program
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
