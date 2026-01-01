import React, { useState } from "react";
import {
  Box,
  Modal,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { db, auth } from "../firebase"; // Make sure auth & db are imported
import { doc, setDoc } from "firebase/firestore";

const COLORS = {
  primary: "#0FFF95",
  background: "#0B0F10",
  card: "#111516",
  text: "#FFFFFF",
  border: "#1F2A2F",
};

export default function KYCModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    dob: "",
    ssn: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    licenseFront: null,
    licenseBack: null,
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFile = (e) => setFormData({ ...formData, [e.target.name]: e.target.files[0] });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const validateFields = () => {
    // Check all text fields
    for (let key of ["fullname", "dob", "ssn", "address", "city", "state", "zip"]) {
      if (!formData[key] || formData[key].trim() === "") return false;
    }
    // Check files
    if (!formData.licenseFront || !formData.licenseBack) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      setSnackbar({ open: true, message: "You must be logged in.", severity: "error" });
      return;
    }

    if (!validateFields()) {
      setSnackbar({ open: true, message: "Please complete all fields.", severity: "warning" });
      return;
    }

    setLoading(true);
    try {
      const submissionRef = doc(db, "kyc_submissions", auth.currentUser.uid);

      await setDoc(submissionRef, {
        ...formData,
        userId: auth.currentUser.uid,
        timestamp: new Date(),
      });

      setLoading(false);
      setSnackbar({ open: true, message: "KYC submission saved successfully!", severity: "success" });
      onClose();
    } catch (error) {
      console.error("Error saving KYC:", error);
      setLoading(false);
      setSnackbar({ open: true, message: "Failed to save KYC. Please try again.", severity: "error" });
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            width: "92%",
            maxWidth: 480,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            bgcolor: COLORS.card,
            borderRadius: "20px",
            outline: "none",
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Scrollable content */}
          <Box sx={{ overflowY: "auto", p: 3, flex: 1 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography sx={{ fontSize: "1.4rem", fontWeight: 700 }}>Identity Verification</Typography>
              <IconButton onClick={onClose} sx={{ color: COLORS.text }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Typography sx={{ opacity: 0.7, fontSize: "0.9rem", mb: 2 }}>
              Complete all fields to verify your identity.
            </Typography>

            <Grid container spacing={2}>
              {[
                { name: "fullname", label: "Full Name" },
                { name: "address", label: "Street Address" },
                { name: "city", label: "City" },
                { name: "state", label: "State" },
                { name: "zip", label: "Zip" },
                { name: "ssn", label: "SSN / National ID" },
              ].map((field) => (
                <Grid item xs={12} key={field.name}>
                  <TextField
                    fullWidth
                    name={field.name}
                    label={field.label}
                    value={formData[field.name]}
                    onChange={handleChange}
                    InputLabelProps={{ style: { color: COLORS.text, fontSize: "0.9rem" } }}
                    sx={{
                      input: { color: COLORS.text, fontSize: "0.95rem", py: 1.5 },
                      bgcolor: COLORS.background,
                      borderRadius: "12px",
                    }}
                  />
                </Grid>
              ))}

              {/* DOB */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  name="dob"
                  label="Date of Birth"
                  value={formData.dob}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true, style: { color: COLORS.text, fontSize: "0.9rem" } }}
                  sx={{
                    input: { color: COLORS.text, py: 1.5 },
                    bgcolor: COLORS.background,
                    borderRadius: "12px",
                  }}
                />
              </Grid>

              {/* License */}
              <Grid item xs={12}>
                <Typography sx={{ mt: 1, mb: 0.5, fontWeight: 600, fontSize: "0.95rem" }}>
                  Driver's License
                </Typography>
                <Typography sx={{ opacity: 0.6, mb: 1, fontSize: "0.8rem" }}>
                  Upload front and back images.
                </Typography>
              </Grid>

              {["licenseFront", "licenseBack"].map((field) => (
                <Grid item xs={12} key={field}>
                  <Button
                    fullWidth
                    component="label"
                    sx={{
                      bgcolor: COLORS.background,
                      color: COLORS.text,
                      borderRadius: "12px",
                      border: `1px solid ${COLORS.border}`,
                      py: 1.5,
                      display: "flex",
                      flexDirection: "column",
                      fontSize: "0.9rem",
                      mb: 1,
                    }}
                  >
                    {field === "licenseFront" ? "Front" : "Back"}
                    <Typography sx={{ fontSize: "0.75rem", opacity: 0.6 }}>
                      {formData[field] ? formData[field].name : "Tap to upload"}
                    </Typography>
                    <input type="file" name={field} hidden onChange={handleFile} />
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Submit */}
          <Box sx={{ p: 3, borderTop: `1px solid ${COLORS.border}`, bgcolor: COLORS.card }}>
            <Button
              fullWidth
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                bgcolor: COLORS.primary,
                color: COLORS.background,
                borderRadius: "12px",
                py: 1.5,
                fontWeight: 700,
                textTransform: "none",
                ":hover": { opacity: 0.85 },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: "#000" }} /> : "Submit Verification"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

