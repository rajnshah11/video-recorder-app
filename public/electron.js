require("dotenv").config();  // Load environment variables from .env file

const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const startServer = require("../src/server/server");  // Import server logic

let mainWindow;

app.whenReady().then(() => {
  // Start the Express server using the port from the .env file
  startServer(process.env.PORT || 3001);

  // Create the Electron window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: `${__dirname}/preload.js`, // Enable IPC in React
    },
  });

  // Use the React URL from the .env file for loading the frontend
  mainWindow.loadURL(process.env.REACT_URL || "http://localhost:3000");

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
