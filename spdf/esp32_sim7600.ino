#include <ModbusMaster.h>
#include <ArduinoJson.h>

#define RXD2 16
#define TXD2 17

void setup() {
  // put your setup code here, to run once:

  // Start hardware serial
  Serial.begin(115200);
  while (!Serial) {; } // wait for serial port to connect. Needed for native USB port only
  delay(500);
  // start software serial2, for testing
  Serial2.begin (115200, SERIAL_8N1, RXD2, TXD2);
  delay(5000);
  // Example: Write AT command and get response, should return OK in serial
  Serial2.println("AT");
  print_serial();
  delay(500);
  // disconnect_aws();
  delay(500);



  // Configure SSL
  configure_ssl();
  delay(1000);
  // Connect AWS
  connect_aws();
  delay(1000);

  delay(2000);
}

void loop() {
  // put your main code here, to run repeatedly:
  send_data();
  delay(30000);

}

// Print Sim7600 from software serial response to Serial port
void print_serial()
{
  while (Serial2.available()) 
  {
    Serial.println(Serial2.readString());
  }
}

// Return sim7600 response as a string, for cases like when wanting to compare response to expected response
String get_response()
{
  String response;

  response = Serial2.readString();

  response.trim();
  return response;
}

// Configure the SSL
void configure_ssl()
{
  // remember for double quotes " use escape sequence \ when sending string like this \"

  // Set the SSL version of the first SSL context
  Serial2.println("AT+CSSLCFG=\"sslversion\",0,4");

  // Set the authentication mode to verify server and client
  Serial2.println("AT+CSSLCFG=\"authmode\",0,2");

  // Set the server root CA of the first SSL contex
  Serial2.println("AT+CSSLCFG=\"cacert\",0,\"cacert.pem\"");

  // Set the client certificate of the first SSL context
  Serial2.println("AT+CSSLCFG=\"clientcert\",0,\"clientcert.pem\"");
    
  // Set the client key of the first SSL context
  Serial2.println("AT+CSSLCFG=\"clientkey\",0,\"clientkey.pem\"");

}

// Connect to AWS
void connect_aws()
{
  // start MQTT service
  Serial2.println("AT+CMQTTSTART");
  print_serial();
  delay(100);

  // Acquire one client which will connect to a SSL/TLS MQTT server
  Serial2.println("AT+CMQTTACCQ=0,\"client01\",1");
  print_serial();
  delay(100);

  // Set the first SSL context to be used in the SSL connection
  Serial2.println("AT+CMQTTSSLCFG=0,0");
  print_serial();
  delay(100);

  // Connect to a MQTT server, in this case aws
  Serial.println("AT+CMQTT Connect");
  Serial2.println("AT+CMQTTCONNECT=0,\"tcp://a5sswhj5ru4gy-ats.iot.us-east-2.amazonaws.com:8883\",60,1");
  print_serial();
  print_serial();
  delay(2000);
}

void disconnect_aws()
{
  // disconnect from server
  Serial2.println("AT+CMQTTDISC=0,120");
  print_serial();
  delay(50);

  // release client
  Serial2.println("AT+CMQTTREL=0");
  print_serial();
  delay(50);

  // stop mqtt service
  Serial2.println("AT+CMQTTSTOP");
  print_serial();
  delay(50);
}

// Create MQTT topic, create json, send payload
void send_data()
{
  // Set the topic for the PUBLISH message
  String topic = "sfdf/client01";
  Serial.println("AT+CMQTTTOPIC=0,"+String(topic.length()));
  Serial2.println("AT+CMQTTTOPIC=0,"+String(topic.length())); // 21 is length of topic name
  delay(20);
  Serial2.println(topic); // input topic name
  print_serial();
  delay(300);

  // create json document
   StaticJsonDocument<200> doc;
   // create nested json object data
  JsonObject data = doc.createNestedObject("data");
  // add sensor data to object data
  data["pH"] = 8.96;
  data["EC"] = 3.67;
  data["DO"] = 2.04;
  data["Temp"] = 24.2;
  data["DateTime"] = get_time();
  // convert json to string
  String message;
  serializeJson(doc, message);
  Serial.println("\n"+message);

  // Set the payload for the PUBLISH message
  Serial2.println("AT+CMQTTPAYLOAD=0," + String(message.length())); 
  delay(20);
  Serial2.println(message); // send payload
  print_serial();
  delay(300);

  // Publish message
  Serial2.println("AT+CMQTTPUB=0,1,60");  
}

// compare response to expected response
String get_time()
{
  Serial2.println("AT+CCLK?");
  String temp = get_response();
  String s = temp.substring(19,36);
  Serial.println(s);
  return s;
}