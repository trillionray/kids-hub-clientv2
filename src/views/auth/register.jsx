// Top imports (unchanged)
import { useState, useEffect, useRef, useContext} from 'react';
import { NavLink, Navigate, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, InputGroup, Form } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { Notyf } from 'notyf';
import UserContext from '../../context/UserContext';
import logoDark from 'assets/images/logo-dark.svg';
import { OverlayTrigger, Popover } from 'react-bootstrap';


export default function Register() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const notyf = new Notyf({
    position: { 
      x: 'right', 
      y: 'top' 
    },
    duration: 3000, // optional: how long the notification stays
    ripple: true,   // optional: ripple effect
    dismissible: true // optional: allow user to close manually
  });
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
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  useEffect(() => {

    if (
      firstName && lastName && email && role && password && confirmPassword
    ) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [firstName, lastName, email, role, password, confirmPassword]);

  function registerAdmin(e) {
    e.preventDefault();

    const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

    if (!passwordRule.test(password)) {
        notyf.error("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character");
        setPasswordError(true);
        setConfirmPasswordError(false);
        passwordRef.current?.focus();
        return;
    } 
    else if (password !== confirmPassword) {
        notyf.error("Password mismatch");
        setConfirmPasswordError(true);
        setPasswordError(false);
        confirmPasswordRef.current?.focus();
        return;
    }

    fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        middleName,
        lastName,
        suffix,
        email,
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
          setEmail("");
          setUsername("");
          setPassword("");
          setConfirmPassword("");
          setRole("teacher");
          
          setPasswordError(false);
          setConfirmPasswordError(false);

          navigate('/all-users');

        } else if (data.message?.toLowerCase().includes("password")) {
          notyf.error(data.message);

          setPasswordError(true);

          setTimeout(() => {
            passwordRef.current?.focus();
            passwordRef.current?.select(); // highlight text
          }, 100);

        } else {
          notyf.error(data.message || "Something went wrong.");
        }
      })
      .catch((error) => {
        console.error(error);
        notyf.error("Server error. Please try again.");
      });
  }


  // if (user.id) return <Navigate to="/" />;

  return (
    <div className="auth-wrapper py-3 d-flex justify-content-center">
      <div className="auth-content w-100" style={{ maxWidth: "900px" }}>
        <Card className="borderless shadow-lg">
          <Card.Body className="card-body">
            <h2 className="mb-4 f-w-400 text-center text-uppercase" style={{ fontWeight: "900" }}>Employee Registration</h2>
            <Form onSubmit={registerAdmin} className="px-3">
              {/* SECTION 1: Employee Information */}
              <h5 className="mb-3">Employee Information</h5>

              {/* NAME ROW */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Middle Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter middle name"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* LASTNAME + SUFFIX */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
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
              </Row>

              {/* EMAIL + ROLE */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
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
                </Col>
              </Row>


              {/* SECTION 2: Account Information */}
              <h5 className="mt-4 mb-3">Account Information</h5>

              {/* PASSWORD + CONFIRM PASSWORD */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                    <OverlayTrigger
                      trigger={['focus', 'hover']}
                      placement="right"
                      overlay={
                        <Popover id="popover-password">
                          <Popover.Header as="h6">Password should be at least:</Popover.Header>
                          <Popover.Body>
                            <ul className="mb-0">
                              <li>8 characters long</li>
                              <li>One uppercase letter</li>
                              <li>One lowercase letter</li>
                              <li>One number</li>
                              <li>One special character</li>
                            </ul>
                          </Popover.Body>
                        </Popover>
                      }
                    >
                      <Form.Control
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        ref={passwordRef} // 3. Attach the ref here
                        required

                        className={passwordError ? "border border-1 border-danger" : ""}
                      />
                    </OverlayTrigger>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      ref={confirmPasswordRef} // ✅ use the correct ref
                      required
                      className={confirmPasswordError ? "border border-1 border-danger" : ""}
                    />

                  </Form.Group>
                </Col>
              </Row>

              {/* SUBMIT */}
              <Button className="btn-block mb-3 w-100 mt-4" type="submit" disabled={!isActive}>
                Sign up
              </Button>

 
            </Form>


          </Card.Body>
        </Card>
      </div>
    </div>
  );
}