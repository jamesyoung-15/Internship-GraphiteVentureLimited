#include <SFDFSensor.h> // Own custom library, need <ModbusMaster.h>
#include "SIM7600_AWS.h" // Own custom library, need <ArduinoJson.h>



// Serial 2 uses pin 16 (U2RX) and 17 (U2TX) on ESP32 Dev C Wroom, for this example for AWS
#define RXD2 16
#define TXD2 17

// Serial 1, pin 18 (U1RX) and 19 (U1TX), for this example used for sensors
#define RXD1 18
#define TXD1 19


// ModMaster Nodes, for getting data with modbus
ModbusMaster node_ec;
ModbusMaster node_ph;
ModbusMaster node_do;

sensorNodes nodes(&node_ec,&node_ph,&node_do);



// Create class instance
SIM7600AWS aws(&Serial2, &Serial);

void setup() 
{


    // Start Serial port
    Serial.begin(115200);
    Serial.println("ESP32 + SIM7600 -> AWS Example.");

    // Start serial port to SIM7600 with RXD2 and TXD2
    Serial2.begin (115200, SERIAL_8N1, RXD2, TXD2);

    aws.disconnectAWS();
    delay(1000);
    
    // make sure you configured the module beforehand and pass the correct matching file names
    aws.configureSSL("cacert","clientcert","clientkey");
    delay(1000);

    // replace with your own endpoint
    aws.connectAWS("client01", "a5sswhj5ru4gy-ats.iot.us-east-2.amazonaws.com");
    delay(1000);

    // Start serial 1
    Serial1.begin(9600, SERIAL_8N1, RXD1, TXD1);
    delay(1000);

    // Start sensor modmaster nodes
    node_ph.begin(1, Serial1);
    node_ec.begin(2, Serial1);
    node_do.begin(3, Serial1);


  

}

void loop() 
{

    // example of sending some sensor datas
    double ph = nodes.readPh();
    double ec = nodes.readEC();
    double do_data = nodes.readDO();
    double temperature = nodes.readTemperature();
    aws.sendSensorData("sfdf/client01/sensor_data", ph,do_data,ec,temperature);

    delay(10000);

}