const currentUser =
  JSON.parse(sessionStorage.getItem("currentUser")) || null;

const greetingEl = document.getElementById("greeting");
const countEl = document.getElementById("count");

// If not logged in → go back
if (!currentUser) {
  window.location.href = "login.html";
}

// Personal greeting
greetingEl.textContent = `Welcome, ${currentUser.name}!`;


// Countdown redirect
let seconds = 3;

const timer = setInterval(() => {
  seconds--;
  countEl.textContent = seconds;

  if (seconds === 0) {
    clearInterval(timer);
    window.location.href = "index.html";
  }
}, 1000);
