import React, { useRef, useState } from "react";

const VideoRecorder = ({ onSave }) => {
  const videoRef = useRef(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0)
          setRecordedChunks((prev) => [...prev, event.data]);
      };
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorder || !videoRef.current) return;
  
    mediaRecorder.stop();
    videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
  
    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
  
      // Show save dialog and get file path
      const filePath = await window.electron.ipcRenderer.invoke(
        "show-save-dialog"
      );
      if (filePath) {
        // Convert blob to buffer and send it to Electron for saving
        const buffer = window.electron.Buffer.from(await blob.arrayBuffer());
        const success = await window.electron.ipcRenderer.invoke("save-file", {
          filePath,
          buffer,
        });
  
        if (success) {
          console.log(`File saved at: ${filePath}`);
          onSave(filePath); 
        } else {
          console.error("Failed to save video.");
        }
      }
    };
  
    setIsRecording(false);
  };  

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Record Video</h2>
      <video ref={videoRef} autoPlay muted style={{ width: "50%" }}></video>
      <div style={{ marginTop: "10px" }}>
        <button onClick={startRecording} disabled={isRecording}>
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
      </div>
    </div>
  );
};

export default VideoRecorder;
