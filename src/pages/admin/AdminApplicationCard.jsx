import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import React, { useState } from "react";
import AdminApplicationModal from "./AdminApplicationModal";

const statusColor = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

const AdminApplicationCard = ({ application }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Paper
        sx={{
          p: 3,
          mb: 2,
          border: "1px solid #30363d",
          backgroundColor: "#0b0f14",
        }}
      >
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography fontWeight={600}>
              {application.personalInfo.fullName}
            </Typography>
            <Typography color="#8b949e" fontSize={14}>
              {application.personalInfo.email}
            </Typography>
            <Typography color="#8b949e" fontSize={14}>
              ${application.fundingRequest.amount} ·{" "}
              {application.fundingRequest.paybackDurationMonths} months
            </Typography>
          </Box>

          <Box textAlign="right">
            <Chip
              label={application.status}
              color={statusColor[application.status]}
              size="small"
            />
            <Button
              size="small"
              sx={{ mt: 1 }}
              onClick={() => setOpen(true)}
            >
              Review
            </Button>
          </Box>
        </Box>
      </Paper>

      <AdminApplicationModal
        open={open}
        onClose={() => setOpen(false)}
        application={application}
      />
    </>
  );
};

export default AdminApplicationCard;

