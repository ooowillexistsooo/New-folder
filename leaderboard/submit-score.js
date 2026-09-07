import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { addDoc, collection, getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6UVO1FE3OSExrk4BuIe5fuTUqQK6uyrA",
  authDomain: "wasabi-b3f9c.firebaseapp.com",
  projectId: "wasabi-b3f9c",
  storageBucket: "wasabi-b3f9c.firebasestorage.app",
  messagingSenderId: "123829633285",
  appId: "1:123829633285:web:9e530c536d3ab9f686776c",
};

const app = initializeApp(firebaseConfig, "score-submitter");
const db = getFirestore(app);
export const auth = getAuth(app);
let resolveAuthReady;
const authReady = new Promise((resolve) => {
  resolveAuthReady = resolve;
});

onAuthStateChanged(auth, (user) => resolveAuthReady(user));

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email, password, username) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: username });
  return credential;
}

export function signOutUser() {
  return signOut(auth);
}

export async function submitScore(game, score) {
  const user = auth.currentUser || await authReady;
  if (!user) {
    return;
  }
  const username = user.displayName || user.email || "signed-in player";
  try {
    await addDoc(collection(db, "scores"), {
      username,
      score,
      game,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error(`Could not submit ${game} score:`, error);
  }
}
