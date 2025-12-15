import { API, state } from "./state.js";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`);
  return res.json();
}

export async function loadAllPokemonIndex() {
  const data = await fetchJSON(`${API}/pokemon?limit=100000&offset=0`);
  state.allIndex = data.results;
}

export async function loadPokemonTypes() {
  const data = await fetchJSON(`${API}/type?limit=1000`);
  return data.results; // [{ name, url }]
}

export async function getIndexByType(type) {
  if (!type) return state.allIndex;

  if (state.typeIndexCache.has(type)) {
    return state.typeIndexCache.get(type);
  }

  const data = await fetchJSON(`${API}/type/${type}`);
  const list = data.pokemon.map((p) => p.pokemon);

  state.typeIndexCache.set(type, list);
  return list;
}

export async function getPokemonDetails(name) {
  if (state.detailsCache.has(name)) return state.detailsCache.get(name);

  const data = await fetchJSON(`${API}/pokemon/${name}`);
  state.detailsCache.set(name, data);
  return data;
}
