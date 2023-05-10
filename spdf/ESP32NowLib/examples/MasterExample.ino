/*
    Main reference: https://espressif-docs.readthedocs-hosted.com/projects/arduino-esp32/en/latest/api/espnow.html

    << This Device Master >>

    Flow: Master
    Step 1 : ESPNow Init on Master and set it in STA mode
    Step 2 : Start scanning for Slave ESP32 (we have added a prefix of `slave` to the SSID of slave for an easy setup)
    Step 3 : Once found, add Slave as peer
    Step 4 : Register for send callback
    Step 5 : Start Transmitting data from Master to Slave 
   
*/

#include "ESP32NowLib.h"

// callback when data is sent from Master to Slave
void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) 
{
    char macStr[18];
    snprintf(macStr, sizeof(macStr), "%02x:%02x:%02x:%02x:%02x:%02x",
            mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5]);
    Serial.print("Last Packet Sent to: "); Serial.println(macStr);
    Serial.print("Last Packet Send Status: "); Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

// Create ESP32 Now node
ESP32Now espNode(1);


void setup() {
    // put your setup code here, to run once:
    Serial.begin(115200);
    Serial.println("ESPNow/Basic/Master Example");

    // Set ESP32 node to master, scan and look for slave node with name "Slave 1"
    espNode.ESPNowStartMaster(OnDataSent);
    espNode.ScanForSlave("Slave 1");
    bool isConnected = espNode.manageSlave();

}

void loop() {
    // put your main code here, to run repeatedly:
    espNode.sendData("PUMPON");
    delay(12000);
}
