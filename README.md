# Hobeian for Homey

Hobeian connects Hobeian and compatible AOYAN Zigbee sensors to Homey Pro. Keep an eye on your plants, monitor room conditions, detect presence, and get notified about water leaks with Homey Flows.

## Supported devices

- ZG-303Z Soil Sensor: soil moisture, temperature, air humidity, battery level, and dry-soil alarm.
- AY-303Z Soil Sensor (AOYAN): soil moisture, temperature, air humidity, battery level, and dry-soil alarm.
- ZG-204ZX 24GHz Presence Sensor: presence, illuminance, temperature, humidity, and battery level.
- ZG-227Z Temperature & Humidity Sensor: temperature, humidity, and battery level.
- ZG-222Z Water Leak Sensor: water leak, tamper, low-battery alarm, and battery level.

Use these sensors in Homey Flows to send a notification when soil is dry or a water leak is detected, control lighting based on presence and light level, or respond to changes in temperature and humidity.

To connect a sensor, add a device in Homey, choose Hobeian, and select your exact device model. For AOYAN sensors, choose AY-303Z Soil Sensor. Put the sensor in pairing mode following its manual, then follow the instructions in Homey.

Requires Homey Pro with Homey 12.4.0 or newer.

## Support

[Report an issue](https://github.com/elrond1999/com.hobeian/issues) with your device model, app and Homey versions, and a description of the problem.

[Development and testing notes](docs/DEVELOPMENT.md) include device settings, technical details, hardware testing status, changelog, and release instructions.
