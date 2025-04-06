// Add these functions to your script.js file

// Declare alarmRinging variable
let alarmRinging = false;

// Enhanced page transition with fade effect
function showPage(pageId) {
  const pages = document.querySelectorAll(".page");

  // First fade out all pages
  pages.forEach((page) => {
    page.style.opacity = "0";
    setTimeout(() => {
      page.style.display = "none";
    }, 300);
  });

  // Then fade in the selected page
  setTimeout(() => {
    const targetPage = document.getElementById(pageId);
    targetPage.style.display = "block";

    // Force a reflow to ensure the transition works
    void targetPage.offsetWidth;

    targetPage.style.opacity = "1";

    // Update the top bar based on day/night theme
    updateTopBarTheme(targetPage.classList.contains("daytime"));
  }, 350);
}

// Update top bar theme based on current page
function updateTopBarTheme(isDaytime) {
  const topBar = document.querySelector(".top-bar");

  if (isDaytime) {
    topBar.style.backgroundColor = "rgba(0, 168, 168, 0.9)";
    topBar.style.borderBottom = "1px solid rgba(255, 255, 255, 0.2)";
  } else {
    topBar.style.backgroundColor = "rgba(0, 88, 122, 0.9)";
    topBar.style.borderBottom = "1px solid rgba(255, 255, 255, 0.1)";
  }
}

// Enhanced alarm animation
function ringAlarm() {
  const audio = document.getElementById("alarmAudio");
  if (!alarmRinging) {
    alarmRinging = true;
    audio.play();

    // Add visual pulsing effect to the page
    const page = document.getElementById("page2");
    page.classList.add("alarm-active");

    // Pulse the background
    const pulseEffect = setInterval(() => {
      page.style.backgroundColor = "rgba(246, 114, 128, 0.2)";
      setTimeout(() => {
        page.style.backgroundColor = "";
      }, 500);
    }, 1000);

    // Store the interval ID to clear it later
    window.pulseEffectInterval = pulseEffect;
  }
}

// Stop alarm with enhanced effects
function stopAlarm() {
  const audio = document.getElementById("alarmAudio");
  if (alarmRinging) {
    audio.pause();
    audio.currentTime = 0;
    alarmRinging = false;

    // Remove visual effects
    const page = document.getElementById("page2");
    page.classList.remove("alarm-active");

    // Clear the pulse interval
    if (window.pulseEffectInterval) {
      clearInterval(window.pulseEffectInterval);
    }
  }
}

// Add this CSS rule to your style.css file
document.addEventListener("DOMContentLoaded", () => {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    .alarm-active {
      animation: alarmPulse 1s infinite alternate;
    }
    
    @keyframes alarmPulse {
      0% {
        background-color: var(--night-background);
      }
      100% {
        background-color: rgba(246, 114, 128, 0.2);
      }
    }
  `;
  document.head.appendChild(styleElement);

  // Declare initCustomTimePicker variable (assuming it's a function)
  function initCustomTimePicker() {
    // Implementation of initCustomTimePicker function goes here
    // For example:
    console.log("initCustomTimePicker called");
  }

  // Initialize the app
  initCustomTimePicker();
  showPage("page1");
});
