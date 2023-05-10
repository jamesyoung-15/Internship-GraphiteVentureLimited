/* Main reference: https://espressif-docs.readthedocs-hosted.com/projects/arduino-esp32/en/latest/api/espnow.html  */

#ifndef ESP32NOWLIB_H
#define ESP32NOWLIB_H

 

// Arduino Libraries
#include <Arduino.h>
#include <ArduinoJson.h>


class ESP32Now
{
    private:
        int channel;
        esp_now_peer_info_t slave;
        String slaveName;

    public:

        /**!
        * @brief Class constructor initializes channel as will be only using single channel
        * @param Wi-Fi channel to use
        */
        ESP32Now(int channel);

        /**!
        * @brief: Class constructor initializes channel as will be only using single channel
        * @param: Callback function that tells what to do when message is sent
        */
        void ESPNowStartMaster(void (&func)(const uint8_t *mac_addr, esp_now_send_status_t status));

        /**!
        * @brief: Start a slave node
        * @param: String of SSID name of slave you wish to set, 
        * @param Callback function that tells what to do when message is received
        */
        void ESPNowStartSlave(String ssid, void (&onDataRec)(const uint8_t *mac_addr, const uint8_t *data, int data_len));

        /**!
        * @brief: Init ESP Now with fallback
        */
        void InitESPNow();

        /**!
        * @brief: Scan for slaves in AP mode 
        * @param: String slave name looks for the name of the other ESP32
        * @return: Return true if found, false if not
        */
        bool ScanForSlave(String name);

        /**! 
        * @brief: Check if the slave is already paired with the master. If not, pair the slave with master 
        * @return: Returns true if already paired, false if not
        */
        bool manageSlave();

        /**!
        * @brief: Deletes peer
        */
        void deletePeer();

        /**! 
        * @brief: Send data based on passed paramter to ESP-NOW slave if connected
        * @param: Data is a string of the data to be sent, change paramter to another data type if desired such as struct
        */
        void sendData(String data);

    

};

#endif