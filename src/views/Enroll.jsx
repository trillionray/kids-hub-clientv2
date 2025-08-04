import { useState, useEffect, useContext } from "react";
import { Form, Button, InputGroup, Card } from "react-bootstrap";
import { Notyf } from "notyf";
import UserContext from "../context/UserContext";

export default function Enroll() {
  const { user } = useContext(UserContext);
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();

  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [miscGroups, setMiscGroups] = useState([]);

  const [programRate, setProgramRate] = useState(0);
  const [miscRate, setMiscRate] = useState(0);

  const [formData, setFormData] = useState({
    branch: "",
    student_id: "",
    program_id: "",
    num_of_sessions: "",
    duration: "",
    academic_year_id: "",
    miscellaneous_group_id: "",
    status: "pending",
    total: 0
  });

  useEffect(() => {
    fetchStudents();
    fetchPrograms();
    fetchAcademicYears();
    fetchMiscGroups();
  }, []);

  // Auto-calculate rates and total whenever program or misc group changes
  useEffect(() => {
    const program = programs.find((p) => p._id === formData.program_id);
    const misc = miscGroups.find((m) => m._id === formData.miscellaneous_group_id);

    const programRateVal = program ? program.rate : 0;
    const miscRateVal = misc ? misc.package_price : 0;

    setProgramRate(programRateVal);
    setMiscRate(miscRateVal);

    setFormData((prev) => ({
      ...prev,
      total: programRateVal + miscRateVal
    }));
  }, [formData.program_id, formData.miscellaneous_group_id, programs, miscGroups]);

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
      .then(data => {
      	console.log("Acad years")
      	console.log(data)
      	setAcademicYears(data)
      }
      	
      	)
      .catch(() => notyf.error("Failed to fetch academic years"));
  };

  const fetchMiscGroups = () => {
    fetch(`${API_URL}/miscellaneous-package`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => res.json())
      .then(setMiscGroups)
      .catch(() => notyf.error("Failed to fetch misc groups"));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`${API_URL}/enrollments/enroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(formData)
    })
      .then((res) => res.json())
      .then((data) => {
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
            miscellaneous_group_id: "",
            status: "pending",
            total: 0
          });
          setProgramRate(0);
          setMiscRate(0);
        } else {
          notyf.error(data.message || "Enrollment failed");
        }
      })
      .catch(() => notyf.error("Server error. Please try again."));
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
            <Form.Select
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.middleName} {s.lastName}
                </option>
              ))}
            </Form.Select>
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
              placeholder="Optional - for short programs usually"
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
            <Form.Label>Miscellaneous Group</Form.Label>
            <Form.Select
              name="miscellaneous_group_id"
              value={formData.miscellaneous_group_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Miscellaneous Group</option>
              {miscGroups.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.package_name} (₱{m.package_price})
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


          {/* Breakdown */}
          <div className="mb-3 p-2 border rounded bg-light">
            <p className="mb-1">
              <strong>Program Rate:</strong> ₱{programRate}
            </p>
            <p className="mb-1">
              <strong>Miscellaneous Package Price:</strong> ₱{miscRate}
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
