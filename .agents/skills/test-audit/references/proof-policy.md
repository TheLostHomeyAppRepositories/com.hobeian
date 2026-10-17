# Proof policy for com.hobeian

## Choose proportional checks

- Read the repository's [AGENTS.md](../../../../AGENTS.md) and applicable scoped
  instructions before editing. Use the commands actually present in package.json.
- Clean generated output before compiling for focused tests. From the repository
  root, after confirming no test, build, or `homey app run` process is using this
  checkout, run:

  ```sh
  node -e "require('node:fs').rmSync('.homeybuild', { recursive: true, force: true })"
  npm run build
  node --test tests/<owner>.test.js
  ```

  Tests load compiled modules from `.homeybuild`. `tsc` does not remove old output
  when a source file is renamed or deleted, so compiling alone can falsely pass
  against stale modules. Never delete output used by an active process or stop
  an unrelated process to make this cleanup possible.
- For runtime changes, run the relevant owner and sibling tests. `npm test`
  builds and runs the current `tests/*.test.js` suite when full local proof is
  appropriate for the change; perform the same cleanup first.
- Run `npm run lint` for code changes. Compare failures with the baseline and
  report existing versus introduced errors; do not weaken checks to get green.
- Driver metadata or packaging changes also need `homey app build` and
  `homey app validate -l verified`, locally when the CLI is available or in CI.
  The current GitHub workflow validates the Homey app; do not assume it runs
  unit tests or lint unless the workflow explicitly does so.
- Documentation-only changes need link/path checks and `git diff --check`;
  no runtime tests are required.

## Behavioral boundaries

Prefer driver lifecycle/report entry points with fixed Zigbee frames or captured,
sanitized device reports. Keep parser and conversion unit tests when they prove
independent protocol contracts. Mocks may replace Homey or network access, but
must not implement the behavior being asserted. Avoid real sleeps and unnecessary
network calls; use controlled clocks and fixtures where practical.

Preserve distinct device variants, alarm transitions, settings writes, sleepy
device wake-up behavior, and backward compatibility when consolidating tests.
Do not add public exports or production flags solely for tests.

## Evidence and cost

Record a failing pre-fix control and passing candidate for regressions. If the
original state cannot be run, explain the missing evidence. Measure changed test
files with a timed focused command; aim for fast tests, and justify expensive
ones by the contract no cheaper boundary can prove.

Run changed checks once they pass. Broaden or repeat only for changed inputs,
failures, or a named unresolved risk. Never edit files while tests or builds are
using the same checkout. Review the final diff and coverage before handoff.

## Failures and physical devices

Distinguish product, fixture, infrastructure, and existing failures. Repair the
cause rather than adding retries, longer timeouts, weaker assertions, or broader
mocks. Record unresolved failures and limitations explicitly.

Automated fixtures do not establish physical device compatibility. Report live
gaps separately. `homey app run` deploys to a real Homey and needs suitable device
access; use it only within the user's authorized task and available environment.
Never restart unrelated processes or publish a release merely to validate tests.
