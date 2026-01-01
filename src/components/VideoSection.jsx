import React, { useState, useRef } from "react";
import "../layout/QuantumHome.css";

const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section className="video-section">
      <div className="video-container">
        {!isPlaying && (
          <div className="video-overlay" onClick={handleTogglePlay}>
            <img
              src="/assets/v-poster.jpeg" // <-- replace with your thumbnail path
              alt="Video thumbnail"
              className="video-thumbnail"
            />
            <div className="play-button">▶</div>
          </div>
        )}

        <video
          ref={videoRef}
          className="hero-video"
          src="/assets/qfs.mp4" // <-- replace with your video path
          muted
          loop
          playsInline
          onClick={handleTogglePlay}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      </div>
    </section>
  );
};

export default VideoSection;

