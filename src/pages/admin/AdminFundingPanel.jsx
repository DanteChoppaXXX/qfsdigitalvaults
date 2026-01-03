import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import AdminApplicationCard from "./AdminApplicationCard";

const AdminFundingPanel = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    // Query without orderBy first, fallback if createdAt missing
    const applicationsRef = collection(db, "fundingApplications");
    let q;

    try {
      q = query(applicationsRef, orderBy("createdAt", "desc"));
    } catch {
      q = applicationsRef; // fallback if ordering fails
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort manually if some docs have no createdAt
        const sorted = data.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setApplications(sorted);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore snapshot error:", err);
        setError(
          "Failed to load applications. Check your permissions."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h5" mb={3}>
        Funding Applications
      </Typography>

      {applications.length === 0 ? (
        <Typography color="#8b949e">
          No applications found.
        </Typography>
      ) : (
        applications.map((app) => (
          <AdminApplicationCard key={app.id} application={app} />
        ))
      )}
    </Box>
  );
};

export default AdminFundingPanel;

