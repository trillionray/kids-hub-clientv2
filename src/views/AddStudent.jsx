import FeatherIcon from "feather-icons-react";
import { useState, useEffect } from "react";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { Notyf } from "notyf";
import Swal from "sweetalert2";

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
    studentType: "new",
    address: { street: "", barangay: "", city: "", province: "" },
    contact: { firstName: "", middleName: "", lastName: "", suffix: "", relationship: "" }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [oldStudents, setOldStudents] = useState([]);
  const [isOldStudentSelected, setIsOldStudentSelected] = useState(false);

  // Fetch old students for search
  useEffect(() => {
    if (formData.studentType === "old" && searchQuery.trim().length > 0) {
      fetch(`${API_URL}/students/search-student`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ query: searchQuery })
      })
        .then(res => res.json())
        .then(data => setOldStudents(data.students || []))
        .catch(() => notyf.error("Failed to fetch old students"));
    } else {
      setOldStudents([]);
    }
  }, [searchQuery, formData.studentType]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
    } else if (name.startsWith("contact.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
    } else if (name === "studentType") {
      setFormData(prev => ({ ...prev, studentType: value }));
      if (value === "new") {
        setFormData({
          firstName: "",
          middleName: "",
          lastName: "",
          suffix: "",
          gender: "Male",
          birthdate: "",
          studentType: "new",
          address: { street: "", barangay: "", city: "", province: "" },
          contact: { firstName: "", middleName: "", lastName: "", suffix: "", relationship: "" }
        });
        setSearchQuery("");
        setOldStudents([]);
        setIsOldStudentSelected(false);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle selection of old student
  const handleSelectOldStudent = (student) => {
    setFormData(prev => ({ ...prev, ...student, studentType: "old" }));
    setOldStudents([]);
    setSearchQuery("");
    localStorage.setItem("selectedStudentId", student._id); // Save old student ID
    setIsOldStudentSelected(true);
  };

  // Handle form submission with Swal
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.studentType === "old") {
      window.location.href = "/enroll";
      return;
    }

    // Show confirmation modal
    const { isConfirmed } = await Swal.fire({
      title: "Confirm New Student",
      html: `
        <p><strong>First Name:</strong> ${formData.firstName}</p>
        <p><strong>Middle Name:</strong> ${formData.middleName}</p>
        <p><strong>Last Name:</strong> ${formData.lastName}</p>
        <p><strong>Gender:</strong> ${formData.gender}</p>
        <p><strong>Birthdate:</strong> ${formData.birthdate}</p>
        <p><strong>Address:</strong> ${formData.address.street}, ${formData.address.barangay}, ${formData.address.city}, ${formData.address.province}</p>
        <p><strong>Contact:</strong> ${formData.contact.firstName} ${formData.contact.middleName} ${formData.contact.lastName} (${formData.contact.relationship})</p>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Continue",
      cancelButtonText: "Cancel"
    });

    if (!isConfirmed) return;

    // Add new student
    try {
      const res = await fetch(`${API_URL}/students/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.student) {
        notyf.success("Student added successfully!");
        localStorage.setItem("selectedStudentId", data.student._id); // Save new student ID
        setFormData({
          firstName: "", middleName: "", lastName: "", suffix: "",
          gender: "Male", birthdate: "", studentType: "new",
          address: { street: "", barangay: "", city: "", province: "" },
          contact: { firstName: "", middleName: "", lastName: "", suffix: "", relationship: "" }
        });
        setIsOldStudentSelected(false);
        window.location.href = "/enroll";
      } else {
        notyf.error(data.message || "Failed to add student");
      }
    } catch (error) {
      notyf.error("Server error. Please try again.");
    }
  };

  const disabled = isOldStudentSelected;

  return (
    <Container className="mt-4 px-3">
      <Card className="p-4 shadow-sm">
        <h3 className="mb-3">Student Information</h3>
        <Form onSubmit={handleSubmit}>

          {/* Student Type */}
          <Form.Group className="mb-3">
            <Form.Label>Student Type</Form.Label>
            <div>
              <Form.Check inline type="radio" label="New Student" name="studentType" value="new"
                checked={formData.studentType === "new"} onChange={handleChange} />
              <Form.Check inline type="radio" label="Old Student" name="studentType" value="old"
                checked={formData.studentType === "old"} onChange={handleChange} />
            </div>
          </Form.Group>

          {/* Old Student Search */}
          {formData.studentType === "old" && !isOldStudentSelected && (
            <Form.Group className="mb-3">
              <Form.Label>Search Old Student</Form.Label>
              <Form.Control type="text" placeholder="Type first, middle, or last name..." 
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              {oldStudents.length > 0 && (
                <div className="border p-2 mt-1" style={{ maxHeight: "150px", overflowY: "auto" }}>
                  {oldStudents.map(s => (
                    <div key={s._id} style={{ padding: "4px", cursor: "pointer" }}
                      onClick={() => handleSelectOldStudent(s)}>
                      {s.firstName} {s.middleName} {s.lastName}
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>
          )}

          {/* Student Basic Info */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" name="firstName" value={formData.firstName} onChange={handleChange} required disabled={disabled} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Middle Name</Form.Label>
                <Form.Control type="text" name="middleName" value={formData.middleName} onChange={handleChange} required disabled={disabled} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleChange} required disabled={disabled} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Suffix</Form.Label>
                <Form.Control type="text" name="suffix" value={formData.suffix} onChange={handleChange} disabled={disabled} />
              </Form.Group>
            </Col>
          </Row>

          {/* Gender & Birthdate */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Select name="gender" value={formData.gender} onChange={handleChange} disabled={disabled}>
                  <option>Male</option>
                  <option>Female</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Birthdate</Form.Label>
                <Form.Control type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} required disabled={disabled} />
              </Form.Group>
            </Col>
          </Row>

          {/* Address */}
          <h5 className="mt-3">Address</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Street</Form.Label>
                <Form.Control type="text" name="address.street" value={formData.address.street} onChange={handleChange} disabled={disabled} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Barangay</Form.Label>
                <Form.Control type="text" name="address.barangay" value={formData.address.barangay} onChange={handleChange} disabled={disabled} />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control type="text" name="address.city" value={formData.address.city} onChange={handleChange} disabled={disabled} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Province</Form.Label>
                <Form.Control type="text" name="address.province" value={formData.address.province} onChange={handleChange} disabled={disabled} />
              </Form.Group>
            </Col>
          </Row>

          {/* Contact Person */}
          <h5 className="mt-3">Contact Person</h5>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" name="contact.firstName" value={formData.contact.firstName} onChange={handleChange} required disabled={disabled} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Middle Name</Form.Label>
                <Form.Control type="text" name="contact.middleName" value={formData.contact.middleName} onChange={handleChange} required disabled={disabled} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" name="contact.lastName" value={formData.contact.lastName} onChange={handleChange} required disabled={disabled} />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Suffix</Form.Label>
                <Form.Control type="text" name="contact.suffix" value={formData.contact.suffix} onChange={handleChange} disabled={disabled} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Relationship</Form.Label>
                <Form.Control type="text" name="contact.relationship" value={formData.contact.relationship} onChange={handleChange} disabled={disabled} />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-3">
            <Button type="submit" variant="primary">
              Next <FeatherIcon icon="chevron-right" />
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
