import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  LinearProgress,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const COLORS = {
  primary: "#0FFF95",
  background: "#0d1117",
  card: "#111516",
  text: "#FFFFFF",
  border: "#1F2A2F",
};

export default function KYCWizard() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [success, setSuccess] = useState(false);

  // Form data
  const [data, setData] = useState({
    fullname: "",
    dob: "", // yyyy-mm-dd
    address: "",
    city: "",
    state: "",
    zip: "",
    ssn: "",
    licenseFront: null,
    licenseBack: null,
  });

  // previews
  const [previewFront, setPreviewFront] = useState(null);
  const [previewBack, setPreviewBack] = useState(null);

  // track slide animation
  const containerRef = useRef(null);

  const steps = [
    { key: "fullname", label: "Full Name" },
    { key: "dob", label: "Date of Birth" },
    { key: "address", label: "Street Address" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "zip", label: "Zip Code" },
    { key: "ssn", label: "SSN" }, // user requested this after zip
    { key: "uploads", label: "Upload ID Photos" }, // final step (submit)
  ];

  const progress = Math.round(((step + 1) / steps.length) * 100);

  const handleSnackbar = (msg, severity = "info") => {
    setSnackbar({ open: true, message: msg, severity });
  };

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // basic validators per step
  const validators = {
    fullname: (v) => v && v.trim().length >= 2,
    dob: (v) => {
      if (!v) return false;
      const d = new Date(v);
      const now = new Date();
      return d instanceof Date && !isNaN(d) && d < now;
    },
    address: (v) => v && v.trim().length >= 3,
    city: (v) => v && v.trim().length >= 2,
    state: (v) => v && v.trim().length >= 2,
    zip: (v) => v && v.trim().length >= 3,
    ssn: (v) => {
      if (!v) return false;
      const digits = v.replace(/\D/g, "");
      return digits.length >= 4; // loose validation; adjust if needed
    },
    uploads: () => data.licenseFront && data.licenseBack,
  };

  const currentKey = steps[step].key;
  const isValid = validators[currentKey] ? validators[currentKey](data[currentKey]) : true;

  const goNext = () => {
    if (!isValid) {
      handleSnackbar("Please enter a valid value to continue", "warning");
      return;
    }
    if (step < steps.length - 1) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else navigate(-1);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const name = e.target.name;
    if (name === "licenseFront") {
      setPreviewFront(URL.createObjectURL(f));
      setData((p) => ({ ...p, licenseFront: f }));
    } else {
      setPreviewBack(URL.createObjectURL(f));
      setData((p) => ({ ...p, licenseBack: f }));
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    // final validation
    if (!validators.uploads()) {
      handleSnackbar("Please upload both front and back images.", "warning");
      return;
    }

    if (!user) {
      handleSnackbar("You must be signed in.", "error");
      return;
    }

    setLoading(true);

    try {
      const frontB64 = await fileToBase64(data.licenseFront);
      const backB64 = await fileToBase64(data.licenseBack);

      // prepare kyc payload
      const kyc = {
        status: "submitted",
        fullname: data.fullname,
        dob: data.dob,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        ssn: data.ssn,
        licenseFront: frontB64,
        licenseBack: backB64,
        submittedAt: Date.now(),
      };

      // write to users/{uid} merged
      await setDoc(doc(db, "users", user.uid), { kyc }, { merge: true });

      setLoading(false);
      setSuccess(true);
      handleSnackbar("KYC submitted successfully!", "success");

      // auto-redirect after short delay so user sees success UI
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("KYC submit error:", err);
      setLoading(false);
      handleSnackbar("Failed to submit KYC. Try again.", "error");
    }
  };

  // small UI for each step
  const renderStepContent = () => {
    switch (currentKey) {
      case "fullname":
        return (
          <TextField
            name="fullname"
            label="Full Name"
            value={data.fullname}
            onChange={onChange}
            fullWidth
            InputLabelProps={{ style: { color: COLORS.text } }}
            sx={{ input: { color: COLORS.text }, bgcolor: COLORS.card, borderRadius: 2, py: 1 }}
          />
        );

      case "dob":
        return (
          <TextField
            name="dob"
            label="Date of Birth"
            type="date"
            value={data.dob}
            onChange={onChange}
            fullWidth
            InputLabelProps={{ shrink: true, style: { color: COLORS.text } }}
            sx={{ input: { color: COLORS.text }, bgcolor: COLORS.card, borderRadius: 2, py: 1 }}
          />
        );

      case "address":
        return (
          <TextField
            name="address"
            label="Street Address"
            value={data.address}
            onChange={onChange}
            fullWidth
            InputLabelProps={{ style: { color: COLORS.text } }}
            sx={{ input: { color: COLORS.text }, bgcolor: COLORS.card, borderRadius: 2, py: 1 }}
          />
        );

      case "city":
        return (
          <TextField
            name="city"
            label="City"
            value={data.city}
            onChange={onChange}
            fullWidth
            InputLabelProps={{ style: { color: COLORS.text } }}
            sx={{ input: { color: COLORS.text }, bgcolor: COLORS.card, borderRadius: 2, py: 1 }}
          />
        );

      case "state":
        return (
          <TextField
            name="state"
            label="State / Region"
            value={data.state}
            onChange={onChange}
            fullWidth
            InputLabelProps={{ style: { color: COLORS.text } }}
            sx={{ input: { color: COLORS.text }, bgcolor: COLORS.card, borderRadius: 2, py: 1 }}
          />
        );

      case "zip":
        return (
          <TextField
            name="zip"
            label="Zip / Postal Code"
            value={data.zip}
            onChange={onChange}
            fullWidth
            InputLabelProps={{ style: { color: COLORS.text } }}
            sx={{ input: { color: COLORS.text }, bgcolor: COLORS.card, borderRadius: 2, py: 1 }}
          />
        );

      case "ssn":
        return (
          <TextField
            name="ssn"
            label="SSN"
            value={data.ssn}
            onChange={onChange}
            fullWidth
            InputLabelProps={{ style: { color: COLORS.text } }}
            sx={{ input: { color: COLORS.text }, bgcolor: COLORS.card, borderRadius: 2, py: 1 }}
          />
        );

      case "uploads":
        return (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 700 }}>Upload front of ID</Typography>
              <Button
                component="label"
                sx={{
                  mt: 1,
                  width: "100%",
                  py: 1.5,
                  bgcolor: COLORS.card,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 2,
                }}
              >
                {data.licenseFront ? "Change front image" : "Upload front image"}
                <input type="file" name="licenseFront" hidden accept="image/*" onChange={onFile} />
              </Button>
              {previewFront && (
                <img
                  src={previewFront}
                  alt="front preview"
                  style={{ width: "100%", marginTop: 10, borderRadius: 8 }}
                />
              )}
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>Upload back of ID</Typography>
              <Button
                component="label"
                sx={{
                  mt: 1,
                  width: "100%",
                  py: 1.5,
                  bgcolor: COLORS.card,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 2,
                }}
              >
                {data.licenseBack ? "Change back image" : "Upload back image"}
                <input type="file" name="licenseBack" hidden accept="image/*" onChange={onFile} />
              </Button>
              {previewBack && (
                <img
                  src={previewBack}
                  alt="back preview"
                  style={{ width: "100%", marginTop: 10, borderRadius: 8 }}
                />
              )}
            </Box>

            <Typography sx={{ opacity: 0.7, mt: 1, mb: 2 }}>
              When both images are uploaded the button below becomes Submit.
            </Typography>
          </>
        );

      default:
        return null;
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: COLORS.background,
          color: COLORS.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: 28, fontWeight: 800, mb: 2, color: COLORS.primary }}>
            ✔ Verification Submitted
          </Typography>
          <Typography sx={{ opacity: 0.8, mb: 3 }}>
            Thanks — your documents are under review. We'll notify you when it's processed.
          </Typography>
          <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ minHeight: "100vh", bgcolor: COLORS.background, color: COLORS.text }}>
        {/* header + progress */}
        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
          <Box sx={{ mb: 2 }}>
             <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                textAlign: "center",
                mb: 3,
              }}
            >
              Identity Verification (KYC)
            </Typography>
             {/* Back Button Row */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton onClick={goBack} sx={{ color: COLORS.text }}>
                  <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>

                <Box sx={{ ml: 1 }}>
                  <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                    {steps[step].label}
                  </Typography>

                  <Typography sx={{ opacity: 0.7, fontSize: 13 }}>
                    Step {step + 1} of {steps.length}
                  </Typography>
                </Box>
              </Box>

              {/* 💡 New descriptive heading */}
              <Typography
                sx={{
                  fontSize: 15,
                  opacity: 0.75,
                  mt: 2,
                  lineHeight: 1.5,
                  color: COLORS.text,
                }}
              >
                To secure your account and enable full account access, please complete the 
  verification steps below. Your information is encrypted and stored safely.
              </Typography>
            </Box>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 99,
              bgcolor: "#0b0b0b",
              "& .MuiLinearProgress-bar": { bgcolor: COLORS.primary },
            }}
          />
        </Box>

        {/* content area */}
        <Box
          ref={containerRef}
          sx={{
            px: 3,
            pt: 3,
            pb: 12,
            // slide animation container
            transition: "transform 300ms ease",
            minHeight: "60vh",
          }}
        >
          {renderStepContent()}
        </Box>

        {/* footer controls */}
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            p: 2,
            display: "flex",
            gap: 2,
            bgcolor: COLORS.card,
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          <Button
            onClick={goBack}
            variant="outlined"
            sx={{
              borderColor: COLORS.border,
              color: COLORS.text,
              flex: 1,
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Back
          </Button>

          {step < steps.length - 1 ? (
            <Button
              onClick={goNext}
              variant="contained"
              disabled={!isValid}
              endIcon={<ArrowForwardIosIcon />}
              sx={{
                bgcolor: isValid ? COLORS.primary : "#2a2a2a",
                color: isValid ? "#000" : COLORS.text,
                flex: 1.2,
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { opacity: 0.9 },
              }}
            >
              Next
            </Button>
          ) : (
            // final step: submit
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!validators.uploads() || loading}
              sx={{
                bgcolor: validators.uploads() ? COLORS.primary : "#2a2a2a",
                color: validators.uploads() ? "#000" : COLORS.text,
                flex: 1.2,
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { opacity: 0.9 },
              }}
            >
              {loading ? <CircularProgress size={20} /> : "Submit Verification"}
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
}

