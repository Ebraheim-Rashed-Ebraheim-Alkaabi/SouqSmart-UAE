// assets/js/ai.js
// AI integration examples:
// 1) Chatbot (prototype) - uses rules + optional OpenAI endpoint
// 2) Bundle recommender - rules-based now, "AI-ready" later

function chatRateLimitOk() {
  const now = Date.now();
  const windowMs = 30_000;
  const limit = 15;

  const raw = localStorage.getItem(CHAT_RATE_KEY);
  const obj = raw ? JSON.parse(raw) : { ts: now, count: 0 };

  if (now - obj.ts > windowMs) {
    localStorage.setItem(CHAT_RATE_KEY, JSON.stringify({ ts: now, count: 1 }));
    return true;
  }
  if (obj.count >= limit) return false;
  obj.count += 1;
  localStorage.setItem(CHAT_RATE_KEY, JSON.stringify(obj));
  return true;
}

function botReply(userText) {
  const t = (userText || "").toLowerCase();

  // quick intent detection (prototype)
  if (t.includes("dubai") || t.includes("abu dhabi") || t.includes("sharjah")) {
    return "Got it. Tell me your goal: fitness, focus, wellness, or travel week?";
  }
  if (t.includes("fitness")) {
    return "Recommendation: Fitness Kickstart Kit. Want low-sugar or eco-friendly preferences?";
  }
  if (t.includes("focus") || t.includes("office")) {
    return "Recommendation: Focus Week Bundle. Budget: value, balanced, or premium?";
  }
  if (t.includes("wellness") || t.includes("calm")) {
    return "Recommendation: Wellness Reset Pack. Do you prefer standard, eco, or low-sugar?";
  }
  if (t.includes("travel")) {
    return "Recommendation: Travel Week Bundle. What city are you in (Dubai/Abu Dhabi/Sharjah)?";
  }
  if (t.includes("price") || t.includes("cost")) {
    return "Most bundles range AED 89–179 in this prototype. Want a value option or premium option?";
  }
  if (t.includes("refund") || t.includes("return")) {
    return "Prototype policy: 7-day returns (mock). In production we’d publish full UAE-compliant terms.";
  }
  return "Hi! Tell me your city + goal + budget and I’ll suggest the best bundle (prototype AI).";
}

function renderChatMessage(role, text) {
  const box = document.querySelector("#chatMessages");
  if (!box) return;
  const m = document.createElement("div");
  m.className = `chat-msg ${role}`;
  m.textContent = text;
  box.appendChild(m);
  box.scrollTop = box.scrollHeight;
}

function initChatWidget() {
  const openBtn = document.querySelector("#chatOpen");
  const panel = document.querySelector("#chatPanel");
  const closeBtn = document.querySelector("#chatClose");
  const input = document.querySelector("#chatInput");
  const sendBtn = document.querySelector("#chatSend");

  if (!openBtn || !panel || !closeBtn || !input || !sendBtn) return;

  openBtn.addEventListener("click", () => {
    panel.classList.add("open");
    openBtn.setAttribute("aria-expanded", "true");
    setTimeout(() => input.focus(), 80);
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.remove("open");
    openBtn.setAttribute("aria-expanded", "false");
  });

  function send() {
    const text = input.value.trim();
    if (!text) return;

    if (!chatRateLimitOk()) {
      renderChatMessage("bot", "Rate limit: please wait a bit (security demo).");
      return;
    }

    renderChatMessage("user", text);
    input.value = "";

    // Prototype reply (rules). AI-ready: replace with API call to OpenAI.
    const reply = botReply(text);
    setTimeout(() => renderChatMessage("bot", reply), 300);
  }

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
  });

  // initial message
  renderChatMessage("bot", "Hi! I’m SouqSmart AI. Tell me your city + goal + budget.");
}

function buildBundleFromQuiz(state) {
  // Rules engine now; can be replaced by ML model later.
  const base = { solo: 1, couple: 2, family: 3 }[state.household] || 1;

  const goalItems = {
    focus: ["Hydration pack", "Focus snack mix", "Desk essentials"],
    fitness: ["Protein-friendly snack", "Electrolytes", "Recovery essentials"],
    wellness: ["Herbal wellness set", "Routine snacks", "Calm essentials"],
    travel: ["Compact essentials", "Travel snack pack", "On-the-go hydration"]
  };

  const prefItems = {
    standard: ["Popular add-on"],
    eco: ["Eco refill option", "Low-waste substitute"],
    low_sugar: ["Low-sugar alternative", "No-added-sugar snack"]
  };

  const budgetMultiplier = { value: 0.9, balanced: 1.0, premium: 1.2 }[state.budget] || 1.0;

  const items = [
    ...(goalItems[state.goal] || goalItems.focus),
    ...(prefItems[state.preference] || prefItems.standard),
    `${base}× weekly essentials pack`
  ];

  const estimatedAED = Math.round((120 + base * 25) * budgetMultiplier);

  return {
    name: `${state.goal.toUpperCase()} Bundle — ${state.budget.toUpperCase()} (${state.preference.replace("_", " ").toUpperCase()})`,
    reason: `Built for a ${state.household} household with a ${state.goal} goal and ${state.budget} budget.`,
    items,
    estimatedAED
  };
}
