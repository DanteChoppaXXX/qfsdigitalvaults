import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  Paper,
  Button,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import { auth, db } from "../firebase";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Settings() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [kycPending, setKycPending] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ------------------------------
  // Fetch KYC status
  // ------------------------------
  useEffect(() => {
    const fetchKYC = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const userData = snap.data();
          setKycPending(!userData.kyc || userData.kyc.status !== "submitted");
        }
      } catch (err) {
        console.log("KYC fetch error:", err);
      }
    };

    fetchKYC();
  }, []);

  // ------------------------------
  // Change Password Function
  // ------------------------------
  const handlePasswordChange = async () => {
    if (!password) return; // no password change
    if (password !== confirm) {
      setSnack({
        open: true,
        message: "Passwords do not match.",
        severity: "error",
      });
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        return setSnack({
          open: true,
          message: "You must be logged in to change password.",
          severity: "error",
        });
      }

      // Re-authenticate user
      const email = user.email;
      const currentPassword = prompt(
        "For security, enter your current password to continue:"
      );

      if (!currentPassword) return;

      const cred = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(user, cred);

      // Update password
      await updatePassword(user, password);

      setSnack({
        open: true,
        message: "Password updated successfully!",
        severity: "success",
      });

      setPassword("");
      setConfirm("");
    } catch (err) {
      console.log(err);
      setSnack({
        open: true,
        message: err.message || "Failed to update password.",
        severity: "error",
      });
    }
  };

  const handleSave = async () => {
    await handlePasswordChange();
  };

  return (
    <Box sx={{ color: "#e6edf3" }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: "#00ffcc" }}>
        Settings
      </Typography>

      <Paper
        sx={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid #30363d",
          borderRadius: "12px",
          p: 3,
          maxWidth: 600,
        }}
      >
        {/* Currency */}
        <Typography variant="body1" sx={{ mb: 2, color: "#c9d1d9", fontWeight: 600 }}>
          Default Currency
        </Typography>

        <Box
          sx={{
            width: 200,
            p: 1.5,
            border: "1px solid #30363d",
            borderRadius: "8px",
            color: "#00ffcc",
            fontWeight: 600,
            mb: 3,
          }}
        >
          USD
        </Box>

        {/* KYC */}
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          KYC Verification
        </Typography>

        {kycPending ? (
          <Box
            sx={{
              p: 2,
              borderRadius: "8px",
              background: "rgba(214,44,44,0.12)",
              border: "1px solid #d42c2c",
              mb: 3,
              color: "#d42c2c",
            }}
          >
            You have not <strong>submitted</strong> KYC yet.
          </Box>
        ) : (
          <Box
            sx={{
              p: 2,
              borderRadius: "8px",
              background: "rgba(255,255,0,0.12)",
              border: "1px solid #c9b208",
              mb: 3,
              color: "#e6e600",
            }}
          >
            ✓ Your KYC verification has been <strong>submitted</strong> and is being <strong>reviewed!</strong>
          </Box>
        )}

        <Divider sx={{ borderColor: "#30363d", my: 3 }} />

        {/* Security */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Security
        </Typography>

        <TextField
          fullWidth
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#30363d" },
              "&:hover fieldset": { borderColor: "#00ffcc" },
              "&.Mui-focused fieldset": { borderColor: "#00ffcc" },
            },
            input: { color: "#e6edf3" },
            "& .MuiInputLabel-root": { color: "#c9d1d9" },
          }}
        />

        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          variant="outlined"
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#30363d" },
              "&:hover fieldset": { borderColor: "#00ffcc" },
              "&.Mui-focused fieldset": { borderColor: "#00ffcc" },
            },
            input: { color: "#e6edf3" },
            "& .MuiInputLabel-root": { color: "#c9d1d9" },
          }}
        />

        <Button
          onClick={handleSave}
          sx={{
            mt: 1,
            background: "#00ffcc",
            color: "#000",
            fontWeight: 600,
            px: 4,
            "&:hover": { background: "#00d4aa" },
          }}
        >
          Save Settings
        </Button>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

