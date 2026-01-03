import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import React, { useState } from "react";

const AdminApplicationModal = ({ open, onClose, application }) => {
  const [notes, setNotes] = useState(application.adminNotes || "");
  const [saving, setSaving] = useState(false);

  const updateStatus = async (status) => {
    setSaving(true);

    try {
      await updateDoc(
        doc(db, "fundingApplications", application.id),
        {
          status,
          adminNotes: notes,
          reviewedAt: serverTimestamp(),
        }
      );
      onClose();
    } catch (err) {
      console.error("Admin update failed:", err);
      alert("Failed to update application");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          backgroundColor: "#0b0f14",
          color: "#e6edf3",
          maxWidth: 600,
          mx: "auto",
          mt: "10vh",
          p: 4,
          borderRadius: 2,
          border: "1px solid #30363d",
        }}
      >
        <Typography variant="h6" mb={2}>
          Application Review
        </Typography>

        <Typography fontWeight={600}>
          {application.personalInfo.fullName}
        </Typography>
        <Typography color="#8b949e" mb={2}>
          {application.personalInfo.email}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography>
          Purpose: {application.fundingRequest.purpose}
        </Typography>
        <Typography>
          Amount: ${application.fundingRequest.amount}
        </Typography>
        <Typography>
          Payback: {application.fundingRequest.paybackDurationMonths} months
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography mb={1}>Admin Notes</Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Box display="flex" gap={2} mt={3}>
          <Button
            fullWidth
            disabled={saving}
            onClick={() => updateStatus("approved")}
            sx={{ backgroundColor: "#00ffcc" }}
          >
            Approve
          </Button>

          <Button
            fullWidth
            disabled={saving}
            color="error"
            onClick={() => updateStatus("rejected")}
          >
            Reject
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AdminApplicationModal;

