---
name: setup-team-guidance
description: "Create or update an agent instruction index pointing to the team's Playbooks and References section in its collaboration software. Use when setting up team best practices or refreshing those document links."
license: MIT
compatibility: "Requires authorized access to the team's collaboration software and a supported agent instruction entry point. Linear is the first documented example; use an existing connector or authenticated browser."
metadata:
  author: "Polarized Lab"
  version: "0.1.0"
---

# Set up team guidance

Keep team best practices in the collaboration software where people maintain
them. Give agents a short index of the relevant source documents.

## Find the guidance

Use the workspace and team scope from the request or established project context.
Ask for missing scope before searching unrelated teams.

Find sections whose name is **Playbooks and References**, ignoring case. This is
one section name, not two sections called Playbooks and References. Include all
matching sections in the selected scope. Linear is the first example; another
collaboration tool can use an equivalent named section or collection.

Prefer an existing authorized connector. Use an authenticated browser when
needed. A URL does not grant access. If access fails or a section is missing,
report it; do not infer an empty source or silently use unrelated sections.

Collect verified section and document URLs. Use titles, descriptions, headings,
and enough content to write an accurate sentence about when to read each
document. Deduplicate by document identity or canonical URL, retaining section
context. Keep the guidance bodies in the source tool.

## Add the reference index

Identify the target agent and instruction scope the user wants. For a shared
project index:

- **Codex and Cursor:** put the index in the project's `AGENTS.md`.
- **Claude Code:** put the index in `CLAUDE.md`, or, if sharing `AGENTS.md`,
  add a standalone `@AGENTS.md` import to `CLAUDE.md`. Preserve existing
  Claude-specific instructions and do not add the import twice.

For another scope or agent, check its supported instruction entry point first.
Respect local rules and managed-file ownership.

When asked to set up or update instructions, add or revise a clearly named
**Team guidance** section. Preserve unrelated instructions and the user's
organization. If asked only for a draft, return the proposed text and destination
without changing files.

The index should:

- Identify the collaboration software as the source of truth.
- Link matching sections so agents can discover guidance added later.
- Give each known document a short topic, a specific “read when” description,
  and its direct URL.
- Name the existing access method, without including credentials.
- Tell agents to retrieve relevant guidance when beginning a matching task and
  follow supporting links only when more detail is needed.
- Direct requested guidance edits to the source document. Update the index when
  its links or routing descriptions change.

Adapt this shape. Replace all placeholders with verified information:

```markdown
## Team guidance

Our guidance lives in <collaboration tool>. Use <existing access method>
to read relevant source guidance before applying it to a task.
Follow supporting links when needed; do not load every document by default.

Source: [Playbooks and References](<verified section URL>)
- <Topic> — Read when <specific task>. [<Document title>](<verified document URL>)

If a source cannot be read, identify the missing guidance and do not imply
that you checked it. Keep requested guidance edits in the source document.
```

Update the existing section on subsequent runs rather than duplicating it.
Remove an old reference only when a complete source check confirms it is no
longer relevant, or the user requests removal. Preserve references when
discovery is incomplete and explain that limitation.

## Check the result

Check that URLs resolve through the chosen access method and that routing
descriptions reflect their sources. Verify the target agent discovers its
instruction entry point and can retrieve a relevant document; distinguish
untested compatibility from demonstrated behavior.

Summarize where the index was added or proposed, which sections it covers, and
any missing access. No custom sync CLI, rendered document copies, manifest, or
scheduled refresh is needed.

The reusable skill is distributed through skills.sh. The filled index and
private guidance stay in the team's environment.
