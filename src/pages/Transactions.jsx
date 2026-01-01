import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import { useTransactions } from "../context/TransactionContext";
import TransactionDetailModal from "../components/TransactionDetailModal";

export default function Transactions() {
  const { transactions } = useTransactions();
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);

  const loading = transactions === null;

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    let filtered = [...transactions];

    if (filterType !== "all") {
      filtered = filtered.filter((tx) => tx.type === filterType);
    }

    if (search.trim() !== "") {
      filtered = filtered.filter((tx) =>
        tx.amountUSD?.toString().includes(search)
      );
    }

    if (sortBy === "newest") {
      filtered.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    } else if (sortBy === "highest") {
      filtered.sort((a, b) => b.amountUSD - a.amountUSD);
    } else if (sortBy === "lowest") {
      filtered.sort((a, b) => a.amountUSD - b.amountUSD);
    }

    return filtered;
  }, [transactions, filterType, sortBy, search]);

  return (
    <Box sx={{ color: "#e6edf3" }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: "#00ffcc" }}>
        Transaction History
      </Typography>

      {/* Filter + Sort Controls */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          alignItems: "center",
        }}
      >
        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel sx={{ color: "#c9d1d9" }}>Filter by Type</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            sx={{
              color: "#e6edf3",
              borderColor: "#30363d",
              background: "rgba(255,255,255,0.05)",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#30363d" },
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="deposit">Deposit</MenuItem>
            <MenuItem value="withdraw">Withdraw</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel sx={{ color: "#c9d1d9" }}>Sort by</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{
              color: "#e6edf3",
              borderColor: "#30363d",
              background: "rgba(255,255,255,0.05)",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#30363d" },
            }}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
            <MenuItem value="highest">Highest Amount</MenuItem>
            <MenuItem value="lowest">Lowest Amount</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Search by Amount"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          sx={{
            flex: 1,
            minWidth: 160,
            background: "rgba(255,255,255,0.05)",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#30363d" },
              "&:hover fieldset": { borderColor: "#00ffcc" },
              "&.Mui-focused fieldset": { borderColor: "#00ffcc" },
            },
            "& .MuiInputLabel-root": { color: "#c9d1d9" },
            input: { color: "#e6edf3" },
          }}
        />

        <Button
          onClick={() => {
            setFilterType("all");
            setSearch("");
            setSortBy("newest");
          }}
          sx={{
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            px: 3,
            "&:hover": { background: "rgba(255,255,255,0.15)" },
          }}
        >
          Reset
        </Button>
      </Box>

      {/* Scrollable Table */}
      <TableContainer
        component={Paper}
        sx={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid #30363d",
          borderRadius: "12px",
          overflowX: "auto",
          "&::-webkit-scrollbar": { height: 8 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#00ffcc",
            borderRadius: "10px",
          },
        }}
      >
        <Table stickyHeader>
          <TableHead sx={{ background: "rgba(255,255,255,0.08)" }}>
            <TableRow>
              <TableCell sx={{ color: "#c9d1d9", fontWeight: 600, width: "15%" }}>Type</TableCell>
              <TableCell sx={{ color: "#c9d1d9", fontWeight: 600, width: "20%" }}>Amount (USD)</TableCell>
              <TableCell sx={{ color: "#c9d1d9", fontWeight: 600, width: "20%" }}>Status</TableCell>
              <TableCell sx={{ color: "#c9d1d9", fontWeight: 600, width: "20%" }}>Date</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: "center", color: "#8b949e", py: 3 }}>
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <TableRow
                  key={tx.id}
                  hover
                  sx={{
                    cursor: "pointer",
                    "&:hover": { background: "rgba(255,255,255,0.08)" },
                  }}
                  onClick={() => setSelectedTx(tx)} // ✅ Opens modal with full details
                >
                  <TableCell sx={{ textTransform: "capitalize" }}>{tx.type}</TableCell>
                  <TableCell>${tx.amountUSD}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "inline-block",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: tx.status === "Success" ? "#00ff80" : "#ffee58",
                        background:
                          tx.status === "Success"
                            ? "rgba(0,255,128,0.15)"
                            : "rgba(255,255,0,0.15)",
                      }}
                    >
                      {tx.status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {tx.createdAt?.seconds
                      ? new Date(tx.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: "center", color: "#8b949e", py: 3 }}>
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Reusable Modal */}
      <TransactionDetailModal
        open={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
      />
    </Box>
  );
}

