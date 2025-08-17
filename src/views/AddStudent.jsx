import FeatherIcon from "feather-icons-react";
import { useState, useEffect } from "react";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { Notyf } from "notyf";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function AddStudent() {
  const notyf = new Notyf();
  const navigate = useNavigate();

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

  const [showContact, setShowContact] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [oldStudents, setOldStudents] = useState([]);
  const [isOldStudentSelected, setIsOldStudentSelected] = useState(false);

  // Fetch old students for search
  useEffect(() => {
    if (formData.studentType === "old" && searchQuery.trim().length > 0) {
      fetch(`${import.meta.env.VITE_API_URL}/students/search-student`, {
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
          firstName: "", middleName: "", lastName: "", suffix: "",
          gender: "Male", birthdate: "", studentType: "new",
          address: { street: "", barangay: "", city: "", province: "" },
          contact: { firstName: "", middleName: "", lastName: "", suffix: "", relationship: "" }
        });
        setSearchQuery("");
        setOldStudents([]);
        setIsOldStudentSelected(false);
        setShowContact(false);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectOldStudent = (student) => {
    setFormData(prev => ({ ...prev, ...student, studentType: "old" }));
    setOldStudents([]);
    setSearchQuery("");
    localStorage.setItem("selectedStudentId", student._id);
    setIsOldStudentSelected(true);
    setShowContact(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Confirm Student",
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
    }).then(result => {
      if (result.isConfirmed) {
        navigate("/enroll", { state: { studentData: formData } });
      }
    });
  };

  const disabled = isOldStudentSelected;

  return (
    <Container className="mt-4 px-3">
      <Card className="p-4 shadow-sm">
        <h3 className="mb-3">Student Information</h3>
        <Form onSubmit={handleSubmit}>
          {/* Step 1: Student Info */}
          {!showContact && (
            <>
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
                  <Form.Control
                    type="text"
                    placeholder="Type first, middle, or last name..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
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
                    <Form.Label>Middle Name (Optional)</Form.Label>
                    <Form.Control type="text" name="middleName" value={formData.middleName} onChange={handleChange} disabled={disabled} />
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
                    <Form.Label>Suffix (Optional)</Form.Label>
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

              <div className="d-flex justify-content-end mt-3">
                <Button variant="secondary" onClick={() => setShowContact(true)}>
                  Continue <FeatherIcon icon="chevron-right" />
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Contact Info */}
          {showContact && (
            <>
              <h5 className="mt-3">Contact Person</h5>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control type="text" name="contact.firstName" value={formData.contact.firstName} onChange={handleChange} required disabled={disabled} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Middle Name (Optional)</Form.Label>
                    <Form.Control type="text" name="contact.middleName" value={formData.contact.middleName} onChange={handleChange} disabled={disabled} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control type="text" name="contact.lastName" value={formData.contact.lastName} onChange={handleChange} required disabled={disabled} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Suffix (Optional)</Form.Label>
                    <Form.Control type="text" name="contact.suffix" value={formData.contact.suffix} onChange={handleChange} disabled={disabled} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Relationship</Form.Label>
                    <Form.Select
                      name="contact.relationship"
                      value={formData.contact.relationship}
                      onChange={handleChange}
                      disabled={disabled}
                      required
                    >
                      <option value="">-- Select Relationship --</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Relative">Relative</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button variant="secondary" onClick={() => setShowContact(false)}>
                  <FeatherIcon icon="chevron-left" /> Back
                </Button>
                <Button type="submit" variant="primary">
                  Next <FeatherIcon icon="chevron-right" />
                </Button>
              </div>

            </>
          )}
        </Form>
      </Card>
    </Container>
  );
}
