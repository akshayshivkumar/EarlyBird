let alarmRinging = false;
let alarmTime;
let alarmOn = false;
let alarmInterval;

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

    const isDaytime = targetPage.classList.contains("daytime");
    updateTopBarTheme(isDaytime);
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

function toggleNapOptions() {
  const napCheckbox = document.getElementById("napMode");
  const napOptions = document.getElementById("napOptions");

  if (napCheckbox.checked) {
    napOptions.style.display = "block";
  } else {
    napOptions.style.display = "none";
  }
}

function startSleep(option) {
  let wakeTime;
  const napMode = document.getElementById("napMode").checked;
  const useEEG = document.getElementById("eegData").checked;
  const shortNap = document.getElementById("shortNap").checked;

  if (option === "now") {
    const now = new Date();

    if (napMode) {
      const napDuration = shortNap ? Math.random() * 10 + 20 : 90;
      wakeTime = new Date(now.getTime() + napDuration * 60000);
    } else {
      wakeTime = new Date(now.getTime() + (14 + 90) * 60000);
    }
  } else {
    wakeTime = getSelectedTime();
    const now = new Date();
    if (wakeTime <= now) {
      wakeTime.setDate(wakeTime.getDate() + 1);
    }
  }

  const result = calculatePredictedWakeTime(wakeTime, napMode, shortNap);
  alarmTime = result.predictedTime;

  document.getElementById("predictedTime").innerText = formatTime(alarmTime);
  document.getElementById("feasibleCycles").innerText = result.cycles;

  showPage("page2");

  alarmOn = true;
  alarmInterval = setInterval(checkAlarm, 1000);

  console.log(
    `Sleep settings: Nap Mode: ${napMode}, Short Nap: ${shortNap}, EEG Data: ${useEEG}`
  );
}

function calculatePredictedWakeTime(
  desiredWakeTime,
  isNap = false,
  isShortNap = true
) {
  const now = new Date();

  if (isNap) {
    const napDuration = isShortNap ? Math.random() * 10 + 20 : 90;
    const cycles = isShortNap ? 0 : 1;

    const predictedTime = new Date(now.getTime() + napDuration * 60000);

    return { predictedTime, cycles };
  } else {
    const fallAsleepTime = new Date(now.getTime() + 14 * 60000);

    const remainingMinutes = (desiredWakeTime - fallAsleepTime) / 60000;
    let cycles = Math.floor(remainingMinutes / 90);

    if (cycles < 1) {
      cycles = 0;
      return { predictedTime: desiredWakeTime, cycles };
    }
    const predictedTime = new Date(
      fallAsleepTime.getTime() + cycles * 90 * 60000
    );
    return { predictedTime, cycles };
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

  document
    .getElementById("napMode")
    .addEventListener("change", toggleNapOptions);
});

function getSelectedTime() {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now;
}

function formatTime(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  const strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

function checkAlarm() {
  if (!alarmOn) return;

  const now = new Date();
  if (now >= alarmTime) {
    ringAlarm();
    clearInterval(alarmInterval);
  }
}
