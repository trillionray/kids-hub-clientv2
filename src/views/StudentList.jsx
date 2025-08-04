import { useEffect, useState } from 'react';
import { Table, Container } from 'react-bootstrap';
import { Notyf } from 'notyf';

export default function StudentList() {
  const notyf = new Notyf();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/students/all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
      	console.log(data)
        if (Array.isArray(data.students)) {
          setStudents(data.students);
        } else {
          notyf.error('Failed to load student list');
        }
      })
      .catch((error) => {
      	console.log(error)
        notyf.error('Server error or unauthorized');
      });
  }, []);

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Student List</h2>
      {students.length === 0 ? (
        <p className="text-center">No students found.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Birthdate</th>
              <th>Address</th>
              <th>Contact Person</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student._id}>
                <td>{index + 1}</td>
                <td>{`${student.firstName} ${student.middleName} ${student.lastName} ${student.suffix || ''}`}</td>
                <td>{student.gender}</td>
                <td>{student.birthdate}</td>
                <td>
                  {`${student.address?.street || ''}, ${student.address?.barangay || ''}, ${student.address?.city || ''}, ${student.address?.province || ''}`}
                </td>
                <td>
                  {`${student.contact?.firstName || ''} ${student.contact?.middleName || ''} ${student.contact?.lastName || ''} (${student.contact?.relationship || ''})`}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
