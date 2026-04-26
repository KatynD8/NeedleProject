// === PARAMÈTRES — v1.1 ===

function renderSettings() {
  const s = DB.getSettings();

  document.getElementById("page-settings").innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">PARAMÈTRES</div>
        <div class="page-subtitle">PROFIL ARTISTE & INFORMATIONS STUDIO</div>
      </div>
    </div>

    <div class="grid-2" style="gap:24px;align-items:start">

      <!-- Profil artiste -->
      <div>
        <div class="section-title">Profil artiste</div>
        <div class="card">
          <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px">
            <div id="settings-avatar" style="width:64px;height:64px;border-radius:50%;background:var(--accent-glow);border:2px solid var(--accent-dim);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:24px;color:var(--accent);flex-shrink:0">
              ${s.artisteInitiales || "?"}
            </div>
            <div>
              <div style="font-size:15px;font-weight:500">${s.artisteNom || "The Artist"}</div>
              <div style="font-size:11px;color:var(--ink-muted);margin-top:3px">${s.studioNom || ""}</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nom d'artiste / Prénom</label>
              <input class="form-input" id="set-artiste-nom" value="${s.artisteNom || ""}" placeholder="Ex: Nico Tattoo">
            </div>
            <div class="form-group">
              <label class="form-label">Initiales (avatar)</label>
              <input class="form-input" id="set-artiste-ini" value="${s.artisteInitiales || ""}" placeholder="NT" maxlength="3" style="text-transform:uppercase">
            </div>
          </div>
        </div>

        <!-- Logo studio -->
        <div class="section-title" style="margin-top:24px">Logo du studio</div>
        <div class="card">
          <p style="font-size:12px;color:var(--ink-muted);margin-bottom:14px">
            Affiché dans la barre latérale et en en-tête des contrats PDF.
          </p>

          <!-- Zone drag & drop -->
          <div id="logo-dropzone" style="
              border:2px dashed var(--border);
              border-radius:var(--radius-lg);
              padding:28px 20px;
              text-align:center;
              cursor:pointer;
              transition:all var(--transition);
              background:var(--bg-base);
              position:relative;
              margin-bottom:12px;
            "
            ondragover="event.preventDefault();this.style.borderColor='var(--accent)';this.style.background='var(--accent-glow)'"
            ondragleave="this.style.borderColor='var(--border)';this.style.background='var(--bg-base)'"
            ondrop="handleLogoDrop(event)"
            onclick="document.getElementById('logo-file-input').click()"
          >
            ${
              s.logoBase64
                ? `
              <img src="${s.logoBase64}" alt="Logo actuel"
                style="max-height:72px;max-width:200px;object-fit:contain;margin:0 auto 10px;display:block">
              <div style="font-family:var(--font-mono);font-size:10px;color:var(--green);letter-spacing:1px">✓ LOGO CHARGÉ</div>
            `
                : `
              <div style="font-size:30px;color:var(--ink-faint);margin-bottom:10px">⬡</div>
              <div style="font-family:var(--font-mono);font-size:11px;color:var(--ink-muted);letter-spacing:1px">GLISSER UNE IMAGE ICI</div>
              <div style="font-size:11px;color:var(--ink-faint);margin-top:5px">ou cliquer pour parcourir — PNG, JPG, SVG</div>
            `
            }
            <input type="file" id="logo-file-input" accept="image/*"
              style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%"
              onchange="handleLogoFileInput(event)">
          </div>

          ${
            s.logoBase64
              ? `
            <div style="display:flex;justify-content:flex-end">
              <button class="btn btn-danger btn-sm" onclick="removeLogo()">SUPPRIMER LE LOGO</button>
            </div>
          `
              : ""
          }

          <!-- Aperçu sidebar -->
          <div style="margin-top:14px;padding:12px 14px;background:var(--bg-base);border-radius:var(--radius);border:1px solid var(--border)">
            <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);letter-spacing:1px;margin-bottom:8px">APERÇU SIDEBAR</div>
            <div style="display:flex;align-items:center;gap:12px" id="logo-sidebar-preview">
              ${_buildSidebarLogoPreview(s.logoBase64, s.studioNom)}
            </div>
          </div>
        </div>
      </div>

      <!-- Informations studio -->
      <div>
        <div class="section-title">Informations studio</div>
        <div class="card">
          <div class="form-group">
            <label class="form-label">Nom du studio *</label>
            <input class="form-input" id="set-studio-nom" value="${s.studioNom || ""}" placeholder="Plan'Ink Studio">
          </div>
          <div class="form-group">
            <label class="form-label">Adresse</label>
            <input class="form-input" id="set-studio-adresse" value="${s.studioAdresse || ""}" placeholder="12 Rue des Artistes">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Code postal & Ville</label>
              <input class="form-input" id="set-studio-ville" value="${s.studioVille || ""}" placeholder="76000 Rouen">
            </div>
            <div class="form-group">
              <label class="form-label">Téléphone</label>
              <input class="form-input" id="set-studio-tel" value="${s.studioTel || ""}" placeholder="02 35 00 00 00">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" id="set-studio-email" value="${s.studioEmail || ""}" placeholder="contact@monstudio.fr">
            </div>
            <div class="form-group">
              <label class="form-label">Site web</label>
              <input class="form-input" id="set-studio-site" value="${s.studioSite || ""}" placeholder="www.monstudio.fr">
            </div>
          </div>

          <div style="padding-top:16px;margin-top:8px;border-top:1px solid var(--border)">
            <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:2px;color:var(--ink-muted);text-transform:uppercase;margin-bottom:12px">Informations légales</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">SIRET</label>
                <input class="form-input" id="set-studio-siret" value="${s.studioSiret || ""}" placeholder="123 456 789 00010">
              </div>
              <div class="form-group">
                <label class="form-label">N° TVA intracommunautaire</label>
                <input class="form-input" id="set-studio-tva" value="${s.studioTva || ""}" placeholder="FR12 345678900">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Mention légale contrats</label>
              <textarea class="form-textarea" id="set-studio-mention" placeholder="Auto-entrepreneur — RCS Rouen..." style="min-height:60px">${s.studioMention || ""}</textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Aperçu en-tête contrat -->
    <div class="section-title" style="margin-top:28px">Aperçu en-tête de contrat</div>
    <div id="settings-preview" style="background:#fff;color:#111;border-radius:var(--radius);padding:20px 28px;border:1px solid var(--border);font-family:'DM Sans',sans-serif;font-size:13px">
      ${_buildHeaderPreview(s)}
    </div>

    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px">
      <button class="btn btn-ghost" onclick="renderSettings()">ANNULER</button>
      <button class="btn btn-primary" onclick="saveSettings()">ENREGISTRER</button>
    </div>
  `;

  // Mise à jour live de l'aperçu et de l'avatar
  [
    "set-artiste-nom",
    "set-artiste-ini",
    "set-studio-nom",
    "set-studio-adresse",
    "set-studio-ville",
    "set-studio-tel",
    "set-studio-email",
    "set-studio-site",
    "set-studio-siret",
    "set-studio-tva",
    "set-studio-mention",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", _updateSettingsPreview);
  });
}

// --- Helpers aperçu ---

function _buildSidebarLogoPreview(logoBase64, studioNom) {
  if (logoBase64) {
    return `<img src="${logoBase64}" alt="Logo" style="max-height:36px;max-width:120px;object-fit:contain">`;
  }
  return `
    <span style="font-size:22px;color:var(--accent)">⬡</span>
    <div>
      <div style="font-family:var(--font-display);font-size:18px;letter-spacing:2px;color:var(--accent)">${studioNom || "PLAN'INK"}</div>
      <div style="font-family:var(--font-mono);font-size:9px;color:var(--ink-muted);letter-spacing:2px">Studio Management</div>
    </div>
  `;
}

function _buildHeaderPreview(s) {
  const logoHtml = s.logoBase64
    ? `<img src="${s.logoBase64}" style="max-height:60px;max-width:160px;display:block;margin:0 auto 8px">`
    : "";
  return `
    <div style="text-align:center;border-bottom:2px solid #111;padding-bottom:14px">
      ${logoHtml}
      <div style="font-size:18px;font-weight:700">${s.studioNom || "Nom du studio"}</div>
      <div style="font-size:12px;color:#555;margin-top:4px">
        ${[s.studioAdresse, s.studioVille].filter(Boolean).join(" — ")}
        ${s.studioTel ? "<br>Tél : " + s.studioTel : ""}
        ${s.studioEmail ? " — " + s.studioEmail : ""}
        ${s.studioSite ? "<br>" + s.studioSite : ""}
        ${s.studioSiret ? "<br>SIRET : " + s.studioSiret : ""}
        ${s.studioMention ? "<br><em>" + s.studioMention + "</em>" : ""}
      </div>
    </div>
  `;
}

function _updateSettingsPreview() {
  const draft = {
    artisteNom: document.getElementById("set-artiste-nom")?.value || "",
    artisteInitiales:
      document.getElementById("set-artiste-ini")?.value.toUpperCase() || "",
    studioNom: document.getElementById("set-studio-nom")?.value || "",
    studioAdresse: document.getElementById("set-studio-adresse")?.value || "",
    studioVille: document.getElementById("set-studio-ville")?.value || "",
    studioTel: document.getElementById("set-studio-tel")?.value || "",
    studioEmail: document.getElementById("set-studio-email")?.value || "",
    studioSite: document.getElementById("set-studio-site")?.value || "",
    studioSiret: document.getElementById("set-studio-siret")?.value || "",
    studioTva: document.getElementById("set-studio-tva")?.value || "",
    studioMention: document.getElementById("set-studio-mention")?.value || "",
    // logoBase64 reste celui déjà en mémoire (modifié via drag&drop séparément)
    logoBase64: DB.getSettings().logoBase64 || "",
  };

  const preview = document.getElementById("settings-preview");
  if (preview) preview.innerHTML = _buildHeaderPreview(draft);

  const avatar = document.getElementById("settings-avatar");
  if (avatar) avatar.textContent = draft.artisteInitiales || "?";
}

// --- Gestion logo drag & drop ---

function handleLogoDrop(event) {
  event.preventDefault();
  const dropzone = document.getElementById("logo-dropzone");
  if (dropzone) {
    dropzone.style.borderColor = "var(--border)";
    dropzone.style.background = "var(--bg-base)";
  }
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) _readAndSaveLogo(file);
}

function handleLogoFileInput(event) {
  const file = event.target.files[0];
  if (file) _readAndSaveLogo(file);
}

function _readAndSaveLogo(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result;
    await DB.saveSettings({ logoBase64: base64 });
    applyLogoToSidebar();
    renderSettings();
    toast("Logo enregistré ✓", "success");
  };
  reader.readAsDataURL(file);
}

async function removeLogo() {
  await DB.saveSettings({ logoBase64: "" });
  applyLogoToSidebar();
  renderSettings();
  toast("Logo supprimé", "info");
}

// --- Applique le logo en sidebar dès le chargement ---
function applyLogoToSidebar() {
  const s = DB.getSettings();
  _applySidebarSettings(s);
}

function _applySidebarSettings(s) {
  // Avatar + nom artiste en footer
  const nameEl = document.querySelector(".artist-name");
  const avatarEl = document.querySelector(".artist-avatar");
  if (nameEl) nameEl.textContent = s.artisteNom || "The Artist";
  if (avatarEl) avatarEl.textContent = s.artisteInitiales || "TA";

  // Logo dans la sidebar
  const logoIcon = document.querySelector(".logo-icon");
  const logoTitle = document.querySelector(".logo-title");
  const logoSub = document.querySelector(".logo-sub");

  if (s.logoBase64) {
    if (logoIcon) logoIcon.style.display = "none";
    if (logoSub) logoSub.style.display = "none";
    if (logoTitle) {
      logoTitle.innerHTML = `<img src="${s.logoBase64}" alt="Logo studio"
        style="max-height:38px;max-width:150px;object-fit:contain;display:block">`;
    }
  } else {
    if (logoIcon) logoIcon.style.display = "";
    if (logoSub) logoSub.style.display = "";
    if (logoTitle) logoTitle.textContent = s.studioNom || "PLAN'INK";
  }
}

// --- Sauvegarde complète ---
async function saveSettings() {
  const updates = {
    artisteNom: document.getElementById("set-artiste-nom").value.trim(),
    artisteInitiales: document
      .getElementById("set-artiste-ini")
      .value.trim()
      .toUpperCase(),
    studioNom: document.getElementById("set-studio-nom").value.trim(),
    studioAdresse: document.getElementById("set-studio-adresse").value.trim(),
    studioVille: document.getElementById("set-studio-ville").value.trim(),
    studioTel: document.getElementById("set-studio-tel").value.trim(),
    studioEmail: document.getElementById("set-studio-email").value.trim(),
    studioSite: document.getElementById("set-studio-site").value.trim(),
    studioSiret: document.getElementById("set-studio-siret").value.trim(),
    studioTva: document.getElementById("set-studio-tva").value.trim(),
    studioMention: document.getElementById("set-studio-mention").value.trim(),
    // logoBase64 conservé tel quel (géré indépendamment par drag&drop)
    logoBase64: DB.getSettings().logoBase64 || "",
  };

  await DB.saveSettings(updates);
  _applySidebarSettings(updates);
  toast("Paramètres enregistrés ✓", "success");
  renderSettings();
}
