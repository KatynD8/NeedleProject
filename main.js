const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Notification,
} = require("electron");
const path = require("path");
const fs = require("fs");

// Données dans AppData/Roaming/<appName>/data
const DATA_DIR = path.join(app.getPath("userData"), "data");
const DATA_PATH = path.join(DATA_DIR, "inkmaster-data.json");
const DATA_TMP = DATA_PATH + ".tmp";

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ── Backup rotatif — 3 derniers .bak ─────────────────────────────────────────
function rotateBackup() {
  if (!fs.existsSync(DATA_PATH)) return;
  const stamp = new Date().toISOString().slice(0, 10);
  const bakPath = path.join(DATA_DIR, `inkmaster-data.${stamp}.bak`);
  try {
    fs.copyFileSync(DATA_PATH, bakPath);
    const baks = fs
      .readdirSync(DATA_DIR)
      .filter((f) => f.endsWith(".bak"))
      .sort()
      .reverse();
    baks.slice(3).forEach((f) => {
      try {
        fs.unlinkSync(path.join(DATA_DIR, f));
      } catch (_) {}
    });
  } catch (e) {
    console.warn("Backup échoué (non bloquant) :", e.message);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: "Plan'Ink Studio",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: "#080809",
  });
  win.loadFile("index.html");
}

// ── IPC handlers ──────────────────────────────────────────────────────────────

ipcMain.handle("load-data", () => {
  try {
    if (!fs.existsSync(DATA_PATH)) return {};
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  } catch (e) {
    console.error("Erreur lecture:", e);
    return {};
  }
});

// Écriture atomique : tmp → rename
ipcMain.handle("save-data", (_, data) => {
  try {
    rotateBackup();
    fs.writeFileSync(DATA_TMP, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(DATA_TMP, DATA_PATH);
    return true;
  } catch (e) {
    console.error("Erreur écriture:", e);
    try {
      if (fs.existsSync(DATA_TMP)) fs.unlinkSync(DATA_TMP);
    } catch (_) {}
    return false;
  }
});

ipcMain.handle("get-data-path", () => DATA_PATH);

// Export CSV avec boîte de dialogue
ipcMain.handle("save-csv", async (_, { content, filename }) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: filename,
    filters: [{ name: "CSV", extensions: ["csv"] }],
  });
  if (canceled || !filePath) return false;
  try {
    fs.writeFileSync(filePath, content, "utf-8");
    return true;
  } catch (e) {
    console.error("Erreur export CSV:", e);
    return false;
  }
});

// Notification desktop native
// Utilisé pour les rappels RDV J-1 au démarrage.
ipcMain.handle("show-notification", (_, { title, body }) => {
  if (!Notification.isSupported()) return false;
  new Notification({
    title,
    body,
    icon: path.join(__dirname, "assets", "icon.png"),
  }).show();
  return true;
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
