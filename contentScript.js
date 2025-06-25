console.log("✅ contentScript.js aktif!");

// === Sabitler ===
const WORLD_EMISSION_FACTOR = 0.5;
let lastUserMessage = "";
let lastAssistantResponse = "";

// === Enerji Hesaplayıcı ===
function calculateEnergy(tokens, method = "ecologits") {
  if (method === "altman") {
    const ENERGY_PER_TOKEN = 0.34 / 781;
    return tokens * ENERGY_PER_TOKEN;
  } else {
    const ENERGY_ALPHA = 8.91e-5;
    const ENERGY_BETA = 1.43e-3;
    const ACTIVE_PARAMS = 55;
    const PUE = 1.2;
    const perTokenEnergy = (ENERGY_ALPHA * ACTIVE_PARAMS) + ENERGY_BETA;
    return tokens * perTokenEnergy * PUE;
  }
}

// === Token Tahmini ===
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

function getEstimationMethod() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["calculationMethod"], (data) => {
      resolve(data.calculationMethod || "ecologits");
    });
  });
}

// === Rozet (badge) UI ===
function createLiveBadge() {
  let badge = document.getElementById("gpt-energy-badge");
  if (badge) return;

  badge = document.createElement("div");
  badge.id = "gpt-energy-badge";
  badge.style.position = "fixed";
  badge.style.top = "10px";
  badge.style.left = "50%";
  badge.style.transform = "translateX(-50%)";
  badge.style.background = "#f0fff4";
  badge.style.color = "#1f684e";
  badge.style.padding = "6px 10px";
  badge.style.borderRadius = "8px";
  badge.style.fontSize = "13px";
  badge.style.fontFamily = "sans-serif";
  badge.style.zIndex = "99999";
  badge.style.boxShadow = "0 0 5px rgba(0,0,0,0.1)";
  document.body.appendChild(badge);
}

function updateLiveBadge(energy, carbon) {
  createLiveBadge();
  const badge = document.getElementById("gpt-energy-badge");
  badge.textContent = `⚡ ${energy.toFixed(2)} Wh | ☁️ ${carbon.toFixed(2)} gCO₂`;
}

async function processMessages() {
  const userMsgs = document.querySelectorAll('[data-message-author-role="user"]');
  const assistantMsgs = document.querySelectorAll('[data-message-author-role="assistant"]');
  if (!userMsgs.length || !assistantMsgs.length) return;

  const latestUser = userMsgs[userMsgs.length - 1].innerText.trim();
  const latestAssistant = assistantMsgs[assistantMsgs.length - 1].innerText.trim();

  if (latestUser === lastUserMessage && latestAssistant === lastAssistantResponse) return;

  const isNewUserMessage = latestUser !== lastUserMessage;

  lastUserMessage = latestUser;
  lastAssistantResponse = latestAssistant;

  const userTokens = estimateTokens(latestUser);
  const assistantTokens = estimateTokens(latestAssistant);
  const totalTokens = userTokens + assistantTokens;

  const method = await getEstimationMethod();
  const energy = calculateEnergy(totalTokens, method);
  const carbon = energy * WORLD_EMISSION_FACTOR;

  chrome.storage.local.get(["messageCount", "totalTokens", "totalEnergy"], (data) => {
    const updated = {
      messageCount: isNewUserMessage ? (data.messageCount || 0) + 1 : data.messageCount || 0,
      totalTokens: (data.totalTokens || 0) + totalTokens,
      totalEnergy: (data.totalEnergy || 0) + energy,
    };
    chrome.storage.local.set(updated);
    updateLiveBadge(updated.totalEnergy, updated.totalEnergy * WORLD_EMISSION_FACTOR);
  });
}

// === İlk açılışta geçmiş verileri göster ===
chrome.storage.local.get(["totalEnergy"], (data) => {
  const energy = data.totalEnergy || 0;
  const carbon = energy * WORLD_EMISSION_FACTOR;
  updateLiveBadge(energy, carbon);
});

// === DOM Değişikliği İzleyici (observer) ===
setTimeout(() => {
  const targetNode = document.querySelector("main") || document.body;
  if (targetNode) {
    const observer = new MutationObserver(() => {
      setTimeout(processMessages, 500);
    });
    observer.observe(targetNode, { childList: true, subtree: true });
    console.log("👀 Observer başlatıldı.");
  } else {
    console.warn("⚠️ targetNode bulunamadı.");
  }
}, 2000);


