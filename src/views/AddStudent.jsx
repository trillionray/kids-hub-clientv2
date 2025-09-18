import FeatherIcon from "feather-icons-react";
import { useState, useEffect } from "react";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { Notyf } from "notyf";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// Helper: camelCase -> snake_case
const toSnakeCase = (obj) => {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (obj && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2") // handles blockOrLot → block_or_lot
        .toLowerCase();
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

export default function AddStudent() {
  const notyf = new Notyf();
  const navigate = useNavigate();

  // ---------- FORM STATE ----------
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    gender: "Male",
    birthdate: "",
    studentType: "new",

    // ✅ FIXED student address
    address: {
      blockOrLot: "",
      street: "",
      barangay: "",
      municipalityOrCity: ""
    },

    // parent/guardian blocks (already matching schema)
    mother: {
      firstName: "",
      middleName: "",
      lastName: "",
      occupation: "",
      address: {
        blockOrLot: "",
        street: "",
        barangay: "",
        municipality_or_city: ""
      },
      contacts: {
        mobile_number: "",
        messenger_account: ""
      }
    },
    father: {
      firstName: "",
      middleName: "",
      lastName: "",
      occupation: "",
      address: {
        blockOrLot: "",
        street: "",
        barangay: "",
        municipality_or_city: ""
      },
      contacts: {
        mobile_number: "",
        messenger_account: ""
      }
    },
    emergency: {
      firstName: "",
      middleName: "",
      lastName: "",
      occupation: "",
      address: {
        blockOrLot: "",
        street: "",
        barangay: "",
        municipality_or_city: ""
      },
      contacts: {
        mobile_number: "",
        messenger_account: ""
      }
    }
  });

  const [step, setStep] = useState(1);

  // (Optional) old student search if you still want it
  const [searchQuery, setSearchQuery] = useState("");
  const [oldStudents, setOldStudents] = useState([]);
  const [isOldStudentSelected, setIsOldStudentSelected] = useState(false);

  // ---------- OLD STUDENT SEARCH ----------
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
        .then((res) => res.json())
        .then((data) => {
          //console.log(data);
          setOldStudents(data.students || []);
      })
        .catch(() => notyf.error("Failed to fetch old students"));
    } else {
      setOldStudents([]);
    }
  }, [searchQuery, formData.studentType]);

  // ---------- HANDLERS ----------
  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Validation: allow letters, numbers, spaces, period, dash
    const regex = /^[A-Za-z0-9.\-\s]*$/; // * = allow empty while typing
    if (!regex.test(value)) {
      //alert("Invalid input: Only letters, numbers, spaces, period (.) and dash (-) are allowed.");
      return;
    }

    // Top-level address.*
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
      return;
    }

    // Nested: mother.*, father.*, emergency.*
    if (
      name.startsWith("mother.") ||
      name.startsWith("father.") ||
      name.startsWith("emergency.")
    ) {
      const [who, section, subfield] = name.split(".");
      if (!section) return;

      setFormData((prev) => {
        const block = { ...prev[who] };

        if (section === "address" || section === "contacts") {
          block[section] = {
            ...block[section],
            [subfield]: value
          };
        } else {
          block[section] = value;
        }
        return { ...prev, [who]: block };
      });
      return;
    }

    if (name === "studentType") {
      if (value === "new") {
        setIsOldStudentSelected(false);
        setSearchQuery("");
      }
      setFormData((prev) => ({ ...prev, studentType: value }));
      return;
    }

    // Default: top-level simple fields
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //vince
  const [originalStudentData, setOriginalStudentData] = useState(null);
  const handleSelectOldStudent = (student) => {
    const mapped = {
      _id: student._id,
      firstName: student.first_name || "",
      middleName: student.middle_name || "",
      lastName: student.last_name || "",
      suffix: student.suffix || "",
      gender: student.gender || "Male",
      birthdate: student.birthdate || "",
      address: {
        blockOrLot: student.address?.block_or_lot || "",
        street: student.address?.street || "",
        barangay: student.address?.barangay || "",
        municipalityOrCity: student.address?.municipality_or_city || ""
      },
      mother: {
        firstName: student.mother?.first_name || "",
        middleName: student.mother?.middle_name || "",
        lastName: student.mother?.last_name || "",
        occupation: student.mother?.occupation || "",
        address: {
          blockOrLot: student.mother?.address?.block_or_lot || "",
          street: student.mother?.address?.street || "",
          barangay: student.mother?.address?.barangay || "",
          municipality_or_city: student.mother?.address?.municipality_or_city || ""
        },
        contacts: {
          mobile_number: student.mother?.contacts?.mobile_number || "",
          messenger_account: student.mother?.contacts?.messenger_account || ""
        }
      },
      father: {
        firstName: student.father?.first_name || "",
        middleName: student.father?.middle_name || "",
        lastName: student.father?.last_name || "",
        occupation: student.father?.occupation || "",
        address: {
          blockOrLot: student.father?.address?.block_or_lot || "",
          street: student.father?.address?.street || "",
          barangay: student.father?.address?.barangay || "",
          municipality_or_city: student.father?.address?.municipality_or_city || ""
        },
        contacts: {
          mobile_number: student.father?.contacts?.mobile_number || "",
          messenger_account: student.father?.contacts?.messenger_account || ""
        }
      },
      emergency: {
        firstName: student.emergency?.first_name || "",
        middleName: student.emergency?.middle_name || "",
        lastName: student.emergency?.last_name || "",
        occupation: student.emergency?.occupation || "",
        address: {
          blockOrLot: student.emergency?.address?.block_or_lot || "",
          street: student.emergency?.address?.street || "",
          barangay: student.emergency?.address?.barangay || "",
          municipality_or_city: student.emergency?.address?.municipality_or_city || ""
        },
        contacts: {
          mobile_number: student.emergency?.contacts?.mobile_number || "",
          messenger_account: student.emergency?.contacts?.messenger_account || ""
        }
      }
    };

    setFormData((prev) => ({ ...prev, ...mapped, studentType: "old" }));
    setOriginalStudentData(mapped);
    setOldStudents([]);
    setSearchQuery("");
    // localStorage.setItem("selectedStudentId", student._id);
    // setIsOldStudentSelected(true);

    // 🚀 Redirect immediately to enroll with student data
    //navigate("/enroll", { state: { studentData: mapped, isOldStudent: true } });
  };

  const isDataChanged = () => {
    if (!originalStudentData) return false;

    // Clone and sort keys
    const normalize = (obj) => {
      if (obj === null || typeof obj !== "object") return obj;
      if (Array.isArray(obj)) return obj.map(normalize);

      return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
          acc[key] = normalize(obj[key]);
          return acc;
        }, {});
    };

    const current = normalize({ ...formData, studentType: "old" });
    const original = normalize({ ...originalStudentData, studentType: "old" });

    return JSON.stringify(current) !== JSON.stringify(original);
  };



  const handleContinue = () => {
    if (formData.studentType === "old"){
      if (isDataChanged()) {
        if (!validateStep1()) return;
        Swal.fire({
          title: "Changes detected",
          text: "You have edited this student's information.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, Continue",
          cancelButtonText: "No"
        }).then((result) => {
          if (result.isConfirmed) {
            setStep(2);
          }
        });
      } else {
        setStep(2);
      }
    }else{
      if (!validateStep1()) return;
      setStep(2);
    }
  };


  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.birthdate) {
      notyf.error("First name, last name and birthdate are required.");
      return false;
    }

    if (
      !formData.address.blockOrLot ||
      !formData.address.street ||
      !formData.address.barangay ||
      !formData.address.municipalityOrCity
    ) {
      notyf.error("All address fields are required.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
      return;
    }

    // Confirm and submit
    Swal.fire({
      title: "Confirm Student",
      html: `
        <p><strong>Name:</strong> ${formData.firstName} ${formData.middleName} ${formData.lastName} ${formData.suffix}</p>
        <p><strong>Gender:</strong> ${formData.gender}</p>
        <p><strong>Birthdate:</strong> ${formData.birthdate}</p>
        <p><strong>Address:</strong> 
          ${formData.address.blockOrLot}, 
          ${formData.address.street}, 
          ${formData.address.barangay}, 
          ${formData.address.municipalityOrCity}
        </p>
        <hr/>
        <p><strong>Mother:</strong> ${formData.mother.firstName} ${formData.mother.lastName} (${formData.mother.occupation})</p>
        <p><strong>Father:</strong> ${formData.father.firstName} ${formData.father.lastName} (${formData.father.occupation})</p>
        <p><strong>Emergency:</strong> ${formData.emergency.firstName} ${formData.emergency.lastName} (${formData.emergency.occupation})</p>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Save Student",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (!result.isConfirmed) return;

      const snakeData = toSnakeCase(formData);

      fetch(`${import.meta.env.VITE_API_URL}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(snakeData)
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.student || data.success) {
            notyf.success("Student added successfully!");
            const studentPayload = data.student || snakeData; // fallback
            navigate("/enroll", { state: { studentData: studentPayload } });
          } else {
            notyf.error(data.message || "Failed to add student");
          }
        })
        .catch(() => notyf.error("Server error. Try again."));
    });
  };

  
  const disabled = formData.studentType === "old";
  
  const today = new Date().toISOString().split("T")[0];
  // ---------- RENDER ----------
  return (

    <div className="auth-wrapper py-3 d-flex justify-content-center">
      <div className="auth-content w-100" style={{ maxWidth: "900px" }}>
        <Card className="borderless shadow-lg">
          <Card.Body className="card-body m-3">
            <h2 className="mb-4 f-w-400 text-center text-uppercase" style={{ fontWeight: "900" }}>{step === 1 ? "Student Information" : "Contact Information"}</h2>
            <Form onSubmit={handleSubmit}>
                {/* Student Type */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Student Type</Form.Label>
                      <Form.Select
                        name="studentType"
                        value={formData.studentType}
                        onChange={handleChange}
                        required
                      >
                        <option value="new">New Student</option>
                        <option value="old">Old Student</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                {/* Old Student Search */}
                {formData.studentType === "old" && !isOldStudentSelected && (
                  <Form.Group className="mb-3">
                    <Form.Label>Search Old Student</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Type first, middle, or last name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {oldStudents.length > 0 && (
                      <div
                        className="border p-2 mt-1"
                        style={{ maxHeight: "150px", overflowY: "auto" }}
                      >
                        {oldStudents.map((s) => (
                          <div
                            key={s._id}
                            style={{ padding: "4px", cursor: "pointer" }}
                            onClick={() => handleSelectOldStudent(s)}
                          >
                            {(s.first_name || s.firstName) || ""}{" "}
                            {(s.middle_name || s.middleName) || ""}{" "}
                            {(s.last_name || s.lastName) || ""}
                          </div>
                        ))}
                      </div>
                    )}
                  </Form.Group>
                )}

                {/* STEP 1: Student Core + Address */}
                {step === 1 && (
                  <>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            disabled={disabled}
                            placeholder="Enter first name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Middle Name (Optional)</Form.Label>
                          <Form.Control
                            type="text"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleChange}
                            disabled={disabled}
                            placeholder="Enter middle name (Optional)"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            disabled={disabled}
                            placeholder="Enter last name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Suffix (Optional)</Form.Label>
                          <Form.Control
                            type="text"
                            name="suffix"
                            value={formData.suffix}
                            onChange={handleChange}
                            disabled={disabled}
                            placeholder="Enter suffix (optional)"
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
                            disabled={disabled}
                          >
                            <option>Male</option>
                            <option>Female</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Birthdate <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="date"
                            name="birthdate"
                            value={formData.birthdate}
                            onChange={handleChange}
                            required
                            disabled={disabled}
                            max={today}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <h5 className="mt-3">Address</h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Block/Lot <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="address.blockOrLot"
                            value={formData.address.blockOrLot}
                            onChange={handleChange}
                            placeholder="Enter Block & Lot"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Street <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="address.street"
                            value={formData.address.street}
                            onChange={handleChange}
                            placeholder="Enter street"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Barangay <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="address.barangay"
                            value={formData.address.barangay}
                            onChange={handleChange}
                            placeholder="Enter barangay"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Municipality/City <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="address.municipalityOrCity"
                            value={formData.address.municipalityOrCity}
                            onChange={handleChange}
                            placeholder="Enter municipality or city"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-3">
                      <Button variant="secondary" onClick={handleContinue}>
                        Continue <FeatherIcon icon="chevron-right" />
                      </Button>

                    </div>
                  </>
                )}

                {/* STEP 2: Mother / Father / Emergency */}
                {step === 2 && (
                  <>
                    {/* Mother */}
                    <h5 className="mt-2">Mother</h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="mother.firstName"
                            value={formData.mother.firstName}
                            onChange={handleChange}
                            disabled={disabled}
                            placeholder="Enter first name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Middle Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="mother.middleName"
                            value={formData.mother.middleName}
                            onChange={handleChange}
                            disabled={disabled}
                            placeholder="Enter middle name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="mother.lastName"
                            value={formData.mother.lastName}
                            onChange={handleChange}
                            disabled={disabled}
                            placeholder="Enter last name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Occupation</Form.Label>
                          <Form.Control
                            type="text"
                            name="mother.occupation"
                            value={formData.mother.occupation}
                            onChange={handleChange}
                            disabled={disabled}
                            placeholder="Enter occupation"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Mobile Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="mother.contacts.mobile_number"
                            value={formData.mother.contacts.mobile_number}
                            onChange={handleChange}
                            placeholder="Enter mobile number"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Messenger Account</Form.Label>
                          <Form.Control
                            type="text"
                            name="mother.contacts.messenger_account"
                            value={formData.mother.contacts.messenger_account}
                            onChange={handleChange}
                            placeholder="Enter messenger account"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Block/Lot</Form.Label>
                          <Form.Control
                            type="text"
                            name="mother.address.blockOrLot"
                            value={formData.mother.address.blockOrLot}
                            onChange={handleChange}
                            placeholder="Enter Block/Lot"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Street</Form.Label>
                          <Form.Control
                            type="text"
                            name="mother.address.street"
                            value={formData.mother.address.street}
                            onChange={handleChange}
                            placeholder="Enter street"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Barangay</Form.Label>
                          <Form.Control
                            type="text"
                            name="mother.address.barangay"
                            value={formData.mother.address.barangay}
                            onChange={handleChange}
                            placeholder="Enter barangay"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Municipality/City</Form.Label>
                          <Form.Control
                            type="text"
                            name="mother.address.municipality_or_city"
                            value={formData.mother.address.municipality_or_city}
                            onChange={handleChange}
                            placeholder="Enter municipality or city"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    {/* Father */}
                    <h5 className="mt-4">Father</h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="father.firstName"
                            value={formData.father.firstName}
                            onChange={handleChange}
                            disabled={disabled}
                            placeholder="Enter first name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Middle Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="father.middleName"
                            value={formData.father.middleName}
                            onChange={handleChange}
                            disabled={disabled}
                            placeholder="Enter middle name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="father.lastName"
                            value={formData.father.lastName}
                            onChange={handleChange}
                            disabled={disabled}
                            placeholder="Enter last name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Occupation</Form.Label>
                          <Form.Control
                            type="text"
                            name="father.occupation"
                            value={formData.father.occupation}
                            onChange={handleChange}
                            disabled={disabled}
                            placeholder="Enter occupation"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                     <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Mobile Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="father.contacts.mobile_number"
                            value={formData.father.contacts.mobile_number}
                            onChange={handleChange}
                            placeholder="Enter mobile number"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Messenger Account</Form.Label>
                          <Form.Control
                            type="text"
                            name="father.contacts.messenger_account"
                            value={formData.father.contacts.messenger_account}
                            onChange={handleChange}
                            placeholder="Enter messenger account"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Block/Lot</Form.Label>
                          <Form.Control
                            type="text"
                            name="father.address.blockOrLot"
                            value={formData.father.address.blockOrLot}
                            onChange={handleChange}
                            placeholder="Enter block & lot"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Street</Form.Label>
                          <Form.Control
                            type="text"
                            name="father.address.street"
                            value={formData.father.address.street}
                            onChange={handleChange}
                            placeholder="Enter street"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Barangay</Form.Label>
                          <Form.Control
                            type="text"
                            name="father.address.barangay"
                            value={formData.father.address.barangay}
                            onChange={handleChange}
                            placeholder="Enter barangay"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Municipality/City</Form.Label>
                          <Form.Control
                            type="text"
                            name="father.address.municipality_or_city"
                            value={formData.father.address.municipality_or_city}
                            onChange={handleChange}
                            placeholder="Enter municipality or city"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                   

                    {/* Emergency Contact */}
                    <h5 className="mt-4">Emergency Contact</h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="emergency.firstName"
                            value={formData.emergency.firstName}
                            onChange={handleChange}
                            placeholder="Enter first name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Middle Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="emergency.middleName"
                            value={formData.emergency.middleName}
                            onChange={handleChange}
                            placeholder="Enter middle name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="emergency.lastName"
                            value={formData.emergency.lastName}
                            onChange={handleChange}
                            placeholder="Enter last name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Occupation</Form.Label>
                          <Form.Control
                            type="text"
                            name="emergency.occupation"
                            value={formData.emergency.occupation}
                            onChange={handleChange}
                            placeholder="Enter occupation"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Mobile Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="emergency.contacts.mobile_number"
                            value={formData.emergency.contacts.mobile_number}
                            onChange={handleChange}
                            placeholder="Enter mobile number"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Messenger Account</Form.Label>
                          <Form.Control
                            type="text"
                            name="emergency.contacts.messenger_account"
                            value={formData.emergency.contacts.messenger_account}
                            onChange={handleChange}
                            placeholder="Enter messenger account"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Block/Lot</Form.Label>
                          <Form.Control
                            type="text"
                            name="emergency.address.blockOrLot"
                            value={formData.emergency.address.blockOrLot}
                            onChange={handleChange}
                            placeholder="Enter block & lot"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Street</Form.Label>
                          <Form.Control
                            type="text"
                            name="emergency.address.street"
                            value={formData.emergency.address.street}
                            onChange={handleChange}
                            placeholder="Enter street"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Barangay</Form.Label>
                          <Form.Control
                            type="text"
                            name="emergency.address.barangay"
                            value={formData.emergency.address.barangay}
                            onChange={handleChange}
                            placeholder="Enter barangay"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Municipality/City</Form.Label>
                          <Form.Control
                            type="text"
                            name="emergency.address.municipality_or_city"
                            value={formData.emergency.address.municipality_or_city}
                            onChange={handleChange}
                            placeholder="Enter municipality or city"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    

                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <Button variant="secondary" onClick={() => setStep(1)}>
                        <FeatherIcon icon="chevron-left" /> Back
                      </Button>
                      <Button type="submit" variant="primary">
                        Save Student <FeatherIcon icon="check" />
                      </Button>
                    </div>
                  </>
                )}
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}