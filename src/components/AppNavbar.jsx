import { useContext } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link, NavLink } from 'react-router-dom';
import UserContext from '../context/UserContext';

export default function AppNavbar() {
	const { user } = useContext(UserContext);

	const isLoggedIn = user?.id !== null && user?.id !== undefined;

	const isAdmin = ["principal", "teacher", "cashier"].includes(user?.role);

	return (
		<Navbar expand="lg" className="bg-light">
			<Container>
				<Navbar.Brand as={Link} to="/">Kids Hub</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					
					<Nav className="ms-auto">

						{isLoggedIn ? (
							<>
								{/* Admin-only routes */}
								{isAdmin && (
									<>
										<Nav.Link as={NavLink} to="/register-student" exact="true">
											Register Student
										</Nav.Link>
										<Nav.Link as={NavLink} to="/students" exact="true">
											Show Students
										</Nav.Link>
									</>
								)}
								
								<Nav.Link as={NavLink} to="/logout" exact="true">
									Logout
								</Nav.Link>
							</>
						) : (
							<>
								<Nav.Link as={NavLink} to="/login" exact="true">Login</Nav.Link>
								<Nav.Link as={NavLink} to="/register" exact="true">Register</Nav.Link>
							</>
						)}

					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}
