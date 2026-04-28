const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

// Données dans AppData/Roaming/<appName>/data — stable, jamais effacé
const DATA_DIR = path.join(app.getPath("userData"), "data");
const DATA_PATH = path.join(DATA_DIR, "inkmaster-data.json");
const DATA_TMP = DATA_PATH + ".tmp";

// Créer le dossier si inexistant
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ── Backup rotatif : conserve les 3 derniers .bak ──────────────────────────
function rotateBackup() {
  if (!fs.existsSync(DATA_PATH)) return;
  const stamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const bakPath = path.join(DATA_DIR, `inkmaster-data.${stamp}.bak`);
  try {
    // Ne crée qu'un seul backup par jour (écrase si même date)
    fs.copyFileSync(DATA_PATH, bakPath);

    // Purge : ne garde que les 3 fichiers .bak les plus récents
    const baks = fs
      .readdirSync(DATA_DIR)
      .filter((f) => f.endsWith(".bak"))
      .sort() // tri lexicographique = tri chronologique grâce au format ISO
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

ipcMain.handle("load-data", () => {
  try {
    if (!fs.existsSync(DATA_PATH)) return {};
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  } catch (e) {
    console.error("Erreur lecture:", e);
    return {};
  }
});

// ── Écriture atomique : tmp → rename ──────────────────────────────────────
// fs.renameSync est atomique sur le même volume (POSIX + NTFS).
// Si le process crashe pendant writeFileSync(tmp), le fichier principal
// reste intact. Le rename ne se produit qu'une fois les données entièrement
// écrites et flushées sur le disque.
ipcMain.handle("save-data", (_, data) => {
  try {
    rotateBackup();
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(DATA_TMP, json, "utf-8");
    fs.renameSync(DATA_TMP, DATA_PATH);
    return true;
  } catch (e) {
    console.error("Erreur écriture:", e);
    // Nettoyage du .tmp orphelin si rename a échoué
    try {
      if (fs.existsSync(DATA_TMP)) fs.unlinkSync(DATA_TMP);
    } catch (_) {}
    return false;
  }
});

ipcMain.handle("get-data-path", () => DATA_PATH);

// ── Export CSV avec boîte "Enregistrer sous" ──────────────────────────────
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

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
