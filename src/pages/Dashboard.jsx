import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Button,
} from "@mui/material";

import SlideShow from "../components/SlideShow";
import TradingViewChartCarousel from "../components/TradingViewChartCarousel";
import { useTransactions } from "../context/TransactionContext";
import DepositWithdrawController from "../components/DepositWithdrawController";

export default function Dashboard() {
  const { balanceUSD, transactions, loading, btcRate } = useTransactions();
  const balanceBTC = btcRate ? (balanceUSD / btcRate).toFixed(6) : "…";

  if (loading) {
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
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* BALANCE CARD */}
      <Card
        sx={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid #30363d",
          borderRadius: "12px",
          p: 3,
          backdropFilter: "blur(6px)",
          transition: "0.2s",
          "&:hover": { transform: "translateY(-3px)" },
          maxWidth: 420,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{ color: "#00ffcc", mb: 1, fontWeight: 600 }}
          >
            Total Balance
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            ${balanceUSD.toLocaleString()}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#8b949e", mt: 0.5 }}>
            ≈ {balanceBTC} BTC
          </Typography>

          {/* Buttons */}
          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <DepositWithdrawController>
              {({ openDeposit, openWithdraw }) => (
                <>
                  <Button
                    onClick={openDeposit}
                    sx={{
                      background: "#00ffcc",
                      color: "#000",
                      borderRadius: "8px",
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      "&:hover": { background: "#00d4aa" },
                    }}
                  >
                    Deposit
                  </Button>

                  <Button
                    onClick={openWithdraw}
                    sx={{
                      background: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      borderRadius: "8px",
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      "&:hover": { background: "rgba(255,255,255,0.2)" },
                    }}
                  >
                    Withdraw
                  </Button>
                </>
              )}
            </DepositWithdrawController>
          </Box>
        </CardContent>
      </Card>

      {/* TRADING VIEW CHART CAROUSEL */}
      <TradingViewChartCarousel
        symbols={["BTCUSD", "ETHUSD", "BNBUSD", "SOLUSD", "XRPUSD"]}
        intervalMs={60000} // auto-swipe every 1 min
      />

      {/* TRANSACTIONS TABLE */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Recent Transactions
        </Typography>
        <Paper
          sx={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid #30363d",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead sx={{ background: "rgba(255,255,255,0.08)" }}>
              <TableRow>
                <TableCell sx={{ color: "#c9d1d9" }}>Type</TableCell>
                <TableCell sx={{ color: "#c9d1d9" }}>Amount (USD)</TableCell>
                <TableCell sx={{ color: "#c9d1d9" }}>Amount (BTC)</TableCell>
                <TableCell sx={{ color: "#c9d1d9" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.slice(0, 5).map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell>${tx.amountUSD}</TableCell>
                    <TableCell>{tx.amountBTC}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color:
                            tx.status === "Success" ? "#00ff80" : "#ffee58",
                          background:
                            tx.status === "Success"
                              ? "rgba(0,255,128,0.15)"
                              : "rgba(255,255,0,0.15)",
                        }}
                      >
                        {tx.status}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ color: "#8b949e", py: 3 }}
                  >
                    No transactions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* SLIDESHOW */}
      <SlideShow />
    </Box>
  );
}

