import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Modal,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amountUSD, setAmountUSD] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().role === "admin") {
        setIsAdmin(true);
        await fetchUsers();
      } else {
        navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const userList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(userList);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeposit = async () => {
    if (!amountUSD || isNaN(amountUSD)) {
      setSnackbar({
        open: true,
        message: "Enter a valid USD amount.",
        severity: "error",
      });
      return;
    }

    try {
      const BTC_RATE = 68000;
      const amountBTC = (amountUSD / BTC_RATE).toFixed(5);
      const userRef = doc(db, "users", selectedUser.id);
      const newBalance = (selectedUser.balanceUSD || 0) + parseFloat(amountUSD);

      await updateDoc(userRef, { balanceUSD: newBalance });

      await addDoc(collection(db, "transactions"), {
        userId: selectedUser.id,
        type: "deposit",
        amountUSD: parseFloat(amountUSD),
        amountBTC,
        status: "Success",
        createdAt: serverTimestamp(),
      });

      setSnackbar({
        open: true,
        message: `Deposit of $${amountUSD} confirmed for ${selectedUser.email}`,
        severity: "success",
      });
      setSelectedUser(null);
      setAmountUSD("");
      await fetchUsers();
    } catch (err) {
      console.error("Deposit error:", err);
      setSnackbar({
        open: true,
        message: "Error confirming deposit.",
        severity: "error",
      });
    }
  };

  if (!isAdmin)
    return (
      <Box
        sx={{
          height: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#00ffcc" }} />
      </Box>
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Admin Panel
      </Typography>

      <Card
        sx={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid #30363d",
          borderRadius: "12px",
          p: 3,
          backdropFilter: "blur(6px)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: "#00ffcc" }}>
            All Users
          </Typography>

          {loading ? (
            <CircularProgress sx={{ color: "#00ffcc" }} />
          ) : isMobile ? (
            // 📱 Mobile View - Card layout
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {users.map((user) => (
                <Box
                  key={user.id}
                  sx={{
                    p: 2,
                    border: "1px solid #30363d",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  <Typography sx={{ color: "#00ffcc", fontWeight: 600 }}>
                    {user.email}
                  </Typography>
                  <Typography sx={{ color: "#c9d1d9", mt: 1 }}>
                    Balance: ${user.balanceUSD?.toLocaleString() || 0}
                  </Typography>
                  <Button
                    onClick={() => setSelectedUser(user)}
                    fullWidth
                    sx={{
                      background: "#00ffcc",
                      color: "#000",
                      borderRadius: "8px",
                      fontWeight: 600,
                      mt: 2,
                      "&:hover": { background: "#00d4aa" },
                    }}
                  >
                    Confirm Deposit
                  </Button>
                </Box>
              ))}
            </Box>
          ) : (
            // 💻 Desktop View - Table layout
            <Box sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 350 }}>
                <TableHead sx={{ background: "rgba(255,255,255,0.08)" }}>
                  <TableRow>
                    <TableCell sx={{ color: "#c9d1d9" }}>Email</TableCell>
                    <TableCell sx={{ color: "#c9d1d9" }}>Balance (USD)</TableCell>
                    <TableCell sx={{ color: "#c9d1d9" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell sx={{ wordBreak: "break-word" }}>
                        {user.email}
                      </TableCell>
                      <TableCell>
                        ${(user.balanceUSD || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => setSelectedUser(user)}
                          sx={{
                            background: "#00ffcc",
                            color: "#000",
                            borderRadius: "8px",
                            fontWeight: 600,
                            "&:hover": { background: "#00d4aa" },
                            whiteSpace: "nowrap",
                          }}
                        >
                          Confirm Deposit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Deposit Modal */}
      <Modal open={!!selectedUser} onClose={() => setSelectedUser(null)}>
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
            boxShadow: "0 0 15px rgba(0,255,204,0.2)",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#00ffcc" }}>
            Confirm Deposit
          </Typography>
          <Typography sx={{ color: "#ccc", mb: 2 }}>
            User: {selectedUser?.email}
          </Typography>

          <TextField
            label="Amount (USD)"
            variant="outlined"
            type="number"
            fullWidth
            value={amountUSD}
            onChange={(e) => setAmountUSD(e.target.value)}
            sx={{
              input: { color: "#fff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#00ffcc" },
              },
              mb: 3,
            }}
          />

          <Button
            onClick={handleConfirmDeposit}
            fullWidth
            sx={{
              background: "#00ffcc",
              color: "#000",
              fontWeight: 600,
              borderRadius: "8px",
              py: 1.2,
              "&:hover": { background: "#00d4aa" },
            }}
          >
            Confirm Deposit
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

