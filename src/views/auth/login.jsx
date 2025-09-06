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
          retrieveUserDetails(data.access);
          setUserId("");
          setPassword("");
          notyf.success("You are now logged in");
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
        });
      });
  }

  useEffect(() => {
    setIsActive(userId !== "" && password !== "");
  }, [userId, password]);

  return (
    <div className="auth-wrapper">
      <div className="auth-content text-center">
        <Card className="borderless p-0">
          <Row className="align-items-center text-center">
            <Col>
              <Card.Body className="card-body">
                <h4 className="mb-3 f-w-400">Login</h4>
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
                    className="btn btn-block btn-primary mb-4"
                    disabled={!isActive}
                  >
                    Sign in
                  </Button>
                </Form>
                <p className="m-0">
                  Created by <strong>Trillion Ray</strong>
                </p>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
