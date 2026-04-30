const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Données app
  loadData: () => ipcRenderer.invoke("load-data"),
  saveData: (data) => ipcRenderer.invoke("save-data", data),
  getDataPath: () => ipcRenderer.invoke("get-data-path"),
  saveCSV: (opts) => ipcRenderer.invoke("save-csv", opts),
  showNotification: (opts) => ipcRenderer.invoke("show-notification", opts),

  // Licence
  licenseActivate: (key) => ipcRenderer.invoke("license-activate", key),
  licenseInfo: () => ipcRenderer.invoke("license-info"),
});
