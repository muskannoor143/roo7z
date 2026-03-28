// geolocation.js - Automatic location-based currency detection

async function detectLocationAndSetCurrency() {
  try {
    // Try multiple geolocation APIs with CORS support
    let data = null;
    let countryCode = null;
    
    // Try primary API (geolocation-db - has better CORS support)
    try {
      const response = await fetch('https://geolocation-db.com/json/geoip/me', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        data = await response.json();
        countryCode = data.country_code;
      }
    } catch (e1) {
      console.log("Primary API failed, trying ipapi...");
      // Fallback to ipapi
      try {
        const response = await fetch('https://ipapi.co/json/', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          data = await response.json();
          countryCode = data.country_code;
        }
      } catch (e2) {
        console.log("All APIs failed, using default");
      }
    }
    
    let detectedCurrency = "PKR"; // Default

    // Set currency based on country code
    if (countryCode === "PK") {
      detectedCurrency = "PKR";
    } else if (countryCode === "GB") {
      detectedCurrency = "GBP";
    } else {
      detectedCurrency = "PKR";
    }

    // Save to localStorage
    const LS_CURRENCY = "roo7z_currency";
    localStorage.setItem(LS_CURRENCY, detectedCurrency);
    window.detectedCurrency = detectedCurrency;

    // Debug logging
    console.log("🌍 Geolocation detected:", countryCode || "DEFAULT", "→ Currency:", detectedCurrency);
    
    // Signal to main.js that currency has been detected
    window.currencyDetected = true;
    window.dispatchEvent(new CustomEvent("currencyDetected", { 
      detail: { currency: detectedCurrency, country: countryCode || "DEFAULT" } 
    }));

    return detectedCurrency;
  } catch (error) {
    console.error("Geolocation error:", error);
    // Fallback to PKR if all APIs fail
    localStorage.setItem("roo7z_currency", "PKR");
    window.currencyDetected = true;
    window.dispatchEvent(new CustomEvent("currencyDetected", { 
      detail: { currency: "PKR", country: "FALLBACK" } 
    }));
    return "PKR";
  }
}

// Run on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", detectLocationAndSetCurrency);
} else {
  detectLocationAndSetCurrency();
}
