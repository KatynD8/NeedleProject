// license.js — Gestion de la licence Plan'Ink (process main Electron)
//
// Logique :
//   1. Au démarrage : lire le cache local (electron-store)
//   2. Si cache valide (< 24h) → démarrage immédiat sans appel réseau
//   3. Si cache expiré ou absent → appel à check-license sur Supabase
//   4. Si réseau indisponible mais cache existe (< 7 jours) → tolérance offline
//   5. Si rien → afficher l'écran d'activation

const Store = require("electron-store");
const https = require("https");

// Configuration — à adapter si tu changes de projet Supabase
const SUPABASE_URL = "https://papeuvkbaqwdfbjouoga.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcGV1dmtiYXF3ZGZiam91b2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODg2MjksImV4cCI6MjA5MzA2NDYyOX0.DH6hLTnYOmHe3zBqMrIh6Y7pADxZCGPbkeUyVjzbJ-w"; // anon public key

// Durées de validité
const CACHE_VALIDITY_MS = 24 * 60 * 60 * 1000; // 24 heures
const OFFLINE_TOLERANCE_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

// Store chiffré — chaque utilisateur a son propre store dans son AppData
const store = new Store({
  name: "planink-license",
  encryptionKey: "planink-v1-license-cache",
});

// ── API publique ──────────────────────────────────────────────────────────

/**
 * Vérifie l'état de licence au démarrage.
 * Retourne un objet { valid, status, reason, source, license_key, expires_at, plan }
 * source = "cache" | "online" | "offline_tolerance" | "none"
 */
async function checkLicenseAtStartup() {
  const cached = store.get("license");

  // Pas de licence enregistrée → premier lancement
  if (!cached || !cached.license_key) {
    return { valid: false, source: "none", reason: "no_license" };
  }

  const cacheAge = Date.now() - (cached.checked_at || 0);

  // Cache encore valide (< 24h) → démarrage rapide sans appel réseau
  if (cacheAge < CACHE_VALIDITY_MS && cached.valid) {
    return {
      valid: true,
      source: "cache",
      license_key: cached.license_key,
      expires_at: cached.expires_at,
      plan: cached.plan,
    };
  }

  // Cache expiré → tentative de re-vérification en ligne
  try {
    const result = await _callCheckLicense(cached.license_key, false);
    _saveCache(cached.license_key, result);
    return { ...result, source: "online", license_key: cached.license_key };
  } catch (err) {
    // Réseau indisponible → tolérance offline si la dernière vérif date de moins de 7j
    if (cached.valid && cacheAge < OFFLINE_TOLERANCE_MS) {
      console.warn("Réseau indisponible — tolérance offline activée");
      return {
        valid: true,
        source: "offline_tolerance",
        license_key: cached.license_key,
        expires_at: cached.expires_at,
        plan: cached.plan,
      };
    }

    // Plus de tolérance → refus
    return {
      valid: false,
      source: "offline_expired",
      reason: "no_network_and_cache_expired",
    };
  }
}

/**
 * Active une licence (premier lancement).
 * Appelé depuis activate.html via IPC.
 */
async function activateLicense(licenseKey) {
  if (!licenseKey || !licenseKey.trim()) {
    return { valid: false, reason: "empty_key" };
  }

  const cleaned = licenseKey.trim().toUpperCase();

  try {
    const result = await _callCheckLicense(cleaned, true); // activate=true
    if (result.valid) {
      _saveCache(cleaned, result);
    }
    return { ...result, license_key: cleaned };
  } catch (err) {
    return { valid: false, reason: "network_error", error: err.message };
  }
}

/**
 * Lit la licence stockée localement (sans appel réseau).
 */
function getStoredLicense() {
  return store.get("license") || null;
}

/**
 * Désactive la licence locale (logout, transfert d'app, debug).
 */
function clearLicense() {
  store.delete("license");
}

// ── Internal ──────────────────────────────────────────────────────────────

function _saveCache(licenseKey, result) {
  store.set("license", {
    license_key: licenseKey,
    valid: result.valid,
    status: result.status,
    plan: result.plan,
    expires_at: result.expires_at,
    checked_at: Date.now(),
  });
}

/**
 * Appelle l'Edge Function check-license.
 * Implémentation HTTPS native (pas de dépendance fetch/axios).
 */
function _callCheckLicense(licenseKey, activate) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/functions/v1/check-license`);
    const payload = JSON.stringify({
      license_key: licenseKey,
      activate: !!activate,
    });

    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
          "Content-Length": Buffer.byteLength(payload),
        },
        timeout: 10000,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const data = JSON.parse(body);
            resolve(data);
          } catch (e) {
            reject(new Error("Réponse invalide du serveur"));
          }
        });
      },
    );

    req.on("error", (e) => reject(e));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout"));
    });

    req.write(payload);
    req.end();
  });
}

module.exports = {
  checkLicenseAtStartup,
  activateLicense,
  getStoredLicense,
  clearLicense,
};
