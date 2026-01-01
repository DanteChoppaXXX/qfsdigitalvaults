import React from "react";
import { Box, Typography, Button, Modal } from "@mui/material";

export default function TransactionDetailModal({ open, onClose, transaction }) {
  if (!transaction) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "rgba(24, 24, 27, 0.95)",
          border: "1px solid #30363d",
          borderRadius: "12px",
          boxShadow: 24,
          width: { xs: "90%", sm: "80%", md: "400px" }, // ✅ Responsive width
          maxWidth: "95vw", // ✅ Prevents edge-to-edge stretch
          maxHeight: "85vh", // ✅ Keeps modal visible even on small screens
          overflowY: "auto",
          p: { xs: 2, sm: 3 }, // ✅ Adds breathing room on small screens
        }}
      >
        {/* Header */}
        <Typography variant="h6" sx={{ mb: 2, color: "#00ffcc", fontWeight: 600 }}>
          Transaction Details
        </Typography>

        {/* Transaction Info */}
        <Box sx={{ color: "#e6edf3" }}>
          <Typography sx={{ mb: 1 }}>
            <strong>Type:</strong> {transaction?.type}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Amount (USD):</strong> ${transaction?.amountUSD}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Amount (BTC):</strong> {transaction?.amountBTC}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Status:</strong> {transaction?.status}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Date:</strong>{" "}
            {transaction?.createdAt?.seconds
              ? new Date(transaction.createdAt.seconds * 1000).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )
              : "—"}
          </Typography>
          <Typography sx={{ mb: 2, wordBreak: "break-all" }}>
            <strong>Transaction ID:</strong> {transaction?.id}
          </Typography>

          <Button
            onClick={onClose}
            sx={{
              mt: 2,
              background: "#00ffcc",
              color: "#000",
              fontWeight: 600,
              "&:hover": { background: "#00e6b8" },
              display: "block",
              mx: "auto",
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

