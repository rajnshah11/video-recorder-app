import React, { useRef, useState, useEffect } from "react";
import { FaPlay, FaPause, FaStop } from "react-icons/fa"; // Import icons for controls
import "./VideoPlayer.css"; // Import the CSS file

const VideoPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null); // Reference to the video element
  const [currentTime, setCurrentTime] = useState(0); // Current playback time
  const [duration, setDuration] = useState(0); // Total duration of the video
  const [isPlaying, setIsPlaying] = useState(false); // Playback state

  // Update current time as the video plays
  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  // Set duration when metadata is loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      console.log("New video duration:", videoRef.current.duration); // Debugging log
    }
  };

  // Play the video
  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Pause the video
  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Stop the video (pause and reset to start)
  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset to beginning
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  // Seek to a specific time in the video
  const handleSeek = (event) => {
    if (videoRef.current) {
      const newTime = (event.target.value / 100) * duration; // Calculate new time based on slider value
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Reload video when URL changes
  useEffect(() => {
    if (videoRef.current) {
      console.log("Video URL changed:", videoUrl); // Debugging log

      // Reset playback state
      videoRef.current.pause();
      videoRef.current.src = videoUrl; 
      videoRef.current.load();
      setCurrentTime(0); 
      setDuration(0); 
      setIsPlaying(false); 
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.pause(); // Stop the video when unmounting
        videoRef.current = null;
      }
    };
  }, [videoUrl]);

  return (
    <div className="video-playback">
      <h2>🎥 Playback</h2>

      {/* Video container */}
      <div className="video-container">
        <video
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata} // Triggered when metadata is loaded
          className="video-preview"
        ></video>
      </div>

      {/* Playback Controls */}
      <div className="controls">
        <button className="btn start-btn" onClick={playVideo} disabled={isPlaying}>
          <FaPlay /> Play
        </button>
        <button className="btn pause-btn" onClick={pauseVideo} disabled={!isPlaying}>
          <FaPause /> Pause
        </button>
        <button className="btn stop-btn" onClick={stopVideo}>
          <FaStop /> Stop
        </button>
      </div>

      {/* Seek Bar */}
      <div className="seek-bar">
        <input
          type="range"
          min="0"
          max="100"
          value={(currentTime / duration) * 100 || 0} // Percentage of playback completed
          onChange={handleSeek}
          className="seek-input"
        />
      </div>

      {/* Time Display */}
      <p className="time-display">
        {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, "0")} /{" "}
        {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, "0")}
      </p>
    </div>
  );
};

export default VideoPlayer;
