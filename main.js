// main.js — Process principal Electron — v1.3
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Notification,
} = require("electron");
const path = require("path");
const fs = require("fs");

const license = require("./license");

// ── Détection du mode dev ─────────────────────────────────────────────────
// Bypass de la vérification de licence quand :
//   • PLANINK_DEV=1 dans l'environnement (npm run dev)
//   • app.isPackaged === false (lancement depuis le code source via electron .)
// const IS_DEV = process.env.PLANINK_DEV === "1" || !app.isPackaged;

const IS_DEV = process.env.PLANINK_DEV === "1" || !app.isPackaged;

// ── Données dans AppData/Roaming/<appName>/data ──────────────────────────
const DATA_DIR = path.join(app.getPath("userData"), "data");
const DATA_PATH = path.join(DATA_DIR, "inkmaster-data.json");
const DATA_TMP = DATA_PATH + ".tmp";

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ── Backup rotatif — 3 derniers .bak ─────────────────────────────────────
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

// ── Fenêtres ──────────────────────────────────────────────────────────────

let mainWindow = null;
let activateWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
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
  mainWindow.loadFile("index.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createActivateWindow() {
  activateWindow = new BrowserWindow({
    width: 540,
    height: 640,
    minWidth: 540,
    minHeight: 640,
    maxWidth: 540,
    maxHeight: 640,
    resizable: false,
    title: "Activation Plan'Ink",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: "#080809",
  });
  activateWindow.loadFile("activate.html");
  activateWindow.setMenuBarVisibility(false);

  activateWindow.on("closed", () => {
    activateWindow = null;
  });
}

// ── Logique de démarrage ──────────────────────────────────────────────────

async function bootstrap() {
  // Mode dev → bypass total
  if (IS_DEV) {
    console.log(
      "[Plan'Ink] Mode développement — vérification licence bypassée",
    );
    createMainWindow();
    return;
  }

  // Mode production → vérification de licence
  const result = await license.checkLicenseAtStartup();
  console.log(
    `[Plan'Ink] Licence : ${result.valid ? "VALIDE" : "INVALIDE"} (${result.source})`,
  );

  if (result.valid) {
    createMainWindow();
  } else {
    createActivateWindow();
  }
}

// ── IPC handlers ──────────────────────────────────────────────────────────

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

ipcMain.handle("show-notification", (_, { title, body }) => {
  if (!Notification.isSupported()) return false;
  new Notification({ title, body }).show();
  return true;
});

// ── Handlers licence ─────────────────────────────────────────────────────

ipcMain.handle("license-activate", async (_, licenseKey) => {
  const result = await license.activateLicense(licenseKey);

  // Si l'activation réussit, on bascule sur la fenêtre principale
  if (result.valid) {
    createMainWindow();
    if (activateWindow) {
      activateWindow.close();
      activateWindow = null;
    }
  }

  return result;
});

ipcMain.handle("license-info", () => {
  return license.getStoredLicense();
});

// ── Lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(bootstrap);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
