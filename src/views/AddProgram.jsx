import { useState, useEffect, useContext } from "react";
import { Form, Button } from "react-bootstrap";
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
  const [downPayment, setDownPayment] = useState(0);
  const [capacity, setCapacity] = useState(0); // ✅ NEW
  const [isActive, setIsActive] = useState(true);
  const [miscGroupId, setMiscGroupId] = useState("");
  const [miscGroups, setMiscGroups] = useState([]);

  // Fetch Miscellaneous Groups
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

    if (capacity <= 0) {
      notyf.error("Capacity must be greater than 0");
      return;
    }

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
        down_payment: downPayment,
        capacity, // ✅ Added
        isActive,
        miscellaneous_group_id: miscGroupId
      })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
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
            <Form.Group className="mb-3" controlId="programName">
              <Form.Label>Program Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter program name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            {/* Category */}
            <Form.Group className="mb-3" controlId="programCategory">
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
            <Form.Group className="mb-3" controlId="programDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            {/* Rate */}
            <Form.Group className="mb-3" controlId="programRate">
              <Form.Label>Rate (₱)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                placeholder="Enter rate"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                required
              />
            </Form.Group>

            {/* Down Payment */}
            <Form.Group className="mb-3" controlId="programDownPayment">
              <Form.Label>Down Payment (₱)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                placeholder="Enter down payment"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
              />
            </Form.Group>

            {/* ✅ Capacity */}
            <Form.Group className="mb-3" controlId="programCapacity">
              <Form.Label>Capacity (Number of enrollees)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                placeholder="Enter maximum enrollees"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
              />
            </Form.Group>

            {/* Miscellaneous Group Selection */}
            <Form.Group className="mb-3" controlId="miscGroup">
              <Form.Label>Miscellaneous Group</Form.Label>
              <Form.Select
                value={miscGroupId}
                onChange={(e) => setMiscGroupId(e.target.value)}
                required
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
            <Button variant="primary" type="submit" className="w-100">
              Save Program
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
