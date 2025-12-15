export const API = "https://pokeapi.co/api/v2";

export const TYPE_PT = {
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

export const state = {
  page: 1,
  pageSize: 18, // 3 linhas x 6 cards (desktop do Figma)
  search: "",
  type: "",
  allIndex: [],
  typeIndexCache: new Map(),
  detailsCache: new Map(),
};

export function debounce(fn, ms = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function capitalizeName(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatPokemonId(id) {
  return "#" + String(id).padStart(4, "0");
}
