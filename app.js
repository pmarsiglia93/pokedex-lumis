const API = "https://pokeapi.co/api/v2";

const el = {
  grid: document.querySelector("#grid"),
  status: document.querySelector("#status"),
  search: document.querySelector("#searchInput"),
  type: document.querySelector("#typeSelect"),
  prev: document.querySelector("#prevBtn"),
  next: document.querySelector("#nextBtn"),
  pages: document.querySelector("#pages"),
};

const state = {
  page: 1,
  pageSize: 18, // 3 linhas x 6 cards (igual Figma)
  search: "",
  type: "",
  allIndex: [],
  typeIndexCache: new Map(),
  detailsCache: new Map(),
};

const TYPE_PT = {
  normal: "Normal",
  fire: "Fogo",
  water: "Água",
  electric: "Elétrico",
  grass: "Planta",
  ice: "Gelo",
  fighting: "Lutador",
  poison: "Veneno",
  ground: "Terra",
  flying: "Voador",
  psychic: "Psíquico",
  bug: "Inseto",
  rock: "Pedra",
  ghost: "Fantasma",
  dragon: "Dragão",
  dark: "Sombrio",
  steel: "Aço",
  fairy: "Fada",
};

function debounce(fn, ms = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function setStatus(msg, show = true) {
  el.status.hidden = !show;
  el.status.textContent = msg || "";
}

function padId(id) {
  const s = String(id);
  return "#" + s.padStart(4, "0");
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`);
  return res.json();
}

async function loadAllIndex() {
  setStatus("Carregando lista de Pokémon...");
  const data = await fetchJSON(`${API}/pokemon?limit=100000&offset=0`);
  state.allIndex = data.results;
  setStatus("", false);
}

async function loadTypes() {
  const data = await fetchJSON(`${API}/type?limit=1000`);
  const types = data.results
    .map(t => t.name)
    .filter(name => TYPE_PT[name]);

  for (const name of types) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = TYPE_PT[name];
    el.type.appendChild(opt);
  }
}

async function getTypeIndex(type) {
  if (!type) return state.allIndex;

  if (state.typeIndexCache.has(type)) {
    return state.typeIndexCache.get(type);
  }

  setStatus("Carregando filtro por tipo...");
  const data = await fetchJSON(`${API}/type/${type}`);
  const list = data.pokemon.map(p => p.pokemon);
  state.typeIndexCache.set(type, list);

  setStatus("", false);
  return list;
}

async function getPokemonDetails(name) {
  if (state.detailsCache.has(name)) return state.detailsCache.get(name);

  const data = await fetchJSON(`${API}/pokemon/${name}`);
  state.detailsCache.set(name, data);
  return data;
}

function getFilteredList(baseList) {
  const q = state.search.trim().toLowerCase();
  if (!q) return baseList;
  return baseList.filter(p => p.name.includes(q));
}

function getTotalPages(totalItems) {
  return Math.max(1, Math.ceil(totalItems / state.pageSize));
}

function getPageSlice(list) {
  const start = (state.page - 1) * state.pageSize;
  return list.slice(start, start + state.pageSize);
}

function renderCards(detailsList) {
  el.grid.innerHTML = "";

  if (!detailsList.length) {
    setStatus("Nenhum Pokémon encontrado.", true);
    return;
  }

  for (const d of detailsList) {
    const mainType = d.types?.[0]?.type?.name || "normal";
    const img =
      d.sprites?.other?.["official-artwork"]?.front_default ||
      d.sprites?.front_default ||
      "";

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card__top">
        <span class="card__type">${TYPE_PT[mainType] || cap(mainType)}</span>
        <span class="card__id">${padId(d.id)}</span>
      </div>

      <div class="card__img">
        ${img ? `<img src="${img}" alt="${cap(d.name)}" loading="lazy" />` : ""}
      </div>

      <div class="card__name">${cap(d.name)}</div>
    `;

    el.grid.appendChild(card);
  }
}

function renderPagination(totalPages) {
  el.pages.innerHTML = "";

  el.prev.disabled = state.page <= 1;
  el.next.disabled = state.page >= totalPages;

  // igual o Figma: 1 2 3
  const windowSize = 3;
  const half = Math.floor(windowSize / 2);

  let start = Math.max(1, state.page - half);
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  for (let p = start; p <= end; p++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pagebtn" + (p === state.page ? " pagebtn--active" : "");
    btn.textContent = String(p);
    btn.addEventListener("click", () => {
      state.page = p;
      void render();
    });
    el.pages.appendChild(btn);
  }
}

async function render() {
  try {
    setStatus("Carregando...");

    const baseList = await getTypeIndex(state.type);
    const filtered = getFilteredList(baseList);

    const totalPages = getTotalPages(filtered.length);
    if (state.page > totalPages) state.page = totalPages;

    const pageItems = getPageSlice(filtered);

    const details = await Promise.all(pageItems.map(p => getPokemonDetails(p.name)));

    setStatus("", false);
    renderCards(details);
    renderPagination(totalPages);
  } catch (err) {
    console.error(err);
    setStatus("Erro ao carregar dados. Tente novamente.", true);
  }
}

function bindEvents() {
  el.search.addEventListener(
    "input",
    debounce((e) => {
      state.search = e.target.value;
      state.page = 1;
      void render();
    }, 250)
  );

  el.type.addEventListener("change", (e) => {
    state.type = e.target.value;
    state.page = 1;
    void render();
  });

  el.prev.addEventListener("click", () => {
    if (state.page > 1) {
      state.page -= 1;
      void render();
    }
  });

  el.next.addEventListener("click", () => {
    state.page += 1;
    void render();
  });
}

async function init() {
  bindEvents();
  await Promise.all([loadTypes(), loadAllIndex()]);
  await render();
}

init();
