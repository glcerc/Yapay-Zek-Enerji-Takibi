// === AI Enerji Takibi - Background Script ===

// Günlük sıfırlama: Türkiye'de 00:00 → UTC'de 21:00
function resetEnergyData() {
  chrome.storage.local.set({
    messageCount: 0,
    totalTokens: 0,
    totalEnergy: 0
  }, () => {
    console.log("Günlük enerji verileri sıfırlandı.");
  });
}

function scheduleDailyReset() {
  const now = new Date();
  const resetHourUTC = 21; // Türkiye'de 00:00
  const nextReset = new Date(now);

  nextReset.setUTCHours(resetHourUTC, 0, 0, 0);
  if (nextReset < now) {
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
  }

  const msUntilReset = nextReset - now;
  setTimeout(() => {
    resetEnergyData();
    scheduleDailyReset(); // Ertesi gün için tekrar kur
  }, msUntilReset);
}

// Eklenti ilk kurulduğunda veya güncellendiğinde
chrome.runtime.onInstalled.addListener((details) => {
  const version = chrome.runtime.getManifest().version;

  if (details.reason === "install") {
    console.log("Yeni kurulum: storage başlatılıyor");
    chrome.storage.local.set({
      messageCount: 0,
      totalTokens: 0,
      totalEnergy: 0,
      extensionVersion: version
    });
  } else if (details.reason === "update") {
    console.log("Güncelleme: mevcut veriler korunuyor");
    chrome.storage.local.set({ extensionVersion: version });
  }

  scheduleDailyReset();
});

// Tarayıcı açıldığında da sıfırlama zamanlayıcısını başlat
chrome.runtime.onStartup.addListener(() => {
  scheduleDailyReset();
});
