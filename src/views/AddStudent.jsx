import { useState } from "react";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { Notyf } from "notyf";

export default function AddStudent() {
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    gender: "Male",
    birthdate: "",
    address: {
      street: "",
      barangay: "",
      city: "",
      province: ""
    },
    contact: {
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      relationship: ""
    }
  });

  // Handle changes for nested fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else if (name.startsWith("contact.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        contact: { ...prev.contact, [field]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`${API_URL}/students/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(formData)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.student) {
          notyf.success("Student added successfully!");
          // Reset form
          setFormData({
            firstName: "",
            middleName: "",
            lastName: "",
            suffix: "",
            gender: "Male",
            birthdate: "",
            address: {
              street: "",
              barangay: "",
              city: "",
              province: ""
            },
            contact: {
              firstName: "",
              middleName: "",
              lastName: "",
              suffix: "",
              relationship: ""
            }
          });
        } else {
          notyf.error(data.message || "Failed to add student");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
  };

  return (
    <Container className="mt-4 px-3">
      <Card className="p-4 shadow-sm">
        <h3 className="mb-3">Add Student</h3>
        <Form onSubmit={handleSubmit}>
          {/* Student Basic Info */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Middle Name</Form.Label>
                <Form.Control
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Suffix</Form.Label>
                <Form.Control
                  type="text"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option>Male</option>
                  <option>Female</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Birthdate</Form.Label>
                <Form.Control
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Address */}
          <h5 className="mt-3">Address</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Street</Form.Label>
                <Form.Control
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Barangay</Form.Label>
                <Form.Control
                  type="text"
                  name="address.barangay"
                  value={formData.address.barangay}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Province</Form.Label>
                <Form.Control
                  type="text"
                  name="address.province"
                  value={formData.address.province}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Contact Person */}
          <h5 className="mt-3">Contact Person</h5>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="contact.firstName"
                  value={formData.contact.firstName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Middle Name</Form.Label>
                <Form.Control
                  type="text"
                  name="contact.middleName"
                  value={formData.contact.middleName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="contact.lastName"
                  value={formData.contact.lastName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Suffix</Form.Label>
                <Form.Control
                  type="text"
                  name="contact.suffix"
                  value={formData.contact.suffix}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Relationship</Form.Label>
                <Form.Control
                  type="text"
                  name="contact.relationship"
                  value={formData.contact.relationship}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Button type="submit" variant="primary">
            Add Student
          </Button>
        </Form>
      </Card>
    </Container>
  );
}
