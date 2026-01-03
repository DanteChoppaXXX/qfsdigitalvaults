import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Logo from "/logo.png";

const FundingApplication = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
    purpose: "",
    amount: "",
    paybackDuration: "",
    description: "",
  });

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const isFormValid = Object.values(form).every(
    (value) => value.trim() !== ""
  );

  const handleSubmit = async () => {
  if (!isFormValid || submitting) return;

  setSubmitting(true);

  try {
    await addDoc(collection(db, "fundingApplications"), {
      personalInfo: {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          country: form.country,
        },
      },
      fundingRequest: {
        purpose: form.purpose,
        amount: Number(form.amount),
        currency: "USD",
        paybackDurationMonths: Number(form.paybackDuration),
      },
      usage: {
        description: form.description,
      },
      status: "pending",
      createdAt: serverTimestamp(),
    });

    navigate("/register");
  } catch (error) {
    console.error("Funding application submission failed:", error);
    alert("Something went wrong. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <Box minHeight="100vh" bgcolor="#0b0f14" color="#e6edf3">
      {/* Header */}
      <Box
        py={1}
        display="flex"
        justifyContent="center"
        borderBottom="1px solid #30363d"
      >
        <Box
          component="img"
          src={Logo}
          alt="Logo"
          sx={{
            height: 70,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        />
      </Box>

      {/* Form */}
      <Box maxWidth={520} mx="auto" px={2} py={2}>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Apply for Business & Personal Funding
        </Typography>

        <SimpleInput label="Full Name" value={form.fullName} onChange={handleChange("fullName")} />
        <SimpleInput label="Email Address" value={form.email} onChange={handleChange("email")} />
        <SimpleInput label="Phone Number" value={form.phone} onChange={handleChange("phone")} />
        <SimpleInput label="Street Address" value={form.street} onChange={handleChange("street")} />
        <SimpleInput label="City" value={form.city} onChange={handleChange("city")} />
        <SimpleInput label="State / Province" value={form.state} onChange={handleChange("state")} />
        <SimpleInput label="Country" value={form.country} onChange={handleChange("country")} />
        <SimpleInput label="Purpose of Funding" value={form.purpose} onChange={handleChange("purpose")} />
        <SimpleInput label="Amount Needed (USD)" type="number" value={form.amount} onChange={handleChange("amount")} />
        <SimpleInput label="Payback Duration (months)" type="number" value={form.paybackDuration} onChange={handleChange("paybackDuration")} />

        <TextField
          label="How will the funds be used?"
          multiline
          rows={4}
          fullWidth
          required
          value={form.description}
          onChange={handleChange("description")}
          sx={inputStyles}
        />

        <Button
          fullWidth
          size="large"
          disabled={!isFormValid || submitting}
          onClick={handleSubmit}
          sx={{
            mt: 4,
            py: 1.4,
            fontWeight: 600,
            borderRadius: 2,
            backgroundColor: "#00ffcc",
            border: "1px solid #00ffcc",
            color: "#0b0f14",
            "&:hover": {
              backgroundColor: "#00e6b8",
              borderColor: "#00e6b8",
            },
            "&.Mui-disabled": {
              backgroundColor: "rgba(0, 255, 204, 0.25)",
              borderColor: "rgba(0, 255, 204, 0.25)",
              color: "rgba(230, 237, 243, 0.6)",
            },
          }}
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </Button>
      </Box>
    </Box>
  );
};

/* ---------- Reusable Input ---------- */

const SimpleInput = ({ label, ...props }) => (
  <TextField
    label={label}
    fullWidth
    required
    {...props}
    sx={{ ...inputStyles, mb: 2 }}
  />
);

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#0b0f14",
    color: "#e6edf3",
    borderRadius: 2,
    "& fieldset": {
      borderColor: "#30363d",
    },
    "&:hover fieldset": {
      borderColor: "#00ffcc",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#00ffcc",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#8b949e",
  },
};

export default FundingApplication;

