import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Spinner, Row, Col } from "react-bootstrap";
import { Notyf } from "notyf";

export default function EditEnrollment() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const notyf = new Notyf();
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [branches, setBranches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [form, setForm] = useState({
    branch: "",
    program_id: "",
    num_of_sessions: "",
    duration: "",
    academic_year_id: "",
    status: "pending",
    total: 0,
    miscellaneous_group_id: "",
    student_id: ""
  });

  // ✅ Initial data loading sequence
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [branchesData, programsData] = await Promise.all([
          fetchBranches(),
          fetchPrograms(),
        ]);
        const academicData = await fetchAcademicYears();
        await fetchEnrollment(academicData); // pass academic years
      } catch (err) {
        console.error(err);
        setError("Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };

    if (enrollmentId) initData();
  }, [enrollmentId]);


  // 🔸 Fetch branches
  const fetchBranches = async () => {
    try {
      const res = await fetch(`${API_URL}/branches/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) {
        const activeBranches = data.branches.filter((b) => b.is_active);
        setBranches(activeBranches);
      } else {
        notyf.error("Failed to fetch branches");
      }
    } catch {
      notyf.error("Error fetching branches");
    }
  };

  // 🔸 Fetch programs
  const fetchPrograms = async () => {
    try {
      const res = await fetch(`${API_URL}/programs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setPrograms(data.programs || []);
    } catch {
      notyf.error("Failed to fetch programs");
    }
  };

  // 🔸 Fetch academic years with formatted names
  const fetchAcademicYears = async () => {
    try {
      const res = await fetch(`${API_URL}/academic-year`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      const data = await res.json();
      const formatted = (data || []).map(ay => {
        const start = new Date(ay.startDate).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric"
        });
        const end = new Date(ay.endDate).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric"
        });
        return { ...ay, displayName: `${start} - ${end}` };
      });
      setAcademicYears(formatted);
      return formatted; // 👈 return list
    } catch (error) {
      console.error("❌ Failed to fetch academic years:", error);
      notyf.error("Failed to fetch academic years");
      return [];
    }
  };

  // 🔸 Fetch enrollment details
  const fetchEnrollment = async (academicData) => {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/enrollments/${enrollmentId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) throw new Error(`Failed to fetch enrollment (${res.status})`);

      const data = await res.json();
      console.log(data)
      console.log("🎯 Enrollment academic_year_id:", data.academic_year_id);
      console.log("🎓 Academic years list:", academicData.map(ay => ay._id));

      setForm({
        branch: data.branch || "",
        program_id: data.program_id?._id || data.program_id || "",
        num_of_sessions: data.num_of_sessions ?? "",
        duration: data.duration || "",
        academic_year_id: data.academic_year_id?.toString() || "",
        status: data.status || "pending",
        total: data.total ?? 0,
        miscellaneous_group_id: data.miscellaneous_group_id || "",
        student_id: data.student_id?._id || data.student_id || ""
      });

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load enrollment");
    }
  };

  // 🔸 Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔸 Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        branch: form.branch,
        program_id: form.program_id || undefined,
        num_of_sessions: form.num_of_sessions === "" ? undefined : Number(form.num_of_sessions),
        duration: form.duration,
        academic_year_id: form.academic_year_id || undefined,
        status: form.status
      };

      const res = await fetch(`${API_URL}/enrollments/${enrollmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || `Update failed (${res.status})`);

      notyf.success("Enrollment updated successfully!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      notyf.error(err.message || "Failed to update enrollment");
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // 🌀 Loading state
  if (loading) {
    return (
      <div className="auth-wrapper pt-5 pb-5 text-center">
        <Spinner animation="border" /> <p className="mt-2">Loading enrollment…</p>
      </div>
    );
  }

  const selectedProgram = programs.find(p => p._id === form.program_id);

  return (
    <div className="auth-wrapper pt-3 pb-5">
      <div className="auth-content text-center">
        <div className="p-5 bg-white">
          <h3 className="mb-4">Edit Enrollment</h3>

          {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="branch">
                  <Form.Label>Branch</Form.Label>
                  <Form.Select
                    name="branch"
                    value={form.branch}
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
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="programId">
                  <Form.Label>Program</Form.Label>
                  <Form.Select
                    name="program_id"
                    value={form.program_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Program --</option>
                    {programs.map((p) => {
                      const rate = p.rate || 0;
                      const miscTotal = p.miscellaneous_group?.miscs_total || 0;
                      return (
                        <option key={p._id} value={p._id}>
                          {p.name} (₱{rate + miscTotal})
                        </option>
                      );
                    })}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>


              {selectedProgram?.category !== "long" && (
                  <>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="numSessions">
                        <Form.Label>No. of Sessions</Form.Label>
                        <Form.Control
                          type="number"
                          name="num_of_sessions"
                          value={form.num_of_sessions}
                          onChange={handleChange}
                          min="0"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="duration">
                        <Form.Label>Duration</Form.Label>
                        <Form.Control
                          type="text"
                          name="duration"
                          value={form.duration}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </>
                )}




              <Form.Group className="mb-3 col-12" controlId="academicYearId">
                <Form.Label>Academic Year</Form.Label>
                <Form.Select
                  name="academic_year_id"
                  value={form.academic_year_id?.toString() || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Academic Year --</option>
                  {academicYears.map(ay => (
                    <option key={ay._id} value={ay._id.toString()}>
                      {ay.displayName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Row>

            <Form.Group className="mb-4" controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={saving}
                className="w-100"
              >
                {saving ? "Saving…" : "Save Changes"}
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate(-1)}
                className="w-100"
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
