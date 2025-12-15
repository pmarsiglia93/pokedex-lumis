import { state, TYPE_PT, debounce } from "./state.js";
import { loadAllPokemonIndex, loadPokemonTypes, getIndexByType, getPokemonDetails } from "./api.js";
import { setStatus, renderCards, renderPagination } from "./ui.js";

const el = {
  grid: document.querySelector("#grid"),
  status: document.querySelector("#status"),
  search: document.querySelector("#searchInput"),
  type: document.querySelector("#typeSelect"),
  prev: document.querySelector("#prevBtn"),
  next: document.querySelector("#nextBtn"),
  pages: document.querySelector("#pages"),
};

function filterBySearch(list) {
  const q = state.search.trim().toLowerCase();
  if (!q) return list;
  return list.filter((p) => p.name.includes(q));
}

function totalPages(totalItems) {
  return Math.max(1, Math.ceil(totalItems / state.pageSize));
}

function slicePage(list) {
  const start = (state.page - 1) * state.pageSize;
  return list.slice(start, start + state.pageSize);
}

async function render() {
  try {
    setStatus(el.status, "Carregando...");

    const baseIndex = await getIndexByType(state.type);
    const filtered = filterBySearch(baseIndex);

    const pages = totalPages(filtered.length);
    if (state.page > pages) state.page = pages;

    const current = slicePage(filtered);
    const details = await Promise.all(current.map((p) => getPokemonDetails(p.name)));

    setStatus(el.status, "", false);
    renderCards(el.grid, el.status, details);

    renderPagination(el.pages, el.prev, el.next, state, pages, (p) => {
      state.page = p;
      void render();
    });
  } catch (e) {
    console.error(e);
    setStatus(el.status, "Erro ao carregar dados. Tente novamente.", true);
  }
}

async function initTypes() {
  const allTypes = await loadPokemonTypes();
  const allowed = allTypes.map((t) => t.name).filter((name) => TYPE_PT[name]);

  for (const name of allowed) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = TYPE_PT[name];
    el.type.appendChild(opt);
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
  await Promise.all([initTypes(), loadAllPokemonIndex()]);
  await render();
}

init();
