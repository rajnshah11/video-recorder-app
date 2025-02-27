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
        if (event.data.size > 0) {
          console.log("Data available: ", event.data);
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstart = () => {
        console.log("Recording started");
      };

      recorder.onstop = () => {
        console.log("Recording stopped");
        if (recordedChunks.length === 0) {
          console.error("No recorded data available.");
          return;
        }

        // Create a Blob from recorded chunks
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        console.log("Recorded video size:", blob.size);

        // Show save dialog
        window.electron.ipcRenderer.invoke("show-save-dialog").then(async (filePath) => {
          if (!filePath) {
            console.log("Save dialog canceled.");
            return;
          }

          try {
            const buffer = window.electron.Buffer.from(await blob.arrayBuffer());
            const success = await window.electron.ipcRenderer.invoke("save-file", {
              filePath,
              buffer,
            });

            if (success) {
              console.log(`File saved at: ${filePath}`);
              onSave(filePath); // Trigger callback with saved file path
            } else {
              console.error("Failed to save video.");
            }
          } catch (error) {
            console.error("Error converting Blob to Buffer:", error);
          }
        });
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorder || !videoRef.current) return;

    // Stop recording and media tracks
    mediaRecorder.stop();
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

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
