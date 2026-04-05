const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// Données dans AppData\Roaming\InkMaster — stable, jamais effacé
const DATA_DIR = path.join(app.getPath("userData"), "data");
const DATA_PATH = path.join(DATA_DIR, "inkmaster-data.json");

// Créer le dossier si inexistant
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: "Plan'ink Studio",
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
    console.error("Erreur lecture:", e);
    return {};
  }
});

ipcMain.handle("save-data", (_, data) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Erreur écriture:", e);
    return false;
  }
});

ipcMain.handle("get-data-path", () => DATA_PATH);

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
