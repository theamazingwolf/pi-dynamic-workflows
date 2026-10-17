# Dynamic-workflows fork: Pi 1.2 upgrade

Status: locally committed and verified; **not pushed or tagged**. PM review required before branch publication.

## Identity and provenance

- Actual worker: `PI_PROVIDER=openai-codex`, `PI_MODEL=gpt-6.1-sol`.
- Worktree: `/home/fenrir/Projects/pi-dynamic-workflows-wt/pi-1.2`.
- Branch: `wlf/pi-1.2`, created by parent from `wlf/main`.
- Base: `9cdae0a7100c7f3d1ef7b8d23ce6978473b2a8f6`.
- Implementation commit: `e3cacc4a1bee06f76f02bca079e06c19992857c0`.
- This handoff is a subsequent documentation-only commit; its SHA is the branch HEAD after commit.
- Read-only `ls-remote` confirmed origin `wlf/main` still equals the base. The existing annotated
  `v3.13.1-wlf.1` tag object is `1ba0f1d2153089abac55907f7153d3390cd2234e`, peeled commit
  `be4d1a7bb00ca52b1d935937e0a4a861beee3e86`. That tag was absent locally; no ancestry claim is made
  about its peeled commit. This rebuild uses the parent's supplied main-branch base, not a tag checkout.
- Reviewed own `AGENTS.md` and `CONTRIBUTING.md`; no pre-existing handoff files. No protected guidance changes.
- Read common/PM-RT briefs, reconciliation Phase A, contracts index/lanes, wave plan, and the named
  stormbuild plan (read-only SSH; local evidence `.scratch/phase-a-plan.md`, exit 0).
- Relevant Pi 1.2 SDK docs/examples read from the authorized read-only installation.

## Changes and public seam

- Declared host peers `pi-coding-agent`, `pi-tui`, and `typebox` are `"*"`.
- Dev/test `pi-coding-agent`, `pi-ai`, and `pi-tui` are exactly `1.2.0`.
- Root overrides align transitive `pi-agent-core`, `pi-ai`, `pi-tui`, `pi-telemetry`, `pi-codemode`,
  and `pi-mcp`. Initial install without the last two overrides selected **1.3.0** for codemode/MCP.
  Final clean install has one physical copy of each of the seven Pi packages, all **1.2.0**.
  Overrides are test-root policy, not a way to override a consuming host's dependency tree.
- Regenerated lockfile removes the old duplicated/bundled 0.85.1 SDK tree.
- Added `tests/pi-sdk-version.test.ts`: checks peer/dev declarations and walks installed transitive
  package resolution, rejecting version skew and duplicate physical SDK copies.
- Updated task-panel capture fixtures for Pi 1.2's authoritative session projection. Replaced the
  old private `_runAgentPrompt` fixture with a **real `createAgentSession` / faux-provider** delivery
  test: real result message reaches model context, turn settles, reply arrives, delivery marker clears.
  No runtime changes or shipped mocks.
- Excluded `.scratch` from Biome so isolated SDK/test-generated files are not lint targets.
- `src/pre-spawn-model.ts`, `src/agent.ts`, `src/index.ts`, and `tests/pre-spawn-model.test.ts` are
  unchanged from base. Public **`PreSpawnModelContext.prompt?: string`** remains exact and exported;
  the agent still supplies its task prompt before spawn. **U3b passes unchanged**.
- Package version remains `3.13.1`; no npm publication or release tag created.

## Reproduction and evidence

All commands run from the worktree above. Scratch/logs are local, git-excluded evidence.
No live home config or credentials were used. Use this environment for reproduction:

```bash
cd /home/fenrir/Projects/pi-dynamic-workflows-wt/pi-1.2
export TMPDIR="$PWD/.scratch/tmp" npm_config_cache="$PWD/.scratch/npm-cache"
export HOME="$PWD/.scratch/home" USERPROFILE="$PWD/.scratch/home"
export GIT_CEILING_DIRECTORIES="$TMPDIR"
unset PI_CODING_AGENT_DIR
mkdir -p "$TMPDIR" "$HOME"
```

The fake HOME is essential: tests intentionally replace HOME and discover settings/extensions there.
A globally fixed `PI_CODING_AGENT_DIR` defeats those test fixtures. The Git ceiling prevents temporary
"non-git directory" fixtures inside this checkout from discovering the enclosing fork repository.
Initial runs exposed both environment issues; neither required a runtime change.

| Command | Exit | Evidence / result |
| --- | --- | --- |
| `npm install --no-audit --no-fund` | 0 | `.scratch/install-aligned.log` |
| `npm ci --no-audit --no-fund` | 0 | `.scratch/ci.log`; clean lockfile install |
| `npm ls` for all seven Pi SDK packages | 0 | `.scratch/npm-ls.log`; all 1.2.0, deduped |
| `npm run check` | 0 | `.scratch/check.log`; Biome + script TypeScript |
| `npm run build` | 0 | `.scratch/build.log` |
| Focused command below | 0 | `.scratch/focused-clean.log`; **143 passed**, including U3b and real SDK delivery |
| `npm test` | 0 | `.scratch/full-clean.log`; **1658 passed**, 68 suites, zero skipped/failed |
| `npm run guidance:check` | 0 | `.scratch/guidance-clean.log`; prose baseline unchanged |
| `git diff --check` | 0 | no whitespace errors |
| Seam-file diff from base | 0 | `.scratch/prompt-unchanged.log`; empty diff before implementation commit |

Focused command:

```bash
node --import tsx --test tests/pre-spawn-model.test.ts tests/agent-thinking.test.ts \
  tests/pi-sdk-version.test.ts tests/task-panel.test.ts
```

Full `npm test` includes check, build, docs check, context check, all unit tests, and release verification.
Release verification reports **0 warnings**. Full verification ran in the background with a 180-second
outer timeout (completed normally, exit 0); `.scratch/clean-proof.sh` records the commands/exits.

Negative regression evidence, in isolated scratch copies (tracked files/dependencies not mutated):

- Base package manifest with new version regression: exit **1**, `.scratch/mutation-base.log`.
- Installed SDK manifest changed to 1.3.0 in the scratch copy: exit **1**,
  `.scratch/mutation-physical.log`; assertion explicitly rejects `1.3.0 !== 1.2.0`.
- Actual aligned installation: regression passes, including after `npm ci`.

## Remaining gates / publication instructions

- **Do not push yet.** PM must review this implementation and provenance first.
- H4 permits the fork branch push, not tag creation. After PM approval only:
  `git -C /home/fenrir/Projects/pi-dynamic-workflows-wt/pi-1.2 push origin HEAD:refs/heads/wlf/pi-1.2`.
- **HI only:** create/publish `v3.13.1-wlf.2` on the reviewed commit. Do not move `v3.13.1-wlf.1`.
- Parent owns agent-recipes pin updates and the rest of A4. No agent-recipes or StormOS source edits made.
- Fork-focused/full A4 tests are green. Broader live guard/router/ask_jev/desk/child-profile smoke and
  regular-TUI/herdr proof are **not performed here** and remain PM integration gates. Faux SDK tests
  are not live-provider smoke, Jev classification evidence, or proof of complete Phase A acceptance.
- No implementation blocker remains. Publication is deliberately held for review/HI tag authority;
  live-provider integration requires the parent's isolated, authorized provider environment.
