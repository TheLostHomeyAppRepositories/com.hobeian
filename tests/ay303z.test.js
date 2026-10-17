'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const driver = require('../drivers/ay-303z/driver.compose.json');

class FakeDevice {
  constructor() {
    this.values = {};
    this.settings = { soil_warning: 30 };
  }

  log() {}

  error(error) {
    throw error;
  }

  getSetting(key) {
    return this.settings[key];
  }

  hasCapability() {
    return true;
  }

  async setCapabilityValue(key, value) {
    this.values[key] = value;
  }
}

function FakeCluster() {}
FakeCluster.addCluster = () => {};

// Load the real device logic without a Homey runtime or live Zigbee traffic.
const originalLoad = Module._load;
Module._load = function load(request, ...args) {
  if (request === 'homey-zigbeedriver') return { ZigBeeDevice: FakeDevice };
  if (request === 'zigbee-clusters') {
    return { Cluster: FakeCluster, ZCLDataTypes: {}, CLUSTER: {} };
  }
  return originalLoad.call(this, request, ...args);
};
let AY303ZDevice;
let ZG303ZDevice;
try {
  // Load only after installing the Homey runtime mocks.
  // eslint-disable-next-line global-require
  AY303ZDevice = require('../.homeybuild/drivers/ay-303z/device');
  // eslint-disable-next-line global-require
  ZG303ZDevice = require('../.homeybuild/drivers/zg-303z/device');
} finally {
  Module._load = originalLoad;
}

function report(device, dp, value) {
  const data = Buffer.alloc(4);
  data.writeInt32BE(value);
  device.processDataPoint(dp, 2, data);
}

test('AY-303Z reports legacy measurements with correct units', () => {
  const device = new AY303ZDevice();
  report(device, 3, 42);
  report(device, 5, 235);
  report(device, 15, 87);
  report(device, 109, 61);
  assert.equal(device.values.measure_soil_moisture, 42);
  assert.equal(device.values.measure_temperature, 23.5);
  assert.equal(device.values.measure_battery, 87);
  assert.equal(device.values.measure_humidity, 61);
});

test('AY-303Z DP106 is an alarm and DP9 does not overwrite it', () => {
  const device = new AY303ZDevice();
  device.processDataPoint(106, 1, Buffer.from([1]));
  assert.equal(device.values.alarm_water, true);
  device.processDataPoint(9, 4, Buffer.from([0]));
  assert.equal(device.values.alarm_water, true);
  device.processDataPoint(106, 1, Buffer.from([0]));
  assert.equal(device.values.alarm_water, false);
});

test('AY-303Z soil reports preserve both hardware alarm states', () => {
  const device = new AY303ZDevice();
  device.processDataPoint(106, 1, Buffer.from([1]));
  report(device, 3, 80);
  assert.equal(device.values.measure_soil_moisture, 80);
  assert.equal(device.values.alarm_water, true);
  device.processDataPoint(106, 1, Buffer.from([0]));
  report(device, 3, 10);
  assert.equal(device.values.measure_soil_moisture, 10);
  assert.equal(device.values.alarm_water, false);
});

test('AY-303Z soil reports wait for the hardware alarm report', () => {
  const device = new AY303ZDevice();
  report(device, 3, 10);
  assert.equal(device.values.measure_soil_moisture, 10);
  assert.equal(device.values.alarm_water, undefined);
});

test('AY-303Z threshold changes write the setting without overriding the hardware alarm', async () => {
  const device = new AY303ZDevice();
  const writes = [];
  device.tuyaCluster = {
    setDatapointValue: async (dp, value) => writes.push({ dp, value }),
  };
  report(device, 3, 50);
  for (const [alarm, threshold] of [[true, 20], [false, 80]]) {
    device.processDataPoint(106, 1, Buffer.from([Number(alarm)]));
    await device.onSettings({
      oldSettings: { soil_warning: 30 },
      newSettings: { soil_warning: threshold },
      changedKeys: ['soil_warning'],
    });
    assert.equal(device.values.alarm_water, alarm);
  }
  assert.deepEqual(writes, [{ dp: 110, value: 20 }, { dp: 110, value: 80 }]);
});

test('ZG-303Z retains its local alarm for soil reports and threshold changes', async () => {
  const device = new ZG303ZDevice();
  report(device, 107, 10);
  assert.equal(device.values.alarm_water, true);
  report(device, 107, 50);
  assert.equal(device.values.alarm_water, false);
  await device.onSettings({
    oldSettings: { soil_warning: 30 },
    newSettings: { soil_warning: 80 },
    changedKeys: ['soil_warning'],
  });
  assert.equal(device.values.alarm_water, true);
});

test('AY-303Z settings use DP9 for Celsius and never write alarm DP106', async () => {
  const device = new AY303ZDevice();
  const writes = [];
  device.tuyaCluster = {
    setDatapointEnum: async (dp, value) => writes.push({ dp, value, type: 'enum' }),
    setDatapointValue: async (dp, value) => writes.push({ dp, value, type: 'value' }),
  };
  device.settings.temperature_calibration = -0.5;
  await device.applyDeviceSettings();
  assert.deepEqual(writes.find((write) => write.type === 'enum'), { dp: 9, value: 0, type: 'enum' });
  assert.equal(writes.some((write) => write.dp === 106), false);
  assert.deepEqual(writes.find((write) => write.dp === 104), { dp: 104, value: -5, type: 'value' });
  assert.deepEqual(writes.filter((write) => write.type === 'value').map((write) => write.dp), [111, 112, 110, 104, 105, 102]);
});

test('ZG-303Z retains its temperature-unit setting and alarm mapping', async () => {
  const device = new ZG303ZDevice();
  report(device, 1, 1);
  device.processDataPoint(106, 4, Buffer.from([0]));
  assert.equal(device.values.alarm_water, true);
  report(device, 14, 0);
  assert.equal(device.values.alarm_water, false);
  const units = [];
  device.tuyaCluster = {
    setDatapointEnum: async (dp, value) => units.push({ dp, value }),
    setDatapointValue: async () => {},
  };
  await device.applyDeviceSettings();
  assert.deepEqual(units, [{ dp: 106, value: 0 }]);
});

test('AY-303Z pairing accepts the padded manufacturer and excludes unrelated models', () => {
  assert.ok(driver.zigbee.manufacturerName.includes('AOYAN  '));
  assert.ok(driver.zigbee.manufacturerName.includes('AOYAN'));
  assert.deepEqual(driver.zigbee.productId, ['AY-303Z']);
});
