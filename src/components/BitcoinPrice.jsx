import React, { useEffect, useState } from "react";

export default function BitcoinPrice({ onRateChange, refreshIntervalMs = 60_000 }) {
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRate = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );
      if (!resp.ok) {
        throw new Error(`HTTP error: ${resp.status}`);
      }
      const data = await resp.json();
      const newRate = data.bitcoin?.usd;
      if (typeof newRate !== "number") {
        throw new Error("Unexpected data format");
      }
      setRate(newRate);
      if (onRateChange) {
        onRateChange(newRate);
      }
    } catch (err) {
      console.error("Failed to fetch BTC rate:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
    const timer = setInterval(fetchRate, refreshIntervalMs);
    return () => clearInterval(timer);
  }, [refreshIntervalMs]);

  if (loading) {
    return <span>Loading BTC rate…</span>;
  }
  if (error) {
    return <span>Error loading BTC rate: {error}</span>;
  }
  return (
    <span>1 BTC = ${rate.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>
  );
}

