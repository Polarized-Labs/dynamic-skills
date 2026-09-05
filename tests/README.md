# Release validation

The product is the skill's instructions. Behavioral checks must observe an
agent reading sources and maintaining an index; matching words in SKILL.md
alone is not acceptance.

## Scenarios

1. Install the skill with the skills CLI in an isolated project for Codex,
   Claude Code, and Cursor.
2. Run setup against the synthetic collaboration MCP fixture. Confirm matching
   the single section name “Playbooks and References”, multiple matching sections,
   URL deduplication, and preservation of unrelated instructions.
3. Run setup again and check that the index is not duplicated.
4. Start a fresh task about release approvals. Confirm the agent reads the
   release document and does not read an unrelated travel document.
5. Change the fixture's release guidance, start another task, and confirm the
   agent sees the new value without rerunning setup.
6. Make a document inaccessible. Confirm the agent reports missing access and
   does not present an earlier value as current.
7. Check missing sections and ambiguous team scope without silently selecting
   unrelated sources.

`fixture.mjs` is a test-only, local stdio MCP server. It contains synthetic
documents and logs calls, allowing behavior to be checked without exposing or
changing a real team's guidance. It is not distributed inside the skill.

Run the fixture contract checks with:

```sh
node --test tests/fixture.test.mjs
```

Live agent evaluation commands and observed results are recorded in
`tests/results.md`. Local fixture results do not establish live Linear
authentication, GUI compatibility, or ax cloud execution.
