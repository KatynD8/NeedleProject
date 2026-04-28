const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  loadData: () => ipcRenderer.invoke("load-data"),
  saveData: (data) => ipcRenderer.invoke("save-data", data),
  getDataPath: () => ipcRenderer.invoke("get-data-path"),
  saveCSV: (opts) => ipcRenderer.invoke("save-csv", opts),
});
