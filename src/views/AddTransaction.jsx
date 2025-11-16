// Top imports (unchanged)
import { useState, useEffect} from 'react';
import Select from "react-select";
import { Card, Row, Col, Button, InputGroup, Form } from 'react-bootstrap';

export default function Register() {
    
    const [referenceNumber, setReferenceNumber] = useState("");
    const [receiptDate, setReceiptDate] = useState("");
    const [amount, setAmount] = useState(""); 
    const [transactionType, setTransactionType] = useState("");
    const [modeOfPayment, setModeOfPayment] = useState("");
    const [students, setStudents] = useState([]);
    const [student, setStudent] = useState(null);
    const [programCategory, setProgramCategory] = useState("");
    const [programType, setProgramType] = useState("");
    const [programOptions, setProgramOptions] = useState([]);


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
    

    const handleStudentSelect = (selected) => {
        setStudent(selected);
        console.log("Selected student data:", selected);

        if (selected.programOptions && selected.programOptions.length > 0) {
            
            // use the backend-prepared programOptions
            setProgramOptions(selected.programOptions);
        } else {
            setProgramOptions([]);
        }
        setProgramType(""); // reset program type
    };

    const handleProgramSelect = (e) => {
        const selectedEnrollmentId = e.target.value; // this is the value of the selected <option>
        setProgramType(selectedEnrollmentId);

        // Optional: you can also find the full program object if needed
        const program = programOptions.find(opt => opt.value === selectedEnrollmentId);
    };





    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/students/search-paystudent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: "" })  // load all
        })
            .then(res => res.json())
            .then(data => {
                console.log("API Response:", data);
                const formattedOptions = data.students.map(s => ({
                    value: s._id,
                    label: `${s.first_name} ${s.last_name}`,
                    ...s
                }));
                setStudents(formattedOptions);
            });
    }, []);


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
                                    <Select
                                        value={student}
                                        onChange={handleStudentSelect}
                                        options={students}
                                        placeholder="Select a student..."
                                        isSearchable
                                    />
                                </Form.Group>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Program Type</Form.Label>

                                        <Form.Select
                                            value={programType}
                                            onChange={handleProgramSelect}
                                            disabled={!student}
                                            required
                                        >
                                            <option value="">-- Select Program Type --</option>
                                            {programOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label} {/* Full Program - Nursery */}
                                                </option>
                                            ))}
                                        </Form.Select>




                                    </Form.Group>

                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Transaction Type</Form.Label>
                                        <Form.Select
                                            value={transactionType}
                                            onChange={(e) => setTransactionType(e.target.value)}
                                            required
                                            >
                                            <option selected>--Select Transaction Type--</option>
                                            <option value="Monthly">Monthly</option>
                                            <option value="Downpayment">Downpayment</option>
                                            <option value="ProgramRate">Program Rate</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
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
                                    <option value="bpi">BPI</option>
                                    <option value="metrobank">MetroBank</option>
                                    <option value="cash">Cash</option>
                                    </Form.Select>
                                </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Reference Number</Form.Label>
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