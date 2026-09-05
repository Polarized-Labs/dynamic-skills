# Validation results

Validated on 2026-09-05 for the initial 0.1.0 release.

Version 0.1.1 renames the repository and skill identifier to `dynamic-skills`,
including the folder, display name, invocation prompt, install commands, and
test paths. The workflow instructions are unchanged. The behavioral evidence
below is from 0.1.0; metadata and CLI installation are checked again for the
renamed skill by the release's GitHub Actions run.

## Distribution and structure

- MIT-licensed public source: [Polarized-Labs/dynamic-skills](https://github.com/Polarized-Labs/dynamic-skills).
- Frontmatter and Codex interface metadata pass YAML validation.
- All five synthetic connector contract checks pass.
- [GitHub Actions](https://github.com/Polarized-Labs/dynamic-skills/actions/runs/33993970380)
  installed the skill through skills CLI 1.5.23 from both the checkout and the
  public repository for Claude Code, Codex, and Cursor. Installed SKILL.md and
  agents/openai.yaml matched the source at both agent locations.

## Agent behavior

Real authenticated CLIs ran fresh tasks against the local synthetic Northstar
collaboration MCP. The fixture serves current state on each read and records
tool calls. No real team documents were changed or published.

| Check | Codex | Claude Code | Cursor Agent |
| --- | --- | --- | --- |
| Setup discovers both matching sections and excludes the unrelated section | Pass | Pass after deduplication correction | Pass |
| Repeat setup preserves instructions and one entry per document | Pass | Pass | Pass |
| Fresh task reads release guidance without reading the travel body | Pass | Pass | Pass |
| Source edit is reflected without running setup again | Pass | Pass | Pass |
| Access denial is explicit; no approval marker is invented | Pass | Pass | Pass |

The first read returned **release captain / PINE-47**. After changing the source,
a fresh task returned **incident commander / MAPLE-83**. MCP logs show only the
release document body was read for these tasks. Denied reads returned no marker.
The index contained source URLs and routing descriptions, not either marker or
the document bodies. Existing project and Claude instructions remained intact.

Codex also exercised two separate setup cases: no matching section, and no
selected team. It left the index unchanged, did not substitute the unrelated
section, and requested missing scope before making any discovery calls.

`node tests/check-behavior.mjs` passed against these outputs, generated files,
and tool-call logs. The final responses and indexes were also reviewed for
duplicate sections, source accuracy, and reported limitations. Raw logs stay
in ignored `.eval` directories.

## Environment and fixes found

| Agent | Versions observed during the test window | Instruction entry point | Access |
| --- | --- | --- | --- |
| Codex | 0.153.4 | AGENTS.md | Per-run collaboration MCP configuration |
| Claude Code | 2.1.198 at initial inspection; 2.1.261 at final inspection | CLAUDE.md importing @AGENTS.md | Explicit test MCP configuration |
| Cursor Agent | 2026.08.04-aaa8809 at initial inspection; 2026.09.02-c22c1a3 at final inspection | AGENTS.md | Project .cursor/mcp.json, with the fixture server enabled |

CLI versions changed during the test window; the initial runs did not record a
version per phase. These are observed version bounds, not a claim that every
phase ran on both versions. The harness now records version and timestamp with
each phase to make later runs more precise. The CLIs used their configured
models without a model override.

Claude's expired OAuth session was refreshed by the user. Cursor required a
separate Git project root and approval for the exact test MCP configuration.
Before that correction, it explicitly reported unavailable access; some early
runs used direct stdio MCP calls. The final read, changed-source, repeat, and
denied runs used the enabled collaboration connector.

Claude's first setup repeated a shared document under both sections. The skill
now explicitly says to list each document once and note all source sections on
that entry. Repeat setup corrected the index and passed the deduplication check.

## Decision and limits

These bounded CLI checks support stopping at the setup skill. No demonstrated
gap requires a custom sync utility, manifest, or rendered document copies.
Connector access and instruction discovery remain environment prerequisites.

This is not a statistical reliability study. It does not establish live Linear
workspace behavior, GUI behavior, a human smoke-test signoff, or an ax cloud
experiment result. Cross-agent installation was checked in GitHub Actions;
behavior was checked locally using the same skill content and synthetic sources.
