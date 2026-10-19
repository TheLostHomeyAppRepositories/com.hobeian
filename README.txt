Hobeian connects Hobeian and compatible AOYAN Zigbee sensors to Homey Pro.

Supported devices:
- ZG-303Z Soil Sensor: soil moisture, temperature, air humidity, battery level, and dry-soil alarm.
- AY-303Z Soil Sensor: soil moisture, temperature, air humidity, battery level, and dry-soil alarm.
- ZG-204ZX 24GHz Presence Sensor: presence, illuminance, temperature, humidity, and battery level.
- ZG-227Z Temperature & Humidity Sensor: temperature, humidity, and battery level.
- ZG-222Z Water Leak Sensor: water leak, tamper, low-battery alarm, and battery level.

Select your exact device model when pairing. For AOYAN sensors, select "AY-303Z Soil Sensor". Theo reports pairing and operation on three AY-303Z units; dry-soil alarms, calibration, and sampling settings have not all been explicitly confirmed on hardware. ZG-204ZX hardware testing is pending.

Battery-powered devices sleep between reports. ZG-204ZX settings changes are queued until the next wake-up and retried after failed writes, including after an app restart.

Requires Homey Pro with Homey 12.4.0 or newer.
