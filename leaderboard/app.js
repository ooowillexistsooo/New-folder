import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { firebaseConfig } from "./firebase-config.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  observeAuth,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
} from "./submit-score.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const leaderboardBody = document.getElementById("leaderboard-body");
const formStatus = document.getElementById("form-status");
const gameTitle = document.getElementById("game-title");
const scoreHeading = document.getElementById("score-heading");
const scoreHelp = document.getElementById("score-help");
const authStatus = document.getElementById("auth-status");
const authControls = document.getElementById("auth-controls");
const usernameInput = document.getElementById("username-input");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const signInButton = document.getElementById("sign-in-button");
const signUpButton = document.getElementById("sign-up-button");
let currentUser = null;

const games = {
  reaction: { title: "reaction time", label: "Time", unit: "milliseconds", direction: "asc", help: "fastest time wins" },
  sudoku: { title: "sudoku", label: "Time", unit: "seconds", direction: "asc", help: "fastest solve wins" },
  minesweeper: { title: "minesweeper", label: "Time", unit: "seconds", direction: "asc", help: "fastest clear wins" },
  solitaire: { title: "solitaire", label: "Time", unit: "seconds", direction: "asc", help: "fastest win wins" },
  snake: { title: "snake", label: "Score", unit: "points", direction: "desc", help: "most points wins" },
  stack: { title: "stack", label: "Score", unit: "points", direction: "desc", help: "most points wins" },
  word: { title: "word", label: "Score", unit: "points", direction: "desc", help: "most points wins" },
  toe: { title: "tic tac toe", label: "Score", unit: "points", direction: "desc", help: "most points wins" },
  wrong: { title: "wrong", label: "Score", unit: "points", direction: "desc", help: "most points wins" },
  all: { title: "all games", label: "Score", unit: "points or time", direction: "desc", help: "top scores from every game" },
};

observeAuth((user) => {
  currentUser = user;
  authStatus.textContent = user ? `signed in as ${user.displayName || user.email}` : "not signed in";
  authControls.hidden = Boolean(user);
  if (user) {
    const signOutButton = document.createElement("button");
    signOutButton.id = "sign-out-button";
    signOutButton.type = "button";
    signOutButton.textContent = "sign out";
    authStatus.textContent = `signed in as ${user.displayName || user.email} `;
    authStatus.appendChild(signOutButton);
    signOutButton.addEventListener("click", async () => {
      await signOutUser();
      formStatus.textContent = "signed out.";
    });
  }
});

async function authenticate(action) {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const username = usernameInput.value.trim();
  if (!email || !password || (action === "sign-up" && !username)) {
    formStatus.textContent = action === "sign-up"
      ? "enter a username, email, and password."
      : "enter your email and password.";
    return;
  }
  signInButton.disabled = true;
  signUpButton.disabled = true;
  try {
    if (action === "sign-up") {
      await signUpWithEmail(email, password, username);
      formStatus.textContent = "account created and signed in.";
    } else {
      await signInWithEmail(email, password);
      formStatus.textContent = "signed in. scores can now be saved.";
    }
  } catch (error) {
    console.error("Authentication failed:", error);
    formStatus.textContent = error.code === "auth/email-already-in-use"
      ? "that email already has an account. sign in instead."
      : "authentication failed. check your details and try again.";
  } finally {
    signInButton.disabled = false;
    signUpButton.disabled = false;
  }
}

signInButton.addEventListener("click", () => authenticate("sign-in"));
signUpButton.addEventListener("click", () => authenticate("sign-up"));

let selectedGame = "reaction";
let unsubscribe = null;

function updateGameDetails() {
  const game = games[selectedGame];
  gameTitle.textContent = game.title;
  scoreHeading.textContent = game.label;
  scoreHelp.textContent = game.help;
}

function renderScores(snapshot) {
  leaderboardBody.innerHTML = "";
  let rank = 0;
  snapshot.forEach((doc) => {
    const data = doc.data();
    rank++;
    const row = document.createElement("tr");
    const game = games[data.game] || games.reaction;
    row.innerHTML = `<td>${rank}</td><td>${data.username}</td><td><strong>${data.score}</strong> <small>${game.unit}</small></td>`;
    leaderboardBody.appendChild(row);
  });
  if (rank === 0) {
    leaderboardBody.innerHTML = '<tr><td colspan="3" class="empty-state">no scorey dorey.</td></tr>';
  }
}

function subscribeToScores() {
  if (unsubscribe) unsubscribe();
  const game = games[selectedGame];
  const scores = collection(db, "scores");
  const scoreQuery = query(scores, orderBy("score", game.direction), limit(100));
  unsubscribe = onSnapshot(scoreQuery, (snapshot) => {
    const scoresForGame = [];
    snapshot.forEach((doc) => {
      if (selectedGame === "all" || (doc.data().game || "reaction") === selectedGame) {
        scoresForGame.push(doc);
      }
    });
    renderScores(scoresForGame.slice(0, 10));
  }, () => {
    formStatus.textContent = "could not load scores right now.";
  });
}

document.querySelectorAll(".game-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    selectedGame = tab.dataset.game;
    document.querySelectorAll(".game-tab").forEach((item) => item.classList.toggle("active", item === tab));
    updateGameDetails();
    subscribeToScores();
  });
});

updateGameDetails();
subscribeToScores();
