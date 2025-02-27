import React, { useRef, useState,useEffect } from "react";

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
    setDuration(videoRef.current.duration);
  };

  // Play the video
  const playVideo = () => {
    videoRef.current.play();
    setIsPlaying(true);
  };

  // Pause the video
  const pauseVideo = () => {
    videoRef.current.pause();
    setIsPlaying(false);
  };

  // Stop the video (pause and reset to start)
  const stopVideo = () => {
    videoRef.current.pause();
    videoRef.current.currentTime = 0; // Reset to beginning
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Seek to a specific time in the video
  const handleSeek = (event) => {
    const newTime = (event.target.value / 100) * duration; // Calculate new time based on slider value
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause(); // Pause the current playback
      videoRef.current.src = videoUrl; // Update the source URL
      videoRef.current.load(); // Reload the new video source
      setCurrentTime(0); // Reset current time
      setDuration(0); // Reset duration
      setIsPlaying(false); // Ensure playback state is reset
      console.log("Video URL changed:", videoUrl); // Debugging log
    }
  }, [videoUrl]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Video Playback</h2>

      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        style={{ width: "70%", marginTop: "10px" }}
      ></video>

      {/* Playback Controls */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={playVideo} disabled={isPlaying}>
          Play
        </button>
        <button onClick={pauseVideo} disabled={!isPlaying}>
          Pause
        </button>
        <button onClick={stopVideo}>Stop</button>
      </div>

      {/* Seek Bar */}
      <div style={{ marginTop: "10px" }}>
        <input
          type="range"
          min="0"
          max="100"
          value={(currentTime / duration) * 100 || 0} // Percentage of playback completed
          onChange={handleSeek}
          style={{ width: "70%" }}
        />
      </div>

      {/* Time Display */}
      <p>
        {Math.floor(currentTime / 60)}:
        {Math.floor(currentTime % 60)
          .toString()
          .padStart(2, "0")}{" "}
        / {Math.floor(duration / 60)}:
        {Math.floor(duration % 60)
          .toString()
          .padStart(2, "0")}
      </p>
    </div>
  );
};

export default VideoPlayer;
