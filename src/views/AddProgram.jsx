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
  const [category, setCategory] = useState(""); // ✅ Default blank
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState();
  const [downPayment, setDownPayment] = useState();
  const [capacity, setCapacity] = useState();
  const [initialEvaluationPrice, setInitialEvaluationPrice] = useState(); // ✅ new field
  const [isActive, setIsActive] = useState(true);
  const [miscGroupId, setMiscGroupId] = useState("");
  const [miscGroups, setMiscGroups] = useState([]);

  const [selectMiscGroup, setSelectMiscGroup] = useState(true);

  // ✅ Fetch Miscellaneous Groups
  useEffect(() => {
    fetch(`${API_URL}/miscellaneous-package/read`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setMiscGroups(data))
      .catch(() => notyf.error("Failed to load miscellaneous groups"));
  }, []);

  useEffect(()=>{
    if(category == "short"){
      setSelectMiscGroup(false)
    }else{
      setSelectMiscGroup(true)
    }
  }, [category])

  // ✅ Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (category === "") {
      notyf.error("Please select a category");
      return;
    }

    if (category === "long" && capacity <= 0) {
      notyf.error("Capacity must be greater than 0");
      return;
    }

    // ✅ Build body dynamically
    const body = {
      name,
      category,
      description,
      rate,
      down_payment: downPayment,
      isActive,
    };

    if (category === "short") {
      body.initial_evaluation_price = initialEvaluationPrice;
    } else {
      body.capacity = capacity;
      body.miscellaneous_group_id = miscGroupId;
    }
    console.log(body);
    fetch(`${API_URL}/programs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          notyf.success("Program added successfully!");
          navigate("/programs");
        } else {
          console.log(data)
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
                <option value="">-- Select Category --</option>
                <option value="short">Short Program</option>
                <option value="long">Full Program</option>
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
                min = "0"
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
                min = "0"
                placeholder="Enter down payment"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
              />
            </Form.Group>

            {/* ✅ Conditional Rendering */}
            {category === "long" && (
              <>
                {/* Capacity */}
                <Form.Group className="mb-3" controlId="programCapacity">
                  <Form.Label>Capacity (Number of Enrollees)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="Enter maximum enrollees"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    required
                  />
                </Form.Group>

                {/* Miscellaneous Group */}
                {selectMiscGroup && (
                  <Form.Group className="mb-3" controlId="miscGroup">
                    <Form.Label>Miscellaneous Group</Form.Label>
                    <Form.Select
                      value={miscGroupId}
                      onChange={(e) => setMiscGroupId(e.target.value)}
                      required
                      disabled={!selectMiscGroup}
                    >
                      <option value="">-- Select Group --</option>
                      {miscGroups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.package_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                )}
              </>
            )}


            {category === "short" && (
              <Form.Group className="mb-3" controlId="initialEvaluation">
                <Form.Label>Initial Evaluation Price (₱)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0"
                  placeholder="Enter evaluation price"
                  value={initialEvaluationPrice}
                  onChange={(e) => setInitialEvaluationPrice(Number(e.target.value))}
                  required
                />
              </Form.Group>
            )}

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
