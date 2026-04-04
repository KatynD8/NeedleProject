// === PLAN'INK CONFIG ===
// Configuration centralisée pour l'app

const PLANINK_CONFIG = {
  // === INFO APP ===
  appName: "Plan'ink",
  appVersion: "1.1.0",
  appSubtitle: "Studio Manager",

  // === STUDIO INFO ===
  studio: {
    name: "Plan'ink Studio",
    address: "Rue de la Créativité",
    city: "76000 Rouen",
    phone: "02 35 98 76 54",
    email: "studio@planink.fr",
  },

  // === CATEGORIES ===
  stockCategories: [
    "Encres",
    "Aiguilles",
    "Hygiène",
    "Soins",
    "Matériel",
    "Autre",
  ],

  bodyZones: [
    "Bras droit",
    "Bras gauche",
    "Avant-bras droit",
    "Avant-bras gauche",
    "Épaule droite",
    "Épaule gauche",
    "Dos",
    "Poitrine",
    "Ventre",
    "Cuisse droite",
    "Cuisse gauche",
    "Mollet droit",
    "Mollet gauche",
    "Cheville",
    "Pied",
    "Cou",
    "Tête",
    "Autre",
  ],

  // === RDV STATUTS ===
  rdvStatuts: [
    { value: "confirme", label: "Confirmé", color: "badge-green" },
    { value: "attente", label: "En attente", color: "badge-yellow" },
    { value: "termine", label: "Terminé", color: "badge-blue" },
    { value: "annule", label: "Annulé", color: "badge-red" },
  ],

  // === DURATIONS (minutes) ===
  rdvDurations: [30, 45, 60, 90, 120, 150, 180, 240],

  // === COLORS ===
  colors: {
    accent: "#000000",
    success: "#388e3c",
    warning: "#ff9800",
    danger: "#d32f2f",
    info: "#1976d2",
  },

  // === FORMATTING ===
  dateFormat: "fr-FR",
  timeFormat: "HH:mm",

  // === FEATURES ===
  features: {
    exportJSON: true,
    exportCSV: true,
    printContrats: true,
    multiUser: false, // Future
    notifications: false, // Future
  },

  // === DEFAULTS ===
  defaults: {
    rdvDuration: 120,
    stockAlert: 5,
    pageSize: 50,
  },
};

// === UTILITY FUNCTIONS ===
function getConfig(key) {
  return PLANINK_CONFIG[key] || null;
}

function getStudioInfo() {
  return PLANINK_CONFIG.studio;
}

function getRdvStatut(value) {
  return PLANINK_CONFIG.rdvStatuts.find((s) => s.value === value);
}

function getRdvStatutLabel(value) {
  const statut = getRdvStatut(value);
  return statut ? statut.label : value;
}

function getBodyZones() {
  return PLANINK_CONFIG.bodyZones;
}

function getStockCategories() {
  return PLANINK_CONFIG.stockCategories;
}

// Export pour utilisation
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PLANINK_CONFIG, getConfig, getStudioInfo };
}
