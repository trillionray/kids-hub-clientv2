// Top imports (unchanged)
import UserContext from "../context/UserContext";
import { useState, useEffect, useContext} from 'react';
import Select from "react-select";
import { Card, Row, Col, Button, InputGroup, Form } from 'react-bootstrap';

export default function Register() {
    const API_URL = import.meta.env.VITE_API_URL;
    const { user } = useContext(UserContext);
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
    const [comment, setComment] = useState("");
    const [remainingDown, setRemainingDown] = useState(null);
    const [requiredDown, setRequiredDown] = useState(null);
    const [penaltyInfo, setPenaltyInfo] = useState(null);
    const [receiptImage, setReceiptImage] = useState(null);
    const [amountNotice, setAmountNotice] = useState("");
    const [disableAmount, setDisableAmount] = useState(false);
    const [nextPaymentDateText, setNextPaymentDateText] = useState("");


    const submitPayment = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("student_id", student?.value);
        formData.append("enrollment_id", programType);
        formData.append("transaction_type", transactionType);
        formData.append("amount", amount);
        formData.append("mode_payment", modeOfPayment);
        formData.append("reference_no", referenceNumber);
        formData.append("receipt_date", receiptDate);
        formData.append("created_by", user.id);
        formData.append("updated_by", user.id);

        if (transactionType === "Monthly" && penaltyInfo) {
            formData.append("daysLate", penaltyInfo.daysLate);
            formData.append("hasPenalty", penaltyInfo.hasPenalty);
            formData.append("totalPenaltyAmount", penaltyInfo.totalPenalty);
        }

        if (receiptImage) {
            formData.append("receiptImage", receiptImage);
        }

        const res = await fetch(`${API_URL}/transaction/create`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
        });

        const data = await res.json();
        console.log(data);
        if (data.success) {
            alert("Payment saved successfully!");
        }
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

    const handleProgramSelect = async (e) => {
        const selectedEnrollmentId = e.target.value;
        setProgramType(selectedEnrollmentId);

        // Find the enrollment matching the selected ID
        const enrollment = student?.enrollments?.find(
            (enr) => enr._id === selectedEnrollmentId
        );

        if (!enrollment) {
            console.error("Enrollment not found for ID:", selectedEnrollmentId);
            return;
        }
        const programId = enrollment.program_id;
        await fetchProgramDetails(selectedEnrollmentId, programId);
        await fetchMonthlyPenalty(selectedEnrollmentId, programId);
    };
    
    const fetchProgramDetails = async (enrollmentId, programId) => {
        try {
            const res = await fetch(`${API_URL}/transaction/downpayment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    enrollment_id: enrollmentId,
                    program_id: programId
                }),
            });

            const data = await res.json();
            console.log("PROGRAM DETAILS FROM BACKEND:", data);

            // Set required and remaining values\
            if (data.requiredDownPayment !== undefined && data.remaining > 0){
                setRequiredDown(data.requiredDownPayment);
                setRemainingDown(data.remaining);
                setTransactionType("Downpayment");
            }

            // Auto-fill amount ONLY if user is doing a downpayment
            if (data.remaining > 0) {
                setAmount(data.remaining);
            }

        } catch (err) {
            console.error("Program lookup failed:", err);
        }
    };

    const fetchMonthlyPenalty = async (enrollmentId, programId) => {
        try {
            const res = await fetch(`${API_URL}/transaction/monthly-penalty`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    enrollment_id: enrollmentId,
                    program_id: programId
                }),
            });

            const data = await res.json();
            console.log("Penalty Data:", data);

            setPenaltyInfo(data);  // <=========== now penaltyInfo is actually stored
        } catch (error) {
            console.error("Penalty fetch failed:", error);
        }
    };


    //Displaying the notification whenever the user exceed downpayment 
    useEffect(() => {
        if (!transactionType || transactionType === "--Select Transaction Type--") {
            setAmount("");
            setAmountNotice("");
            setDisableAmount(false);
            setNextPaymentDateText("");
            return;
        }

        const amt = Number(amount || 0);

        // ===============================
        // DOWNPAYMENT LOGIC (UNCHANGED)
        // ===============================
        if (transactionType === "Downpayment" && remainingDown !== null) {
            const remaining = Number(remainingDown);

            if (!amount) {
                setAmount(remaining.toFixed(2));
                return;
            }

            if (amt > remaining) {
                const excess = (amt - remaining).toFixed(2);
                setAmountNotice(`⚠ Excess ₱${excess} will be applied to the next payment.`);
            } else if (amt < remaining) {
                const shortage = (remaining - amt).toFixed(2);
                setAmountNotice(
                    `⚠ Your payment is short by ₱${shortage}.
                    Required to fully settle this month: ₱${remaining.toFixed(2)}`
                );
            } else {
                setAmountNotice("");
            }
            return;
        }

        // ===============================
        // MONTHLY PAYMENT 
        // ===============================
        if (transactionType === "Monthly" && penaltyInfo) {

            const noticeLines = [];

            if (penaltyInfo.finalPayable === 0) {
                setDisableAmount(true);
            }


            if (penaltyInfo.isCurrentMonthPaid) {
                noticeLines.push("✅ Monthly fee already paid");
            } else {
                noticeLines.push(`🧾 Monthly Fee: ₱${penaltyInfo.recurr_fee.toFixed(2)}`);
                noticeLines.push(`🧮 Total Monthly Fee: ₱${penaltyInfo.monthlyFeeToPay.toFixed(2)}`);
            }

            if (penaltyInfo.dueMonths > 0) {
                noticeLines.push(`📅 Pay for ${penaltyInfo.dueMonths} month(s)`);
            }

            if (penaltyInfo.daysLate > 0) {
                noticeLines.push(`⏰ Late by ${penaltyInfo.daysLate} day(s)`);
                noticeLines.push(`⚠ Penalty: ₱${(penaltyInfo.totalPenalty + penaltyInfo.due_amount_paid).toFixed(2)}`);
            }

            if (penaltyInfo.due_amount_paid > 0) {
                noticeLines.push(`➖ Penalty already paid: ₱${penaltyInfo.due_amount_paid.toFixed(2)}`);
            }

            if (penaltyInfo.remainingExcess > 0) {
                noticeLines.push(`➖ Excess applied: ₱${penaltyInfo.remainingExcess.toFixed(2)}`);
            }

            noticeLines.push(`💰 Amount to Pay: ₱${penaltyInfo.finalPayable.toFixed(2)}`);

            setAmountNotice(noticeLines.join("\n"));

            // auto-fill
            if (amount === "") {
                setAmount(penaltyInfo.finalPayable.toFixed(2));
            }

            return;
        }

        setAmountNotice("");

    }, [amount, transactionType, remainingDown, penaltyInfo]);

    //Student Display in select tag
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
                            {remainingDown !== null && remainingDown > 0 && (
                                <div className="alert alert-danger">
                                    Remaining Downpayment Balance: <b>₱{remainingDown}</b>
                                </div>
                            )}
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
                                            <option value="">--Select Transaction Type--</option>
                                            <option value="Monthly">Monthly</option>
                                            <option value="Downpayment">Downpayment</option>
                                            <option value="ProgramRate">Program Rate</option>
                                            <option value="InitialEvaluation">Initial Evaluation</option>
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
                                            disabled={disableAmount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                        />
                                        {amountNotice && (
                                            <div className="alert alert-info" style={{ whiteSpace: "pre-line" }}>
                                                {amountNotice}
                                            </div>
                                        )}

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
                                    <Form.Group className="mb-3">
                                        <Form.Label>Receipt Image</Form.Label>
                                        <Form.Control 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => setReceiptImage(e.target.files[0])}
                                        />
                                    </Form.Group>

                                </Col>
                            </Row>

                            <Row>
                                <Col className="mt-3">
                                    <Form.Group className="mb-3">
                                    <Form.Label>
                                        Comment{/*  <span className="text-danger">*</span> */}
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}            
                                        value={comment} 
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Enter your comment"
                                    />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6} className="ms-auto mt-4">
                                    <Button variant="primary" className="w-100" type="submit">
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