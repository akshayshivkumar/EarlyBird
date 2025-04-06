let alarmTime = null;
let alarmOn = false;
let alarmRinging = false;
let alarmInterval;

const lastSleepData = {
  cycles: 0,
  lightSleep: 0,
  deepSleep: 0,
};

/**
 * Displays the specified page and hides all others.
 */
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

function initCustomTimePicker() {
  const hoursSelect = document.getElementById("hours");
  const minutesSelect = document.getElementById("minutes");
  const ampmSelect = document.getElementById("ampm");

  for (let h = 1; h <= 12; h++) {
    const option = document.createElement("option");
    option.value = h;
    option.textContent = h;
    hoursSelect.appendChild(option);
  }

  for (let m = 0; m < 60; m++) {
    const option = document.createElement("option");
    const val = m < 10 ? "0" + m : m;
    option.value = val;
    option.textContent = val;
    minutesSelect.appendChild(option);
  }

  hoursSelect.value = "8";
  minutesSelect.value = "00";
  ampmSelect.value = "AM";
}

function getSelectedTime() {
  const now = new Date();
  const hoursSelect = document.getElementById("hours");
  const minutesSelect = document.getElementById("minutes");
  const ampmSelect = document.getElementById("ampm");

  let hours = Number.parseInt(hoursSelect.value);
  const minutes = Number.parseInt(minutesSelect.value);
  const ampm = ampmSelect.value;

  if (ampm === "PM" && hours < 12) {
    hours += 12;
  }
  if (ampm === "AM" && hours === 12) {
    hours = 0; // 12 AM is 00 in 24-hour
  }

  const selectedTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );
  return selectedTime;
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

// Add a global variable to store the *exact* user-chosen wake time (not the predicted).
let userChosenWakeTime = null;

function startSleep(option) {
  let wakeTime;
  const napMode = document.getElementById("napMode").checked;
  const useEEG = document.getElementById("eegData").checked;
  const shortNap = document.getElementById("shortNap").checked;

  // If user clicks "Choose For Me"
  if (option === "now") {
    const now = new Date();
    if (napMode) {
      // Nap logic ...
      const napDuration = shortNap ? Math.random() * 10 + 20 : 90;
      wakeTime = new Date(now.getTime() + napDuration * 60000);
    } else {
      // Normal sleep ...
      wakeTime = new Date(now.getTime() + (14 + 90) * 60000);
    }
  } else {
    // If user set time manually
    wakeTime = getSelectedTime();
    const now = new Date();
    if (wakeTime <= now) {
      wakeTime.setDate(wakeTime.getDate() + 1);
    }
  }

  // Store the user-chosen time (i.e., the 'inputted' wake time before cycle adjustments)
  userChosenWakeTime = new Date(wakeTime.getTime());

  // Calculate the predicted / final alarm time
  const result = calculatePredictedWakeTime(wakeTime, napMode, shortNap);
  alarmTime = result.predictedTime;

  // Show the predicted alarm time and cycles
  document.getElementById("predictedTime").innerText = formatTime(alarmTime);
  document.getElementById("feasibleCycles").innerText = result.cycles;

  // Compute the one-hour-earlier window
  const windowStart = new Date(userChosenWakeTime.getTime() - 60 * 60 * 1000);
  const windowEnd = userChosenWakeTime;
  document.getElementById("wakeUpWindow").innerText =
    formatTime(windowStart) + " - " + formatTime(windowEnd);

  // Go to the Sleep Monitoring page
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
    const napDuration = isShortNap ? Math.random() * 10 + 20 : 90; // 20-30 min for short nap, 90 for long
    const cycles = isShortNap ? 0 : 1; // Short naps don't complete a full cycle

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

function formatTime(date) {
  const hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  let hours12 = hours % 12;
  hours12 = hours12 ? hours12 : 12; // convert hour '0' to '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return hours12 + ":" + minutes + " " + ampm;
}

function checkAlarm() {
  const now = new Date();
  const timeRemaining = alarmTime - now;

  // If time's up, ring alarm and fade LED
  if (alarmOn && timeRemaining <= 0) {
    ringAlarm();
    clearInterval(alarmInterval);
    fadeLEDLocally(); // Trigger the LED fade
    return;
  }

  // Otherwise, update countdown
  if (timeRemaining > 0) {
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    const hoursStr = String(hours).padStart(2, "0");
    const minutesStr = String(minutes).padStart(2, "0");
    const secondsStr = String(seconds).padStart(2, "0");

    document.getElementById(
      "countdown"
    ).innerText = `${hoursStr}:${minutesStr}:${secondsStr}`;
  } else {
    document.getElementById("countdown").innerText = "00:00:00";
  }
}

function ringAlarm() {
  const audio = document.getElementById("alarmAudio");
  if (!alarmRinging) {
    alarmRinging = true;
    audio.play();

    // Add visual pulsing effect to the page
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

function manualWake() {
  stopAlarm();
  fetch("http://localhost:3000/off")
    .then((response) => response.text())
    .then((data) => console.log(data))
    .catch((err) => console.error("Error calling local server:", err));
  document.getElementById("countdown").innerText = "--:--:--";
  transitionToFeedback();
}

function toggleAlarm() {
  const audio = document.getElementById("alarmAudio");
  const now = new Date();
  if (alarmRinging) {
    stopAlarm();
    // transitionToFeedback();
  } else {
    if (alarmOn && now >= alarmTime) {
      alarmRinging = true;
      audio.play();
    } else {
      alert("Alarm is not active yet.");
    }
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

function transitionToFeedback() {
  showPage("page3");
}

function submitFeedback(feedback) {
  console.log("User feedback:", feedback);
  // Generate new random analytics data
  lastSleepData.cycles = Math.floor(Math.random() * 5) + 3;
  lastSleepData.lightSleep = Math.floor(Math.random() * 120) + 60;
  lastSleepData.deepSleep = Math.floor(Math.random() * 60) + 30;

  showAnalytics();
}

function showAnalytics() {
  document.getElementById("sleepCycles").innerText = lastSleepData.cycles;
  document.getElementById("lightSleep").innerText = lastSleepData.lightSleep;
  document.getElementById("deepSleep").innerText = lastSleepData.deepSleep;

  showPage("page4");
}

function restart() {
  showPage("page1");
  alarmOn = false;
  alarmRinging = false;
  clearInterval(alarmInterval);
}

/*Calls the local server to fade the LED*/
function fadeLEDLocally() {
  fetch("http://localhost:3000/fade")
    .then((response) => response.text())
    .then((data) => {
      console.log("Local server response:", data);
    })
    .catch((err) => {
      console.error("Error calling local server:", err);
    });
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

  initCustomTimePicker();
  showPage("page1");

  document
    .getElementById("napMode")
    .addEventListener("change", toggleNapOptions);
});
