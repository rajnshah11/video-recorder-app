// Load environment variables from .env file
require("dotenv").config();
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { logger } = require("../src/server/utils/logger"); // Logging utility
const startServer = require("../src/server/server"); // Import server logic

let mainWindow;

// Function to validate environment variables
function validateEnv() {
  if (!process.env.PORT) {
    logger.error("Missing environment variable: PORT");
    process.exit(1); // Exit the app if required variable is missing
  }
  if (!process.env.REACT_URL) {
    process.env.REACT_URL = "http://localhost:3000"; // Default to development URL
  }
}

app.whenReady().then(() => {
  validateEnv(); // Validate required environment variables

  // Start the Express server using the port from the .env file
  startServer(process.env.PORT || 8081);

  // Create the Electron window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"), // Ensure the path is correct
    },
  });

  // Use the React URL from the .env file for loading the frontend
  mainWindow.loadURL(process.env.REACT_URL);

  // Open DevTools only in development
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  logger.info("Electron app started successfully.");
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

  if (result.canceled) {
    logger.info("Save dialog was canceled.");
    return null;
  }

  logger.info(`File saved to: ${result.filePath}`);
  return result.filePath;
});

// Handle save file operation
ipcMain.handle("save-file", async (_, { filePath, buffer }) => {
  try {
    if (!buffer || buffer.length === 0) {
      logger.error("Buffer is empty or invalid.");
      throw new Error("Buffer is empty or invalid.");
    }

    fs.writeFileSync(filePath, buffer);
    const stat = fs.statSync(filePath);
    if (stat.size === 0) {
      logger.error("File saved but is empty.");
      throw new Error("File saved but is empty.");
    }

    logger.info(`File successfully saved to ${filePath}`);
    return true;
  } catch (error) {
    logger.error(`Failed to save file: ${error.message}`);
    return false;
  }
});

// Handle uncaught exceptions in production
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1); // Exit the app on uncaught exceptions
});

// Handle unhandled promise rejections in production
process.on("unhandledRejection", (error) => {
  logger.error(`Unhandled Rejection: ${error}`);
  process.exit(1); // Exit the app on unhandled promise rejections
});
