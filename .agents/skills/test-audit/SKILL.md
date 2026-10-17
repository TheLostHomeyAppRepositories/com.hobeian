---
name: test-audit
description: "Write, change, review, and audit tests for com.hobeian: protect observable behavior, reject duplicate or implementation-coupled proof, and remove test-only production seams."
---

# Test Audit

Use when authoring or reviewing tests, or auditing existing coverage. For a
whole-driver or subsystem audit, also read [CAMPAIGN.md](CAMPAIGN.md).

## Authoring gate

Before adding or changing a test, identify:

1. The protected observable behavior, invariant, or independent contract.
2. A credible regression that would make the test fail.
3. Why existing coverage misses it. Give each contract one primary owner at the
   strongest practical boundary. Another layer needs a distinct protocol or
   lifecycle risk; extend shared fixtures or tables instead of repeating setup.
4. Any export, flag, wrapper, or injection hook needed only by the test. Prefer
   exercising a real production entry point instead of adding a test-only seam.

Prove caller-visible behavior with fixed external inputs and independently
chosen expected values. A regression must fail before the fix for the intended
reason and pass afterward; report when baseline proof is unavailable.
Behavior-preserving refactors should not break tests.

## Reject low-value proof

Reject self-comparisons, copied inventories, source greps tied to identifiers,
internal call-shape assertions, duplicate contracts, subject-generated expected
values, and mocks supplying the behavior being asserted. Negative controls must
fail at the intended guard, and names must match exercised behavior.

See the [audit checklist](references/audit.md) before deleting coverage.

## Retention bar

Keep independent public API, Zigbee/Tuya protocol, configuration, migration,
storage, security, platform, default, package, release, architecture, and
observable-ordering contracts. Static or slow tests are not automatically
disposable. Source inspection must guard an independent user-facing contract and
survive identifier-only refactors. Baseline failures may be bugs to repair.

## Validation and handoff

Follow the local [proof policy](references/proof-policy.md). Inspect complete
tests, production owners, callers, and history; record the remaining proof before
deletion. Remove obsolete test-only seams along with their tests. Never optimize
for deletion counts.

Report the cause, protected contracts, validation and cost, production versus
test/support line changes, and remaining gaps. Commit, push, or merge only within
the user's authorized task.

Adapted from [OpenClaw's test-audit skill](https://github.com/openclaw/openclaw/tree/main/.agents/skills/test-audit).
See [LICENSE](LICENSE) for the upstream license.
