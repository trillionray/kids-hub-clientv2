import { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Card, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { Notyf } from "notyf";
import UserContext from "../../context/UserContext";

export default function Login() {
  const notyf = new Notyf();
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  // 🔑 Use userId instead of username
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (user?.id) {
      navigate("/dashboard/home", { replace: true });
    }
  }, [user, navigate]);

  function authenticate(e) {
    e.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: userId, password }), // ✅ Send _id instead of username
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.access) {
          localStorage.setItem("token", data.access);
          setUserId("");
          setPassword("");
          notyf.success("You are now logged in");

          retrieveUserDetails(data.access);

          navigate("/dashboard/home", { replace: true });
        } else {
          notyf.error(data.message || "Invalid ID or password");
        }
      })
      .catch(() => notyf.error("Server not responding. Please wait."));
  }

  function retrieveUserDetails(token) {
    fetch(`${import.meta.env.VITE_API_URL}/users/details`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser({
          id: data._id, // ✅ user ID
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          status: data.status
        });

        if (data.status == "initial"){
            navigate("/profile/change-password", { replace: true });
        }
      });
  }

  useEffect(() => {
    setIsActive(userId !== "" && password !== "");
  }, [userId, password]);

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="auth-content w-100" style={{ maxWidth: "800px" }}>
        <Row className="g-0 shadow rounded overflow-hidden">
          {/* Left Side - Logo Section */}
          <Col
            md={6}
            className="d-flex justify-content-center align-items-center"
            style={{ backgroundColor: "#ffffff" }} // White background
          >
            <div className="p-5 text-center">
              <img
                src="/logo-nobackground.png" // ✅ Remove /public prefix (React automatically serves from /public)
                alt="Logo"
                className="img-fluid rounded-circle"
                style={{ maxWidth: "370px", width: "100%" }}
              />
            </div>
          </Col>

          {/* Right Side - Form Section */}
          <Col
            md={6}
            className="d-flex justify-content-center align-items-center"
            style={{ backgroundColor: "#89C7E7" }} // Light blue background
          >
            <div className="w-75 bg-white p-4 rounded shadow">
              {/* Put the form inside a white box for better contrast */}
              <h1 className="mb-3 fw-bold text-center">Login</h1>

              <Form onSubmit={authenticate} className="m-0 p-0">
                <InputGroup className="mb-3">
                  <InputGroup.Text>
                    <FeatherIcon icon="hash" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Enter your ID (e.g. AN202500001)"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                  />
                </InputGroup>

                <InputGroup className="mb-3">
                  <InputGroup.Text>
                    <FeatherIcon icon="lock" />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </InputGroup>

                <Button
                  type="submit"
                  className="btn btn-block btn-primary mb-4 w-100"
                  disabled={!isActive}
                >
                  Sign in
                </Button>
              </Form>

              <p className="m-0 text-center">
                Created by <strong>Trillion Ray</strong>
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );



}
