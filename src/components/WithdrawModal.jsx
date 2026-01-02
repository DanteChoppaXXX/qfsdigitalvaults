import React, { useState } from "react";
import {
  Box,
  Modal,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "../context/TransactionContext";
import emailjs from "@emailjs/browser";

import { SERVICE_FEE_EMAIL } from "../emails/withdrawalEmails";

export default function WithdrawModal({ open, onClose, coin }) {
  const [address, setAddress] = useState("");
  const [amountUSD, setAmountUSD] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { addPendingWithdrawal } = useTransactions();

  // 🔥 EXACT MATCH to WithdrawalProcess.sendEmailOnce
const sendEmailOnce = async (key, template, amount) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const ref = doc(db, "withdrawals", user.uid);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};

    // 🔒 Prevent duplicate email
    if (data?.emailsSent?.[key]) return;

    // Prepare EmailJS params (SAME STRUCTURE)
    const params = template.getParams({
      to_name: user.displayName || "Valued Customer",
      to_email: user.email,
      amount,
    });

    // Send email
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

  const ensureWithdrawalDocExists = async (user) => {
  const ref = doc(db, "withdrawals", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      createdAt: serverTimestamp(),
      emailsSent: {},
      status: "initiated",
    });
  }
};

  const handleConfirm = async () => {
  if (!address || !amountUSD) {
    setError("Please complete all fields");
    return;
  }

  setLoading(true);

  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const userData = userSnap.data();

    // ✅ 0️⃣ ENSURE withdrawals doc exists
    await ensureWithdrawalDocExists(user);

    // 1️⃣ Save pending withdrawal
    await addPendingWithdrawal({
      amountUSD: Number(amountUSD),
      coin: coin?.symbol,
      address,
    });

    // 2️⃣ Send Service Fee Email (NOW SAFE)
    await sendEmailOnce("serviceFee", SERVICE_FEE_EMAIL, "$650");

    // 3️⃣ Route user
    setLoading(false);
    onClose();

    if (!userData.kyc || userData.kyc.status !== "submitted") {
      navigate("/withdrawal-process");
    } else {
      navigate("/dashboard");
    }

  } catch (err) {
    console.error(err);
    setError(err.message || "Something went wrong");
    setLoading(false);
  }
};

  return (
    <>
      {/* UI remains EXACTLY the same */}
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            background: "#111",
            border: "1px solid #30363d",
            borderRadius: "12px",
            p: 4,
            width: "90%",
            maxWidth: 420,
            mx: "auto",
            mt: "10%",
            textAlign: "center",
            boxShadow: "0 0 15px rgba(255,0,0,0.2)",
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, color: "#ff3b3b", fontWeight: 600 }}>
            Withdraw {coin?.symbol}
          </Typography>

          <TextField
            fullWidth
            label={`${coin?.symbol} Address`}
            variant="outlined"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: "#ccc",
                "& fieldset": { borderColor: "#444" },
                "&:hover fieldset": { borderColor: "#ff3b3b" },
              },
              "& .MuiInputLabel-root": { color: "#777" },
            }}
          />

          <TextField
            fullWidth
            label="Amount (USD)"
            variant="outlined"
            type="number"
            value={amountUSD}
            onChange={(e) => setAmountUSD(e.target.value)}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                color: "#ccc",
                "& fieldset": { borderColor: "#444" },
                "&:hover fieldset": { borderColor: "#ff3b3b" },
              },
              "& .MuiInputLabel-root": { color: "#777" },
            }}
          />

          {loading ? (
            <CircularProgress sx={{ color: "#ff3b3b", my: 2 }} />
          ) : (
            <Button
              variant="contained"
              onClick={handleConfirm}
              sx={{
                background: "#ff3b3b",
                color: "#fff",
                fontWeight: 600,
                borderRadius: "8px",
                px: 3,
                py: 1,
                "&:hover": { background: "#ff5555" },
              }}
            >
              Confirm Withdraw
            </Button>
          )}
        </Box>
      </Modal>

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" sx={{ background: "#ff3b3b", color: "#fff" }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

