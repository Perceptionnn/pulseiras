const STORE_KEY = "atelierAdsCrm.v1";
const PHOTO_PLAN = [
  "Peça no corpo, pulso ou pescoço como foto principal.",
  "Close-up do brilho, textura e presença da malha.",
  "Peça completa bem centrada e com fundo limpo.",
  "Detalhe do fecho e eventuais marcações visíveis.",
  "Foto com peso/medidas para reduzir dúvidas.",
  "Conjunto com outras peças para estimular bundles."
];
const BLOCKED_CLAIMS = ["prata 925", "prata verdadeira", "prata maciça", "prata real"];
const RESPONSE_TEMPLATES = {
  "Português PT": {
    autenticidade: [
      "A peça foi confirmada como prata por ourives após a compra. Não vejo marcação 925 visível, por isso prefiro descrevê-la exatamente dessa forma.",
      "Tem bastante peso e presença ao vivo. Foi confirmada como prata por ourives, embora não tenha marcação visível 925.",
      "Foi confirmada como prata por ourives."
    ],
    desconto: [
      "Posso ajustar um pouco o valor, mas como é uma peça pesada e com bastante procura não consigo baixar muito mais.",
      "Se conseguir finalizar hoje ainda consigo fazer um pequeno desconto.",
      "Consigo fazer um ajuste ligeiro para fechar hoje."
    ],
    reserva: ["Posso reservar durante algum tempo, mas tenho tido bastante interesse nesta peça.", "Consigo reservar por algumas horas sem problema."],
    disponibilidade: ["Sim, continua disponível.", "Sim, ainda está disponível e pronta para envio."],
    "urgência suave": ["Este tipo de peças costuma sair relativamente rápido, sobretudo as mais pesadas.", "Tenho tido algum interesse nela, por isso recomendo decidir com calma mas sem deixar muito tempo."],
    "cross-sell": ["Tenho outras pulseiras/colares semelhantes no perfil caso queira combinar várias peças.", "Se quiser fazer pack com outras peças, consigo ajustar melhor o valor final."],
    envio: ["Sim, envio normalmente através da Vinted/Wallapop sem problema.", "Sim, posso enviar. Os portes ficam pela plataforma quando finalizar a compra."]
  },
  Espanhol: {
    autenticidade: [
      "La pieza fue confirmada como plata por un joyero después de la compra. No veo marca 925 visible, por eso prefiero describirla exactamente así.",
      "Tiene bastante peso y presencia en persona. Fue confirmada como plata por un joyero, aunque no tiene marca 925 visible.",
      "Fue confirmada como plata por un joyero."
    ],
    desconto: [
      "Puedo ajustar un poco el precio, pero como es una pieza con peso y bastante interés no puedo bajarlo mucho más.",
      "Si puedes finalizar hoy, todavía puedo hacerte un pequeño descuento.",
      "Puedo hacer un ajuste ligero para cerrar hoy."
    ],
    reserva: ["Puedo reservarla durante un tiempo, aunque he tenido bastante interés en esta pieza.", "Puedo reservarla unas horas sin problema."],
    disponibilidade: ["Sí, sigue disponible.", "Sí, sigue disponible y lista para enviar."],
    "urgência suave": ["Este tipo de piezas suele venderse relativamente rápido, sobre todo las más pesadas.", "He tenido algo de interés en ella, así que conviene no dejarlo demasiado tiempo."],
    "cross-sell": ["Tengo otras pulseras/collares parecidos en mi perfil por si quieres combinar varias piezas.", "Si quieres hacer un pack con otras piezas, puedo ajustar mejor el precio final."],
    envio: ["Sí, envío normalmente a través de Vinted/Wallapop sin problema.", "Sí, puedo enviarla. Los gastos se calculan en la plataforma al finalizar la compra."]
  },
  Inglês: {
    autenticidade: [
      "The piece was confirmed as silver by a jeweller after purchase. I cannot see a visible 925 mark, so I prefer to describe it exactly that way.",
      "It has a nice weight and strong presence in person. It was confirmed as silver by a jeweller, although there is no visible 925 mark.",
      "It was confirmed as silver by a jeweller."
    ],
    desconto: [
      "I can adjust the price a little, but as it is a weighty piece with good interest I cannot reduce it much more.",
      "If you can complete the purchase today, I can still make a small discount.",
      "I can make a small adjustment to close today."
    ],
    reserva: ["I can reserve it for a short while, but there has been quite a bit of interest in this piece.", "I can reserve it for a few hours, no problem."],
    disponibilidade: ["Yes, it is still available.", "Yes, it is still available and ready to ship."],
    "urgência suave": ["These pieces usually sell fairly quickly, especially the heavier ones.", "There has been some interest in it, so I would not leave it too long."],
    "cross-sell": ["I have other similar bracelets/necklaces on my profile if you would like to combine several pieces.", "If you want to make a bundle with other pieces, I can adjust the final price better."],
    envio: ["Yes, I usually ship through Vinted/Wallapop without any problem.", "Yes, I can ship it. Shipping is handled by the platform when you complete the purchase."]
  }
};

let state = loadState();
let generated = null;
let selectedPhotos = [];
let currentResponses = [];

document.addEventListener("DOMContentLoaded", init);

function init() {
  bindNavigation();
  hydrateSelects();
  bindEvents();
  renderAll();
  updateSafety();
  renderPhotoStrategy();
}

function loadState() {
  const saved = localStorage.getItem(STORE_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(STORE_KEY, JSON.stringify(SEED_DATA));
  return clone(SEED_DATA);
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function bindNavigation() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item, .view").forEach((el) => el.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.view).classList.add("active");
      document.getElementById("pageTitle").textContent = button.textContent.trim();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function hydrateSelects() {
  fillSelect("[name='platform']", state.platforms);
  fillSelect("[name='type']", state.types);
  fillSelect("[name='condition']", state.conditions);
  fillSelect("[name='material']", state.materials);
  fillSelect("[name='style']", state.styles);
  fillSelect("[name='confirmed']", ["sim", "não"]);
  fillSelect("[name='mark925']", ["não", "sim"]);
  fillSelect("#responseLang", state.languages);
  fillSelect("#responseTone", state.tones);
  fillSelect("#conversationResult", state.results);
  fillSelect("#statusFilter", ["todos", "ativo", "vendido", "pausado", "republicar"]);
}

function fillSelect(selector, items) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = items.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("");
}

function bindEvents() {
  document.getElementById("themeToggle").addEventListener("click", () => document.body.classList.toggle("light"));
  document.getElementById("listingForm").addEventListener("input", updateSafety);
  document.getElementById("listingForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const listing = listingFromForm();
    generated = buildGenerated(listing);
    state.listings.unshift(listing);
    addActivityConversation(`Anúncio criado: ${listing.title}`, listing.id);
    saveState();
    renderAll();
    showToast("Anúncio gerado e guardado");
  });
  document.getElementById("generateOnly").addEventListener("click", () => {
    generated = buildGenerated(listingFromForm(false));
    renderGenerated();
    showToast("Variações geradas");
  });
  document.getElementById("clearForm").addEventListener("click", () => {
    document.getElementById("listingForm").reset();
    selectedPhotos = [];
    updateSafety();
    renderPhotos();
  });
  document.getElementById("imageInput").addEventListener("change", handleImages);
  document.getElementById("clearImages").addEventListener("click", () => {
    selectedPhotos = [];
    document.getElementById("imageInput").value = "";
    renderPhotos();
  });
  document.getElementById("copyGenerated").addEventListener("click", () => copyText(generatedText(), "Resultados copiados"));
  document.getElementById("detectIntent").addEventListener("click", generateResponses);
  document.getElementById("variantResponses").addEventListener("click", generateResponses);
  document.getElementById("saveConversation").addEventListener("click", saveConversation);
  document.getElementById("statusFilter").addEventListener("change", renderListings);
  document.getElementById("globalSearch").addEventListener("input", renderAll);
  document.getElementById("seedDemo").addEventListener("click", () => {
    state = clone(SEED_DATA);
    saveState();
    renderAll();
    showToast("Base inicial restaurada");
  });
  document.getElementById("exportAllJson").addEventListener("click", () => download("atelier-ads-crm.json", JSON.stringify(state, null, 2)));
  document.getElementById("exportListingsJson").addEventListener("click", () => download("anuncios.json", JSON.stringify(state.listings, null, 2)));
  document.getElementById("exportListingsCsv").addEventListener("click", () => download("anuncios.csv", toCsv(state.listings)));
  document.getElementById("exportCrmCsv").addEventListener("click", () => download("crm.csv", toCsv(state.conversations)));
  document.getElementById("exportLibraryJson").addEventListener("click", () => download("biblioteca-respostas.json", JSON.stringify(state.responseLibrary, null, 2)));
  document.querySelector("[data-export='csv']").addEventListener("click", () => download("metricas.csv", toCsv(getMetricsRows())));
}

function listingFromForm(persist = true) {
  const data = new FormData(document.getElementById("listingForm"));
  const listing = Object.fromEntries(data.entries());
  listing.id = persist ? uid() : "preview";
  listing.weight = Number(listing.weight) || "";
  listing.measure = Number(listing.measure) || "";
  listing.targetPrice = Number(listing.targetPrice) || 0;
  listing.minPrice = Number(listing.minPrice) || 0;
  listing.status = "ativo";
  listing.interest = 0;
  listing.responsesSent = 0;
  listing.proposals = 0;
  listing.photos = selectedPhotos.map((photo) => ({ name: photo.name, main: photo.main }));
  listing.photoLinks = String(listing.photoLinks || "").split(/\n+/).map((url) => url.trim()).filter(Boolean);
  listing.title = titleBase(listing);
  listing.description = descriptionForPlatform(listing, listing.platform);
  listing.createdAt = new Date().toISOString();
  listing.updatedAt = listing.createdAt;
  return listing;
}

function titleBase(listing) {
  const material = materialLabel(listing);
  const parts = [listing.type || "Peça", material];
  if (listing.measure) parts.push(`${listing.measure} cm`);
  if (listing.weight) parts.push(`${listing.weight}g`);
  return sanitizeClaims(parts.filter(Boolean).join(" - "), listing);
}

function materialLabel(listing) {
  if (listing.material === "prata 925 marcada" && listing.mark925 === "sim") return "Prata 925";
  if (listing.material === "prata confirmada" || listing.confirmed === "sim") return "Prata da Índia";
  if (listing.material === "silver tone") return "Silver Tone";
  if (listing.material === "metal prateado") return "Metal Prateado";
  return "Estilo Prata Indiana";
}

function buildGenerated(listing) {
  return {
    titles: generateTitles(listing),
    descriptions: state.platforms.map((platform) => ({ label: platform, text: descriptionForPlatform(listing, platform) })),
    prices: priceSuggestions(listing),
    plan: maintenancePlan(listing),
    reposts: repostVariations(listing),
    safety: safetyAdvice(listing)
  };
}

function generateTitles(listing) {
  const type = listing.type || "Peça";
  const style = listing.style || "boho";
  const weight = listing.weight ? `${listing.weight}g` : "";
  const measure = listing.measure ? `${listing.measure} cm` : "";
  const material = materialLabel(listing);
  const heavy = listing.weight >= 60 ? "peça pesada" : "peça marcante";
  return [
    ["Vinted", `${type} ${material} ${style} ${weight}`],
    ["Wallapop", `${type} ${style} em tom prateado ${weight}`],
    ["OLX", `${type} ${material} ${style} vintage ${measure} ${weight}`],
    ["CustoJusto", `${type} estilo prata indiana ${style} ${heavy}`],
    ["Versão boho", `${type} boho ${material} com visual artesanal`],
    ["Versão vintage", `${type} vintage tribal ${weight}`],
    ["Versão premium", `${type} statement ${material} com presença forte`],
    ["Versão curta", `${type} ${style} ${weight}`],
    ["Versão SEO", `${type} ${style} étnico silver tone prata indiana ${weight}`]
  ].map(([label, text]) => ({ label, text: sanitizeClaims(text.replace(/\s+/g, " ").trim(), listing) }));
}

function descriptionForPlatform(listing, platform) {
  const item = listing.type?.toLowerCase() || "peça";
  const material = materialLabel(listing).toLowerCase();
  const style = listing.style || "boho";
  const weight = listing.weight ? `Tem ${listing.weight}g` : "Tem boa presença";
  const measure = listing.measure ? ` e mede cerca de ${listing.measure} cm` : "";
  const condition = listing.condition ? `Estado: ${listing.condition}.` : "";
  const honesty = listing.mark925 === "sim" ? "Tem marcação 925 visível." : listing.confirmed === "sim" ? "Foi confirmada como prata por ourives, sem marcação 925 visível." : "Descrevo como tom prateado/silver tone para manter o anúncio honesto.";
  const notes = listing.notes ? ` ${listing.notes}` : "";
  const copy = {
    Vinted: `${capitalize(item)} ${style} com visual marcante e estética ${material}. ${weight}${measure}, com presença bonita ao vivo. Ideal para looks boho, vintage, tribais ou statement.${notes} ${honesty}`,
    Wallapop: `${capitalize(item)} em estilo ${style}, muito fácil de combinar e com bastante presença. ${weight}${measure}. Posso enviar mais detalhes ou fotos se quiser. ${honesty}`,
    OLX: `Vendo ${item} estilo ${style}, inspiração prata indiana, visual étnico/vintage e acabamento prateado. ${weight}${measure}. ${condition} Boa opção para quem procura joalharia boho, tribal, statement ou acessórios com personalidade.${notes} ${honesty}`,
    CustoJusto: `${capitalize(item)} ${style} / vintage / étnico, com visual de prata indiana e tom prateado. ${weight}${measure}. Peça indicada para looks boho, hippie chic, rock, alternativo ou colecionadores de acessórios statement.${notes} ${condition} ${honesty}`
  };
  return sanitizeClaims(copy[platform] || copy.Vinted, listing);
}

function sanitizeClaims(text, listing) {
  if (canClaimSilver(listing)) return text;
  let safe = text;
  BLOCKED_CLAIMS.forEach((claim) => {
    safe = safe.replace(new RegExp(claim, "gi"), "estilo prata indiana");
  });
  safe = safe.replace(/prata da índia/gi, "estilo prata indiana");
  return safe;
}

function canClaimSilver(listing) {
  return listing.material === "prata confirmada" || (listing.material === "prata 925 marcada" && listing.mark925 === "sim") || listing.confirmed === "sim";
}

function safetyAdvice(listing) {
  if (canClaimSilver(listing)) {
    return ["Pode mencionar prata confirmada, mantendo a nota sobre marcação 925 se não estiver visível.", "Evita prometer pureza exata quando só existe confirmação geral por ourives."];
  }
  return ["Bloquear: prata 925, prata verdadeira, prata maciça e prata real.", "Sugerir: estilo prata indiana, tom prateado, silver tone, visual boho/vintage e peça estilo tribal."];
}

function priceSuggestions(listing) {
  const price = Number(listing.targetPrice) || 0;
  const min = Number(listing.minPrice) || Math.max(0, price - 10);
  const psycho = price > 0 ? Math.max(1, price - 1) : 0;
  return [
    ["Preço psicológico", euro(psycho)],
    ["Preço negociação", euro(price + 5)],
    ["Preço mínimo", euro(min)],
    ["Preço bundle", euro(Math.max(min, Math.round(price * .9)))],
    ["Preço republicação", euro(Math.max(min, psycho - 4))]
  ];
}

function maintenancePlan() {
  return [
    "Dia 1: publicar em horário forte, entre almoço e noite.",
    "Dia 2: trocar a foto principal por uma imagem no corpo.",
    "Dia 3: editar ligeiramente o título com palavra boho/vintage.",
    "Dia 4: baixar 1€ para reativar interesse.",
    "Dia 5: alterar a primeira frase da descrição.",
    "Dia 6: responder favoritos/interessados com tom suave.",
    "Dia 7: decidir republicar com nova variação."
  ];
}

function repostVariations(listing) {
  const type = listing.type || "Peça";
  return ["boho", "premium", "vintage", "tribal", "minimal", "pesada/luxo"].map((tone) => ({
    label: tone,
    text: sanitizeClaims(`${type} ${tone} ${materialLabel(listing)} ${listing.weight ? `${listing.weight}g` : ""} com presença marcante`, listing)
  }));
}

function updateSafety() {
  const listing = Object.fromEntries(new FormData(document.getElementById("listingForm")).entries());
  const box = document.getElementById("safetyBox");
  box.innerHTML = safetyAdvice(listing).map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function handleImages(event) {
  [...event.target.files].forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = () => {
      selectedPhotos.push({ name: file.name, src: reader.result, main: selectedPhotos.length === 0 && index === 0 });
      renderPhotos();
    };
    reader.readAsDataURL(file);
  });
}

function renderPhotoStrategy() {
  document.getElementById("photoStrategy").innerHTML = PHOTO_PLAN.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderPhotos() {
  document.getElementById("photoPreview").innerHTML = selectedPhotos.map((photo, index) => `
    <div class="photo-tile ${photo.main ? "main" : ""}">
      <img src="${photo.src}" alt="${escapeHtml(photo.name)}">
      <button type="button" data-photo-main="${index}">${photo.main ? "Principal" : "Marcar principal"}</button>
      <div class="photo-move">
        <button type="button" data-photo-up="${index}" title="Subir foto">↑</button>
        <button type="button" data-photo-down="${index}" title="Descer foto">↓</button>
      </div>
    </div>
  `).join("");
  document.querySelectorAll("[data-photo-main]").forEach((button) => button.addEventListener("click", () => {
    selectedPhotos = selectedPhotos.map((photo, index) => ({ ...photo, main: index === Number(button.dataset.photoMain) }));
    renderPhotos();
  }));
  document.querySelectorAll("[data-photo-up]").forEach((button) => button.addEventListener("click", () => movePhoto(Number(button.dataset.photoUp), -1)));
  document.querySelectorAll("[data-photo-down]").forEach((button) => button.addEventListener("click", () => movePhoto(Number(button.dataset.photoDown), 1)));
}

function movePhoto(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= selectedPhotos.length) return;
  [selectedPhotos[index], selectedPhotos[target]] = [selectedPhotos[target], selectedPhotos[index]];
  renderPhotos();
}

function renderAll() {
  renderDashboard();
  renderGenerated();
  renderListingSelect();
  renderListings();
  renderCrm();
  renderLibrary();
}

function filteredListings() {
  const q = document.getElementById("globalSearch")?.value?.toLowerCase() || "";
  return state.listings.filter((listing) => JSON.stringify(listing).toLowerCase().includes(q));
}

function renderDashboard() {
  const listings = state.listings;
  const active = listings.filter((l) => l.status === "ativo").length;
  const sold = listings.filter((l) => l.status === "vendido").length;
  const paused = listings.filter((l) => l.status === "pausado").length;
  const republish = listings.filter((l) => l.status === "republicar").length;
  const sales = listings.filter((l) => l.status === "vendido").reduce((sum, l) => sum + Number(l.targetPrice || 0), 0);
  const avg = listings.length ? listings.reduce((sum, l) => sum + Number(l.targetPrice || 0), 0) / listings.length : 0;
  const responses = listings.reduce((sum, l) => sum + Number(l.responsesSent || 0), 0) + state.conversations.length;
  const pending = state.conversations.filter((c) => c.result === "interessado" || c.result === "negociar depois").length;
  const proposals = listings.reduce((sum, l) => sum + Number(l.proposals || 0), 0);
  const metrics = [
    ["Total anúncios", listings.length, "biblioteca local"],
    ["Ativos", active, "à venda agora"],
    ["Vendidos", sold, euro(sales)],
    ["Pausados", paused, "em revisão"],
    ["Para republicar", republish, "otimização pendente"],
    ["Preço médio", euro(avg), "ticket médio"],
    ["Respostas enviadas", responses, "CRM + anúncios"],
    ["Negociações", pending, "pendentes"],
    ["Propostas", proposals, "recebidas"],
    ["Melhor plataforma", bestPlatform(), "por volume"],
    ["Mais interesse", bestInterest(), "peça quente"],
    ["Mais vendidas", bestSoldType(), "por categoria"]
  ];
  document.getElementById("metricGrid").innerHTML = metrics.map(([label, value, note]) => `<article class="metric-card"><span>${label}</span><strong>${value}</strong><em>${note}</em></article>`).join("");
  renderPlatformChart();
  renderInterestList();
  renderActivity();
  renderConversionMetrics();
}

function renderPlatformChart() {
  const canvas = document.getElementById("platformChart");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = 160 * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, canvas.clientWidth, 160);
  const counts = state.platforms.map((p) => [p, state.listings.filter((l) => l.platform === p).length]);
  const max = Math.max(1, ...counts.map(([, count]) => count));
  counts.forEach(([platform, count], index) => {
    const x = 22 + index * ((canvas.clientWidth - 44) / counts.length);
    const width = Math.max(36, (canvas.clientWidth - 80) / counts.length - 18);
    const height = (count / max) * 105;
    ctx.fillStyle = index % 2 ? "#f4c95d" : "#67e8c9";
    ctx.fillRect(x, 126 - height, width, height);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--muted");
    ctx.font = "12px system-ui";
    ctx.fillText(platform, x, 148);
    ctx.fillText(String(count), x + width / 2 - 3, 116 - height);
  });
}

function renderInterestList() {
  const max = Math.max(1, ...state.listings.map((l) => l.interest || 0));
  document.getElementById("interestList").innerHTML = [...state.listings].sort((a, b) => b.interest - a.interest).slice(0, 5).map((l) => `
    <div class="rank-item"><strong>${escapeHtml(l.title)}</strong><span class="tag">${l.interest || 0} sinais</span><div><span style="width:${((l.interest || 0) / max) * 100}%"></span></div></div>
  `).join("");
}

function renderActivity() {
  const items = [
    ...state.conversations.map((c) => ({ date: c.createdAt, text: `${c.platform}: ${c.category} com ${c.buyer}` })),
    ...state.listings.map((l) => ({ date: l.updatedAt, text: `${l.status}: ${l.title}` }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7);
  document.getElementById("activityList").innerHTML = items.map((item) => `<div class="activity-item">${escapeHtml(item.text)}<br><small>${new Date(item.date).toLocaleString("pt-PT")}</small></div>`).join("");
}

function renderConversionMetrics() {
  const categories = countBy(state.conversations, "category");
  const platforms = countBy(state.conversations, "platform");
  const hours = state.conversations.map((c) => new Date(c.createdAt).getHours());
  const bestHour = hours.length ? `${mode(hours)}h-${mode(hours) + 1}h` : "Sem dados";
  const rows = [
    ["Respostas mais eficazes", topLibrary()],
    ["Categorias mais usadas", topCount(categories)],
    ["Perguntas frequentes", topCount(categories)],
    ["Peças mais procuradas", bestInterest()],
    ["Melhores horários", bestHour],
    ["Melhores plataformas", topCount(platforms) || bestPlatform()]
  ];
  document.getElementById("conversionMetrics").innerHTML = rows.map(([label, value]) => `<div class="rank-item"><span>${label}</span><h3>${escapeHtml(String(value || "Sem dados"))}</h3></div>`).join("");
}

function renderGenerated() {
  const root = document.getElementById("generatedResults");
  if (!generated) {
    root.innerHTML = `<div class="result-card"><h3>Pronto para gerar</h3><p>Preenche o formulário e gera títulos, descrições, preços, plano de manutenção e variações de republicação.</p></div>`;
    return;
  }
  const cards = [
    sectionCard("Títulos", generated.titles),
    sectionCard("Descrições", generated.descriptions),
    simpleCard("Preços", generated.prices.map(([a, b]) => `${a}: ${b}`).join("\n")),
    simpleCard("Plano 7 dias", generated.plan.join("\n")),
    sectionCard("Republicação", generated.reposts),
    simpleCard("Honestidade", generated.safety.join("\n"))
  ];
  root.innerHTML = cards.join("");
  bindCopyButtons();
}

function sectionCard(title, items) {
  return `<article class="result-card"><h3>${escapeHtml(title)}</h3>${items.map((item) => `<p><strong>${escapeHtml(item.label)}</strong><br>${escapeHtml(item.text)}</p><button class="small-btn" data-copy="${escapeAttr(item.text)}">Copiar</button>`).join("")}</article>`;
}

function simpleCard(title, text) {
  return `<article class="result-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text).replace(/\n/g, "<br>")}</p><button class="small-btn" data-copy="${escapeAttr(text)}">Copiar</button></article>`;
}

function renderListingSelect() {
  document.getElementById("responseListing").innerHTML = state.listings.map((l) => `<option value="${l.id}">${escapeHtml(l.title)}</option>`).join("");
}

function renderListings() {
  const status = document.getElementById("statusFilter").value || "todos";
  const listings = filteredListings().filter((l) => status === "todos" || l.status === status);
  document.getElementById("savedListings").innerHTML = listings.map((listing) => `
    <article class="listing-card">
      <h3>${escapeHtml(listing.title)}</h3>
      <div class="tag-row">
        <span class="tag">${escapeHtml(listing.platform)}</span>
        <span class="tag">${escapeHtml(listing.status)}</span>
        <span class="tag">${euro(listing.targetPrice)}</span>
        <span class="tag">${escapeHtml(listing.style)}</span>
      </div>
      <p>${escapeHtml(listing.description)}</p>
      <div class="card-actions">
        <button class="small-btn" data-copy="${escapeAttr(listing.title + "\n\n" + listing.description)}">Copiar</button>
        <button class="small-btn" data-edit="${listing.id}">Editar</button>
        <button class="small-btn" data-duplicate="${listing.id}">Duplicar</button>
        <button class="small-btn" data-version="${listing.id}">Nova versão</button>
        <button class="small-btn" data-reply="${listing.id}">Respostas</button>
        <button class="small-btn" data-republish="${listing.id}">Republicar</button>
        <button class="small-btn" data-sold="${listing.id}">Vendido</button>
        <button class="small-btn" data-export-listing="${listing.id}">JSON</button>
      </div>
    </article>
  `).join("");
  bindListingActions();
  bindCopyButtons();
}

function bindListingActions() {
  document.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => {
    const listing = state.listings.find((l) => l.id === button.dataset.edit);
    fillFormFromListing(listing);
    generated = buildGenerated(listing);
    renderGenerated();
    document.querySelector("[data-view='generator']").click();
    showToast("Anúncio carregado no gerador");
  }));
  document.querySelectorAll("[data-duplicate]").forEach((button) => button.addEventListener("click", () => {
    const original = state.listings.find((l) => l.id === button.dataset.duplicate);
    state.listings.unshift({ ...original, id: uid(), title: `${original.title} (cópia)`, status: "ativo", updatedAt: new Date().toISOString() });
    saveState();
    renderAll();
    showToast("Anúncio duplicado");
  }));
  document.querySelectorAll("[data-version]").forEach((button) => button.addEventListener("click", () => {
    const listing = state.listings.find((l) => l.id === button.dataset.version);
    generated = buildGenerated(listing);
    renderGenerated();
    document.querySelector("[data-view='generator']").click();
  }));
  document.querySelectorAll("[data-reply]").forEach((button) => button.addEventListener("click", () => {
    document.getElementById("responseListing").value = button.dataset.reply;
    document.querySelector("[data-view='responses']").click();
  }));
  document.querySelectorAll("[data-republish]").forEach((button) => button.addEventListener("click", () => updateListingStatus(button.dataset.republish, "republicar")));
  document.querySelectorAll("[data-sold]").forEach((button) => button.addEventListener("click", () => updateListingStatus(button.dataset.sold, "vendido")));
  document.querySelectorAll("[data-export-listing]").forEach((button) => button.addEventListener("click", () => {
    const listing = state.listings.find((l) => l.id === button.dataset.exportListing);
    download(`${slugify(listing.title)}.json`, JSON.stringify(listing, null, 2));
  }));
}

function fillFormFromListing(listing) {
  const form = document.getElementById("listingForm");
  ["platform", "type", "weight", "measure", "condition", "targetPrice", "minPrice", "material", "confirmed", "mark925", "style", "sourceUrl", "notes"].forEach((name) => {
    if (form.elements[name]) form.elements[name].value = listing[name] ?? "";
  });
  form.elements.photoLinks.value = (listing.photoLinks || []).join("\n");
  selectedPhotos = [];
  renderPhotos();
  updateSafety();
}

function updateListingStatus(id, status) {
  const listing = state.listings.find((l) => l.id === id);
  listing.status = status;
  listing.updatedAt = new Date().toISOString();
  saveState();
  renderAll();
  showToast("Estado atualizado");
}

function generateResponses() {
  const message = document.getElementById("buyerMessage").value;
  const category = detectIntent(message);
  const lang = document.getElementById("responseLang").value;
  const tone = document.getElementById("responseTone").value;
  currentResponses = buildResponses(category, lang, tone);
  document.getElementById("intentBox").innerHTML = `<h3>${escapeHtml(category)}</h3><p>${intentExplanation(category)}</p>`;
  document.getElementById("responseResults").innerHTML = currentResponses.map((text) => `
    <article class="result-card"><p>${escapeHtml(text)}</p><button class="small-btn" data-copy="${escapeAttr(text)}">Copiar</button><button class="small-btn" data-favorite="${escapeAttr(text)}">Favorito</button></article>
  `).join("");
  bindCopyButtons();
  document.querySelectorAll("[data-favorite]").forEach((button) => button.addEventListener("click", () => {
    state.responseLibrary.unshift({ id: uid(), category, lang, tone, uses: 0, favorite: true, text: button.dataset.favorite });
    saveState();
    renderLibrary();
    showToast("Resposta guardada");
  }));
}

function detectIntent(message) {
  const text = message.toLowerCase();
  if (/(prata|925|silver)/.test(text)) return "autenticidade";
  if (/(desconto|mínimo|minimo|proposta|baixar)/.test(text)) return "desconto";
  if (/(disponível|disponivel|ainda tem)/.test(text)) return "disponibilidade";
  if (/reservar/.test(text)) return "reserva";
  if (/(envio|espanha|portes)/.test(text)) return "envio";
  if (/(mais peças|mais pecas|conjunto|pack)/.test(text)) return "cross-sell";
  return "urgência suave";
}

function buildResponses(category, lang, tone) {
  const base = RESPONSE_TEMPLATES[lang] || RESPONSE_TEMPLATES["Português PT"];
  return base[category].map((text) => adjustTone(text, tone, lang));
}

function adjustTone(text, tone, lang = "Português PT") {
  const suffix = {
    "Português PT": {
      curto: "",
      neutro: "",
      premium: " Ao vivo tem uma presença muito bonita.",
      persuasivo: " Se gostar mesmo dela, é uma boa peça para garantir agora.",
      cauteloso: " Prefiro ser transparente para evitar qualquer dúvida.",
      "fecho de venda": " Posso deixar tudo pronto para envio assim que finalizar."
    },
    Espanhol: {
      curto: "",
      neutro: "",
      premium: " En persona tiene mucha presencia.",
      persuasivo: " Si te gusta de verdad, es una buena pieza para reservar ahora.",
      cauteloso: " Prefiero explicarlo con total claridad para evitar dudas.",
      "fecho de venda": " Puedo dejarlo todo listo para el envío cuando finalices."
    },
    Inglês: {
      curto: "",
      neutro: "",
      premium: " It has a very strong presence in person.",
      persuasivo: " If you really like it, it is a good piece to secure now.",
      cauteloso: " I prefer to be fully transparent so there are no doubts.",
      "fecho de venda": " I can have it ready to ship as soon as you complete the purchase."
    }
  };
  return `${text}${suffix[lang]?.[tone] || ""}`;
}

function saveConversation() {
  const listing = state.listings.find((l) => l.id === document.getElementById("responseListing").value) || state.listings[0];
  const message = document.getElementById("buyerMessage").value;
  const category = detectIntent(message);
  const response = currentResponses[0] || buildResponses(category, document.getElementById("responseLang").value, document.getElementById("responseTone").value)[0];
  state.conversations.unshift({
    id: uid(),
    buyer: document.getElementById("buyerName").value || "Comprador",
    platform: listing.platform,
    question: message,
    response,
    listingId: listing.id,
    category,
    result: document.getElementById("conversationResult").value,
    createdAt: new Date().toISOString()
  });
  listing.responsesSent = Number(listing.responsesSent || 0) + 1;
  if (category === "desconto") listing.proposals = Number(listing.proposals || 0) + 1;
  listing.updatedAt = new Date().toISOString();
  saveState();
  renderAll();
  showToast("Conversa guardada no CRM");
}

function renderCrm() {
  const rows = state.conversations.map((c) => {
    const listing = state.listings.find((l) => l.id === c.listingId);
    return `<tr><td>${escapeHtml(c.buyer)}</td><td>${escapeHtml(c.platform)}</td><td>${escapeHtml(c.category)}</td><td>${escapeHtml(listing?.title || "Sem artigo")}</td><td>${escapeHtml(c.question)}</td><td>${escapeHtml(c.response)}</td><td>${escapeHtml(c.result)}</td></tr>`;
  }).join("");
  document.getElementById("crmTable").innerHTML = `<table><thead><tr><th>Comprador</th><th>Plataforma</th><th>Categoria</th><th>Artigo</th><th>Pergunta</th><th>Resposta</th><th>Resultado</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderLibrary() {
  document.getElementById("responseLibrary").innerHTML = state.responseLibrary.map((item) => `
    <article class="library-item">
      <div class="tag-row"><span class="tag ${item.favorite ? "ok" : ""}">${item.favorite ? "Favorita" : "Resposta"}</span><span class="tag">${escapeHtml(item.category)}</span><span class="tag">${escapeHtml(item.lang)}</span><span class="tag">${escapeHtml(item.tone)}</span></div>
      <p>${escapeHtml(item.text)}</p>
      <button class="small-btn" data-copy="${escapeAttr(item.text)}">Copiar</button>
    </article>
  `).join("");
  bindCopyButtons();
}

function bindCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.onclick = () => copyText(button.dataset.copy, "Copiado");
  });
}

function copyText(text, message) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text || "").then(() => showToast(message));
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text || "";
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  showToast(message);
}

function generatedText() {
  if (!generated) return "";
  return [
    "TÍTULOS", ...generated.titles.map((i) => `${i.label}: ${i.text}`),
    "\nDESCRIÇÕES", ...generated.descriptions.map((i) => `${i.label}: ${i.text}`),
    "\nPREÇOS", ...generated.prices.map(([a, b]) => `${a}: ${b}`),
    "\nPLANO", ...generated.plan,
    "\nREPUBLICAÇÃO", ...generated.reposts.map((i) => `${i.label}: ${i.text}`)
  ].join("\n");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function addActivityConversation(text, listingId) {
  state.conversations.unshift({ id: uid(), buyer: "Sistema", platform: "App", question: text, response: "Guardado em localStorage", listingId, category: "atividade", result: "interessado", createdAt: new Date().toISOString() });
}

function bestPlatform() { return topCount(countBy(state.listings, "platform")) || "Sem dados"; }
function bestInterest() { return [...state.listings].sort((a, b) => (b.interest || 0) - (a.interest || 0))[0]?.title || "Sem dados"; }
function bestSoldType() { return topCount(countBy(state.listings.filter((l) => l.status === "vendido"), "type")) || "Ainda sem vendas"; }
function topLibrary() { return [...state.responseLibrary].sort((a, b) => b.uses - a.uses)[0]?.text.slice(0, 70) || "Sem dados"; }
function countBy(items, key) { return items.reduce((acc, item) => (acc[item[key]] = (acc[item[key]] || 0) + 1, acc), {}); }
function topCount(obj) { return Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0]; }
function mode(items) { return Number(topCount(countBy(items.map((value) => ({ value })), "value")) || 18); }
function getMetricsRows() { return state.platforms.map((platform) => ({ platform, anuncios: state.listings.filter((l) => l.platform === platform).length })); }
function euro(value) { return `${Math.round(Number(value) || 0)}€`; }
function capitalize(text) { return `${text.charAt(0).toUpperCase()}${text.slice(1)}`; }
function slugify(text) { return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function download(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function toCsv(rows) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  return [keys.join(","), ...rows.map((row) => keys.map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`).join(","))].join("\n");
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}
function escapeAttr(value) { return escapeHtml(value).replace(/\n/g, "&#10;"); }
function uid() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function clone(value) {
  return globalThis.structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}
function intentExplanation(category) {
  const map = {
    autenticidade: "Pergunta sobre prata, 925 ou silver. Responder com clareza e sem prometer o que não está confirmado.",
    desconto: "Pedido de mínimo, proposta ou desconto. Defender valor e abrir pequena margem.",
    disponibilidade: "Pergunta simples de disponibilidade. Resposta curta e pronta para fecho.",
    reserva: "Pedido de reserva. Aceitar com limite suave.",
    envio: "Dúvida sobre portes ou envio. Confirmar processo pela plataforma.",
    "cross-sell": "Interesse em conjunto ou pack. Sugerir combinação de peças.",
    "urgência suave": "Mensagem genérica. Usar urgência leve sem pressão excessiva."
  };
  return map[category];
}
