// Top imports (unchanged)
import { useState, useEffect} from 'react';
import { Card, Row, Col, Button, InputGroup, Form } from 'react-bootstrap';


export default function Register() {
    const [student, setStudent] = useState(""); 
    const [referenceNumber, setReferenceNumber] = useState("");
    const [receiptDate, setReceiptDate] = useState("");
    const [amount, setAmount] = useState(""); 
    const [transactionType, setTransactionType] = useState("");
    const [modeOfPayment, setModeOfPayment] = useState("");

    const submitPayment = (e) => {
        e.preventDefault();

        console.log({
        student,
        transactionType,
        amount,
        modeOfPayment,
        referenceNumber,
        receiptDate,
        comment,
        });
    };


    return (
        <div className="auth-wrapper py-3 d-flex justify-content-center">
            <div className="auth-content w-100" style={{ maxWidth: "900px" }}>
                <Card className="borderless shadow-lg">
                    <Card.Body className="card-body">
                        <h2 className="mb-4 f-w-400 text-center text-uppercase" style={{ fontWeight: "900" }}>Record Attendance</h2>
                        <Form onSubmit={submitPayment} className="px-3">

                            <Row>
                                <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Student Name<span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                    type="text"
                                    placeholder="student name..."
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    />
                                </Form.Group>
                                </Col>
                                <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date and Time</Form.Label>
                                

                                    <Form.Select
                                    value={modeOfPayment}
                                    onChange={(e) => setModeOfPayment(e.target.value)}
                                    required
                                    >
                                    <option selected >--Select Payment--</option>
                                    <option value="gcash">Gcash</option>
                                    <option value="bank">Bank</option>
                                    <option value="cash">Cash</option>
                                    </Form.Select>
                                </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                
                                </Col>
                                <Col md={6}>
                                
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Date and Time</Form.Label>
                                    

                                        <Form.Select
                                        value={modeOfPayment}
                                        onChange={(e) => setModeOfPayment(e.target.value)}
                                        required
                                        >
                                        <option selected >--Select Payment--</option>
                                        <option value="gcash">Present</option>
                                        <option value="bank">Cash</option>
                                        <option value="cash">Cash</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col className="mt-3">
                                    <Form.Group className="mb-3">
                                    <Form.Label>
                                        Comment <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}             
                                        placeholder="Enter your comment"
                                        required
                                    />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6} className="ms-auto mt-4">
                                    <Button variant="secondary" className="w-100">
                                    Back
                                    </Button>
                                </Col>
                                <Col md={6} className="ms-auto mt-4">
                                    <Button variant="primary" className="w-100">
                                    Submit
                                    </Button>
                                </Col>
                            </Row>

                        </Form>


                    </Card.Body>
                </Card>
            </div>
        </div>
    );
}