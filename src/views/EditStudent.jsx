import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Spinner, Card } from "react-bootstrap";
import { Notyf } from "notyf";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const notyf = new Notyf();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/students/get-student-by-id/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          // ✅ Ensure nested objects exist to avoid "undefined" errors
          setStudent({
            ...data,
            address: data.address || {},
            mother: {
              ...data.mother,
              address: data.mother?.address || {},
              contacts: data.mother?.contacts || {},
            },
            father: {
              ...data.father,
              address: data.father?.address || {},
              contacts: data.father?.contacts || {},
            },
            emergency: {
              ...data.emergency,
              address: data.emergency?.address || {},
              contacts: data.emergency?.contacts || {},
            },
          });
        } else {
          notyf.error("Student not found");
        }
      })
      .catch(() => notyf.error("Failed to fetch student"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Handle nested fields using dot notation e.g. "mother.first_name"
    if (name.includes(".")) {
      const [parent, child, subchild] = name.split(".");
      setStudent((prev) => ({
        ...prev,
        [parent]: subchild
          ? {
              ...prev[parent],
              [child]: {
                ...prev[parent]?.[child],
                [subchild]: value,
              },
            }
          : {
              ...prev[parent],
              [child]: value,
            },
      }));
    } else {
      setStudent((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    fetch(`${API_URL}/students/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(student),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          notyf.success("Student updated successfully");
          navigate("/students");
        } else {
          notyf.error(data?.message || "Update failed");
        }
      })
      .catch(() => notyf.error("Server error"))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="container mt-5">
      <Card className="p-4 shadow mb-4">
        <h3 className="mb-3">Edit Student</h3>
        <Form onSubmit={handleSubmit}>
          {/* ✏️ Basic Info */}
          <div className="row">
            <div className="col-md-4 mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={student.first_name || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4 mb-3">
              <Form.Label>Middle Name</Form.Label>
              <Form.Control
                type="text"
                name="middle_name"
                value={student.middle_name || ""}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4 mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={student.last_name || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4 mb-3">
              <Form.Label>Gender</Form.Label>
              <Form.Select
                name="gender"
                value={student.gender || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Form.Select>
            </div>
            <div className="col-md-4 mb-3">
              <Form.Label>Birthdate</Form.Label>
              <Form.Control
                type="date"
                name="birthdate"
                value={student.birthdate?.substring(0, 10) || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* 🏡 Address */}
          <hr />
          <h5>Address</h5>
          <div className="row">
            {["block_or_lot", "street", "barangay", "municipality_or_city"].map((field) => (
              <div className="col-md-3 mb-3" key={field}>
                <Form.Label className="text-capitalize">{field.replace(/_/g, " ")}</Form.Label>
                <Form.Control
                  type="text"
                  name={`address.${field}`}
                  value={student.address?.[field] || ""}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>

          {/* 👩 Mother */}
          <hr />
          <h5>Mother's Information</h5>
          <div className="row">
            {["first_name", "middle_name", "last_name", "occupation"].map((field) => (
              <div className="col-md-3 mb-3" key={`mother-${field}`}>
                <Form.Label className="text-capitalize">{field.replace(/_/g, " ")}</Form.Label>
                <Form.Control
                  type="text"
                  name={`mother.${field}`}
                  value={student.mother?.[field] || ""}
                  onChange={handleChange}
                />
              </div>
            ))}
            <div className="col-md-3 mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="text"
                name="mother.contacts.mobile_number"
                value={student.mother?.contacts?.mobile_number || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 👨 Father */}
          <hr />
          <h5>Father's Information</h5>
          <div className="row">
            {["first_name", "middle_name", "last_name", "occupation"].map((field) => (
              <div className="col-md-3 mb-3" key={`father-${field}`}>
                <Form.Label className="text-capitalize">{field.replace(/_/g, " ")}</Form.Label>
                <Form.Control
                  type="text"
                  name={`father.${field}`}
                  value={student.father?.[field] || ""}
                  onChange={handleChange}
                />
              </div>
            ))}
            <div className="col-md-3 mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="text"
                name="father.contacts.mobile_number"
                value={student.father?.contacts?.mobile_number || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 🚨 Emergency Contact */}
          <hr />
          <h5>Emergency Contact</h5>
          <div className="row">
            {["first_name", "middle_name", "last_name", "occupation"].map((field) => (
              <div className="col-md-3 mb-3" key={`emergency-${field}`}>
                <Form.Label className="text-capitalize">{field.replace(/_/g, " ")}</Form.Label>
                <Form.Control
                  type="text"
                  name={`emergency.${field}`}
                  value={student.emergency?.[field] || ""}
                  onChange={handleChange}
                />
              </div>
            ))}
            <div className="col-md-3 mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="text"
                name="emergency.contacts.mobile_number"
                value={student.emergency?.contacts?.mobile_number || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 📝 Submit */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => navigate("/students")}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
