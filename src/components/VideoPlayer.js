import React from "react";

const VideoPlayer = ({ videoUrl }) => {
  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Playback</h2>
      {videoUrl ? (
        <video controls style={{ width: "50%" }}>
          <source src={`file:/${videoUrl}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>No video recorded yet.</p>
      )}
    </div>
  );
};

export default VideoPlayer;
