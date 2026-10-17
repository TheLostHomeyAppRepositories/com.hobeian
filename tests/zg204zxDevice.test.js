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
    this.store = new Map();
    this.error = (error) => this.errors.push(error);
  }

  log() {}

  getSetting(key) {
    return this.settings[key];
  }

  getStoreValue(key) {
    return this.store.get(key);
  }

  async setStoreValue(key, value) {
    this.store.set(key, value);
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

test('a settings edit during a wake update remains queued for the next wake', async (t) => {
  let now = 100000;
  t.mock.method(Date, 'now', () => now);
  const device = new ZG204ZXDevice();
  const { frames, endpoint, zclNode } = fixture();
  await device.onNodeInit({ zclNode });
  device.settings.fading_time = 45;
  await device.onSettings({ oldSettings: {}, newSettings: device.settings, changedKeys: ['fading_time'] });

  let release;
  let entered;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const started = new Promise((resolve) => {
    entered = resolve;
  });
  const send = endpoint.sendFrame.bind(endpoint);
  let pause = true;
  endpoint.sendFrame = async (...args) => {
    if (pause) {
      pause = false;
      entered();
      await gate;
    }
    return send(...args);
  };
  const wake = device.onEndDeviceAnnounce();
  await started;
  device.settings.fading_time = 75;
  await device.onSettings({ oldSettings: { fading_time: 45 }, newSettings: device.settings, changedKeys: ['fading_time'] });
  release();
  await wake;
  assert.equal(frames.length, 10);
  assert.deepEqual(frames[1].frame.subarray(5), Buffer.from([102, 2, 0, 4, 0, 0, 0, 45]));
  now += 6000;
  await device.onEndDeviceAnnounce();
  assert.equal(frames.length, 20);
  assert.deepEqual(frames[11].frame.subarray(5), Buffer.from([102, 2, 0, 4, 0, 0, 0, 75]));
});

test('queued settings survive restarts before a wake or after a failed apply', async (t) => {
  t.mock.method(Date, 'now', () => 100000);
  for (const failBeforeRestart of [false, true]) {
    const device = new ZG204ZXDevice();
    const original = fixture();
    await device.onNodeInit({ zclNode: original.zclNode });
    device.settings.fading_time = 45;
    await device.onSettings({ oldSettings: {}, newSettings: device.settings, changedKeys: ['fading_time'] });
    if (failBeforeRestart) {
      original.endpoint.failAt = 2;
      await device.onEndDeviceAnnounce();
      assert.equal(original.frames.length, 2);
    }

    const restart = new ZG204ZXDevice();
    restart.store = device.store;
    restart.settings = device.settings;
    const next = fixture();
    await restart.onNodeInit({ zclNode: next.zclNode });
    assert.equal(next.frames.length, 0);
    await restart.onEndDeviceAnnounce();
    assert.equal(next.frames.length, 10);
    assert.deepEqual(next.frames[1].frame.subarray(5), Buffer.from([102, 2, 0, 4, 0, 0, 0, 45]));

    const afterSuccess = new ZG204ZXDevice();
    afterSuccess.store = restart.store;
    afterSuccess.settings = restart.settings;
    const last = fixture();
    await afterSuccess.onNodeInit({ zclNode: last.zclNode });
    await afterSuccess.onEndDeviceAnnounce();
    assert.equal(last.frames.length, 0);
  }
});
