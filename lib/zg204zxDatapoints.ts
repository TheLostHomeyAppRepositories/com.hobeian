'use strict';

/**
 * Handler types for DP processing
 */
export type DpHandler = 'presence' | 'illuminance' | 'temperature' | 'humidity' | 'battery' | 'setting';

const DP = {
  PRESENCE: 1,
  STATIC_SENSITIVITY: 2,
  DETECTION_DISTANCE: 4,
  HUMIDITY: 101,
  FADING_TIME: 102,
  ANTI_INTERFERENCE: 103,
  HUMIDITY_CALIBRATION: 104,
  TEMP_CALIBRATION: 105,
  ILLUMINANCE: 106,
  ILLUMINANCE_INTERVAL: 107,
  INDICATOR: 108,
  TEMP_UNIT: 109,
  BATTERY: 110,
  TEMPERATURE: 111,
  MOTION_SENSITIVITY: 123,
} as const;

/**
 * DP to handler mapping.
 *
 * Source: HOBEIAN ZG-204ZX definition in zigbee-herdsman-converters
 * (https://github.com/Koenkk/zigbee-herdsman-converters/blob/master/src/devices/tuya.ts,
 * fingerprint TS0601 / _TZE200_w0ap83qu).
 */
export const DP_HANDLERS: Record<number, { handler: DpHandler; divideBy?: number }> = {
  [DP.PRESENCE]: { handler: 'presence' },
  [DP.ILLUMINANCE]: { handler: 'illuminance' },
  [DP.TEMPERATURE]: { handler: 'temperature', divideBy: 10 },
  [DP.HUMIDITY]: { handler: 'humidity' },
  [DP.BATTERY]: { handler: 'battery' },

  // Settings (echoed back by device)
  [DP.FADING_TIME]: { handler: 'setting' }, // fading time
  [DP.ANTI_INTERFERENCE]: { handler: 'setting' }, // anti interference
  [DP.DETECTION_DISTANCE]: { handler: 'setting' }, // detection distance
  [DP.STATIC_SENSITIVITY]: { handler: 'setting' }, // static detection sensitivity
  [DP.MOTION_SENSITIVITY]: { handler: 'setting' }, // motion detection sensitivity
  [DP.INDICATOR]: { handler: 'setting' }, // LED indicator
  [DP.TEMP_UNIT]: { handler: 'setting' }, // temperature unit
  [DP.TEMP_CALIBRATION]: { handler: 'setting' }, // temperature calibration
  [DP.HUMIDITY_CALIBRATION]: { handler: 'setting' }, // humidity calibration
  [DP.ILLUMINANCE_INTERVAL]: { handler: 'setting' }, // illuminance interval
};

/**
 * Settings DPs for writing to device
 */
export const DP_WRITE = {
  FADING_TIME: DP.FADING_TIME,
  ANTI_INTERFERENCE: DP.ANTI_INTERFERENCE,
  DETECTION_DISTANCE: DP.DETECTION_DISTANCE,
  STATIC_SENSITIVITY: DP.STATIC_SENSITIVITY,
  MOTION_SENSITIVITY: DP.MOTION_SENSITIVITY,
  INDICATOR: DP.INDICATOR,
  TEMP_UNIT: DP.TEMP_UNIT,
  TEMP_CALIBRATION: DP.TEMP_CALIBRATION,
  HUMIDITY_CALIBRATION: DP.HUMIDITY_CALIBRATION,
  ILLUMINANCE_INTERVAL: DP.ILLUMINANCE_INTERVAL,
} as const;

/**
 * Default setting values
 */
export const DEFAULTS = {
  FADING_TIME_SECONDS: 30,
  ILLUMINANCE_INTERVAL_MINUTES: 1,
  DETECTION_DISTANCE_METERS: 5,
  SENSITIVITY: 5,
  CALIBRATION: 0,
  ANTI_INTERFERENCE: false,
  INDICATOR: true,
} as const;
