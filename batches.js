// === GESTION DES LOTS (Batch Management) ===
// Suivi des numéros de lots pour encres et aiguilles (traçabilité)

// Extension de la structure stock pour inclure les lots
// Un stock peut avoir plusieurs lots avec numéro, date expiration, quantité

function addBatchToStock(stockId, batchNumber, quantity, expiryDate) {
  const stock = DB.getStocks().find((s) => s.id === stockId);
  if (!stock) return false;

  // Initialiser les lots si nécessaire
  if (!stock.batches) stock.batches = [];

  // Vérifier si le lot existe déjà
  const existingBatch = stock.batches.find((b) => b.number === batchNumber);
  if (existingBatch) {
    existingBatch.quantity += quantity;
    existingBatch.lastUpdated = new Date().toISOString();
  } else {
    stock.batches.push({
      number: batchNumber,
      quantity: quantity,
      expiryDate: expiryDate || null,
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });
  }

  // Mettre à jour quantité totale stock
  stock.quantite = stock.batches.reduce((sum, b) => sum + b.quantity, 0);
  DB.updateStock(stock.id, stock);
  return true;
}

function removeBatchFromStock(stockId, batchNumber, quantity) {
  const stock = DB.getStocks().find((s) => s.id === stockId);
  if (!stock || !stock.batches) return false;

  const batch = stock.batches.find((b) => b.number === batchNumber);
  if (!batch) return false;

  batch.quantity -= quantity;
  if (batch.quantity <= 0) {
    stock.batches = stock.batches.filter((b) => b.number !== batchNumber);
  }

  // Recalculer quantité totale
  stock.quantite = stock.batches.reduce((sum, b) => sum + b.quantity, 0);
  DB.updateStock(stock.id, stock);
  return true;
}

function getBatchesForStock(stockId) {
  const stock = DB.getStocks().find((s) => s.id === stockId);
  if (!stock || !stock.batches) return [];

  return stock.batches.sort((a, b) => {
    // Trier par date expiration (expirant en premier)
    if (a.expiryDate && b.expiryDate) {
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    }
    return a.dateAdded ? -new Date(a.dateAdded) : 0;
  });
}

function isLotExpired(expiryDate) {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
}

function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  return daysLeft;
}

function getExpiryStatus(expiryDate) {
  if (!expiryDate) return { status: "ok", color: "green", text: "N/A" };

  const daysLeft = getDaysUntilExpiry(expiryDate);

  if (daysLeft < 0) {
    return { status: "expired", color: "red", text: "EXPIRÉ" };
  } else if (daysLeft < 30) {
    return { status: "expiring_soon", color: "orange", text: `${daysLeft}j` };
  } else if (daysLeft < 90) {
    return { status: "caution", color: "yellow", text: `${daysLeft}j` };
  } else {
    return { status: "ok", color: "green", text: `${daysLeft}j` };
  }
}

function formatBatchDate(isoDate) {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

// === VALIDATION LOTS ===

function validateLotNumber(number) {
  // Format : Alphanumérique, tirets autorisés
  return /^[A-Z0-9\-]{3,20}$/.test(number);
}

function validateLotQuantity(quantity) {
  return quantity > 0 && Number.isInteger(quantity);
}

// === STATISTIQUES LOTS ===

function getLotStats() {
  const allStocks = DB.getStocks();
  let totalBatches = 0;
  let expiredBatches = 0;
  let expiringBatches = 0;
  let totalQuantityInBatches = 0;

  allStocks.forEach((stock) => {
    if (!stock.batches) return;

    stock.batches.forEach((batch) => {
      totalBatches++;
      totalQuantityInBatches += batch.quantity;

      if (isLotExpired(batch.expiryDate)) {
        expiredBatches++;
      } else if (batch.expiryDate) {
        const daysLeft = getDaysUntilExpiry(batch.expiryDate);
        if (daysLeft < 30) {
          expiringBatches++;
        }
      }
    });
  });

  return {
    totalBatches,
    expiredBatches,
    expiringBatches,
    totalQuantityInBatches,
    trackedStocks: allStocks.filter((s) => s.batches && s.batches.length > 0)
      .length,
  };
}

function getExpiredBatches() {
  const allStocks = DB.getStocks();
  const expired = [];

  allStocks.forEach((stock) => {
    if (!stock.batches) return;

    stock.batches.forEach((batch) => {
      if (isLotExpired(batch.expiryDate)) {
        expired.push({
          stockId: stock.id,
          stockName: stock.nom,
          category: stock.categorie,
          batchNumber: batch.number,
          quantity: batch.quantity,
          expiryDate: batch.expiryDate,
        });
      }
    });
  });

  return expired.sort(
    (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
  );
}

function getExpiringBatches(daysThreshold = 30) {
  const allStocks = DB.getStocks();
  const expiring = [];

  allStocks.forEach((stock) => {
    if (!stock.batches) return;

    stock.batches.forEach((batch) => {
      if (!batch.expiryDate) return;
      if (isLotExpired(batch.expiryDate)) return; // Déjà expiré

      const daysLeft = getDaysUntilExpiry(batch.expiryDate);
      if (daysLeft < daysThreshold && daysLeft >= 0) {
        expiring.push({
          stockId: stock.id,
          stockName: stock.nom,
          category: stock.categorie,
          batchNumber: batch.number,
          quantity: batch.quantity,
          expiryDate: batch.expiryDate,
          daysLeft: daysLeft,
        });
      }
    });
  });

  return expiring.sort((a, b) => a.daysLeft - b.daysLeft);
}

// === EXPORT TRAÇABILITÉ ===

function exportLotTraceability() {
  const stats = getLotStats();
  const expired = getExpiredBatches();
  const expiring = getExpiringBatches(30);

  const report = {
    generatedAt: new Date().toISOString(),
    stats: stats,
    expiredBatches: expired,
    expiringBatches: expiring,
  };

  const json = JSON.stringify(report, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `planink-traceability-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Export pour utilisation
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    addBatchToStock,
    removeBatchFromStock,
    getBatchesForStock,
    isLotExpired,
    getDaysUntilExpiry,
    getExpiryStatus,
    formatBatchDate,
    validateLotNumber,
    validateLotQuantity,
    getLotStats,
    getExpiredBatches,
    getExpiringBatches,
    exportLotTraceability,
  };
}
