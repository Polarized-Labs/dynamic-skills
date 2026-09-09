import {existsSync, readFileSync} from 'node:fs';
import {basename, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {parse} from 'yaml';

const root = fileURLToPath(new URL('../', import.meta.url));
const length = value => typeof value === 'string' ? [...value].length : -1;
const check = (condition, message) => {
  if (!condition) throw new Error(message);
};

export function validateSkill(projectRoot = root) {
  const dir = join(projectRoot, 'skills', 'dynamic-skills');
  const text = readFileSync(join(dir, 'SKILL.md'), 'utf8');
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  check(frontmatter, 'Missing YAML frontmatter');
  // Maps preserve key types so numeric metadata keys cannot pass as strings.
  const data = parse(frontmatter[1], {mapAsMap: true});
  check(data instanceof Map, 'Invalid skill metadata');
  const name = data.get('name');
  check(name === basename(dir) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) && length(name) <= 64, 'Invalid skill name');
  check(length(data.get('description')) >= 1 && length(data.get('description')) <= 1024, 'Invalid description');
  check(length(data.get('compatibility')) >= 0 && length(data.get('compatibility')) <= 500, 'Invalid compatibility');
  const metadata = data.get('metadata');
  check(metadata instanceof Map && [...metadata].every(([key, value]) => typeof key === 'string' && typeof value === 'string'), 'Invalid metadata');
  check(data.get('license') === 'MIT' && existsSync(join(projectRoot, 'LICENSE')), 'Missing license');
  const config = parse(readFileSync(join(dir, 'agents', 'openai.yaml'), 'utf8'), {mapAsMap: true});
  const ui = config instanceof Map ? config.get('interface') : undefined;
  check(ui instanceof Map && length(ui.get('short_description')) >= 25 && length(ui.get('short_description')) <= 64, 'Invalid UI description');
  check(typeof ui.get('default_prompt') === 'string' && ui.get('default_prompt').includes('$' + name), 'Missing skill invocation');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    validateSkill();
    console.log('Skill frontmatter and Codex UI metadata are valid.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
