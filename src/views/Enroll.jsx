import { useState, useEffect, useContext } from "react";
import { Form, Button, InputGroup, Card } from "react-bootstrap";
import { Notyf } from "notyf";
import UserContext from "../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function Enroll() {
  const { user } = useContext(UserContext);
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();
  const location = useLocation();
  const navigate = useNavigate();

  // Get studentData from AddStudent page
  const studentData = location.state?.studentData || null;

  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [programRate, setProgramRate] = useState(0);

  // formData for enrollment
  const [formData, setFormData] = useState({
    branch: "",
    student_id: studentData?._id || "", // If old student selected
    program_id: "",
    num_of_sessions: "",
    duration: "",
    academic_year_id: "",
    status: "pending",
    total: 0
  });

  useEffect(() => {
    fetchStudents();
    fetchPrograms();
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    const program = programs.find((p) => p._id === formData.program_id);
    const programRateVal = program ? program.rate : 0;
    setProgramRate(programRateVal);
    setFormData((prev) => ({ ...prev, total: programRateVal }));
  }, [formData.program_id, programs]);

  const fetchStudents = () => {
    fetch(`${API_URL}/students`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => res.json())
      .then((data) => setStudents(data.students))
      .catch(() => notyf.error("Failed to fetch students"));
  };

  const fetchPrograms = () => {
    fetch(`${API_URL}/programs`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => res.json())
      .then(setPrograms)
      .catch(() => notyf.error("Failed to fetch programs"));
  };

  const fetchAcademicYears = () => {
    fetch(`${API_URL}/academic-year`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => res.json())
      .then(setAcademicYears)
      .catch(() => notyf.error("Failed to fetch academic years"));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let studentId = formData.student_id;

    // If AddStudent provided a new student (not yet registered), register first
    if (studentData && !studentData._id) {
      try {
        const res = await fetch(`${API_URL}/students/`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(studentData)
        });
        const data = await res.json();
        console.log(data)
        if (!data.student) {
          notyf.error(data.message || "Failed to register student");
          return;
        }
        studentId = data.student._id; // Use the newly created student ID
        notyf.success("Student registered successfully!");
      } catch (err) {
        notyf.error("Server error during student registration");
        return;
      }
    }

    // Now enroll the student
    try {
      const enrollmentData = { ...formData, student_id: studentId };
      const res = await fetch(`${API_URL}/enrollments/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(enrollmentData)
      });
      const data = await res.json();
      console.log(data);
      if (data.success) {
        notyf.success(data.message);
        setFormData({
          branch: "",
          student_id: "",
          program_id: "",
          num_of_sessions: "",
          duration: "",
          academic_year_id: "",
          status: "pending",
          total: 0
        });
        setProgramRate(0);
        navigate("/enrollments"); // redirect to enrollment list
      } else {
        notyf.error(data.message || "Enrollment failed");
      }
    } catch (err) {
      notyf.error("Server error. Please try again.");
    }
  };

  return (
    <div className="p-3 px-5">
      <h3 className="mb-4">Enroll Student</h3>
      <Card className="p-3 shadow-sm">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Branch</Form.Label>
            <Form.Select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Branch --</option>
              <option value="Tanza">Tanza</option>
              <option value="General Trias">General Trias</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Student</Form.Label>
            {studentData ? (
              <Form.Control
                type="text"
                value={`${studentData.firstName} ${studentData.middleName} ${studentData.lastName}`}
                disabled
              />
            ) : (
              <p className="text-danger">No student selected. Please select a student first.</p>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Program</Form.Label>
            <Form.Select
              name="program_id"
              value={formData.program_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Program</option>
              {programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (₱{p.rate})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <InputGroup className="mb-3">
            <InputGroup.Text>Number of Sessions</InputGroup.Text>
            <Form.Control
              type="number"
              name="num_of_sessions"
              placeholder="Optional"
              value={formData.num_of_sessions}
              onChange={handleChange}
            />
          </InputGroup>

          <Form.Group className="mb-3">
            <Form.Label>Duration</Form.Label>
            <Form.Control
              type="text"
              name="duration"
              placeholder="Optional"
              value={formData.duration}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Academic Year (optional)</Form.Label>
            <Form.Select
              name="academic_year_id"
              value={formData.academic_year_id}
              onChange={handleChange}
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((a) => (
                <option key={a._id} value={a._id}>
                  {new Date(a.startDate).toLocaleDateString()} - {new Date(a.endDate).toLocaleDateString()}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="enrolled - not fully paid">Enrolled - Not Fully Paid</option>
              <option value="enrolled - fully paid">Enrolled - Fully Paid</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>

          <div className="mb-3 p-2 border rounded bg-light">
            <p className="mb-1">
              <strong>Program Rate:</strong> ₱{programRate}
            </p>
            <hr className="my-2" />
            <p className="mb-0">
              <strong>Total:</strong> ₱{formData.total}
            </p>
          </div>

          <Button variant="primary" type="submit">
            Submit Enrollment
          </Button>
        </Form>
      </Card>
    </div>
  );
}
