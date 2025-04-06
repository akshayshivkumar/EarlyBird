#include <Arduino.h>

// Three pins for three LEDs
const int ledPins[3] = {5, 18, 19};

// For PWM
const int freq = 5000;       // 5 kHz
const int resolution = 8;    // 8-bit (values 0..255)
const int ledChannels[3] = {0, 1, 2}; // We need a unique LEDC channel per pin

void setup() {
  Serial.begin(115200);

  // Setup each LED pin on a separate channel
  for (int i = 0; i < 3; i++) {
    ledcSetup(ledChannels[i], freq, resolution);
    ledcAttachPin(ledPins[i], ledChannels[i]);
    // Start them off at 0
    ledcWrite(ledChannels[i], 0);
  }
  
  Serial.println("ESP32 with 3 LEDs ready. Listening on Serial...");
}

void loop() {
  // Check for serial commands (if you’re using USB bridging)
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command == "FADE") {
      fadeAllLEDs(); // Example: fade them on
    } else if (command == "OFF") {
      turnAllOff();
    }
    // You could add more commands as needed
  }
}

// Example function to fade all 3 LEDs from 0..255
void fadeAllLEDs() {
  for (int duty = 0; duty <= 255; duty++) {
    for (int i = 0; i < 3; i++) {
      ledcWrite(ledChannels[i], duty);
    }
    delay(75); // fade speed
  }
}

// Example function to turn all LEDs off
void turnAllOff() {
  for (int i = 0; i < 3; i++) {
    ledcWrite(ledChannels[i], 0); 
  }
}
