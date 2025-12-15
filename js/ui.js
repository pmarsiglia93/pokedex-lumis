import { TYPE_PT, capitalizeName, formatPokemonId } from "./state.js";

export function setStatus(elStatus, msg, show = true) {
  elStatus.hidden = !show;
  elStatus.textContent = msg || "";
}

export function renderCards(elGrid, elStatus, detailsList) {
  elGrid.innerHTML = "";

  if (!detailsList.length) {
    setStatus(elStatus, "Nenhum Pokémon encontrado.", true);
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
        <span class="card__type">${TYPE_PT[mainType] || capitalizeName(mainType)}</span>
        <span class="card__id">${formatPokemonId(d.id)}</span>
      </div>

      <div class="card__img">
        ${img ? `<img src="${img}" alt="${capitalizeName(d.name)}" loading="lazy" />` : ""}
      </div>

      <div class="card__name">${capitalizeName(d.name)}</div>
    `;

    elGrid.appendChild(card);
  }
}

export function renderPagination(elPages, elPrev, elNext, state, totalPages, onGoToPage) {
  elPages.innerHTML = "";

  elPrev.disabled = state.page <= 1;
  elNext.disabled = state.page >= totalPages;

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
    btn.addEventListener("click", () => onGoToPage(p));
    elPages.appendChild(btn);
  }
}
