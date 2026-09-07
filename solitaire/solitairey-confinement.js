import { submitScore } from "../leaderboard/submit-score.js";

const suits = [
  { name: "hearts", symbol: "♥", color: "red" },
  { name: "diamonds", symbol: "♦", color: "red" },
  { name: "clubs", symbol: "♣", color: "black" },
  { name: "spades", symbol: "♠", color: "black" },
];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const columns = Array.from(document.querySelectorAll(".column"));
const foundationElement = document.getElementById("foundations");
const stockElement = document.getElementById("stock");
const wasteElement = document.getElementById("waste");
const timerElement = document.getElementById("timer");
const statusElement = document.getElementById("status");
const newGameButton = document.getElementById("new-game");

let stock = [];
let waste = [];
let tableau = [[], [], [], [], [], [], []];
let foundations = {};
let selected = null;
let startedAt = null;
let timerId = null;
let gameOver = false;

function createDeck() {
  return suits.flatMap((suit) => values.map((value, rank) => ({
    value,
    rank: rank + 1,
    suit,
    faceUp: false,
  })));
}

function shuffle(cards) {
  for (let index = cards.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [cards[index], cards[randomIndex]] = [cards[randomIndex], cards[index]];
  }
  return cards;
}

function startTimer() {
  if (startedAt !== null) return;
  startedAt = performance.now();
  timerId = setInterval(() => {
    timerElement.textContent = `time: ${Math.floor((performance.now() - startedAt) / 1000)}s`;
  }, 250);
}

function cardMarkup(card) {
  return `<span>${card.value} ${card.suit.symbol}</span><span class="suit-bottom">${card.value} ${card.suit.symbol}</span>`;
}

function makeCardElement(card, clickHandler) {
  const element = document.createElement("div");
  element.className = `card ${card.suit.color === "red" ? "red" : ""} ${card.faceUp ? "" : "face-down"}`;
  if (card.faceUp) element.innerHTML = cardMarkup(card);
  element.addEventListener("click", (event) => {
    event.stopPropagation();
    clickHandler();
  });
  return element;
}

function render() {
  columns.forEach((column, columnIndex) => {
    column.innerHTML = "";
    tableau[columnIndex].forEach((card, cardIndex) => {
      const element = makeCardElement(card, () => handleTableauCardClick(columnIndex, cardIndex));
      element.style.top = `${cardIndex * 24}px`;
      if (selected?.source === "tableau" && selected.columnIndex === columnIndex && cardIndex >= selected.cardIndex) {
        element.classList.add("selected");
      }
      column.appendChild(element);
    });
    column.onclick = () => handleTableauDestination(columnIndex);
  });

  stockElement.classList.toggle("empty", stock.length === 0);
  stockElement.textContent = stock.length ? "↻" : "";
  wasteElement.innerHTML = "";
  const wasteCard = waste.at(-1);
  if (wasteCard) wasteElement.appendChild(makeCardElement(wasteCard, () => handleWasteClick()));

  foundationElement.innerHTML = "";
  suits.forEach((suit) => {
    const pile = document.createElement("button");
    pile.type = "button";
    pile.className = "pile foundation";
    pile.dataset.suit = suit.name;
    const topCard = foundations[suit.name].at(-1);
    pile.textContent = topCard ? `${topCard.value} ${suit.symbol}` : suit.symbol;
    pile.classList.toggle("red", suit.color === "red");
    pile.addEventListener("click", () => handleFoundationClick(suit.name));
    foundationElement.appendChild(pile);
  });
}

function validTableauSequence(cards) {
  return cards.every((card, index) => index === 0 || (
    card.faceUp && card.suit.color !== cards[index - 1].suit.color && card.rank === cards[index - 1].rank - 1
  ));
}

function canPlaceOnTableau(card, target) {
  return target.length === 0 ? card.rank === 13 : (
    target.at(-1).faceUp && target.at(-1).suit.color !== card.suit.color && target.at(-1).rank === card.rank + 1
  );
}

function canPlaceOnFoundation(card, suitName) {
  const pile = foundations[suitName];
  return card.suit.name === suitName && (pile.length === 0 ? card.rank === 1 : pile.at(-1).rank + 1 === card.rank);
}

function select(source, card, details) {
  startTimer();
  selected = { source, card, ...details };
  render();
}

function handleTableauCardClick(columnIndex, cardIndex) {
  const card = tableau[columnIndex][cardIndex];
  if (!card.faceUp) return;
  if (selected) {
    handleTableauDestination(columnIndex);
    return;
  }
  const movingCards = tableau[columnIndex].slice(cardIndex);
  if (validTableauSequence(movingCards)) select("tableau", card, { columnIndex, cardIndex });
}

function handleWasteClick() {
  if (!waste.length) return;
  if (selected) {
    selected = null;
    render();
    return;
  }
  select("waste", waste.at(-1), {});
}

function handleTableauDestination(targetIndex) {
  if (!selected) return;
  const movingCards = selected.source === "tableau"
    ? tableau[selected.columnIndex].slice(selected.cardIndex)
    : [selected.card];
  if (!canPlaceOnTableau(movingCards[0], tableau[targetIndex])) {
    selected = null;
    render();
    return;
  }

  if (selected.source === "tableau") {
    tableau[selected.columnIndex].splice(selected.cardIndex);
    revealTopCard(selected.columnIndex);
  } else {
    waste.pop();
  }
  tableau[targetIndex].push(...movingCards);
  selected = null;
  render();
}

function handleFoundationClick(suitName) {
  if (!selected) return;
  if (selected.source === "tableau" && selected.cardIndex !== tableau[selected.columnIndex].length - 1) {
    selected = null;
    render();
    return;
  }
  if (!canPlaceOnFoundation(selected.card, suitName)) {
    selected = null;
    render();
    return;
  }
  if (selected.source === "tableau") {
    tableau[selected.columnIndex].pop();
    revealTopCard(selected.columnIndex);
  } else {
    waste.pop();
  }
  foundations[suitName].push(selected.card);
  selected = null;
  render();
  checkWin();
}

function revealTopCard(columnIndex) {
  const topCard = tableau[columnIndex].at(-1);
  if (topCard) topCard.faceUp = true;
}

function drawFromStock() {
  startTimer();
  selected = null;
  if (stock.length) {
    const card = stock.pop();
    card.faceUp = true;
    waste.push(card);
  } else {
    stock = waste.reverse();
    waste = [];
    stock.forEach((card) => { card.faceUp = false; });
  }
  render();
}

function checkWin() {
  if (suits.every((suit) => foundations[suit.name].length === 13)) {
    gameOver = true;
    clearInterval(timerId);
    const elapsedSeconds = Math.max(1, Math.ceil((performance.now() - startedAt) / 1000));
    statusElement.textContent = `you won in ${elapsedSeconds}s!`;
    submitScore("solitaire", elapsedSeconds);
  }
}

function initGame() {
  clearInterval(timerId);
  stock = shuffle(createDeck());
  waste = [];
  tableau = [[], [], [], [], [], [], []];
  foundations = Object.fromEntries(suits.map((suit) => [suit.name, []]));
  selected = null;
  startedAt = null;
  gameOver = false;
  timerElement.textContent = "time: 0s";
  statusElement.textContent = ":)";

  for (let columnIndex = 0; columnIndex < 7; columnIndex++) {
    for (let cardIndex = 0; cardIndex <= columnIndex; cardIndex++) {
      const card = stock.pop();
      card.faceUp = cardIndex === columnIndex;
      tableau[columnIndex].push(card);
    }
  }
  stock.forEach((card) => { card.faceUp = false; });
  render();
}

stockElement.addEventListener("click", drawFromStock);
newGameButton.addEventListener("click", initGame);
initGame();
