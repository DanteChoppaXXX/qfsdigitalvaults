import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

/**
 * Firestore structure expected:
 * withdrawals/{userId}
 * {
 *   step: number,
 *   proofs: {
 *     0: imageBase64,
 *     1: imageBase64,
 *     2: imageBase64
 *   },
 *   adminConfirmed: [true,false,false,false]
 * }
 *
 * users/{uid}
 * {
 *   role: "admin"
 *   // OR
 *   isAdmin: true
 * }
 */

export default function AdminWithdrawalApprovalDashboard() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const navigate = useNavigate();

  // 🔐 Admin access guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      const data = snap.data();
      const isAdmin = data?.role === "admin" || data?.isAdmin === true;

      if (!isAdmin) {
        navigate("/"); // or any safe page
        return;
      }

      setCheckingAccess(false);
    });

    return () => unsub();
  }, [navigate]);

  // 🔁 Listen to withdrawals only AFTER admin is verified
  useEffect(() => {
    if (checkingAccess) return;

    const unsub = onSnapshot(collection(db, "withdrawals"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setWithdrawals(data);
    });

    return () => unsub();
  }, [checkingAccess]);

  const approveStep = async (userId, stepIndex) => {
  const ref = doc(db, "withdrawals", userId);
  await updateDoc(ref, {
    [`adminConfirmed.${stepIndex}`]: true,
  });
};

  // ⛔ Render nothing while checking (no UI changes)
  if (checkingAccess) return null;

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Withdrawal Approval Dashboard
      </Typography>

      <Stack spacing={3}>
        {withdrawals.map((w) => (
          <Paper key={w.id} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              User ID: {w.id}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {[0, 1, 2].map((step) => (
              <Box key={step} sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    variant="rounded"
                    src={w.proofs?.[step]}
                    sx={{ width: 100, height: 70 }}
                  />

                  <Box flex={1}>
                    <Typography variant="body2">
                      Step {step + 1} Proof
                    </Typography>

                    {w.adminConfirmed?.[step] ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Approved"
                        color="success"
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    ) : (
                      <Chip
                        icon={<HourglassEmptyIcon />}
                        label="Pending"
                        color="warning"
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    size="small"
                    disabled={w.adminConfirmed?.[step]}
                    onClick={() => approveStep(w.id, step)}
                  >
                    Approve
                  </Button>
                </Stack>
              </Box>
            ))}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}

