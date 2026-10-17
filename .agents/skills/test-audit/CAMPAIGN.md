# Whole-driver or subsystem test audit

Use for an audit covering an entire driver, shared protocol layer, or other
coherent production owner. The value and retention bars in [SKILL.md](SKILL.md)
apply throughout. Finish each step's evidence before proceeding.

## 1. Baseline

Pin the starting commit. Inventory in-scope tests and support code, record line
counts separately from production, and record each test file's pass/fail state.
Investigate baseline failures as possible product defects.

## 2. Ownership inventory

Group tests by production owner, such as frame decoding, datapoint conversion,
driver initialization, reports/alarms, settings, wake handling, and packaging.
Include shared boundary tests. Each test belongs to exactly one group.

## 3. Read-only ledger

Read each test declaration and its parameter cases in full, plus production
owners, entry points, callers, history, and CI routing. Mark each declaration:

- `R`: retain; name the contract and credible regression it catches.
- `F`: repair the proof while retaining the contract.
- `C`: consolidate; identify the keeper that absorbs its assertions first.
- `D`: delete; identify the proof that remains, or why no contract exists.

Judge assertions rather than names. Record evidence for every mark. Parameter
rows may need different marks when they protect different contracts.

## 4. Layer plan

Identify redundant layers, not just individual files. Name one primary keeper
for each contract, the assertions to carry into it, and any test-only production
seams that can be removed. Keep distinct protocol and lifecycle risks.

## 5. Cutover

Edit one owner at a time and serialize shared harness changes. Transfer retained
assertions before deleting suites. Remove obsolete test-only seams and update
test discovery or CI routing if needed. Keep each owner's proof green.

## 6. Preservation review

Compare deleted coverage against keepers. Look for contracts losing their only
proof and assertions that cannot fail. For restored or materially rewritten
regressions, deliberately reintroduce the relevant defect and confirm that the
keeper fails for the intended reason. Restore source exactly afterward.

## 7. Product defects

Treat baseline failures surviving consolidation as bug reports. When fixing is
within task scope, repair the production owner in a separate coherent change and
record failing-control/passing-candidate evidence. Record unrelated defects as
follow-ups rather than expanding an audit without reason.

## 8. Reconcile and hand off

If the base branch changed, preserve newly added contracts when updating the
audit branch. Rerun tests affected by the update or failures; use CI for remaining
required checks and report physical-device gaps separately.

Report baseline/final test and support counts, production changes separately,
retired layers and keepers, preservation gaps and regression controls, repaired
defects, validation/cost, and remaining follow-ups. Follow the local
[proof policy](references/proof-policy.md).
