import { useState } from "react";
import { Form, Button, Card, Container, Alert, Spinner } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      console.log("New password and confirmation do not match");
      setMessage("New password and confirmation do not match");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(data.message || "❌ Error changing password");

      setMessage(`✅ ${data.message}`);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      navigate("/dashboard/home", { replace: true });
    } catch (err) {
      console.log(err)
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

      	      <Button
      	        type="submit"
      	        variant="primary"
      	        className="w-100"
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
      	    </Form>
      	  </Card>
      	</Container>

  </div>
    
  );
}
