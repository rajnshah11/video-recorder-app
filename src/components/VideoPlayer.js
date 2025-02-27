import React, { useRef, useState, useEffect } from "react";

const VideoPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null); // Reference to the video element
  const [currentTime, setCurrentTime] = useState(0); // Current playback time
  const [duration, setDuration] = useState(0); // Total duration of the video
  const [isPlaying, setIsPlaying] = useState(false); // Playback state
  const [videoSrc, setVideoSrc] = useState(videoUrl); // Video source with query parameter

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

  // Reload video when URL changes or even if it's the same (force reload)
  useEffect(() => {
    // Append a timestamp to the video URL to force a re-fetch each time
    const newVideoSrc = `${videoUrl}?t=${new Date().getTime()}`;

    setVideoSrc(newVideoSrc); // Update the source URL with the timestamp

    if (videoRef.current) {
      console.log("Video URL changed:", newVideoSrc); // Debugging log

      // Reset playback state
      videoRef.current.pause();
      videoRef.current.src = newVideoSrc; // Set the new source with timestamp
      videoRef.current.load();

      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);

      console.log("Video reloaded with new source.");
    }
  }, [videoUrl]); // Dependency array ensures it runs whenever videoUrl changes

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Video Playback</h2>

      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoSrc} // Use the updated video source
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata} // Triggered when metadata is loaded
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
