import { useEffect, useState, useContext } from "react";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import UserContext from "../context/UserContext";

export default function Profile() {
  const { user } = useContext(UserContext);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    fetch(`${API_URL}/users/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setDetails(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setLoading(false);
      });
  }, [API_URL]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!details) {
    return <h4 className="text-center mt-5">Unable to load profile</h4>;
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-content text-center">
        <Card className="borderless p-4 pb-2">
          <Row className="align-items-center text-center pb-0 mb-0">
            <Col>
              <Card.Body className="card-body">
                <h3 className="mb-3">My Profile</h3>
                <p><strong>ID:</strong> {details._id}</p>
                <p><strong>Name:</strong> {details.firstName} {details.lastName}</p>
                <p><strong>Email:</strong> {details.email || "N/A"}</p>
                <p><strong>Role:</strong> {details.role}</p>

                {/* 🔗 Change Password Button */}
                <div className="mt-4">
                  <Button as={Link} to="/profile/change-password" variant="primary" className="text-white">
                    Change Password
                  </Button>
                </div>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
