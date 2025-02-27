# README: Electron Video Recorder Application

## Overview

This is a desktop application built with **Electron** and **React** that allows users to record videos using their webcam, save the recordings to disk, and play them back with full video controls (play, pause, stop, and seek). The app also includes a light/dark mode toggle for a user-friendly experience.

---

## Features

- **Video Recording**: Record videos from your webcam with adjustable resolutions (720p, 1080p, 4K).
- **Save to Disk**: Save recorded videos in `.mp4` format to your local storage.
- **Video Playback**: Play back recorded videos with controls for:
  - Play
  - Pause
  - Stop
  - Seek
- **Light/Dark Mode**: Toggle between light and dark themes for better usability.
- **Responsive Design**: The interface adapts seamlessly to different screen sizes.

---

## Technologies Used

- **Electron**: For building the cross-platform desktop application.
- **React**: For creating the user interface.
- **Node.js**: For backend server logic (video streaming).
- **MediaRecorder API**: For video recording.
- **Winston Logger**: For logging application events.
- **CSS**: For styling the application.

---

## Installation

### Prerequisites
1. Install [Node.js](https://nodejs.org/) (v14 or higher).
2. Install [Git](https://git-scm.com/).

### Steps to Run Locally
1. Clone the repository:
   ```bash
   git clone 
   cd video-recorder-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   PORT=8081
   REACT_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. Start the React development server:
   ```bash
   npm start
   ```

5. In a new terminal, start the Electron app:
   ```bash
   npm run electron-start
   ```

---

## Usage

1. Launch the application by running `npm start` (for React) and `npm run electron-start` (for Electron).
2. Use the "Start" button to begin recording your webcam feed.
3. Click "Stop" to end the recording. You will be prompted to save the video file.
4. After saving, navigate to the playback section where you can:
   - Play, pause, or stop the video.
   - Seek through the timeline using a slider.

---

## Project Structure

```
video-recorder-app/
├── node_modules/           # Dependencies installed via npm
├── public/
│   ├── electron.js         # Main Electron process file
│   ├── index.html          # Entry point for React app
│   ├── preload.js          # Preload script for Electron context isolation
├── src/
│   ├── components/         # React components (VideoPlayer, VideoRecorder)
│       ├── VideoPlayer.css # CSS for VideoPlayer component
│       ├── VideoPlayer.js  # Video playback component
│       ├── VideoRecorder.css# CSS for VideoRecorder component
│       ├── VideoRecorder.js# Webcam recording component
│   ├── server/             # Backend server logic
│       ├── utils/          # Utility files for server logic
│           ├── logger.js   # Winston logger configuration
│       ├── server.js       # Express server for video streaming
│   ├── App.css             # Global styles for React app layout and design
│   ├── App.js              # Main React component for app layout and logic
│   ├── index.js            # React entry point file
├── .env                    # Environment variables file (e.g., PORT)
├── .gitignore              # Files/folders ignored by Git
├── app.log                 # Log file generated by Winston logger during runtime
├── package.json            # Project metadata and dependencies
├── README.md               # Documentation file (this file)
```

---

## Key Scripts in `package.json`

| Command                 | Description                                                      |
|-------------------------|------------------------------------------------------------------|
| `npm start`             | Starts the React development server at `http://localhost:3000`. |
| `npm run electron-start`| Starts the Electron application alongside the backend server.    |

---

## Known Issues

- The application currently supports `.mp4` format only.
- Video playback might fail if an invalid or empty file is saved.

---

## Future Enhancements
1. Enable the application to handle different video resolutions (for playback and recording preview).
2. Include error handling for situations where a webcam might not be available or is denied permission by the user.
3. Add support for multiple video formats (e.g., `.webm`, `.avi`).
4. Provide an option to trim or edit recorded videos before saving.
5. Add localization support for multiple languages.

---