'use strict';

const fs = require('node:fs');
const { AthomAppsAPI } = require('homey-api');
const athom = require('../node_modules/homey/services/AthomApi');

async function main() {
  const manifest = JSON.parse(fs.readFileSync('.homeycompose/app.json', 'utf8'));
  const buildId = process.env.HOMEY_TEST_BUILD_ID;
  if (!process.env.HOMEY_PAT || !/^\d+$/.test(buildId || '')) {
    throw new Error('HOMEY_PAT and a numeric HOMEY_TEST_BUILD_ID are required.');
  }

  const api = new AthomAppsAPI();
  const token = await athom.createDelegationToken({ audience: 'apps' });
  const parameters = { $token: token, appId: manifest.id, buildId };
  const build = await api.getBuild(parameters);
  if (build.version !== manifest.version) {
    throw new Error(`Build version ${build.version} does not match branch version ${manifest.version}.`);
  }

  // This workflow can only select the test channel; it never promotes to live.
  await api.updateBuildChannel({ ...parameters, channel: 'test' });
  const app = await api.getApp({ $token: token, appId: manifest.id });
  if (app.testVersion !== manifest.version || String(app.testBuild?.id) !== buildId) {
    throw new Error('The public test channel did not confirm the requested build.');
  }

  const link = `https://homey.app/a/${manifest.id}/test/`;
  console.log(`Test release ${manifest.id}@${manifest.version}, build ${buildId}: ${link}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Test release **${manifest.version}**, build ${buildId}: [Install](${link})\n`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
