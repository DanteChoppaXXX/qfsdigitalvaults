import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import Layout from "./layout/Layout";

// Context
import { TransactionProvider } from "./context/TransactionContext";

// Pages
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminPanel from "./pages/AdminPanel.jsx"
import Homepage from "./pages/Homepage.jsx"
import KYCPage from "./pages/KYCPage.jsx"
import WithdrawalProcess from "./pages/WithdrawalProcess.jsx"
import WithdrawalApproval from "./pages/admin/WithdrawalApproval.jsx"
import FundingApplication from "./pages/FundingApplication";
import AdminFundingPanel from "./pages/admin/AdminFundingPanel";

// Routes
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

const router = createBrowserRouter([
  // 🟩 Protected (user must be logged in)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "transactions", element: <Transactions /> },
          { path: "settings", element: <Settings /> },
          { path: "verify-identity", element: <KYCPage /> },
          { path: "withdrawal-process", element: <WithdrawalProcess /> },
          { path: "withdrawal-approval", element: <WithdrawalApproval /> },
          { path: "admin", element: <AdminPanel /> },
          { path: "admin/funding", element: <AdminFundingPanel /> },
        ],
      },
    ],
  },

  // 🟦 Public (homepage/login/register only when logged out)
  {
    element: <PublicRoute />,
    children: [
      { index: true, element: <Homepage /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "apply-for-funding", element: <FundingApplication /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TransactionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </TransactionProvider>
  </React.StrictMode>
);

