const express = require("express");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const SERIAL_PORT = "/dev/cu.usbserial-0001";
const BAUD_RATE = 115200;

const app = express();
const port = 3000;

const serialPort = new SerialPort({
  path: SERIAL_PORT,
  baudRate: BAUD_RATE,
});
const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));

parser.on("data", (line) => {
  console.log("ESP32 says:", line);
});

app.get("/fade", (req, res) => {
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
