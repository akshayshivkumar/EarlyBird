const express = require("express");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

// Replace 'COM3' with whichever port your ESP32 shows in Arduino IDE (Mac/Linux might be '/dev/ttyUSB0' or '/dev/cu.SLAB_USBtoUART')
const SERIAL_PORT = "/dev/cu.usbserial-0001";
const BAUD_RATE = 115200;

const app = express();
const port = 3000;

// Open serial port
const serialPort = new SerialPort({
  path: SERIAL_PORT,
  baudRate: BAUD_RATE,
});
const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));

// For debugging, log any data the ESP32 sends back
parser.on("data", (line) => {
  console.log("ESP32 says:", line);
});

// HTTP endpoint
app.get("/fade", (req, res) => {
  // Send "FADE\n" to the ESP32
  serialPort.write("FADE\n", (err) => {
    if (err) {
      console.error("Error writing to serial:", err);
      return res.status(500).send("Error writing to serial.");
    }
    console.log("Sent 'FADE' to ESP32");
    res.send("Triggering LED fade.");
  });
});

app.get("/off", (req, res) => {
  serialPort.write("OFF\n");
  res.send("Turning LEDs off...");
});

app.listen(port, () => {
  console.log(`Local server running on http://localhost:${port}`);
});
