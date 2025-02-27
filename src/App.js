import React, { useState } from "react";
import VideoRecorder from "./components/VideoRecorder";
import VideoPlayer from "./components/VideoPlayer";

function App() {
  const [videoPath, setVideoPath] = useState(null);

  return (
    <div className="App" style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Electron Video Recorder</h1>
      {/* Pass setVideoPath to VideoRecorder */}
      <VideoRecorder onSave={(path) => setVideoPath(path)} />
      {/* Pass videoPath to VideoPlayer */}
      {videoPath && <VideoPlayer videoUrl={videoPath} />}
    </div>
  );
}

export default App;
