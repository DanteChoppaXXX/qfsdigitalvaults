import React, { useEffect, useRef } from "react";

export default function TradingViewMiniChart({ symbol = "BTCUSD" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Clear previous widget if it exists
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: `CRYPTO:${symbol}`,
      width: "100%",
      height: "220",
      locale: "en",
      dateRange: "1D",
      colorTheme: "dark",
      trendLineColor: "#2962FF",
      underLineColor: "rgba(41, 98, 255, 0.3)",
      isTransparent: true,
      autosize: true,
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "220px",
        width: "100%",
      }}
    />
  );
}

