import React from "react";
import { Button, Stack } from "react-bootstrap";

export default function DownloadPDF() {
  return (
    <div className="download-pdf-container">
      <h3>Download Documents</h3>
      <Stack gap={3}>
        <Button variant="primary">Download Registration Form</Button>
        <Button variant="secondary">Download Breakdown</Button>
        <Button variant="success">Download Acknowledgement Receipt</Button>
      </Stack>
    </div>
  );
}
