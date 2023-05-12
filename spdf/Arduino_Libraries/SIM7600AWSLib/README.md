# ESP32 to SIM7600 to AWS
This is a Arduino library that helps with controlling a SIM7600 module from a ESP32. It mainly is for connecting to AWS MQTT IoT core. 

## Libraries Needed
- Arduino-ESP32 Library
- ArduinoJson

Arduino-ESP32 Library as this library was written for ESP32. Also I used ArduinoJson library for formatting sensor data (not really needed, you can do this outside the library and pass it as a String in the general send to AWS function).

## Usage