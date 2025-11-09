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
                        <h2 className="mb-4 f-w-400 text-center text-uppercase" style={{ fontWeight: "900" }}>Transaction</h2>
                        <Form onSubmit={submitPayment} className="px-3">
                            <Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Student</Form.Label>
                                    <Form.Select
                                    value={student}
                                    onChange={(e) => setStudent(e.target.value)}
                                    required
                                    >
                                    <option value="teacher">Teacher</option>
                                    <option value="cashier">Cashier</option>
                                    </Form.Select>
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Transaction Type</Form.Label>
                                    <Form.Select
                                    value={transactionType}
                                    onChange={(e) => setTransactionType(e.target.value)}
                                    required
                                    >
                                    <option selected>--Select Transaction Type--</option>
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                    </Form.Select>
                                </Form.Group>
                            </Row>

                            <Row>
                                <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Amount<span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                    type="number"
                                    placeholder="amount..."
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    />
                                </Form.Group>
                                </Col>
                                <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mode of Payment</Form.Label>
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
                                <Form.Group className="mb-3">
                                    <Form.Label>Reference Number<span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                    type="text"
                                    placeholder="Enter reference number"
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    required
                                    />
                                </Form.Group>
                                </Col>
                                <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Receipt Date</Form.Label>
                                    <Form.Control
                                    type="date"
                                    value={receiptDate}
                                    onChange={(e) => setReceiptDate(e.target.value)}
                                    />
                                </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Button variant="secondary" className="w-100">
                                        Upload Receipt
                                    </Button>
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