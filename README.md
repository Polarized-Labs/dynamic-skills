# Set up team guidance

An open-source skill from Polarized Lab that connects agents to the team's
existing best practices. The documents stay in your collaboration software;
the agent maintains a short index of links and when to read them.

## Install

Run in the project where you want to use the skill:

```sh
npx skills add Polarized-Labs/setup-team-guidance --skill setup-team-guidance
```

To select the three initial targets explicitly:

```sh
npx skills add Polarized-Labs/setup-team-guidance --skill setup-team-guidance -a claude-code -a codex -a cursor
```

The existing [skills CLI](https://skills.sh/docs/cli) handles installation.
This repository does not ship a CLI or a background sync process.
A global install is available with the upstream `--global` option; choose the
scope that fits your environment and managed configuration.

## Use

Give your agent access to your collaboration tool using its existing connector
or authenticated browser. Then ask:

> Use setup-team-guidance to find the “Playbooks and References” section
> for our team and set up a guidance index for this project.

Specify your workspace, team, and target agents if they are not already known.
For a preview, say “draft the index without changing files.”

The section name is **Playbooks and References**: one name, matched without
regard to case. Multiple matching sections in the selected team scope are
supported. Missing or inaccessible sections are reported rather than replaced
with unrelated sources. Linear is the first documented example; the skill can
use an equivalent named collection in another tool.

The skill creates a concise **Team guidance** section containing source links
and task-specific routing descriptions. It preserves existing instructions and
avoids duplicate entries. Full documents remain in the collaboration tool.
Agents read them when needed, so source edits do not require a custom sync step.

## Agent instruction files

| Agent | Project instruction entry point |
| --- | --- |
| Codex | `AGENTS.md` |
| Cursor | `AGENTS.md` |
| Claude Code | `CLAUDE.md`; import a shared index with a standalone `@AGENTS.md` line |

A link is not access, and instructions are not a guarantee that every run will
retrieve the right document. Check the configured connector and actual agent
behavior. The skill reports what it could verify. See [validation](tests/README.md)
for the release checks and their limits.

References: [Agent Skills format](https://agentskills.io/specification),
[Codex skills](https://learn.chatgpt.com/docs/build-skills),
[Cursor rules](https://cursor.com/docs/rules),
[Claude Code memory](https://code.claude.com/docs/en/memory).

## Public skill, private guidance

This repository contains reusable instructions and synthetic test data.
Keep filled indexes, private source URLs, document exports, and credentials
in your own environment. Installing this skill neither grants access to your
collaboration tool nor publishes your documents.

## Contribute

Edit [SKILL.md](skills/setup-team-guidance/SKILL.md) for behavior and
[openai.yaml](skills/setup-team-guidance/agents/openai.yaml) for optional Codex
display metadata. Keep the skill focused on setup and reference maintenance.
Test changes with the scenarios in [tests/README.md](tests/README.md), and report
the agent versions and source-access method. Use synthetic examples in issues
and pull requests.

MIT licensed. No custom runtime dependencies.
