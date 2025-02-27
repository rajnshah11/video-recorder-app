import React, { useState } from "react";
import VideoRecorder from "./components/VideoRecorder";
import VideoPlayer from "./components/VideoPlayer";
import { FaSun, FaMoon } from "react-icons/fa";
import "./App.css";

function App() {
  const [videoPath, setVideoPath] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`App ${darkMode ? "dark-mode" : "light-mode"}`}>
      {/* Header */}
      <header className={`app-header ${darkMode ? "dark-header" : "light-header"}`}>
        <h1>Electron Video Recorder</h1>
        <button className="theme-toggle-btn" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode">
          {darkMode ? <FaSun className="icon light-icon" /> : <FaMoon className="icon dark-icon" />}
        </button>
      </header>

      {/* Main Content */}
      <main className={`app-main`}>
        {/* Video Recorder */}
        <section className={`recorder-section ${darkMode ? "dark-section" : "light-section"}`}>
          <VideoRecorder
            onStartRecording={() => setVideoPath(null)} // Reset video path when starting a new recording
            onSave={(path) => setVideoPath(path)} // Save video path when done recording
          />
        </section>

        {/* Show Video Player if there's a recorded video */}
        {videoPath && (
          <section className={`player-section ${darkMode ? "dark-section" : "light-section"}`}>
            <VideoPlayer videoUrl={`http://localhost:3001/video?path=${encodeURIComponent(videoPath)}`} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
