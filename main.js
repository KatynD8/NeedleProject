const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// Données dans AppData\Roaming\Cartouche
const DATA_DIR = path.join(app.getPath("userData"), "data");
const DATA_PATH = path.join(DATA_DIR, "cartouche-data.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: "Cartouche Studio",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: "#080809",
  });

  win.loadFile("index.html");
}

ipcMain.handle("load-data", () => {
  try {
    if (!fs.existsSync(DATA_PATH)) return {};
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  } catch (e) {
    console.error("[Cartouche] Erreur lecture:", e);
    return {};
  }
});

ipcMain.handle("save-data", (_, data) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("[Cartouche] Erreur écriture:", e);
    return false;
  }
});

ipcMain.handle("get-data-path", () => DATA_PATH);

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
