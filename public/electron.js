const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const express = require("express");
// Create an Express server for serving videos
const appServer = express();

const ffmpeg = require('fluent-ffmpeg');

appServer.get("/video", (req, res) => {
  const decodedPath = decodeURIComponent(req.query.path);
  if (!decodedPath || !fs.existsSync(decodedPath)) {
    return res.status(404).send("Video file not found");
  }

  const stat = fs.statSync(decodedPath);
  if (stat.size === 0) {
    return res.status(404).send("Video file is empty");
  }
  console.log("Decoded Path:", decodedPath);

  // Get video duration using fluent-ffmpeg
  ffmpeg.ffprobe(decodedPath, (err, metadata) => {
    if (err) {
      console.error("Error getting video metadata:", err);
      return res.status(500).send("Error retrieving video information");
    }

    const duration = metadata.format.duration; // Get video duration
    console.log("Video Duration (seconds):", duration);

    // You can include this duration in the response headers, or handle it however you need
    res.setHeader("X-Video-Duration", duration);

    const fileSize = stat.size;
    const range = req.headers.range;

    console.log("File Size:", fileSize);
    console.log("Range Header:", range);

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      console.log("Start Byte:", start);
      console.log("End Byte:", end);

      if (start >= fileSize || end >= fileSize) {
        res.setHeader("Content-Range", `bytes */${fileSize}`);
        return res.status(416).send("Requested Range Not Satisfiable");
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(decodedPath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      });

      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      });
      fs.createReadStream(decodedPath).pipe(res);
    }
  });
});


// Start the Express server
appServer.listen(3001, () => {
  console.log("Server running at http://localhost:3001");
});

let mainWindow;

app.whenReady().then(() => {
  // Create BrowserWindow
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: `${__dirname}/preload.js`, // Enable IPC in React
    },
  });

  mainWindow.loadURL("http://localhost:3000"); // Update with your React build path
  mainWindow.webContents.openDevTools();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle save dialog
ipcMain.handle("show-save-dialog", async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Save Recorded Video",
    defaultPath: "Untitled0.mp4",
    filters: [
      { name: "MP4 Video", extensions: ["mp4"] }, // Default option
      { name: "WebP Video", extensions: ["webm"] },
    ],
  });

  return result.canceled ? null : result.filePath;
});

// Handle save file operation
ipcMain.handle("save-file", async (_, { filePath, buffer }) => {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error("Buffer is empty or invalid.");
    }
    fs.writeFileSync(filePath, buffer);
    const stat = fs.statSync(filePath);
    if (stat.size === 0) {
      throw new Error("File saved but is empty.");
    }
    console.log(`File successfully saved to ${filePath}`);
    return true;
  } catch (error) {
    console.error("Failed to save file:", error);
    return false;
  }
});