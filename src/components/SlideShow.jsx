import React from "react";
import { Box, Typography } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function NewsSlideshow() {
  const newsSlides = [
    {
      img: "/assets/btc.jpg",
      title: "An independent peer-to-peer network for transactions, free from central authority",
    },
    {
      img: "/assets/btc1.png",
      title: "Powered by the transparent and immutable blockchain ledger, ensuring secure transactions",
    },
    {
      img: "/assets/btc2.jpeg",
      title: " A scarce digital asset with a fixed supply of 21 million coins",
    },
    {
      img: "/assets/btc3.webp",
      title: "A potential hedge against inflation due to its fixed supply and deflationary model",
    },

  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: false,
    pauseOnHover: true,
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Bitcoin News
      </Typography>

      <Slider {...sliderSettings}>
        {newsSlides.map((slide, i) => (
          <Box
            key={i}
            sx={{
              position: "relative",
              height: 220,
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #30363d",
            }}
          >
            <Box
              component="img"
              src={slide.img}
              alt={slide.title}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "brightness(0.7)",
              }}
            />
            <Typography
              variant="subtitle1"
              sx={{
                position: "absolute",
                bottom: 16,
                color: "#ffff55",
                fontWeight: 600,
                background: "rgba(0,0,0,0.5)",
                px: 2,
                py: 1,
                borderRadius: "8px",
                maxWidth: "100%",
              }}
            >
              {slide.title}
            </Typography>
          </Box>
        ))}
      </Slider>
    </Box>
  );
}

