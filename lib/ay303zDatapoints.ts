'use strict';

import { DP_HANDLERS, DP_WRITE } from './zg303zDatapoints';

// AOYAN's stock AY-303Z uses the legacy measurement DPs, but DP 106 is
// its dry-soil alarm. Temperature units are configured through DP 9.
// References: zigbee-herdsman-converters #12157 and zha-device-handlers #5352.
export const AY303Z_DP_HANDLERS: typeof DP_HANDLERS = {
  3: DP_HANDLERS[3],
  5: DP_HANDLERS[5],
  15: DP_HANDLERS[15],
  102: DP_HANDLERS[102],
  104: DP_HANDLERS[104],
  105: DP_HANDLERS[105],
  109: DP_HANDLERS[109],
  110: DP_HANDLERS[110],
  111: DP_HANDLERS[111],
  112: DP_HANDLERS[112],
  9: { handler: 'setting' },
  106: { handler: 'waterWarning' },
};

export const AY303Z_DP_WRITE: Record<keyof typeof DP_WRITE, number> = {
  SOIL_CALIBRATION: DP_WRITE.SOIL_CALIBRATION,
  TEMP_CALIBRATION: DP_WRITE.TEMP_CALIBRATION,
  HUMIDITY_CALIBRATION: DP_WRITE.HUMIDITY_CALIBRATION,
  TEMP_UNIT: 9,
  SOIL_WARNING_THRESHOLD: DP_WRITE.SOIL_WARNING_THRESHOLD,
  TEMP_SAMPLING_INTERVAL: DP_WRITE.TEMP_SAMPLING_INTERVAL,
  SOIL_SAMPLING_INTERVAL: DP_WRITE.SOIL_SAMPLING_INTERVAL,
};
