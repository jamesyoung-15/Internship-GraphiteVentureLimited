/* 
Main reference: https://espressif-docs.readthedocs-hosted.com/projects/arduino-esp32/en/latest/api/espnow.html 

  Flow: Master
  Step 1 : ESPNow Init on Master and set it in STA mode
  Step 2 : Start scanning for Slave ESP32 (we have added a prefix of `slave` to the SSID of slave for an easy setup)
  Step 3 : Once found, add Slave as peer
  Step 4 : Register for send callback
  Step 5 : Start Transmitting data from Master to Slave

  Flow: Slave
  Step 1 : ESPNow Init on Slave
  Step 2 : Update the SSID of Slave with a prefix of `slave`
  Step 3 : Set Slave in AP mode
  Step 4 : Register for receive callback and wait for data
  Step 5 : Once data arrives, print it in the serial monitor

*/

#include "ESP32NowLib.h"


ESP32Now::ESP32Now(int channel):channel(channel) {}


void ESP32Now::ESPNowStartMaster(void (&onDataSent)(const uint8_t *mac_addr, esp_now_send_status_t status))
{
      // Set ESP32 as a Wi-Fi Station
    WiFi.mode(WIFI_STA);

    // use only one channel
    esp_wifi_set_channel(channel, WIFI_SECOND_CHAN_NONE);

    // Init ESPNow with a fallback logic
    InitESPNow();

    // Callback function
    esp_now_register_send_cb(onDataSent);
}

void ESP32Now::ESPNowStartSlave(String ssid, void (&onDataRec)(const uint8_t *mac_addr, const uint8_t *data, int data_len))
{
    slaveName = ssid;
    WiFi.mode(WIFI_AP);
    bool result = WiFi.softAP(ssid, "Slave_1_Password", channel, 0);


    if (!result) 
    {
      Serial.println("AP Config failed.");
    } 
    else 
    {
      Serial.println("AP Config Success. Broadcasting with AP: " + String(SSID));
      Serial.print("AP CHANNEL "); Serial.println(WiFi.channel());
    }

    InitESPNow();

     // Callback function
    esp_now_register_recv_cb(onDataRec);
}

void ESP32Now::InitESPNow() 
{
  WiFi.disconnect();
  if (esp_now_init() == ESP_OK) {
    Serial.println("ESPNow Init Success");
  }
  else {
    Serial.println("ESPNow Init Failed");
    // Retry InitESPNow, add a counte and then restart?
    // InitESPNow();
    // or Simply Restart
    ESP.restart();
  }
}


bool ESP32Now::ScanForSlave(String name) {
  int16_t scanResults = WiFi.scanNetworks(false, false, false, 300, channel); // Scan only on one channel
  // reset on each scan
  bool slaveFound = 0;
  memset(&slave, 0, sizeof(slave));

  Serial.println("");
  if (scanResults == 0) 
  {
    Serial.println("No WiFi devices in AP Mode found");
  } 
  else 
  {
    // Serial.print("Found "); Serial.print(scanResults); Serial.println(" devices ");

    for (int i = 0; i < scanResults; ++i) {
      // Print SSID and RSSI for each device found
      String SSID = WiFi.SSID(i);
      int32_t RSSI = WiFi.RSSI(i);
      String BSSIDstr = WiFi.BSSIDstr(i);

      //   Serial.print(i + 1);
      //   Serial.print(": ");
      //   Serial.print(SSID);
      //   Serial.print(" (");
      //   Serial.print(RSSI);
      //   Serial.print(")");
      //   Serial.println("");
    
      delay(10);
      // Check if the current device starts with `Slave`
      if (SSID.indexOf(name) == 0) {
        
        // SSID of interest
        Serial.println("Found a Slave.");
        Serial.print(i + 1); Serial.print(": "); Serial.print(SSID); Serial.print(" ["); Serial.print(BSSIDstr); Serial.print("]"); Serial.print(" ("); Serial.print(RSSI); Serial.print(")"); Serial.println("");
        
        // Get BSSID => Mac Address of the Slave
        int mac[6];
        if ( 6 == sscanf(BSSIDstr.c_str(), "%x:%x:%x:%x:%x:%x",  &mac[0], &mac[1], &mac[2], &mac[3], &mac[4], &mac[5] ) ) {
          for (int ii = 0; ii < 6; ++ii ) {
            slave.peer_addr[ii] = (uint8_t) mac[ii];
          }
        }

        slave.channel = channel; // pick a channel
        slave.encrypt = 0; // no encryption

        slaveFound = 1;
        // we are planning to have only one slave in this example;
        // Hence, break after we find one, to be a bit efficient
        break;
      }
    }
  }

  if (slaveFound) {
    Serial.println("Slave Found, processing..");

  } 
  else {
    Serial.println("Slave Not Found, trying again.");
  }
    // clean up ram
  WiFi.scanDelete();

  return slaveFound;

}


bool ESP32Now::manageSlave() 
{
  if (slave.channel == channel) {
    // if (DELETEBEFOREPAIR) {
    //   deletePeer();
    // }

    Serial.print("Slave Status: ");
    // check if the peer exists
    bool exists = esp_now_is_peer_exist(slave.peer_addr);
    if ( exists) {
      // Slave already paired.
      Serial.println("Already Paired");
      return true;
    } 
    else {
      // Slave not paired, attempt pair
      esp_err_t addStatus = esp_now_add_peer(&slave);
      if (addStatus == ESP_OK) {
        // Pair success
        Serial.println("Pair success");
        return true;
      } else if (addStatus == ESP_ERR_ESPNOW_NOT_INIT) {
        // How did we get so far!!
        Serial.println("ESPNOW Not Init");
        return false;
      } else if (addStatus == ESP_ERR_ESPNOW_ARG) {
        Serial.println("Invalid Argument");
        return false;
      } else if (addStatus == ESP_ERR_ESPNOW_FULL) {
        Serial.println("Peer list full");
        return false;
      } else if (addStatus == ESP_ERR_ESPNOW_NO_MEM) {
        Serial.println("Out of memory");
        return false;
      } else if (addStatus == ESP_ERR_ESPNOW_EXIST) {
        Serial.println("Peer Exists");
        return true;
      } else {
        Serial.println("Not sure what happened");
        return false;
      }
    }
  } else {
    // No slave found to process
    Serial.println("No Slave found to process");
    return false;
  }
}

void ESP32Now::deletePeer() {
  esp_err_t delStatus = esp_now_del_peer(slave.peer_addr);
  Serial.print("Slave Delete Status: ");
  if (delStatus == ESP_OK) {
    // Delete success
    Serial.println("Success");
  } else if (delStatus == ESP_ERR_ESPNOW_NOT_INIT) {
    // How did we get so far!!
    Serial.println("ESPNOW Not Init");
  } else if (delStatus == ESP_ERR_ESPNOW_ARG) {
    Serial.println("Invalid Argument");
  } else if (delStatus == ESP_ERR_ESPNOW_NOT_FOUND) {
    Serial.println("Peer not found.");
  } else {
    Serial.println("Not sure what happened");
  }
}

/* 
Brief: Send data based on passed paramter to ESP-NOW slave if connected
Paramter: Data is a string of the data to be sent, change paramter to another data type if desired such as struct
*/
void ESP32Now::sendData(String data) {

  const uint8_t *peer_addr = slave.peer_addr;
  Serial.print("Sending: "); Serial.println(data);
  esp_err_t result = esp_now_send(peer_addr, (uint8_t*)&data, sizeof(data));
  
  
  
  Serial.print("Send Status: ");
  if (result == ESP_OK) {
    Serial.println("Success");
  } else if (result == ESP_ERR_ESPNOW_NOT_INIT) {
    // How did we get so far!!
    Serial.println("ESPNOW not Init.");
  } else if (result == ESP_ERR_ESPNOW_ARG) {
    Serial.println("Invalid Argument");
  } else if (result == ESP_ERR_ESPNOW_INTERNAL) {
    Serial.println("Internal Error");
  } else if (result == ESP_ERR_ESPNOW_NO_MEM) {
    Serial.println("ESP_ERR_ESPNOW_NO_MEM");
  } else if (result == ESP_ERR_ESPNOW_NOT_FOUND) {
    Serial.println("Peer not found.");
  } else {
    Serial.println("Not sure what happened");
  }
}


