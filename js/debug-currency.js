// debug-currency.js - Debug tool for testing currency detection locally
// Add this to your browser console or inject it for testing

console.log(`
╔════════════════════════════════════════════════════════════╗
║          ROO7Z CURRENCY DEBUG CONSOLE                      ║
╚════════════════════════════════════════════════════════════╝

📍 CURRENT STATUS:
  Current Currency: ${localStorage.getItem("roo7z_currency") || "PKR"}
  Detected Currency: ${window.detectedCurrency || "Waiting..."}
  
🧪 TEST COMMANDS (Paste in console):

  // Test Pakistan Currency (PKR)
  localStorage.setItem("roo7z_currency", "PKR"); location.reload();
  
  // Test UK Currency (GBP)
  localStorage.setItem("roo7z_currency", "GBP"); location.reload();
  
  // Reset to auto-detect
  localStorage.removeItem("roo7z_currency"); location.reload();
  
  // Check all prices
  console.table(window.allProducts);
  
  // Check current settings
  console.log("Current Currency:", window.currentCurrency);
  console.log("Currency Symbol:", window.getCurrencySymbol?.());

💡 HOW PRICES WORK:
  - Each product has pricePKR and priceGBP
  - When currency changes, renderProducts() is called
  - All prices update instantly
  
🔍 CHECK IF WORKING:
  1. Reload page
  2. Check browser console (F12)
  3. Look for "🌍 Geolocation detected" message
  4. Prices should match detected currency
  5. Use test commands above to override
`);

// Export debug tools
window.debugCurrency = {
  setToPKR: () => { localStorage.setItem("roo7z_currency", "PKR"); location.reload(); },
  setToGBP: () => { localStorage.setItem("roo7z_currency", "GBP"); location.reload(); },
  reset: () => { localStorage.removeItem("roo7z_currency"); location.reload(); },
  getCurrent: () => localStorage.getItem("roo7z_currency") || "PKR",
  getDetected: () => window.detectedCurrency || "Not detected yet",
  showPrices: () => console.table(window.allProducts)
};

console.log("✅ Debug tools loaded! Use window.debugCurrency.setToPKR(), window.debugCurrency.setToGBP(), etc.");
