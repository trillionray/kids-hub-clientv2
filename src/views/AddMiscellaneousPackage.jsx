import { useEffect, useState, useContext } from "react";
import { Card, Row, Col, Button, Form, Spinner } from "react-bootstrap";
import { Notyf } from "notyf";
import UserContext from "../context/UserContext";
import { useNavigate } from "react-router-dom"; // ✅ import navigate
export default function AddMiscellaneousPackage() {

  const { user } = useContext(UserContext);
  const notyf = new Notyf();
  const navigate = useNavigate(); // ✅ initialize navigate

  const [packageName, setPackageName] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [packagePrice, setPackagePrice] = useState(0); // auto-computed
  const [isActive, setIsActive] = useState(true);
  const [miscs, setMiscs] = useState([]);
  const [selectedMiscs, setSelectedMiscs] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch miscellaneous items
  useEffect(() => {
    fetch(`${API_URL}/miscellaneous`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (Array.isArray(data)) {
          setMiscs(data);
        } else {
          notyf.error(data.message || "Error fetching miscellaneous items");
        }
      })
      .catch(() => notyf.error("Server error"))
      .finally(() => setLoading(false));
  }, []);

  // Update package price when selectedMiscs changes
  useEffect(() => {
    const total = selectedMiscs.reduce((sum, miscId) => {
      const misc = miscs.find((m) => m._id === miscId);
      return sum + (misc ? parseFloat(misc.price) : 0);
    }, 0);
    setPackagePrice(total);
  }, [selectedMiscs, miscs]);

  // Handle misc checkbox selection
  const handleMiscSelection = (miscId) => {
    setSelectedMiscs((prev) =>
      prev.includes(miscId)
        ? prev.filter((id) => id !== miscId)
        : [...prev, miscId]
    );
  };

  // Handle form submit
  function handleSubmit(e) {
    e.preventDefault();

    if (selectedMiscs.length === 0) {
      notyf.error("Please select at least one miscellaneous item");
      return;
    }

    fetch(`${API_URL}/miscellaneous-package/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        package_name: packageName,
        package_description: packageDescription,
        package_price: packagePrice, // auto-computed
        is_active: isActive,
        miscs: selectedMiscs,
        created_by: user.id,
        last_updated_by: user.id
      })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.success) {
          notyf.success("Package added successfully!");
          setPackageName("");
          setPackageDescription("");
          setSelectedMiscs([]);
          setPackagePrice(0);
          navigate("/miscellaneous-package"); // ✅ redirect after success
        } else {
          notyf.error(data.message || "Failed to add package");
        }
      })
      .catch(() => notyf.error("Server error"));
  }

  return (
    <div className="auth-wrapper pt-4">
      <div className="auth-content pt-0">
        <Card className="borderless">
          <Row className="align-items-center">
            <Col>
              <Card.Body className="card-body">
                <h4 className="mb-3 f-w-400 text-center tx">Add Miscellaneous Package</h4>
                {loading ? (
                  <Spinner animation="border" />
                ) : (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Package Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={packageName}
                        onChange={(e) => setPackageName(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Package Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={packageDescription}
                        onChange={(e) => setPackageDescription(e.target.value)}
                      />
                    </Form.Group>

                    {/* Checkbox list for miscs */}
                    <Form.Group className="mb-3">
                      <Form.Label>Select Miscellaneous Items</Form.Label>
                      <div
                        className="border rounded p-2"
                        style={{ maxHeight: "200px", overflowY: "auto", textAlign: "left" }}
                      >
                        {miscs.length === 0 ? (
                          <p>No miscellaneous items available</p>
                        ) : (
                          miscs.map((misc) => (
                            <Form.Check
                              key={misc._id}
                              type="checkbox"
                              label={`${misc.name} (${new Date(misc.school_year_id.startDate).getFullYear()}-${new Date(misc.school_year_id.endDate).getFullYear()}) - ₱${misc.price}`}


                              checked={selectedMiscs.includes(misc._id)}
                              onChange={() => handleMiscSelection(misc._id)}
                            />
                          ))
                        )}
                      </div>
                    </Form.Group>

                    {/* Computed total price */}
                    <Form.Group className="mb-3">
                      <Form.Label>Total Price: {`₱${packagePrice}`} </Form.Label>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Active"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                    </Form.Group>

                    <Button type="submit" className="btn btn-block btn-primary">
                      Add Package
                    </Button>
                  </Form>
                )}
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
