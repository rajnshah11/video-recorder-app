const { contextBridge, ipcRenderer } = require('electron');
console.log('Preload script loaded'); // Debugging log

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, args) => ipcRenderer.invoke(channel, args),
  },    
  Buffer:{
    from: (data, encoding) => Buffer.from(data, encoding), // Properly expose Buffer.from
  },
});
