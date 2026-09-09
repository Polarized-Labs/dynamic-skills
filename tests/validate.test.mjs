import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {stringify} from 'yaml';
import {validateSkill} from './validate.mjs';

function fixture(t, change = () => {}) {
  const root = mkdtempSync(join(tmpdir(), 'skill-validation-'));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  const dir = join(root, 'skills', 'dynamic-skills');
  mkdirSync(join(dir, 'agents'), {recursive: true});
  const state = {
    data: {name: 'dynamic-skills', description: 'Team guidance', compatibility: '', metadata: {author: 'Example'}, license: 'MIT'},
    ui: {short_description: 'Point agents to team guidance documents', default_prompt: 'Use $dynamic-skills'},
    license: true,
  };
  change(state);
  writeFileSync(join(dir, 'SKILL.md'), state.text ?? `---\n${stringify(state.data)}---\n# Skill\n`);
  writeFileSync(join(dir, 'agents', 'openai.yaml'), stringify({interface: state.ui}));
  if (state.license) writeFileSync(join(root, 'LICENSE'), 'MIT');
  return root;
}

test('accepts valid metadata, including empty compatibility and metadata', t => {
  validateSkill(fixture(t, state => {state.data.metadata = {};}));
});

test('counts Unicode code points at the existing character limits', t => {
  validateSkill(fixture(t, ({data, ui}) => {
    data.description = '😀'.repeat(1024);
    data.compatibility = '😀'.repeat(500);
    ui.short_description = '😀'.repeat(64);
  }));
});

test('accepts CRLF frontmatter', t => {
  validateSkill(fixture(t, state => {
    state.text = `---\n${stringify(state.data)}---\n# Skill\n`.replaceAll('\n', '\r\n');
  }));
});

const invalid = [
  ['missing frontmatter', s => {s.text = '# Skill';}, /Missing YAML frontmatter/],
  ['malformed YAML', s => {s.text = '---\nname: [\n---\n';}, /./],
  ['non-mapping frontmatter', s => {s.data = [];}, /Invalid skill metadata/],
  ['wrong name', s => {s.data.name = 'other';}, /Invalid skill name/],
  ['missing name', s => {delete s.data.name;}, /Invalid skill name/],
  ['empty description', s => {s.data.description = '';}, /Invalid description/],
  ['long description', s => {s.data.description = 'a'.repeat(1025);}, /Invalid description/],
  ['non-string description', s => {s.data.description = 42;}, /Invalid description/],
  ['long compatibility', s => {s.data.compatibility = 'a'.repeat(501);}, /Invalid compatibility/],
  ['missing compatibility', s => {delete s.data.compatibility;}, /Invalid compatibility/],
  ['non-mapping metadata', s => {s.data.metadata = [];}, /Invalid metadata/],
  ['non-string metadata value', s => {s.data.metadata.author = 42;}, /Invalid metadata/],
  ['non-string metadata key', s => {s.data.metadata = new Map([[42, 'value']]);}, /Invalid metadata/],
  ['wrong license', s => {s.data.license = 'Apache-2.0';}, /Missing license/],
  ['absent license file', s => {s.license = false;}, /Missing license/],
  ['missing interface', s => {s.ui = null;}, /Invalid UI description/],
  ['short UI description', s => {s.ui.short_description = 'a'.repeat(24);}, /Invalid UI description/],
  ['long UI description', s => {s.ui.short_description = 'a'.repeat(65);}, /Invalid UI description/],
  ['non-string UI description', s => {s.ui.short_description = 42;}, /Invalid UI description/],
  ['absent skill invocation', s => {s.ui.default_prompt = 'Use the skill';}, /Missing skill invocation/],
  ['missing prompt', s => {delete s.ui.default_prompt;}, /Missing skill invocation/],
];
for (const [name, change, error] of invalid) {
  test(`rejects ${name}`, t => {
    assert.throws(() => validateSkill(fixture(t, change)), error);
  });
}

test('CLI validates the repository independently of the working directory', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./validate.mjs', import.meta.url))], {cwd: tmpdir(), encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Skill frontmatter and Codex UI metadata are valid/);
});
