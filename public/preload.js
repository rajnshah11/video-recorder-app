const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  Buffer: {
    from: (data, encoding) => Buffer.from(data, encoding),
  },
  getEnvVariables: () => ipcRenderer.invoke("get-env-variables"),
  convertWebMToMP4: (webmPath, mp4Path) =>
    ipcRenderer.invoke("convert-webm-to-mp4", { webmPath, mp4Path }),
  saveFile: async (filePath, buffer) => {
    // Call the main process to save a file with the provided path and buffer
    return await ipcRenderer.invoke("save-file", { filePath, buffer });
  },
  showSaveDialog: async () => {
    // Call the main process to show the file save dialog
    return await ipcRenderer.invoke("show-save-dialog");
  },
});
