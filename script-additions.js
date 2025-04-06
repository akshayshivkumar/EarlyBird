let alarmRinging = false;

function showPage(pageId) {
  const pages = document.querySelectorAll(".page");

  pages.forEach((page) => {
    page.style.opacity = "0";
    setTimeout(() => {
      page.style.display = "none";
    }, 300);
  });

  setTimeout(() => {
    const targetPage = document.getElementById(pageId);
    targetPage.style.display = "block";

    void targetPage.offsetWidth;

    targetPage.style.opacity = "1";

    updateTopBarTheme(targetPage.classList.contains("daytime"));
  }, 350);
}

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

function ringAlarm() {
  const audio = document.getElementById("alarmAudio");
  if (!alarmRinging) {
    alarmRinging = true;
    audio.play();

    const page = document.getElementById("page2");
    page.classList.add("alarm-active");

    const pulseEffect = setInterval(() => {
      page.style.backgroundColor = "rgba(246, 114, 128, 0.2)";
      setTimeout(() => {
        page.style.backgroundColor = "";
      }, 500);
    }, 1000);

    window.pulseEffectInterval = pulseEffect;
  }
}

function stopAlarm() {
  const audio = document.getElementById("alarmAudio");
  if (alarmRinging) {
    audio.pause();
    audio.currentTime = 0;
    alarmRinging = false;

    const page = document.getElementById("page2");
    page.classList.remove("alarm-active");

    if (window.pulseEffectInterval) {
      clearInterval(window.pulseEffectInterval);
    }
  }
}

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

  function initCustomTimePicker() {
    console.log("initCustomTimePicker called");
  }

  initCustomTimePicker();
  showPage("page1");
});
