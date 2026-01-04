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

  const [selectionDisabled, setSelectionDisabled] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const notyf = new Notyf();
  const navigate = useNavigate();
  
   const initialFormData = {
     first_name: "",
     middle_name: "",
     last_name: "",
     suffix: "",
     gender: "Male",
     birthdate: "",
     picture_file_path: null, // store file object here
     student_type: "new",
     address: {
       block_or_lot: "",
       street: "",
       barangay: "",
       municipality_or_city: ""
     },
     mother: {
       first_name: "",
       middle_name: "",
       last_name: "",
       suffix: "",
       occupation: "",
       address: {
         block_or_lot: "",
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
       first_name: "",
       middle_name: "",
       last_name: "",
       suffix: "",
       occupation: "",
       address: {
         block_or_lot: "",
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
       first_name: "",
       middle_name: "",
       last_name: "",
       suffix: "",
       occupation: "",
       address: {
         block_or_lot: "",
         street: "",
         barangay: "",
         municipality_or_city: ""
       },
       contacts: {
         mobile_number: "",
         messenger_account: ""
       }
     }
   };


  const [formData, setFormData] = useState(initialFormData);


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
          setOldStudents(data.students || []);
          
          const pendingStudent = data.students.find(s => s.hasPendingEnrollment);
          if (pendingStudent) {
            notyf.warning(`${pendingStudent.first_name} ${pendingStudent.last_name} has a pending enrollment!`);
          }
      })
        .catch(() => notyf.error("Failed to fetch old students"));
    } else {
      setOldStudents([]);
    }
    
  }, [searchQuery, formData.studentType]);
  console.log(searchQuery)

  // ---------- NEW useEffect: Reset isOldStudentSelected when switching studentType ----------
  useEffect(() => {
    setIsOldStudentSelected(false);
    setSearchQuery("");
    setOriginalStudentData(null);

    setFormData((prev) => ({
      ...initialFormData,
      studentType: prev.studentType // ✅ use prev so it doesn't "fight" with select input
    }));
  }, [formData.studentType]);


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
    if (student.hasPendingEnrollment) {
      Swal.fire({
        title: "Pending Enrollment",
        text: `${student.first_name} ${student.last_name} has a pending balance!\nNeed to settle first before continuing.`,
        icon: "warning",
        confirmButtonText: "OK"
      });
    }

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
        suffix: student.mother?.suffix || "",
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
      father: { /* same as above */ },
      emergency: { /* same as above */ },
      picture_file_path: null, // keep null for file input
    };

    setFormData((prev) => ({ ...prev, ...mapped, studentType: "old" }));

    // ✅ Show old student picture
    if (student.picture_file_path) {
      setPreviewImage(`${import.meta.env.VITE_API_URL}${student.picture_file_path}`);
    } else {
      setPreviewImage(null);
    }

    setOriginalStudentData({
      ...mapped,
      hasPendingEnrollment: student.hasPendingEnrollment
    });

    setOldStudents([]);
    setSearchQuery("");
    setIsOldStudentSelected(true);
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
    setSelectionDisabled(true);

    if (formData.studentType === "old") {
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
            setIsOldStudentSelected(true); // 👈 Hides search bar
          }
        });
      } else {
        setStep(2);
        setIsOldStudentSelected(true); // 👈 Hides search bar
      }
    } else {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1 validation
    if (step === 1 && !validateStep1()) return;

    try {
      const formPayload = new FormData();

      // Append all fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "picture_file_path") {
          if (value instanceof File) {
            formPayload.append("picture_file_path", value); // ✅ File
          }
        } else if (typeof value === "object") {
          formPayload.append(key, JSON.stringify(value)); // nested objects
        } else {
          formPayload.append(key, value); // string fields
        }
      });

      const res = await fetch(`${import.meta.env.VITE_API_URL}/students`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formPayload, // must not set Content-Type manually
      });

      const data = await res.json();

      if (data.message.includes("successfully")) {
        notyf.success("Student saved successfully!");
        navigate("/enroll", { state: { studentData: data.student || formData } });
      } else {
        notyf.error(data.message || "Failed to save student");
      }
    } catch (err) {
      console.error(err);
      notyf.error("Server error. Try again.");
    }
  };








  
  const disabled = formData.studentType === "old";
  
  const today = new Date().toISOString().split("T")[0];

  const hasRegisteredContact = (person) => {
    return (
      person.firstName.trim() &&
      person.lastName.trim() &&
      person.suffix.trim() &&
      person.occupation.trim()
    );
  };


  // ---------- RENDER ----------
  return (

    <div className="auth-wrapper py-3 d-flex justify-content-center">
      <div className="auth-content w-100" style={{ maxWidth: "900px" }}>
        <Card className="borderless shadow-lg">
          <Card.Body className="card-body m-3">
            <h2 className="mb-4 f-w-400 text-center text-uppercase" style={{ fontWeight: "900" }}>{step === 1 ? "Student Information" : "Contact Information"}</h2>
            <Form onSubmit={handleSubmit}>
  
                
                

                {/* STEP 1: Student Core + Address */}
                {step === 1 && (
                  <>
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

                     <Row className="align-items-end">
                       <Col md={6}>
                         <Form.Group className="mb-3">
                           <Form.Label>Student Picture (Optional)</Form.Label>
                           <Form.Control
                             type="file"
                             accept="image/*"
                             onChange={(e) => {
                               const file = e.target.files[0];
                               setFormData((prev) => ({ ...prev, picture_file_path: file }));
                               if (file) setPreviewImage(URL.createObjectURL(file));
                             }}
                           />
                         </Form.Group>
                       </Col>

                       <Col md={6} className="d-flex justify-content-center">
                         {previewImage && (
                           <img
                             src={previewImage}
                             alt="Student Preview"
                             style={{
                               width: "120px",
                               height: "120px",
                               objectFit: "cover",
                               borderRadius: "8px",
                               marginBottom: "10px"
                             }}
                           />
                         )}
                       </Col>
                     </Row>




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

                    <h6 className="mt-3">Address</h6>
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
                      <Button
                        variant={formData.studentType === "old" && originalStudentData?.hasPendingEnrollment ? "danger" : "primary"}
                        onClick={handleContinue}
                        disabled={formData.studentType === "old" && originalStudentData?.hasPendingEnrollment}
                      >
                        {formData.studentType === "old" && originalStudentData?.hasPendingEnrollment
                          ? "Go to Cashier"
                          : "Continue"}{" "}
                        <FeatherIcon icon="chevron-right" />
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
                            disabled={
                                formData.studentType === "old" &&
                                hasRegisteredContact(formData.mother)
                              }
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
                            disabled={
                                formData.studentType === "old" &&
                                hasRegisteredContact(formData.mother)
                              }
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
                            disabled={
                                formData.studentType === "old" &&
                                hasRegisteredContact(formData.mother)
                              }
                            placeholder="Enter last name"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Suffix (Optional)</Form.Label>
                          <Form.Control
                            type="text"
                            name="mother.suffix"
                            value={formData.mother.suffix}
                            onChange={handleChange}
                            placeholder="e.g. Jr., Sr., II"
                            disabled={
                                formData.studentType === "old" &&
                                hasRegisteredContact(formData.mother)
                              }
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
                            disabled={
                                formData.studentType === "old" &&
                                hasRegisteredContact(formData.mother)
                              }
                            placeholder="Enter occupation"
                          />
                        </Form.Group>
                      </Col>
                    
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Mobile Number</Form.Label>
                          <div className="input-group">
                            <Form.Select
                              name="mother.contacts.country_code"
                              disabled={disabled}
                              onChange={handleChange}
                              className="input-group-text border-end-0 bg-light"
                              style={{ maxWidth: "110px" }}
                            >
                              <option value="+63">+63 🇵🇭</option>
                              <option value="+1">+1 🇺🇸</option>
                              <option value="+44">+44 🇬🇧</option>
                              <option value="+82">+82 🇰🇷</option>
                              {/* Add more country codes as needed */}
                            </Form.Select>

                            <Form.Control
                              type="number"
                              name="mother.contacts.mobile_number"
                              value={formData.mother.contacts.mobile_number}
                              onChange={handleChange}
                              placeholder="9123456789"
                              className="border-start-0"
                            />
                          </div>
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

                      <h6 className="mt-3">Address</h6>
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

                    <hr/>
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
                            disabled={
                                formData.studentType === "old" &&
                                hasRegisteredContact(formData.mother)
                              }
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
                            disabled={
                                formData.studentType === "old" &&
                                hasRegisteredContact(formData.mother)
                              }
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
                            disabled={
                                formData.studentType === "old" &&
                                hasRegisteredContact(formData.mother)
                              }
                            placeholder="Enter last name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Suffix (Optional)</Form.Label>
                          <Form.Control
                            type="text"
                            name="father.suffix"
                            value={formData.father.suffix}
                            onChange={handleChange}
                            placeholder="e.g. Jr., Sr., II"
                            disabled={
                                formData.studentType === "old" &&
                                hasRegisteredContact(formData.mother)
                              }
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
                            disabled={
                                formData.studentType === "old" &&
                                hasRegisteredContact(formData.mother)
                              }
                            placeholder="Enter occupation"
                          />
                        </Form.Group>
                      </Col>
                    
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Mobile Number</Form.Label>
                          <div className="input-group">
                            <Form.Select
                              name="father.contacts.country_code"
                              value={formData.father.contacts.country_code}
                              onChange={handleChange}
                              className="input-group-text border-end-0 bg-light"
                              style={{ maxWidth: "110px" }}
                            >
                              <option value="+63">+63 🇵🇭</option>
                              <option value="+1">+1 🇺🇸</option>
                              <option value="+44">+44 🇬🇧</option>
                              <option value="+82">+82 🇰🇷</option>
                              {/* Add more country codes as needed */}
                            </Form.Select>

                            <Form.Control
                              type="number"
                              name="father.contacts.mobile_number"
                              value={formData.father.contacts.mobile_number}
                              onChange={handleChange}
                              placeholder="9123456789"
                              className="border-start-0"
                            />
                          </div>
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

                       <h5 className="mt-3">Address</h5>

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

                   <hr />

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
                          <Form.Label>Suffix (Optional)</Form.Label>
                          <Form.Control
                            type="text"
                            name="father.suffix"
                            value={formData.father.suffix}
                            onChange={handleChange}
                            placeholder="e.g. Jr., Sr., II"

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
                    
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Mobile Number</Form.Label>
                          <div className="input-group">
                            <Form.Select
                              name="emergency.contacts.country_code"
                              value={formData.emergency.contacts.country_code}
                              onChange={handleChange}
                              className="input-group-text border-end-0 bg-light"
                              style={{ maxWidth: "110px" }}
                            >
                              <option value="+63">+63 🇵🇭</option>
                              <option value="+1">+1 🇺🇸</option>
                              <option value="+44">+44 🇬🇧</option>
                              <option value="+82">+82 🇰🇷</option>
                              {/* Add more country codes as needed */}
                            </Form.Select>

                            <Form.Control
                              type="number"
                              name="emergency.contacts.mobile_number"
                              value={formData.emergency.contacts.mobile_number}
                              onChange={handleChange}
                              placeholder="9123456789"
                              className="border-start-0"
                            />
                          </div>
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


                    <h6 className="mt-3">Address</h6>
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
                        Continue <FeatherIcon icon="check" />
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