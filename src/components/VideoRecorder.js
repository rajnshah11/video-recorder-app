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
  
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      recordedChunksRef.current = [];
  
      // Use WebM format as an intermediate format (WebM is needed to record)
      const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
    
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
  
      recorder.onstart = () => {
        setIsRecording(true);
        alert("Recording Started!");
      };
  
      recorder.onstop = async () => {
        await handleStopRecording(); // Handle stop after conversion
      };
  
      setMediaRecorder(recorder);
      recorder.start();
    } catch (error) {
      alert("Error accessing media devices. Please check your camera and microphone.");
    }
  };
  
  const handleStopRecording = async () => {
    if (recordedChunksRef.current.length === 0) {
      alert("No video data recorded.");
      return;
    }
  
    try {
      // Show the save dialog for MP4 directly
      let filePath = await window.electron.showSaveDialog();
      if (!filePath) return;
      filePath = filePath.replace(/\.webm$/, '');
      const mp4Path = filePath.endsWith('.mp4') ? filePath : `${filePath}.mp4`;
  
      // Check if the recorded data is already in MP4 format
      const isMP4 = recordedChunksRef.current[0].type.includes('mp4');
  
      if (isMP4) {
        // If it's already MP4, save directly
        const mp4Blob = new Blob(recordedChunksRef.current, { type: 'video/mp4' });
        const mp4Buffer = window.electron.Buffer.from(await mp4Blob.arrayBuffer());
        await window.electron.saveFile(mp4Path, mp4Buffer);
        onSave(mp4Path);
      } else {
        // If it's WebM, convert to MP4
        const webmBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const webmBuffer = window.electron.Buffer.from(await webmBlob.arrayBuffer());
        const webmPath = mp4Path.replace(/\.mp4$/, '.webm');
        await window.electron.saveFile(webmPath, webmBuffer);
  
        const success = await window.electron.convertWebMToMP4(webmPath, mp4Path);
        if (success) {
          onSave(mp4Path);
        } else {
          alert("Failed to convert video. The format may be unsupported.");
        }
      }
    } catch (error) {
      alert("Error processing video. Please try a different format or resolution.");
      console.error("Video processing error:", error);
    }
  };
  
  const stopRecording = () => {
    if (!mediaRecorder || !videoRef.current) return;

    mediaRecorder.stop();
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    setIsRecording(false);
  };
  
  return (
    <div className="video-recorder">
      <h2>🎥 Record Video</h2>

      {/* Video Preview */}
      <div className="video-container">
        <video ref={videoRef} autoPlay muted className="video-preview" />
      </div>

      {/* Controls */}
      <div className="controls">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="btn start-btn"
        >
          <FaVideo className="icon" /> Start
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="btn stop-btn"
        >
          <FaStop className="icon" /> Stop
        </button>
      </div>

      {/* Resolution Selector */}
      <div className="resolution-selector">
        <label htmlFor="resolution">Resolution:</label>
        <select
          id="resolution"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          disabled={isRecording}
        >
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
          <option value="4K">4K</option>
        </select>
      </div>
    </div>
  );
};

export default VideoRecorder;
