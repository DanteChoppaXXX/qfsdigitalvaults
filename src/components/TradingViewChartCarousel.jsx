import React, { useState, useRef, useEffect } from "react";
import { Box, IconButton } from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import TradingViewMiniChart from "./TradingViewMiniChart";

export default function TradingViewChartCarousel({
  symbols = ["BTCUSD", "ETHUSD", "BNBUSD", "SOLUSD"],
  autoSlideInterval = 60000, // 1 minute
}) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % symbols.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + symbols.length) % symbols.length);
  };

  // --- Auto Slide ---
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [autoSlideInterval]);

  // --- Swipe Detection ---
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;

    const delta = e.changedTouches[0].clientX - touchStartX.current;

    if (delta > 60) prevSlide();     // swipe right  
    if (delta < -60) nextSlide();    // swipe left  

    touchStartX.current = null;
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 500,
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
        touchAction: "pan-y", // allows vertical scroll + horizontal swipe
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider container */}
      <Box
        sx={{
          display: "flex",
          transition: "transform 0.45s ease",
          transform: `translateX(-${index * 100}%)`,
        }}
      >
        {symbols.map((symbol, i) => (
          <Box
            key={i}
            sx={{
              minWidth: "100%",
              boxSizing: "border-box",
              px: 1,
            }}
          >
           
            <TradingViewMiniChart symbol={symbol} />
          </Box>
        ))}
      </Box>

      {/* Left Arrow */}
      <IconButton
        onClick={prevSlide}
        sx={{
          position: "absolute",
          top: "50%",
          left: 5,
          transform: "translateY(-50%)",
          color: "#00ffcc",
          background: "rgba(0,0,0,0.3)",
          "&:hover": { background: "rgba(0,0,0,0.5)" },
          zIndex: 10,
        }}
      >
        <ArrowBackIosNew />
      </IconButton>

      {/* Right Arrow */}
      <IconButton
        onClick={nextSlide}
        sx={{
          position: "absolute",
          top: "50%",
          right: 5,
          transform: "translateY(-50%)",
          color: "#00ffcc",
          background: "rgba(0,0,0,0.3)",
          "&:hover": { background: "rgba(0,0,0,0.5)" },
          zIndex: 10,
        }}
      >
        <ArrowForwardIos />
      </IconButton>

      {/* Dot navigation */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 1,
          gap: 1,
        }}
      >
        {symbols.map((_, i) => (
          <Box
            key={i}
            onClick={() => setIndex(i)}
            sx={{
              width: i === index ? 12 : 8,
              height: i === index ? 12 : 8,
              borderRadius: "50%",
              backgroundColor: i === index ? "#00ffcc" : "#555",
              cursor: "pointer",
              transition: "0.3s",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

