import { useState, useEffect, useContext } from "react";
import { Form, Button, InputGroup, Card, Row, Col  } from "react-bootstrap";
import { Notyf } from "notyf";
import UserContext from "../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function Enroll() {
  
  const { user } = useContext(UserContext);
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const location = useLocation();
  const navigate = useNavigate();

  const studentData = location.state?.studentData || null;

  const [showMiscs, setShowMiscs] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [latestAcademicYear, setLatestAcademicYear] = useState(null);
  const [programRate, setProgramRate] = useState(0);
  const [branches, setBranches] = useState([]);
  const [programType, setProgramType] = useState("");
  const [miscellaneousTotal, setMiscellaneousTotal] = useState(0);
  const [miscs, setMiscs] = useState([]);
  const [programCapacity, setProgramCapacity] = useState(null);
  const [enrollCount, setEnrollCount] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [discountPercentage, setDiscountPercentage] = useState([]);

  const [formData, setFormData] = useState({
    branch: "",
    student_id: "",
    program_id: "",
    num_of_sessions: "",
    duration: "",
    academic_year_id: "",
    status: "pending",
    total: 0,
    discount_id: "", // ✅ New field
  });

  useEffect(() => {
    if (studentData?._id) {
      setFormData((prev) => ({ ...prev, student_id: studentData._id }));
    }
  }, [studentData]);

  useEffect(() => {
    fetchPrograms();
    fetchAcademicYears();
    fetchBranches();
    fetchDiscounts(); // ✅ fetch discounts
  }, []);

  // Update total when program or discount changes
  useEffect(() => {
    const program = programs.find((p) => p._id === formData.program_id);
    if (program) {
      const rate = program.rate || 0;
      const misc = program.miscellaneous_group?.miscs_total || 0;
      setProgramRate(rate);
      setMiscellaneousTotal(misc);
      setMiscs(program.miscellaneous_group?.miscs || []);
      setProgramCapacity(program.capacity || 0);
      fetchEnrollCount(program._id);

      let total = rate + misc;

      setDiscountPercentage(undefined);
      // Apply discount
      if (formData.discount_id) {
        const selectedDiscount = discounts.find(d => d._id === formData.discount_id);
        console.log(selectedDiscount);
        setDiscountPercentage(selectedDiscount.percentage)

        if (selectedDiscount && selectedDiscount.is_active) {
          total = total - (total * (discountPercentage / 100));
        }
      }

      setFormData(prev => ({ ...prev, total }));
    } else {
      setProgramRate(0);
      setMiscellaneousTotal(0);
      setMiscs([]);
      setProgramCapacity(null);
      setFormData(prev => ({ ...prev, total: 0 }));
    }
  }, [formData.program_id, formData.discount_id, programs, discounts, discountPercentage]);

  const fetchPrograms = async () => {
    try {
      const res = await fetch(`${API_URL}/programs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setPrograms(data.programs || []);
    } catch {
      notyf.error("Failed to fetch programs");
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const res = await fetch(`${API_URL}/academic-year`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setAcademicYears(data || []);

      const latestRes = await fetch(`${API_URL}/academic-year/latest`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const latestData = await latestRes.json();
      if (latestData) {
        setLatestAcademicYear(latestData);
        setFormData(prev => ({ ...prev, academic_year_id: prev.academic_year_id || latestData._id }));
      }
    } catch {
      notyf.error("Failed to fetch academic years");
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch(`${API_URL}/branches/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) setBranches(data.branches.filter(b => b.is_active));
    } catch {
      notyf.error("Error fetching branches");
    }
  };

  // ✅ Fetch discounts
  const fetchDiscounts = async () => {
    try {
      const res = await fetch(`${API_URL}/discounts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      console.log(data)
      setDiscounts(data.data || []);
    } catch {
      notyf.error("Failed to fetch discounts");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "program_type") {
      setProgramType(value);
      setFormData(prev => ({ ...prev, program_id: "" }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let studentId = formData.student_id;

    if (studentData && !studentData._id) {
      try {
        const res = await fetch(`${API_URL}/students`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(studentData),
        });
        const data = await res.json();
        if (!data.student?._id) {
          notyf.error(data.message || "Failed to register student");
          return;
        }
        studentId = data.student._id;
        notyf.success("Student registered successfully!");
      } catch {
        notyf.error("Server error during student registration");
        return;
      }
    }

    if (!formData.branch || !studentId || !formData.program_id) {
      notyf.error("Please select branch, student, and program.");
      return;
    }

    const enrollmentData = {
      branch: formData.branch,
      student_id: studentId,
      program_id: formData.program_id,
      num_of_sessions: formData.num_of_sessions || undefined,
      duration: formData.duration || undefined,
      academic_year_id: formData.academic_year_id || latestAcademicYear?._id,
      status: formData.status || "pending",
      discount_id: formData.discount_id || undefined, // ✅ include discount
    };

    try {
      const res = await fetch(`${API_URL}/enrollments/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(enrollmentData),
      });
      const data = await res.json();
      if (data.success) {
        notyf.success(data.message);
        setFormData({
          branch: "",
          student_id: "",
          program_id: "",
          num_of_sessions: "",
          duration: "",
          academic_year_id: latestAcademicYear?._id || "",
          status: "pending",
          total: 0,
          discount_id: "",
        });
        setProgramRate(0);


        fetch(`${API_URL}/logs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                user: user.id, 
                task: "Enroll Student", 
                documentLog: data
              }) // datetime is automatic in backend
          })
          .then(res => res.json())
          .then(data => {
            console.log(data)
            if (data.log) {
              console.log('Log added successfully:', data.log);
            } else {
              console.error('Error adding log:', data.message);
            }
          })
          .catch(err => {
            console.error('Server error:', err.message);
          });


        navigate("/enrollments");
      } else {
        notyf.error(data.message || "Enrollment failed");
      }
    } catch {
      notyf.error("Server error. Please try again.");
    }
  };

  const fetchEnrollCount = async (programId) => {
    if (!programId) {
      setEnrollCount(null);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/enrollments/count/${programId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setEnrollCount(data.success ? data.enrollment_count : null);
    } catch {
      setEnrollCount(null);
    }
  };

  return (
    <div className="auth-wrapper py-3 d-flex justify-content-center">
      <div className="auth-content w-100" style={{ maxWidth: "900px" }}>
        <Card className="borderless shadow-lg">
          <Card.Body className="card-body m-3">
            <h2 className="mb-4 f-w-400 text-center text-uppercase">ENROLLMENT FORM</h2>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Branch</Form.Label>
                    <Form.Select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Branch --</option>
                      {branches.map((b) => (
                        <option key={b._id} value={b.branch_name}>{b.branch_name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Student</Form.Label>
                    {studentData ? (
                      <Form.Control
                        type="text"
                        value={`${studentData.first_name} ${studentData.middle_name || ""} ${studentData.last_name}`}
                        disabled
                      />
                    ) : (
                      <p className="text-danger">No student selected. Please select a student first.</p>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Program Type</Form.Label>
                    <Form.Select
                      name="program_type"
                      value={programType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Program Type --</option>
                      <option value="short">Short Program</option>
                      <option value="long">Full Program</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Program</Form.Label>
                    <Form.Select
                      name="program_id"
                      value={formData.program_id}
                      onChange={handleChange}
                      required
                      disabled={!programType}
                    >
                      <option value="">Select Program</option>
                      {programs.filter(p => !programType || p.category === programType).map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </Form.Select>

                    {programCapacity !== null && <p className="mt-1 mb-0 text-muted"><strong>Program Capacity:</strong> {programCapacity}</p>}
                    {enrollCount !== null && <p className="mb-0 text-muted"><strong>Current Enrollees:</strong> {enrollCount}</p>}
                    {programCapacity !== null && enrollCount !== null && (
                      <p className="mt-1 mb-0 text-muted"><strong>Remaining Slot:</strong> {programCapacity - enrollCount}</p>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              {programType === "short" && (
                <Row>
                  <Col md={6}>
                    <InputGroup className="mb-3">
                      <InputGroup.Text># of Sessions Per Week</InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="num_of_sessions"
                        placeholder="Optional"
                        value={formData.num_of_sessions}
                        onChange={handleChange}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={6}>
                    <InputGroup className="mb-3">
                      <InputGroup.Text>Duration</InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="duration"
                        placeholder="Optional"
                        value={formData.duration}
                        onChange={handleChange}
                      />
                    </InputGroup>
                  </Col>
                </Row>
              )}

              {/* Discount Selection */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Discount</Form.Label>
                    <Form.Select
                      name="discount_id"
                      value={formData.discount_id}
                      onChange={handleChange}
                    >
                      <option value="">-- No Discount --</option>
                      {discounts.map(d => (
                        <option key={d._id} value={d._id}>
                          {d.discount_name} ({d.percentage}%)
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div className="mb-3 p-2 border rounded bg-light">
                <p className="mb-1"><strong>Program Rate:</strong> ₱{programRate.toLocaleString()}</p>
                <p className="mb-1"><strong>Miscellaneous:</strong> ₱{miscellaneousTotal.toLocaleString()}</p>
                <p className="mb-1"><strong>Discount:</strong> - ₱{discountPercentage ? (programRate / discountPercentage) : "None"} </p>

                {miscs.length > 0 && (
                  <div className="mb-2">
                    <Button variant="link" className="p-0 mb-2" onClick={() => setShowMiscs(prev => !prev)}>
                      {showMiscs ? "Hide Miscellaneous Details ▲" : "Show Miscellaneous Details ▼"}
                    </Button>
                    {showMiscs && (
                      <ul className="mb-0 ps-3">
                        {miscs.map((item, index) => (
                          <li key={index}>{item.name} — ₱{item.price.toLocaleString()}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                <hr className="my-2" />
                <p className="mb-0"><strong>Total:</strong> ₱{formData.total.toLocaleString()}</p>
              </div>

              {programCapacity !== null && enrollCount !== null && enrollCount < programCapacity ? (
                <Button variant="primary" type="submit">Submit Enrollment</Button>
              ) : (
                <Button variant="secondary" type="button" disabled>Program Full</Button>
              )}
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
