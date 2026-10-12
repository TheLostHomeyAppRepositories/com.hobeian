'use strict';

import { AY303Z_DP_HANDLERS, AY303Z_DP_WRITE } from '../../lib/ay303zDatapoints';

// Homey loads the compiled sibling device module at runtime.
// eslint-disable-next-line node/no-missing-require
const ZG303ZDevice = require('../zg-303z/device');

module.exports = class AY303ZDevice extends ZG303ZDevice {

  protected datapointHandlers = AY303Z_DP_HANDLERS;
  protected writeDatapoints = AY303Z_DP_WRITE;

};
