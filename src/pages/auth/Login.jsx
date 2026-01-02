import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const { email, password } = formData;
    if (!email || !password) {
      setSnack({
        open: true,
        message: "All fields are required.",
        severity: "error",
      });
      setLoading(false);
      return;
    }

    try {
      // ✅ Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // 🔐 Block unverified email users
        if (!user.emailVerified) {
          setSnack({
            open: true,
            message: "Please verify your email before logging in.",
            severity: "warning",
          });

          await auth.signOut(); // immediately log them out
          setLoading(false);
          return;
        }


      // 🔍 Fetch user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        throw new Error("User data not found in database. Please contact support.");
      }

      const userData = userSnap.data();

      // ✅ Store user info in localStorage
      localStorage.setItem("qfs_logged_in", "true");
      localStorage.setItem(
        "qfs_user",
        JSON.stringify({
          uid: user.uid,
          name: userData.name || user.displayName || "User",
          username: userData.username || "",
          email: user.email,
          avatar: userData.avatar || "",
          balance: userData.balance || 0,
        })
      );

      setSnack({
        open: true,
        message: "Login successful!",
        severity: "success",
      });

      // ✅ Redirect after success
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Login error:", err.code);
      let errorMsg = "Login failed. Please try again.";

      switch (err.code) {
        case "auth/invalid-email":
          errorMsg = "Invalid email address.";
          break;
        case "auth/user-not-found":
          errorMsg = "No user found with this email.";
          break;
        case "auth/wrong-password":
          errorMsg = "Incorrect password.";
          break;
        case "auth/too-many-requests":
          errorMsg = "Too many failed attempts. Try again later.";
          break;
        default:
          errorMsg = err.message;
      }

      setSnack({
        open: true,
        message: errorMsg,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/auth.jpg')",
        backgroundSize: "cover",        // makes the image fill the screen
        backgroundPosition: "center",    // centers the image
        backgroundRepeat: "no-repeat",   // prevent tiling
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#e6edf3",
        p: 2,
        flexDirection: "column",
      }}
    >
      {/* 🔷 App Logo */}
      <Link href="/" underline="none">
          <Box
            component="img"
            src="/logo.png"
            alt="CryptoBank Logo"
            sx={{
              width: 250,
              height: 100,
              mb: 3,
              opacity: 0.9,
              p: 1,
            }}
          />
      </Link>

      {/* 🔷 Login Card */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          bgcolor: "rgba(22, 27, 34, 0.6)",   // 60% opaque (more transparent)
          border: "1px solid rgba(48, 54, 61, 0.6)",
          borderRadius: "12px",
          backdropFilter: "blur(10px)",       // frosted glass effect
        }}
      >
        <Typography
          variant="h5"
          align="center"
          sx={{ mb: 3, fontWeight: 600, color: "#00ffcc" }}
        >
          Welcome Back
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ style: { color: "#c9d1d9" } }}
            InputProps={{ style: { color: "#e6edf3" } }}
            sx={{
              "& .MuiOutlinedInput-root fieldset": { borderColor: "#30363d" },
              "& .MuiOutlinedInput-root:hover fieldset": {
                borderColor: "#00ffcc",
              },
              "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                borderColor: "#00ffcc",
              },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ style: { color: "#c9d1d9" } }}
            InputProps={{ style: { color: "#e6edf3" } }}
            sx={{
              "& .MuiOutlinedInput-root fieldset": { borderColor: "#30363d" },
              "& .MuiOutlinedInput-root:hover fieldset": {
                borderColor: "#00ffcc",
              },
              "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                borderColor: "#00ffcc",
              },
            }}
          />

          <Button
            fullWidth
            type="submit"
            disabled={loading}
            sx={{
              mt: 3,
              borderRadius: 8,
              background: "#00ffcc",
              color: "#000",
              fontWeight: 600,
              "&:hover": { background: "#00d4aa" },
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <Typography align="center" sx={{ mt: 2, color: "#8b949e" }}>
          Don’t have an account?{" "}
          <Link
            component="button"
            onClick={() => navigate("/register")}
            sx={{ color: "#00ffcc", textDecoration: "none" }}
          >
            Register
          </Link>
        </Typography>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}

