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

  // Get studentData from previous page
  const studentData = location.state?.studentData || null;

  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [programRate, setProgramRate] = useState(0);
  const [branches, setBranches] = useState([]);


  const [formData, setFormData] = useState({
    branch: "",
    student_id: "", // will be set via useEffect
    program_id: "",
    num_of_sessions: "",
    duration: "",
    academic_year_id: "",
    status: "pending",
    total: 0,
  });

  // Auto-fill student_id if we have an old student
  useEffect(() => {
    if (studentData?._id) {
      setFormData((prev) => ({ ...prev, student_id: studentData._id }));
    }
  }, [studentData]);

  useEffect(() => {
    fetchPrograms();
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    const program = programs.find((p) => p._id === formData.program_id);
    if (program) {
      const rate = program.rate || 0;
      const misc = program.miscellaneous_group?.miscs_total || 0;
      setProgramRate(rate);
      setFormData((prev) => ({ ...prev, total: rate + misc }));
    } else {
      setProgramRate(0);
      setFormData((prev) => ({ ...prev, total: 0 }));
    }
  }, [formData.program_id, programs]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch(`${API_URL}/branches/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (data.success) {
          // Only active branches
          const activeBranches = data.branches.filter((b) => b.is_active);
          setBranches(activeBranches);
        } else {
          notyf.error("Failed to fetch branches");
        }
      } catch (err) {
        console.error(err);
        notyf.error("Error fetching branches");
      }
    };
    fetchBranches();
  }, []);

  const fetchPrograms = () => {
    fetch(`${API_URL}/programs`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setPrograms(data.programs || []))
      .catch(() => notyf.error("Failed to fetch programs"));
  };

  const fetchAcademicYears = () => {
    fetch(`${API_URL}/academic-year`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setAcademicYears(data || []))
      .catch(() => notyf.error("Failed to fetch academic years"));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(studentData);
    // Determine studentId
    let studentId = formData.student_id;

    if(studentData._id == undefined){
      console.log("Student ID not received")
    }


    // If no _id, create new student first
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
        console.log("New student created:", data);

        if (!data.student?._id) {
          notyf.error(data.message || "Failed to register student");
          return;
        }

        studentId = data.student._id;
        notyf.success("Student registered successfully!");
      } catch (err) {
        console.error("Student registration error:", err);
        notyf.error("Server error during student registration");
        return;
      }
    }

    // Validate required fields
    if (!formData.branch || !studentId || !formData.program_id) {
      notyf.error("Please select branch, student, and program.");
      console.log("Invalid enrollment form data:", {
        branch: formData.branch,
        student_id: studentId,
        program_id: formData.program_id,
      });
      return;
    }

    // Prepare payload: only include necessary fields
    const enrollmentData = {
      branch: formData.branch,
      student_id: studentId,
      program_id: formData.program_id,
      num_of_sessions: formData.num_of_sessions || undefined,
      duration: formData.duration || undefined,
      academic_year_id: formData.academic_year_id || undefined,
      status: formData.status || "pending",
    };

    console.log("Sending enrollment data:", enrollmentData);

    // Submit enrollment
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
      console.log("Enrollment response:", data);

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
          total: 0,
        });
        setProgramRate(0);
        navigate("/enrollments");
      } else {
        notyf.error(data.message || "Enrollment failed");
      }
    } catch (err) {
      console.error("Enrollment server error:", err);
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
              {branches.map((b) => (
                <option key={b._id} value={b.branch_name}>
                  {b.branch_name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Student</Form.Label>
            {studentData ? (
              <Form.Control
                type="text"
                value={`${studentData.firstName} ${studentData.middleName || ""} ${studentData.lastName}`}
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
              {programs.map((p) => {
                const rate = p.rate || 0;
                const miscTotal = p.miscellaneous_group?.miscs_total || 0;
                const combined = rate + miscTotal;
                return (
                  <option key={p._id} value={p._id}>
                    {p.name} ( Rate: ₱{rate} + Miscellaneous: ₱{miscTotal} = ₱{combined})
                  </option>
                );
              })}
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
                  {new Date(a.startDate).toLocaleDateString()} -{" "}
                  {new Date(a.endDate).toLocaleDateString()}
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
