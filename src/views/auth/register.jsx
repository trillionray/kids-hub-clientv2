// Top imports (unchanged)
import { useState, useEffect, useContext } from 'react';
import { NavLink, Navigate } from 'react-router-dom';
import { Card, Row, Col, Button, InputGroup, Form } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { Notyf } from 'notyf';
import UserContext from '../../context/UserContext';
import logoDark from 'assets/images/logo-dark.svg';

export default function SignUp1() {
  const { user } = useContext(UserContext);
  const notyf = new Notyf();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [email, setEmail] = useState(""); // ✅ added
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("teacher");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isActive, setIsActive] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (
      firstName && lastName && email && role &&
      password === confirmPassword &&
      password.length >= 8
    ) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [firstName, lastName, email, role, password, confirmPassword]);

  function registerAdmin(e) {
    e.preventDefault();

    fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        middleName,
        lastName,
        suffix,
        email,
        password,
        role
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === "User registered successfully") {
          notyf.success("Registration successful!");

          // Reset fields
          setFirstName("");
          setMiddleName("");
          setLastName("");
          setSuffix("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setRole("teacher");
        } else {
          notyf.error(data.message || "Something went wrong.");
        }
      })
      .catch((error) => {
        console.error(error);
        notyf.error("Server error. Please try again.");
      });
  }


  function registerAdmin(e) {
    e.preventDefault();

    fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        middleName,
        lastName,
        suffix,
        email, // ✅ included
        username,
        password,
        role
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === "User registered successfully") {
          notyf.success("Registration successful!");

          // Reset fields
          setFirstName("");
          setMiddleName("");
          setLastName("");
          setSuffix("");
          setEmail(""); // ✅
          setUsername("");
          setPassword("");
          setConfirmPassword("");
          setRole("teacher");
        } else {
          notyf.error(data.message || "Something went wrong.");
        }
      })
      .catch((error) => {
        console.log(error)
        notyf.error("Server error. Please try again.");
      });
  }

  // if (user.id) return <Navigate to="/" />;

  return (
    <div className="auth-wrapper pt-3 pb-5 d-flex justify-content-center">
      <div className="auth-content w-100" style={{ maxWidth: "900px" }}>
        <Card className="borderless shadow-lg">
          <Card.Body className="card-body">
            <h4 className="mb-4 f-w-400 text-center">Employee Registration</h4>
            <Form onSubmit={registerAdmin}>
              <Row>
                {/* LEFT COLUMN */}
                <Col md={6} className="pe-md-3">
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Middle Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter middle name"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Suffix (Optional)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter suffix (optional)"
                      value={suffix}
                      onChange={(e) => setSuffix(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                {/* RIGHT COLUMN */}
                <Col md={6} className="ps-md-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </Form.Group> */}

                  <Form.Group className="mb-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="teacher">Teacher</option>
                      <option value="cashier">Cashier</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Submit button centered below both columns */}
              <Button className="btn-block mb-3 w-100" type="submit" disabled={!isActive}>
                Sign up
              </Button>

              <p className="mb-2 text-center">
                Already have an account?{' '}
                <NavLink to="/login" className="f-w-400">Signin</NavLink>
              </p>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}