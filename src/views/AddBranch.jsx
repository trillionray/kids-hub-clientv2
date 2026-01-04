import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

export default function AddBranch() {
  const [branch, setBranch] = useState({
    branch_name: "",
    address: "",
    contact_number: "",
    email: "",
    is_active: true,
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/branches/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(branch),
      });
      const data = await res.json();
      if (data.success) {
        alert("Branch added successfully");
        setBranch({ branch_name: "", address: "", contact_number: "", email: "", is_active: true });

        fetch(`${API_URL}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              user: user.id, 
              task: "Add Branch", 
              documentLog: data
            }) // datetime is automatic in backend
        })
        .then(res => res.json())
        .then(data => {
          console.log(data)
          if (data.log) {
            console.log('Log added successfully:', data.log);
          } else {
            console.error('Error adding log:', data.message);
          }
        })
        .catch(err => {
          console.error('Server error:', err.message);
        });
      } else {
        alert("Failed to add branch");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="p-4">
      <h3>Add Branch</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-2">
          <Form.Label>Branch Name</Form.Label>
          <Form.Control
            type="text"
            value={branch.branch_name}
            onChange={(e) => setBranch({ ...branch, branch_name: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            value={branch.address}
            onChange={(e) => setBranch({ ...branch, address: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Contact Number</Form.Label>
          <Form.Control
            type="text"
            value={branch.contact_number}
            onChange={(e) => setBranch({ ...branch, contact_number: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={branch.email}
            onChange={(e) => setBranch({ ...branch, email: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Check
            type="checkbox"
            label="Active"
            checked={branch.is_active}
            onChange={(e) => setBranch({ ...branch, is_active: e.target.checked })}
          />
        </Form.Group>

        <Button type="submit">Add Branch</Button>
      </Form>
    </div>
  );
}
