const { app, BrowserWindow, ipcMain, dialog, protocol } = require("electron");
const path = require("path");
const fs = require("fs");

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
    defaultPath: path.join(app.getPath("videos"), "Untitled0.mp4"),
    filters: [
      { name: "MP4 Video", extensions: ["mp4"] }, // Default option
      { name: "WebP Video", extensions: ["webm"] },
    ],
  });

  // Return null if user cancels the dialog
  return result.canceled ? null : result.filePath;
});



// Handle save file operation
ipcMain.handle("save-file", async (_, { filePath, buffer }) => {
  try {
    fs.writeFileSync(filePath, buffer);
    return true; // Explicitly return success status
  } catch (error) {
    console.error("Failed to save file:", error);
    return false;
  }
});
