import React, { useState } from "react";
import VideoRecorder from "./components/VideoRecorder";
import VideoPlayer from "./components/VideoPlayer";

function App() {
  const [videoPath, setVideoPath] = useState(null);

  return (
    <div className="App" style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Electron Video Recorder</h1>
      <VideoRecorder onSave={(path) => setVideoPath(path)} />
      {videoPath && (
        <VideoPlayer videoUrl={`http://localhost:3001/video?path=${encodeURIComponent(videoPath)}`} />
      )}
    </div>
  );
}

export default App;
