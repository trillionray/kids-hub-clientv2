import { useState, useContext } from "react";
import { Form, Button, Card, Container, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/UserContext";
import { Notyf } from "notyf";
import FeatherIcon from "feather-icons-react";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, setUser } = useContext(UserContext);

  const notyf = new Notyf({
     duration: 2000,
     position: { x: "right", y: "top" },
   });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirmation do not match");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/change-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "❌ Error changing password");

      setMessage(`✅ ${data.message}`);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setUser({
        status: "active"
      });

      navigate("/dashboard/home", { replace: true });

    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Retain Password Handler -> Calls /users/activate
  const handleRetainPassword = async () => {
    setMessage("");
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/activate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log(data);

      if(data.message == "User activated successfully"){
        setUser({
          status: "active"
        });

        notyf.success("User activated")
        navigate("/dashboard/home", { replace: true });
      }

      
      if (!res.ok) throw new Error(data.message || "❌ Error activating user");

      

      

    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper pt-5 pb-5">
      <Container className="mt-0 d-flex justify-content-center">
        <Card className="p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
          <h2 className="text-center text-primary mb-4">Change Password</h2>

          {message && (
            <Alert
              variant={message.startsWith("✅") ? "success" : "danger"}
              className="text-center"
            >
              {message}
            </Alert>
          )}

          <Form onSubmit={handleChangePassword}>
            <Form.Group className="mb-3">
              <Form.Label>Old Password</Form.Label>
              <Form.Control
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button
                type="submit"
                variant="primary"
                className="w-50 me-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      className="me-2"
                    />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>

              <Button
                variant="danger"
                className="w-50 d-flex align-items-center justify-content-center"
                onClick={handleRetainPassword}
                disabled={loading}
              >
                <FeatherIcon icon="x" size="16" className="me-2" /> {/* ✅ Exit icon */}
                {loading ? "Please wait..." : "Retain Password"}
              </Button>
            </div>
          </Form>
        </Card>
      </Container>
    </div>
  );
}
