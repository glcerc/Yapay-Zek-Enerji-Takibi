document.addEventListener("DOMContentLoaded", () => {
  const CO2_PER_WH = 0.418;

  const activityMap = {
    tea: { emoji: "☕", label: "bardak çay demleyebilirdin", energy: 15 },
    meal: { emoji: "🍲", label: "yemek pişirebilirdin", energy: 100 },
    coffee: { emoji: "☕", label: "Türk kahvesi hazırlayabilirdin", energy: 25 },
    series: { emoji: "📺", label: "dakika dizi izleyebilirdin", energy: 100 / 60 },
    elevator: { emoji: "🛗", label: "kat asansörle çıktın ", energy: 3 },
    phone: { emoji: "📱", label: "telefon şarj edebilirdin", energy: 12 }
  };

  // Verileri göster
  function updateUI(data) {
    const msgCount = data.messageCount || 0;
    const energy = data.totalEnergy || 0;
    const carbon = (energy * CO2_PER_WH).toFixed(3);

    document.getElementById("msgCount").innerText = msgCount;
    document.getElementById("energyUsed").innerText = energy.toFixed(2);
    document.getElementById("carbonEmission").innerText = `${carbon} gCO₂`;

    Object.entries(activityMap).forEach(([key, val]) => {
      const count = (energy / val.energy).toFixed(1);
      document.getElementById(`${key}Equivalent`).innerText = `${val.emoji} ${count} ${val.label}`;
    });

    showRandomTip("popupSuggestions");
  }

  chrome.storage.local.get(["messageCount", "totalTokens", "totalEnergy"], updateUI);

  // Sıfırlama bağlantısı
  document.getElementById("resetLink").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.storage.local.set({
      messageCount: 0,
      totalTokens: 0,
      totalEnergy: 0
    }, () => {
      updateUI({ messageCount: 0, totalEnergy: 0 });
      updateLiveBadge(0, 0);
    });
  });
});

// Rastgele öneri
function showRandomTip(containerId) {
  const suggestions = [
    "Net sor, daha az enerji harca! ⚡",
    "Enerji dostu kullanımlar için sorguları birleştir! 🔋",
    "Bugün sohbetini kısa tut, doğa kazansın! 🌿",
    "Gereksiz sorguları sil, karbon ayak izin azalsın! 🧹",
    "Bir mesaj = 1 bardak çay demlemek kadar enerji! ☕",
    "Yapay zekâya sormadan önce kendine sor! 🤔",
    "Sorguları tek seferde netleştir, doğaya zaman kazandır! 🕊️",
    "Az mesaj, çok etki! 🌍",
    "Bugünkü enerji tüketiminle 1 tost basabilirdin! 🍞",
    "Bir cevap daha alırken 🌳 bir ağaç daha nefes alıyor mu, düşün!",
    "İletişimini sadeleştir, gezegeni koru! 💬",
    "Bilgiyi çekmeden önce enerjiyi düşün! 💡",
    "Her kelimenin bir maliyeti var, az konuş çok yaşa! 💸🌱",
    "Bugün kullandığın enerjiyle 1 saat dizi izleyebilirdin! 📺",
    "Yapay zekâyı akıllı kullan, doğayı yorma! 🧠🌿",
    "Enerji kaynağın GPT mi, dünya mı? 🪐",
    "Daha verimli sorgular = Daha yaşanabilir bir gelecek 🌎",
    "Bugün 1 telefon şarjına denk enerji harcadın 📱",
    "AI'ı değil, alışkanlıklarını optimize et! ⚙️",
    "Kısa cevaplar büyük etki yaratır! 🎯",
    "Doğaya bir iyilik yap: ‘Prompt’larını sade tut! ✏️",
    "Fazla sorgu, fazla salınım! Azla yetin 🍃",
    "Bir cümle daha yazmadan önce nefes al 🍃",
    "Bugünlük sorgu hakkını iyi değerlendir! 🎟️",
    "Kahve yerine bilgi tükettin – ama doğa da bunu hissediyor! ☕➡️📊"
  ];
  const tip = suggestions[Math.floor(Math.random() * suggestions.length)];
  document.querySelector(`#${containerId} .dailyTip`).textContent = tip;
}
