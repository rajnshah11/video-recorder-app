import React, { useRef, useState, useEffect, useCallback } from "react";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
import "./VideoPlayer.css";

const VideoPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoError = () => {
    setIsError(true);
    console.error("Error loading video");
  };

  const playVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(handleVideoError);
      setIsPlaying(true);
    }
  }, []);

  const pauseVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stopVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      alert("Video Stopped!");
    }
  }, []);

  const handleSeek = (event) => {
    if (videoRef.current) {
      const newTime = (event.target.value / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  useEffect(() => {
    const newVideoSrc = `${videoUrl}?t=${new Date().getTime()}`;
    if (videoRef.current) {
      setIsError(false);
      videoRef.current.pause();
      videoRef.current.src = newVideoSrc;
      videoRef.current.load();
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [videoUrl]);

  return (
    <div className="video-playback">
      <h2>🎥 Playback</h2>

      <div className="video-container">
        <video
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleVideoError}
          className="video-preview"
          aria-label="Video Player"
        />
        {isError && <div className="error-message">Failed to load video. Please try again.</div>}
      </div>

      <div className="controls">
        {/* Toggle Play/Pause Button */}
        <button
          className="btn start-btn"
          onClick={isPlaying ? pauseVideo : playVideo} // Toggle between play and pause
          disabled={isError}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <FaPause /> : <FaPlay />} {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          className="btn stop-btn"
          onClick={stopVideo}
          disabled={isError}
          aria-label="Stop video"
        >
          <FaStop /> Stop
        </button>
      </div>

      <div className="seek-bar">
        <input
          type="range"
          min="0"
          max="100"
          value={(currentTime / duration) * 100 || 0}
          onChange={handleSeek}
          className="seek-input"
          aria-label="Seek video"
        />
      </div>

      <p className="time-display">
        {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, "0")} /{" "}
        {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, "0")}
      </p>
    </div>
  );
};

export default VideoPlayer;
