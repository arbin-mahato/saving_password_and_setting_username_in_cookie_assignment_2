const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById("pin");
const sha256HashView = document.getElementById("sha256-hash");
const resultView = document.getElementById("result");
const attemptsView = document.getElementById("attempts");
const resetBtn = document.getElementById("reset");
const checkBtn = document.getElementById("check");

let attempts = 0;
let correctPin = null;

// Storage helpers
const store = (key, value) => localStorage.setItem(key, value);
const retrieve = (key) => localStorage.getItem(key);
const clearStorage = () => localStorage.clear();

// Random 3-digit PIN as string
function getRandomPin() {
  return String(Math.floor(Math.random() * (MAX - MIN + 1)) + MIN);
}

// SHA-256 hashing
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(String(message));
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Init or retrieve stored hash
async function initHash() {
  let storedHash = retrieve("sha256");
  let storedPin = retrieve("pin");

  if (storedHash && storedPin) {
    correctPin = String(storedPin);
    return storedHash;
  }

  correctPin = getRandomPin();
  const newHash = await sha256(correctPin);

  store("pin", correctPin);
  store("sha256", newHash);
  store("attempts", "0");

  return newHash;
}

// Display hash and attempts
async function main() {
  sha256HashView.textContent = "Generating hash...";
  const hash = await initHash();
  sha256HashView.textContent = hash;
  attempts = parseInt(retrieve("attempts")) || 0;
  attemptsView.textContent = attempts;
}

// Validate user guess
async function validateGuess() {
  if (
    !sha256HashView.textContent ||
    sha256HashView.textContent.includes("Generating")
  ) {
    showResult("Please wait, hash not ready yet!", "error");
    return;
  }

  const pin = pinInput.value;
  if (pin.length !== 3) {
    showResult("Please enter exactly 3 digits", "error");
    return;
  }

  attempts++;
  store("attempts", attempts);
  attemptsView.textContent = attempts;

  const hashedInput = await sha256(pin);
  const currentHash = sha256HashView.textContent;

  if (hashedInput === currentHash) {
    showResult(`Correct! The PIN was ${correctPin}`, "success");
    disableInput(true);
  } else {
    showResult("Incorrect. Try again!", "error");
  }
}

// Show result message
function showResult(message, type) {
  resultView.textContent = message;
  resultView.classList.remove("hidden", "error", "success");
  resultView.classList.add(type);
}

// Reset game
function resetGame() {
  clearStorage();
  pinInput.value = "";
  pinInput.disabled = false;
  resultView.classList.add("hidden");
  checkBtn.disabled = false;
  main();
}

// Enable/disable input
function disableInput(disabled) {
  pinInput.disabled = disabled;
  checkBtn.disabled = disabled;
}

// Input restrictions
pinInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 3);
});

// Event listeners
checkBtn.addEventListener("click", validateGuess);
resetBtn.addEventListener("click", resetGame);

// Start
document.addEventListener("DOMContentLoaded", main);
