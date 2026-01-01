import React, { useState, useEffect } from "react";
import {
  Box,
  Modal,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { QRCodeCanvas } from "qrcode.react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function DepositModal({ open, onClose, coin }) {
  const [depositAddress, setDepositAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (!coin) return;

      try {
        setLoading(true);
        setDepositAddress("");

        const docRef = doc(db, "appSettings", "globalWallet");
        const snap = await getDoc(docRef);

        if (!snap.exists()) return;

        const data = snap.data();
        const key = `${coin.symbol.toLowerCase()}Address`;
        if (data[key]) setDepositAddress(data[key]);
      } catch (err) {
        console.error("Error fetching wallet address:", err);
      } finally {
        setLoading(false);
      }
    };

    if (open) fetchWalletAddress();
    else setDepositAddress("");
  }, [open, coin]);

  const handleCopy = async () => {
    if (!depositAddress) return;

    // Try modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(depositAddress);
      } catch {
        fallbackCopy(depositAddress);
      }
    } else {
      fallbackCopy(depositAddress);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }

    document.body.removeChild(textarea);
  };

  return (
    <>
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
            boxShadow: "0 0 15px rgba(0,255,204,0.2)",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#00ffcc" }}>
            Deposit {coin?.symbol || ""}
          </Typography>

          {loading ? (
            <CircularProgress sx={{ color: "#00ffcc", my: 4 }} />
          ) : depositAddress ? (
            <>
              <QRCodeCanvas
                value={depositAddress}
                size={180}
                bgColor="transparent"
                fgColor="#00ffcc"
              />

              <Typography
                sx={{
                  mt: 2,
                  mb: 1,
                  fontSize: "0.9rem",
                  color: "#ff3b3b",
                }}
              >
                Send only {coin?.symbol} to the address below:
              </Typography>

              <Box
                sx={{
                  background: "rgba(255,255,255,0.05)",
                  p: 1.5,
                  borderRadius: "8px",
                  color: "#00ffcc",
                  fontSize: "0.85rem",
                  wordBreak: "break-all",
                  mb: 2,
                }}
              >
                {depositAddress}
              </Box>

              {/* Centered Copy Button */}
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  onClick={handleCopy}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    background: "rgba(0,255,204,0.1)",
                    color: "#00ffcc",
                    fontWeight: 600,
                    borderRadius: "8px",
                    px: 3,
                    py: 1,
                    "&:hover": { background: "rgba(0,255,204,0.2)" },
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                  Copy Address
                </Button>
              </Box>
            </>
          ) : (
            <Typography sx={{ color: "#ff6b6b", mt: 2 }}>
              No deposit address configured for {coin?.symbol}.
            </Typography>
          )}
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={copied}
        autoHideDuration={1500}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ background: "#00ffcc", color: "#000" }}>
          Address copied!
        </Alert>
      </Snackbar>
    </>
  );
}

