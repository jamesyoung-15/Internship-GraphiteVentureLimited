# Internship at Graphite Venture Limited
My work during my internship with Graphite Venture Limited as an IoT intern. Most of my work there was to help with developing IoT water sensors but was also assigned various other tasks.

## SFDF Sensors
Worked on reading sensor data from various water sensors (eg. pH, DO, etc.) and sending those data to AWS. Sensor data obtained through ESP32 microcontroller and data sent to AWS through a SIM7600G module. The ESP32 can also connect to another ESP32 through ESP-Now and send commands to it with a master-slave connection.

My work is packaged into these 3 custom Arduino libraries I wrote:

Library for working with ESP-Now: [ESPNowLib](./spdf/Arduino_Libraries/ESP32NowLib/)

Library for working with SFDF-sensors: [SFDFSensorLib](./spdf/Arduino_Libraries/SFDFSensorLib/)

Library for working with SIM7600 module with ESP32: [SIM7600AWSLib](./spdf/Arduino_Libraries/SIM7600AWSLib/)


Main Arduino code for the SFDF Project using the three libraries above: [sfdf.ino](https://github.com/jamesyoung-15/XDreamVenture-Intern/blob/main/spdf/sfdf.ino)

Documentation: [Link](https://github.com/jamesyoung-15/XDreamVenture-Intern/blob/main/spdf/README.md)


## Simple ROS GUI
Worked on a simple ROS GUI example to control ROS robot with virtual joystick and display camera stream. Mainly uses roslibjs for connecting to ROS and website uses basic HTML, CSS, and javascript.