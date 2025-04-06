let alarmTime = null;
let alarmOn = false; // Indicates if an alarm is scheduled
let alarmRinging = false; // Indicates if the alarm sound is playing
let alarmInterval;

// We'll store the last night's data here, so the Analytics page can show it.
let lastSleepData = {
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
    page.style.display = "none";
  });
  document.getElementById(pageId).style.display = "block";
}

/**
 * Initializes our custom time picker (hours, minutes, AM/PM).
 * We'll call this once DOM content is loaded.
 */
function initCustomTimePicker() {
  const hoursSelect = document.getElementById("hours");
  const minutesSelect = document.getElementById("minutes");
  const ampmSelect = document.getElementById("ampm");

  // Populate hours [1..12]
  for (let h = 1; h <= 12; h++) {
    const option = document.createElement("option");
    option.value = h;
    option.textContent = h;
    hoursSelect.appendChild(option);
  }

  // Populate minutes [00..59]
  for (let m = 0; m < 60; m++) {
    const option = document.createElement("option");
    const val = m < 10 ? "0" + m : m;
    option.value = val;
    option.textContent = val;
    minutesSelect.appendChild(option);
  }

  // By default set the time to 8:00 AM
  hoursSelect.value = "8";
  minutesSelect.value = "00";
  ampmSelect.value = "AM";
}

/**
 * Extracts the time from our custom time picker <select> elements
 * and returns a Date object representing *today’s* date with that time.
 * If the selected time has already passed, we'll handle that logic in startSleep().
 */
function getSelectedTime() {
  const now = new Date();
  const hoursSelect = document.getElementById("hours");
  const minutesSelect = document.getElementById("minutes");
  const ampmSelect = document.getElementById("ampm");

  let hours = parseInt(hoursSelect.value);
  const minutes = parseInt(minutesSelect.value);
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

/**
 * Starts the sleep flow based on user input or "now".
 */
function startSleep(option) {
  let wakeTime;
  if (option === "now") {
    // Sleep Now: set wake-up time to now + 14 min + one 90-min cycle
    const now = new Date();
    wakeTime = new Date(now.getTime() + (14 + 90) * 60000);
  } else {
    // Use the custom time picker
    wakeTime = getSelectedTime();

    // If the selected time has already passed today, assume it’s for tomorrow
    const now = new Date();
    if (wakeTime <= now) {
      wakeTime.setDate(wakeTime.getDate() + 1);
    }
  }

  // Calculate the predicted wake-up time
  const result = calculatePredictedWakeTime(wakeTime);
  alarmTime = result.predictedTime;

  // Update UI
  document.getElementById("predictedTime").innerText = formatTime(alarmTime);
  document.getElementById("feasibleCycles").innerText = result.cycles;

  // Go to the Sleep Monitoring page
  showPage("page2");

  // Start checking for alarm condition every second
  alarmOn = true;
  alarmInterval = setInterval(checkAlarm, 1000);
}

/**
 * Predicts the wake-up time considering 14 min to fall asleep + 90-min cycles.
 */
function calculatePredictedWakeTime(desiredWakeTime) {
  const now = new Date();
  // 14 minutes to fall asleep
  const fallAsleepTime = new Date(now.getTime() + 14 * 60000);

  let remainingMinutes = (desiredWakeTime - fallAsleepTime) / 60000;
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

/**
 * Formats a Date object into 12-hour time with AM/PM.
 */
function formatTime(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  let hours12 = hours % 12;
  hours12 = hours12 ? hours12 : 12; // convert hour '0' to '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return hours12 + ":" + minutes + " " + ampm;
}

/**
 * Checks if the alarm time has been reached.
 */
function checkAlarm() {
  const now = new Date();
  if (alarmOn && now >= alarmTime) {
    ringAlarm();
    clearInterval(alarmInterval);
  }
}

/**
 * Plays the alarm sound if not already playing.
 */
function ringAlarm() {
  const audio = document.getElementById("alarmAudio");
  if (!alarmRinging) {
    alarmRinging = true;
    audio.play();
  }
}

/**
 * Allows the user to manually wake up (stop alarm if ringing)
 * and move on to feedback.
 */
function manualWake() {
  stopAlarm();
  fetch("http://localhost:3000/off")
    .then((response) => response.text())
    .then((data) => console.log(data));
  document.getElementById("countdown").innerText = "--:--:--";
  transitionToFeedback();
}

/**
 * Toggles the alarm sound on/off if the alarm time has passed.
 */
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

/**
 * Stops the alarm if it’s playing.
 */
function stopAlarm() {
  const audio = document.getElementById("alarmAudio");
  if (alarmRinging) {
    audio.pause();
    audio.currentTime = 0;
    alarmRinging = false;
  }
}

/**
 * Moves from the Monitoring page (page2) to the Feedback page (page3).
 */
function transitionToFeedback() {
  showPage("page3");
}

/**
 * Submits user feedback, logs it, and transitions to Analytics (page4).
 */
function submitFeedback(feedback) {
  console.log("User feedback:", feedback);
  // Generate new random analytics data
  lastSleepData.cycles = Math.floor(Math.random() * 5) + 3;
  lastSleepData.lightSleep = Math.floor(Math.random() * 120) + 60;
  lastSleepData.deepSleep = Math.floor(Math.random() * 60) + 30;

  showAnalytics();
}

/**
 * Displays the most recent night of sleep analytics on page4.
 */
function showAnalytics() {
  document.getElementById("sleepCycles").innerText = lastSleepData.cycles;
  document.getElementById("lightSleep").innerText = lastSleepData.lightSleep;
  document.getElementById("deepSleep").innerText = lastSleepData.deepSleep;

  showPage("page4");
}

/**
 * Resets the app and returns to the Home page (page1).
 */
function restart() {
  showPage("page1");
  alarmOn = false;
  alarmRinging = false;
  clearInterval(alarmInterval);
}

/**
 * Once everything loads, populate the custom time picker.
 */
document.addEventListener("DOMContentLoaded", () => {
  initCustomTimePicker();
  showPage("page1");
});

function checkAlarm() {
  const now = new Date();
  const timeRemaining = alarmTime - now;

  // If time’s up, ring alarm and fade LED
  if (alarmOn && timeRemaining <= 0) {
    ringAlarm();
    clearInterval(alarmInterval);
    fadeLEDLocally(); // Trigger the LED fade
    return; // Then exit the function
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
