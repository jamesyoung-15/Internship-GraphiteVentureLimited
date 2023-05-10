#ifndef SFDFSENSOR_H
#define SFDFSENSOR_H

#include <ModbusMaster.h>
#include <Arduino.h>
#include <ArduinoJson.h>

class sensorNodes
{
    private:
        ModbusMaster node_ec;
        ModbusMaster node_ph;
        ModbusMaster node_do;
    public:
        /**!
         * @brief
         * @param
        */
        sensorNodes(ModbusMaster node_ec,ModbusMaster node_ph,ModbusMaster node_do);

        /**!
         * @brief
         * @return
         */
        double readEC();

        /**!
         * @brief
         * @return
         */
        double readTemperature();


        /**!
         * @brief
         * @return
         */
        double readDO();

        /**!
         * @brief
         * @return
         */
        double readPh();

        
};



#endif