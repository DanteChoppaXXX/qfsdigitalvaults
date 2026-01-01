import React from "react";
import { Box, Modal, Typography, Grid, Paper } from "@mui/material";
import { FaBitcoin, FaEthereum, FaBitcoin as FaBnb } from "react-icons/fa";
import { SiSolana, SiRipple } from "react-icons/si";

const COINS = [
  { symbol: "BTC", name: "Bitcoin", icon: <FaBitcoin size={36} color="#f7931a" /> },
  { symbol: "ETH", name: "Ethereum", icon: <FaEthereum size={36} color="#3c3c3d" /> },
  { symbol: "BNB", name: "Binance Coin", icon: <FaBnb size={36} color="#f0b90b" /> },
  { symbol: "SOL", name: "Solana", icon: <SiSolana size={36} color="#00ffa3" /> },
  { symbol: "XRP", name: "Ripple", icon: <SiRipple size={36} color="#346aa9" /> },
];

export default function CoinSelectionModal({ open, onClose, onSelect }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: "90%",
          maxWidth: 480,
          bgcolor: "#111",
          border: "1px solid #30363d",
          borderRadius: "16px",
          p: 3,
          mx: "auto",
          mt: "10%",
          color: "#fff",
          textAlign: "center",
          boxShadow: "0 0 20px rgba(0,255,204,0.2)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, color: "#00ffcc", fontWeight: 700 }}>
          Select a Coin
        </Typography>

        <Grid container spacing={2}>
          {COINS.map((coin) => (
            <Grid item xs={4} sm={3} key={coin.symbol}>
              <Paper
                onClick={() => onSelect(coin)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                  cursor: "pointer",
                  bgcolor: "rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  border: "1px solid #30363d",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 0 15px rgba(0,255,204,0.4)",
                    borderColor: "#00ffcc",
                    bgcolor: "rgba(0,255,204,0.05)",
                  },
                }}
              >
                {coin.icon}
                <Typography sx={{ fontWeight: 600, mt: 1 }}>{coin.symbol}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Modal>
  );
}

