import { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Notyf } from 'notyf';

export default function StudentRegister() {
	const notyf = new Notyf();

	const [student, setStudent] = useState({
		firstName: '',
		middleName: '',
		lastName: '',
		suffix: '',
		gender: '',
		birthdate: '',
		address: {
			street: '',
			barangay: '',
			city: '',
			province: ''
		},
		contact: {
			firstName: '',
			middleName: '',
			lastName: '',
			suffix: '',
			relationship: ''
		}
	});

	const [isActive, setIsActive] = useState(false);

	// Update top-level student fields
	const handleChange = (e) => {
		const { name, value } = e.target;
		setStudent(prev => ({
			...prev,
			[name]: value
		}));
	};

	// Update nested address fields
	const handleAddressChange = (e) => {
		const { name, value } = e.target;
		setStudent(prev => ({
			...prev,
			address: {
				...prev.address,
				[name]: value
			}
		}));
	};

	// Update nested contact fields
	const handleContactChange = (e) => {
		const { name, value } = e.target;
		setStudent(prev => ({
			...prev,
			contact: {
				...prev.contact,
				[name]: value
			}
		}));
	};

	useEffect(() => {
		const required =
			student.firstName &&
			student.middleName &&
			student.lastName &&
			student.gender &&
			student.birthdate &&
			student.contact.firstName &&
			student.contact.middleName &&
			student.contact.lastName;

		setIsActive(required);
	}, [student]);

	const registerStudent = (e) => {
		e.preventDefault();

		fetch(`${import.meta.env.VITE_API_URL}/students/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem('token')}`
			},
			body: JSON.stringify(student)
		})
			.then(res => res.json())
			.then(data => {
				if (data.message === 'Student registered successfully') {
					notyf.success("Student registered successfully");

					// Reset form
					setStudent({
						firstName: '',
						middleName: '',
						lastName: '',
						suffix: '',
						gender: '',
						birthdate: '',
						address: {
							street: '',
							barangay: '',
							city: '',
							province: ''
						},
						contact: {
							firstName: '',
							middleName: '',
							lastName: '',
							suffix: '',
							relationship: ''
						}
					});
				} else {
					notyf.error("Something went wrong");
				}
			})
			.catch(() => {
				notyf.error("Server error");
			});
	};

	return (
		<Container className="mt-4">
			<h2 className="text-center mb-4">Register Student</h2>
			<Form onSubmit={registerStudent}>
				<Row>
					<Col md={4}>
						<Form.Group>
							<Form.Label>First Name</Form.Label>
							<Form.Control name="firstName" value={student.firstName} onChange={handleChange} required />
						</Form.Group>
					</Col>
					<Col md={4}>
						<Form.Group>
							<Form.Label>Middle Name</Form.Label>
							<Form.Control name="middleName" value={student.middleName} onChange={handleChange} required />
						</Form.Group>
					</Col>
					<Col md={4}>
						<Form.Group>
							<Form.Label>Last Name</Form.Label>
							<Form.Control name="lastName" value={student.lastName} onChange={handleChange} required />
						</Form.Group>
					</Col>
				</Row>

				<Row className="mt-3">
					<Col md={3}>
						<Form.Group>
							<Form.Label>Suffix</Form.Label>
							<Form.Control name="suffix" value={student.suffix} onChange={handleChange} />
						</Form.Group>
					</Col>
					<Col md={3}>
						<Form.Group>
							<Form.Label>Gender</Form.Label>
							<Form.Select name="gender" value={student.gender} onChange={handleChange} required>
								<option value="">Select</option>
								<option value="Male">Male</option>
								<option value="Female">Female</option>
							</Form.Select>
						</Form.Group>
					</Col>
					<Col md={6}>
						<Form.Group>
							<Form.Label>Birthdate</Form.Label>
							<Form.Control type="date" name="birthdate" value={student.birthdate} onChange={handleChange} required />
						</Form.Group>
					</Col>
				</Row>

				<h5 className="mt-4">Address</h5>
				<Row>
					<Col md={6}>
						<Form.Group>
							<Form.Label>Street</Form.Label>
							<Form.Control name="street" value={student.address.street} onChange={handleAddressChange} />
						</Form.Group>
					</Col>
					<Col md={6}>
						<Form.Group>
							<Form.Label>Barangay</Form.Label>
							<Form.Control name="barangay" value={student.address.barangay} onChange={handleAddressChange} />
						</Form.Group>
					</Col>
					<Col md={6} className="mt-3">
						<Form.Group>
							<Form.Label>City</Form.Label>
							<Form.Control name="city" value={student.address.city} onChange={handleAddressChange} />
						</Form.Group>
					</Col>
					<Col md={6} className="mt-3">
						<Form.Group>
							<Form.Label>Province</Form.Label>
							<Form.Control name="province" value={student.address.province} onChange={handleAddressChange} />
						</Form.Group>
					</Col>
				</Row>

				<h5 className="mt-4">Emergency Contact</h5>
				<Row>
					<Col md={4}>
						<Form.Group>
							<Form.Label>First Name</Form.Label>
							<Form.Control name="firstName" value={student.contact.firstName} onChange={handleContactChange} required />
						</Form.Group>
					</Col>
					<Col md={4}>
						<Form.Group>
							<Form.Label>Middle Name</Form.Label>
							<Form.Control name="middleName" value={student.contact.middleName} onChange={handleContactChange} required />
						</Form.Group>
					</Col>
					<Col md={4}>
						<Form.Group>
							<Form.Label>Last Name</Form.Label>
							<Form.Control name="lastName" value={student.contact.lastName} onChange={handleContactChange} required />
						</Form.Group>
					</Col>
					<Col md={4} className="mt-3">
						<Form.Group>
							<Form.Label>Suffix</Form.Label>
							<Form.Control name="suffix" value={student.contact.suffix} onChange={handleContactChange} />
						</Form.Group>
					</Col>
					<Col md={4} className="mt-3">
						<Form.Group>
							<Form.Label>Relationship</Form.Label>
							<Form.Control name="relationship" value={student.contact.relationship} onChange={handleContactChange} />
						</Form.Group>
					</Col>
				</Row>

				<Button type="submit" variant="primary" className="mt-4" disabled={!isActive}>
					Register Student
				</Button>
			</Form>
		</Container>
	);
}
