# Hobeian for Homey

Adds support for Hobeian and compatible AOYAN Zigbee devices on Homey Pro (Homey 12.4.0 or newer).

## Supported Devices

| Device | Measurements and alarms |
| --- | --- |
| ZG-303Z Soil Sensor | Soil moisture, temperature, air humidity, battery, dry-soil alarm |
| AY-303Z Soil Sensor (Experimental) | Soil moisture, temperature, air humidity, battery, dry-soil alarm |
| ZG-204ZX 24GHz Presence Sensor | Presence, illuminance, temperature, humidity, battery |
| ZG-227Z Temperature & Humidity Sensor | Temperature, humidity, battery |
| ZG-222Z Water Leak Sensor | Water leak, tamper, low-battery alarm, battery |

### ZG-303Z Soil Moisture Sensor

A battery-powered Zigbee soil moisture sensor with temperature and humidity sensing.

**Capabilities:**

- Soil Moisture (0-100%)
- Temperature (°C)
- Air Humidity (0-100%)
- Battery Level (%)
- Water Shortage Alarm

**Settings:**

- Temperature Calibration (-2.0 to +2.0 °C)
- Humidity Calibration (-30 to +30)
- Soil Moisture Calibration (-30 to +30)
- Temperature/Humidity Sampling Interval (5-3600 seconds)
- Soil Moisture Sampling Interval (5-3600 seconds)
- Soil Dryness Threshold (0-100%)

**Technical Details:**

- Zigbee Manufacturer: HOBEIAN (Tuya OEM: _TZE200_wqashyqo)
- Zigbee Model: ZG-303Z (Tuya: TS0601)
- Power: 2x AAA batteries
- Protocol: Tuya Zigbee (Cluster 0xEF00)

### AY-303Z Soil Moisture Sensor (Experimental)

AOYAN variant with soil moisture, temperature, air humidity, battery level, and dry-soil alarm. Select **AY-303Z Soil Sensor (Experimental)** when pairing. Manufacturer identifiers `AOYAN  ` (two trailing spaces) and `AOYAN` are accepted for model `AY-303Z`. This variant uses the sensor's DP 106 dry-soil alarm and DP 9 temperature unit. Soil-moisture reports do not override its alarm state.

A tester reports all three units working after resolving a Zigbee network pairing problem. Dry-soil alarm, calibration, and sampling settings still need explicit hardware confirmation, so support remains experimental.

### ZG-204ZX 24GHz Presence Sensor

A battery-powered Zigbee 24GHz mmWave presence sensor with illuminance, temperature and humidity sensing.

**Capabilities:**
- Presence (mmWave radar)
- Illuminance (lux)
- Temperature (°C)
- Humidity (0-100%)
- Battery Level (%)

**Settings:**
- Fading Time (0-28800 seconds)
- Illuminance Interval (1-720 minutes)
- Detection Distance (0-5 meters, in 0.01 m steps)
- Motion Detection Sensitivity (0-10)
- Static Detection Sensitivity (0-10)
- Anti-Interference
- LED Indicator
- Temperature Calibration (-2.0 to +2.0 °C, in 0.1 °C steps)
- Humidity Calibration (-30 to +30)

**Technical Details:**
- Zigbee Manufacturer: HOBEIAN (Tuya OEM: _TZE200_w0ap83qu)
- Zigbee Model: ZG-204ZX (Tuya: TS0601)
- Power: battery
- Protocol: Tuya Zigbee (Cluster 0xEF00)

Hardware testing of the ZG-204ZX driver is still pending. Changed settings on sleeping devices are queued until the next wake-up; failed writes are retried, and pending changes survive app restarts.

### ZG-227Z Temperature & Humidity Sensor

Reports temperature, relative humidity, and battery level. Uses two AAA batteries. Added as experimental support in version 1.0.5.

### ZG-222Z Water Leak Sensor

Reports water leaks, tamper status, low-battery alarms, and battery level. Uses a CR2032 battery.

## Installation

1. Install [Hobeian from the Homey App Store](https://homey.app/a/com.hobeian/)
2. Add device: Devices → + → Hobeian → select your device
3. Put the sensor in pairing mode (see the device's manual)
4. Follow the pairing instructions

## Reporting Issues

[Open an issue](https://github.com/elrond1999/com.hobeian/issues) with the device model, app and Homey versions, pairing outcome, and the readings or settings affected. For experimental drivers, include whether alarms and settings work on the physical device. Battery-powered sensors may apply settings only when they next wake up.

## Changelog

### Unreleased

- Add ZG-204ZX presence, illuminance, temperature, humidity, and battery support.
- Fix Tuya settings encoding and ZG-204ZX first-pair initialization.
- Retry ZG-204ZX settings after failed writes and retain pending changes across restarts and concurrent edits.
- Keep AY-303Z dry-soil alarms controlled by the sensor.
- Credit the ZG-204ZX contribution in the app's developer metadata.

### 1.0.7

- Add experimental AOYAN AY-303Z soil sensor support.

### 1.0.6

- Add ZG-222Z water leak sensor support.

### 1.0.5

- Add experimental ZG-227Z temperature and humidity sensor support.

Earlier changes are listed in [.homeychangelog.json](.homeychangelog.json) and [GitHub releases](https://github.com/elrond1999/com.hobeian/releases).

## Releasing

1. Merge the release changes into `main` and confirm the **Validate Homey App** workflow passes. Run `npm ci && npm test` for the exact code being released; the validation workflow does not run these tests.
2. Run [Update Homey App Version](https://github.com/elrond1999/com.hobeian/actions/workflows/homey-app-version.yml) on `main`, choosing a version increment and entering the user-facing changelog. This updates the version, commits it, creates a tag, and publishes a GitHub release. The current manifest is 1.0.7, so a patch increment produces 1.0.8.
3. Check that the resulting version commit validates successfully before publishing.
4. Run [Publish Homey App](https://github.com/elrond1999/com.hobeian/actions/workflows/homey-app-publish.yml) on the validated release ref. It uses the repository's `HOMEY_PAT` secret and links to the release in Homey Developer Tools.
5. In Homey Developer Tools, release to **Test** first. Confirm pairing, readings, alarms, settings, and restart behavior on physical devices, including existing sensors affected by shared Tuya changes. Then submit for **Live** certification.

GitHub releases and Homey distribution are separate steps. See [Homey's publishing guide](https://apps.developer.homey.app/app-store/publishing) for Test and Live release management.
