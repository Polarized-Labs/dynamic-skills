# Dynamic Skills

**Give your agent the team playbook.**

Your team's best practices deserve a life beyond “it's in the docs.”

Dynamic Skills gives coding agents a short index of your team's guidance:
what to read and when. Your docs stay where your team edits them.

Built for **Claude Code, Codex, and Cursor**. Open source by Polarized Lab.

## Get started

Run this in your project and choose your agents:

```sh
npx skills add Polarized-Labs/dynamic-skills --skill dynamic-skills
```

Give your agent access to your collaboration tool through an existing connector
or authenticated browser. Keep your team's guidance in a section named
**Playbooks and References**, then ask:

> Use dynamic-skills to find our team's “Playbooks and References” section
> and set up a guidance index for this project.

Include your workspace and team if your agent doesn't already know them.
For a sneak peek, add “draft the index without changing files.”

Linear is the first documented example; other tools can use an equivalent
named collection.

## Your docs do the teaching

- **Relevant guidance.** The index tells agents which docs to read for each task.
- **Fresh from the source.** Agents are instructed to read the original docs.
  Refresh the index when links or topics change.
- **Fits right in.** Adds guidance to your agent's instruction files while
  preserving existing instructions and avoiding duplicates.

Keep private docs and filled indexes in your own environment. Installing the
skill doesn't grant document access or publish your guidance.

[Skill instructions](skills/dynamic-skills/SKILL.md) ·
[Install options](https://skills.sh/docs/cli) ·
[Validation & contributing](tests/README.md) · [MIT license](LICENSE)

Contributions welcome. Keep examples synthetic and run the linked checks.
