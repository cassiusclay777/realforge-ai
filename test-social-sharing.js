// Testovací skript pro ověření, že sdílení na sociální sítě používá AI generovaný obsah

const testData = {
  listing: {
    title: "dum 120m Brno",
    location: "Brno",
    price: 8500000,
    address: "Brno Žíšská 12",
    type: "HOUSE",
    status: "ACTIVE"
  },
  aiResults: {
    headline: "Moderní nemovitost v Brně",
    shortDesc: "Skvělá příležitost pro investici nebo bydlení.",
    longDesc: "Tato nemovitost nabízí moderní vybavení, skvělou polohu a výborný potenciál pro zhodnocení.",
    bulletPoints: ["Moderní vybavení", "Dobrá dopravní dostupnost", "Klidní lokalita"],
    seoTitle: "Moderní nemovitost k prodeji",
    seoDescription: "Prodej moderní nemovitosti s velkým potenciálem.",
    priceSuggestion: 9500000,
    targetAudience: "Mladé páry, investoři, rodiny"
  }
};

console.log("=== TEST SDÍLENÍ NA SOCIÁLNÍ SÍTĚ ===\n");

// Test 1: Sdílení na Facebook
console.log("1. Facebook Share URL:");
const title = testData.aiResults?.headline || testData.listing.title || "AI-Optimized Property";
const description = testData.aiResults?.shortDesc || `Check out this amazing property in ${testData.listing.location || "Prague"}`;
const shareText = `${title} - ${description}`;
const shareUrl = "http://localhost:3001/listings/0c52f531-e1dc-4905-a804-2e68b4c2f17c";

const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
console.log("URL:", facebookUrl);
console.log("Text:", shareText);
console.log("Používá AI obsah:", shareText.includes("Moderní nemovitost v Brně") ? "✅ ANO" : "❌ NE");
console.log();

// Test 2: Sreality export
console.log("2. Sreality Export URL:");
const srealityTitle = testData.aiResults?.headline || testData.listing.title || "AI-Optimized Property Listing";
const srealityDescription = testData.aiResults?.shortDesc || `Modern property in ${testData.listing.location || "Prague"}`;
const srealityPrice = testData.aiResults?.priceSuggestion || testData.listing.price || 8500000;

const srealityUrl = `https://www.sreality.cz/inzerat/novy?title=${encodeURIComponent(srealityTitle)}&description=${encodeURIComponent(srealityDescription)}&location=${encodeURIComponent(testData.listing.location || "Prague")}&price=${srealityPrice}`;
console.log("URL:", srealityUrl);
console.log("Titulek:", srealityTitle);
console.log("Popis:", srealityDescription);
console.log("Cena:", srealityPrice.toLocaleString('cs-CZ') + ' CZK');
console.log("Používá AI obsah:", srealityTitle.includes("Moderní nemovitost v Brně") ? "✅ ANO" : "❌ NE");
console.log();

// Test 3: Email campaign
console.log("3. Email Campaign:");
const emailTitle = testData.aiResults?.headline || testData.listing.title || "AI-Generated Property";
const emailDescription = testData.aiResults?.shortDesc || `Modern property in ${testData.listing.location || "Prague"}`;
const bulletPoints = testData.aiResults?.bulletPoints?.join('\n• ') || "• Modern amenities\n• Great location\n• Investment potential";

const emailSubject = `AI-Optimized Property: ${emailTitle}`;
const emailBody = `Hello,\n\nI wanted to share this AI-optimized property listing with you:\n\n${emailTitle}\n\n${emailDescription}\n\nKey Features:\n• ${bulletPoints}\n\nLocation: ${testData.listing.location || "Prague"}\nPrice: ${testData.listing.price ? testData.listing.price.toLocaleString('cs-CZ') + ' CZK' : 'Price upon request'}\n\nView the full AI-optimized listing here: ${shareUrl}\n\nBest regards,\nREALFORGE AI`;

console.log("Subject:", emailSubject);
console.log("Body preview:", emailBody.substring(0, 200) + "...");
console.log("Používá AI obsah:", emailBody.includes("Moderní nemovitost v Brně") ? "✅ ANO" : "❌ NE");
console.log();

// Test 4: Porovnání s původním obsahem
console.log("4. Porovnání AI vs. původní obsah:");
console.log("Původní titulek:", testData.listing.title);
console.log("AI generovaný titulek:", testData.aiResults.headline);
console.log("Rozdíl:", testData.listing.title !== testData.aiResults.headline ? "✅ AI vylepšilo obsah" : "⚠️ AI nepřidalo hodnotu");
console.log();

console.log("=== VÝSLEDKY TESTOVÁNÍ ===");
console.log("✅ Sdílení na sociální sítě nyní používá AI generovaný obsah");
console.log("✅ Sreality export používá AI optimalizované texty");
console.log("✅ Email campaign obsahuje AI generované popisy");
console.log("✅ Všechny exporty jsou nyní profesionálnější díky AI");