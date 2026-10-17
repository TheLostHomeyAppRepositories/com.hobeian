'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const { Cluster, CLUSTER } = require('zigbee-clusters');

class FakeDevice {
  constructor() {
    this.node = { receiveWhenIdle: false };
    this.settings = {};
    this.errors = [];
    this.error = (error) => this.errors.push(error);
  }

  log() {}

  getSetting(key) {
    return this.settings[key];
  }

  isFirstInit() {
    return this.firstInit;
  }

  async setAvailable() {
    return undefined;
  }
}

const originalLoad = Module._load;
let ZG204ZXDevice;
try {
  Module._load = function load(request, ...args) {
    if (request === 'homey-zigbeedriver') return { ZigBeeDevice: FakeDevice };
    return originalLoad.call(this, request, ...args);
  };
  // eslint-disable-next-line global-require
  ZG204ZXDevice = require('../.homeybuild/drivers/zg-204zx/device');
} finally {
  Module._load = originalLoad;
}
const { TuyaSpecificCluster } = require('../.homeybuild/lib/TuyaCluster');

function fixture() {
  const frames = [];
  const endpoint = {
    clusters: {},
    failAt: undefined,
    async sendFrame(clusterId, frame) {
      frames.push({ clusterId, frame });
      if (frames.length === this.failAt) throw new Error('Wake window closed');
      const cluster = this.clusters.tuya;
      if (clusterId === 0xef00 && cluster._trxHandlers[frame[1]]) {
        await cluster.handleFrame({
          frameControl: { clusterSpecific: false, manufacturerSpecific: false },
          trxSequenceNumber: frame[1],
          cmdId: 0x0b,
          data: Buffer.from([frame[2], 0]),
        });
      }
    },
  };
  const BasicCluster = Cluster.getCluster(CLUSTER.BASIC.ID);
  endpoint.clusters.basic = new BasicCluster(endpoint);
  endpoint.clusters.tuya = new TuyaSpecificCluster(endpoint);
  return { frames, endpoint, zclNode: { endpoints: { 1: endpoint } } };
}

test('first pairing sends the raw Tuya magic attribute; restarts do not', async () => {
  for (const firstInit of [true, false]) {
    const device = new ZG204ZXDevice();
    const { frames, zclNode } = fixture();
    device.firstInit = firstInit;
    await device.onNodeInit({ zclNode });
    assert.equal(frames.length, firstInit ? 1 : 0);
    if (firstInit) {
      assert.equal(frames[0].clusterId, 0);
      assert.equal(frames[0].frame[0] & 1, 0);
      assert.equal(frames[0].frame[2], 0);
      assert.deepEqual(frames[0].frame.subarray(3), Buffer.from([0xfe, 0xff]));
    }
  }
});

test('settings helpers emit Tuya payload lengths in network byte order', async () => {
  const { endpoint, frames } = fixture();
  const cluster = endpoint.clusters.tuya;
  const cases = [
    ['setDatapointValue', 102, 30, [102, 2, 0, 4, 0, 0, 0, 30]],
    ['setDatapointBool', 103, true, [103, 1, 0, 1, 1]],
    ['setDatapointEnum', 109, 0, [109, 4, 0, 1, 0]],
  ];
  for (const [method, dp, value, expected] of cases) {
    await cluster[method](dp, value);
    const { clusterId, frame } = frames[frames.length - 1];
    assert.equal(clusterId, 0xef00);
    assert.equal(frame[0], 0x11);
    assert.equal(frame[2], 0);
    assert.equal(frame[3], 0);
    assert.deepEqual(frame.subarray(5), Buffer.from(expected));
  }
});

test('failed sleepy settings are retried on the next wake and stop after success', async (t) => {
  let now = 100000;
  t.mock.method(Date, 'now', () => now);
  const device = new ZG204ZXDevice();
  const { frames, endpoint, zclNode } = fixture();
  await device.onNodeInit({ zclNode });
  device.settings.fading_time = 45;
  await device.onSettings({ oldSettings: {}, newSettings: device.settings, changedKeys: ['fading_time'] });
  assert.equal(frames.length, 0);
  endpoint.failAt = 2;
  await device.onEndDeviceAnnounce();
  assert.equal(frames.length, 2);
  assert.equal(device.errors.length, 1);
  now += 6000;
  await device.onEndDeviceAnnounce();
  assert.equal(frames.length, 12);
  assert.deepEqual(frames[3].frame.subarray(5), Buffer.from([102, 2, 0, 4, 0, 0, 0, 45]));
  now += 6000;
  await device.onEndDeviceAnnounce();
  assert.equal(frames.length, 12);
});
