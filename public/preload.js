const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, args) => ipcRenderer.invoke(channel, args),
  },    
  Buffer:{
    from: (data, encoding) => Buffer.from(data, encoding), 
  },
});
