'use strict';

import { ZigBeeDriver } from 'homey-zigbeedriver';

module.exports = class AY303ZDriver extends ZigBeeDriver {

  async onInit() {
    this.log('AY-303Z Driver has been initialized');
  }

};
