# Pokedex Lumis (Vanilla JS)

## Tecnologias
- HTML5
- CSS3 (Grid + responsividade)
- Vanilla JavaScript
- PokéAPI (REST)

## Funcionalidades
- Listagem de Pokémon
- Busca por nome (sem recarregar a página)
- Filtro por tipo
- Paginação (sem recarregar a página)
- Cache em memória para reduzir chamadas à API

## Como executar
### Opção 1 (Python)
python -m http.server 5173

Acesse: http://localhost:5173

### Opção 2 (Node)
npx serve .

## Observações
- Foi usado cache em memória para evitar múltiplas requisições repetidas aos mesmos Pokémon.
