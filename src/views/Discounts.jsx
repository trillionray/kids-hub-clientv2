import { useEffect, useState } from 'react';
import { Table, Container } from 'react-bootstrap';
import { Notyf } from 'notyf';

export default function DiscountList() {
  const notyf = new Notyf();
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/discounts`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.data)) {
          setDiscounts(data.data);
        } else {
          notyf.error('Failed to load discount list');
        }
      })
      .catch(() => {
        notyf.error('Server error or unauthorized');
      });
  }, []);

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Discount List</h2>
      {discounts.length === 0 ? (
        <p className="text-center">No discounts found.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Discount Name</th>
              <th>Description</th>
              <th>Percentage</th>
              <th>Active</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((discount, index) => (
              <tr key={discount._id}>
                <td>{index + 1}</td>
                <td>{discount.discount_name}</td>
                <td>{discount.description}</td>
                <td>{discount.percentage}%</td>
                <td>{discount.is_active ? "Yes" : "No"}</td>
                <td>{new Date(discount.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
