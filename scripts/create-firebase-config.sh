#!/usr/bin/env bash
set -eu

: "${FIREBASE_API_KEY:?FIREBASE_API_KEY is required}"
: "${FIREBASE_AUTH_DOMAIN:?FIREBASE_AUTH_DOMAIN is required}"
: "${FIREBASE_PROJECT_ID:?FIREBASE_PROJECT_ID is required}"
: "${FIREBASE_STORAGE_BUCKET:?FIREBASE_STORAGE_BUCKET is required}"
: "${FIREBASE_MESSAGING_SENDER_ID:?FIREBASE_MESSAGING_SENDER_ID is required}"
: "${FIREBASE_APP_ID:?FIREBASE_APP_ID is required}"

cat > leaderboard/firebase-config.js <<EOF
export const firebaseConfig = {
  apiKey: "$FIREBASE_API_KEY",
  authDomain: "$FIREBASE_AUTH_DOMAIN",
  projectId: "$FIREBASE_PROJECT_ID",
  storageBucket: "$FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "$FIREBASE_MESSAGING_SENDER_ID",
  appId: "$FIREBASE_APP_ID",
  measurementId: "${FIREBASE_MEASUREMENT_ID:-}",
};
EOF
