import React, { useRef, useState } from "react";
import "./VideoRecorder.css"; // Import the CSS file
import { FaVideo, FaStop } from "react-icons/fa"; // Importing icons

const VideoRecorder = ({ onSave, onStartRecording }) => {
  const videoRef = useRef(null); // Reference to the video element
  const [mediaRecorder, setMediaRecorder] = useState(null); // MediaRecorder instance
  const recordedChunksRef = useRef([]); // Stores recorded video chunks
  const [isRecording, setIsRecording] = useState(false); // Recording state
  const [resolution, setResolution] = useState("720p"); // Default resolution

  // Supported resolutions
  const resolutions = {
    "720p": { width: 1280, height: 720 },
    "1080p": { width: 1920, height: 1080 },
    "4K": { width: 3840, height: 2160 },
  };

  // Start recording video
  const startRecording = async () => {
    try {
      const { width, height } = resolutions[resolution]; // Get resolution dimensions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width, height },
        audio: true,
      });

      if (onStartRecording) {
        onStartRecording(); // Notify parent component when recording starts
      }

      // Set up video stream
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      recordedChunksRef.current = [];

      // Initialize MediaRecorder
      const recorder = new MediaRecorder(stream, { mimeType: "video/mp4" });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstart = () => console.log("Recording started");
      recorder.onstop = () => handleStopRecording();

      setMediaRecorder(recorder);
      recorder.start(); // Start recording
      setIsRecording(true); // Disable resolution dropdown during recording
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  // Stop recording video
  const stopRecording = () => {
    if (!mediaRecorder || !videoRef.current) return;

    mediaRecorder.stop();
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    setIsRecording(false); // Enable resolution dropdown after stopping recording
  };

  // Handle recording stop and save the file
  const handleStopRecording = () => {
    console.log("Recording stopped");

    if (recordedChunksRef.current.length === 0) {
      console.error("No recorded data available.");
      return;
    }

    const blob = new Blob(recordedChunksRef.current, { type: "video/mp4" });

    window.electron.ipcRenderer.invoke("show-save-dialog").then(async (filePath) => {
      if (!filePath) {
        console.log("Save dialog canceled.");
        return;
      }

      try {
        const buffer = window.electron.Buffer.from(await blob.arrayBuffer());
        const success = await window.electron.ipcRenderer.invoke("save-file", { filePath, buffer });

        if (success) {
          console.log(`File saved at: ${filePath}`);
          onSave(filePath); // Notify parent component of saved file path
        } else {
          console.error("Failed to save video.");
        }
      } catch (error) {
        console.error("Error converting Blob to Buffer:", error);
      }
    });
  };

  return (
<div className="video-recorder">
      <h2>🎥 Record Video</h2>

      {/* Video Preview */}
      <div className="video-container">
        <video ref={videoRef} autoPlay muted className="video-preview"></video>
      </div>

      {/* Controls */}
      <div className="controls">
        <button onClick={startRecording} disabled={isRecording} className="btn start-btn">
          <FaVideo className="icon" /> Start
        </button>
        <button onClick={stopRecording} disabled={!isRecording} className="btn stop-btn">
          <FaStop className="icon" /> Stop
        </button>
      </div>

      {/* Resolution Selector */}
      <div className="resolution-selector">
        <label htmlFor="resolution">Resolution:</label>
        <select id="resolution" value={resolution} onChange={(e) => setResolution(e.target.value)} disabled={isRecording}>
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
          <option value="4K">4K</option>
        </select>
      </div>
    </div>
  );
};

export default VideoRecorder;
