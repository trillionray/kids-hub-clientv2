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
      firstName && middleName && lastName && email &&
      username && role &&
      password === confirmPassword &&
      password.length >= 8
    ) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [firstName, middleName, lastName, email, username, role, password, confirmPassword]);

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
    <div className="auth-wrapper pt-3 pb-5">
      <div className="auth-content text-center">
        <Card className="borderless">
          <Row className="align-items-center text-center">
            <Col>
              <Card.Body className="card-body">
                <img src={logoDark} alt="" className="img-fluid mb-4" />
                <h4 className="mb-3 f-w-400">Employee Registration</h4>
                <Form onSubmit={registerAdmin}>

                  <InputGroup className="mb-3">
                    <InputGroup.Text><FeatherIcon icon="user" /></InputGroup.Text>
                    <Form.Control type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text><FeatherIcon icon="user" /></InputGroup.Text>
                    <Form.Control type="text" placeholder="Middle Name" value={middleName} onChange={e => setMiddleName(e.target.value)} required />
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text><FeatherIcon icon="user" /></InputGroup.Text>
                    <Form.Control type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text><FeatherIcon icon="user" /></InputGroup.Text>
                    <Form.Control type="text" placeholder="Suffix (optional)" value={suffix} onChange={e => setSuffix(e.target.value)} />
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text><FeatherIcon icon="mail" /></InputGroup.Text>
                    <Form.Control type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text><FeatherIcon icon="user" /></InputGroup.Text>
                    <Form.Control type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text><FeatherIcon icon="briefcase" /></InputGroup.Text>
                    <Form.Select value={role} onChange={e => setRole(e.target.value)} required>
                      <option value="teacher">Teacher</option>
                      <option value="cashier">Cashier</option>
                    </Form.Select>
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text><FeatherIcon icon="lock" /></InputGroup.Text>
                    <Form.Control type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                  </InputGroup>

                  <InputGroup className="mb-4">
                    <InputGroup.Text><FeatherIcon icon="lock" /></InputGroup.Text>
                    <Form.Control type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </InputGroup>

                  <Button className="btn-block mb-4" type="submit" disabled={!isActive}>
                    Sign up
                  </Button>
                </Form>

                <p className="mb-2">
                  Already have an account?{' '}
                  <NavLink to="/login" className="f-w-400">Signin</NavLink>
                </p>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
