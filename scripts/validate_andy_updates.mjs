import fs from 'node:fs';

const targetPath = process.argv[2] || 'public/data/andy-updates.json';

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function fail(errors) {
  console.error('andy-updates validation failed:');
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

function warn(warnings) {
  if (!warnings.length) return;
  console.warn('andy-updates validation warnings:');
  for (const message of warnings) console.warn(`- ${message}`);
}

let rawText = '';
try {
  rawText = fs.readFileSync(targetPath, 'utf8');
} catch (err) {
  fail([`could not read ${targetPath}: ${err.message}`]);
}

let data;
try {
  data = JSON.parse(rawText);
} catch (err) {
  fail([`invalid JSON in ${targetPath}: ${err.message}`]);
}

const errors = [];
const warnings = [];

if (!isObject(data)) {
  fail(['root must be a JSON object']);
}

const requiredTopLevel = [
  'last_updated',
  'moltbook',
  'learning_progress',
  'insights',
  'challenge_status',
  'network',
  'strategies',
  'daily_log',
];

for (const key of requiredTopLevel) {
  if (!(key in data)) errors.push(`missing top-level field "${key}"`);
}

if (typeof data.last_updated !== 'string') {
  errors.push('"last_updated" must be a string');
}

if (!isObject(data.moltbook)) {
  errors.push('"moltbook" must be an object');
} else {
  const m = data.moltbook;
  for (const key of ['karma', 'followers', 'following']) {
    if (typeof m[key] !== 'number') errors.push(`"moltbook.${key}" must be a number`);
  }
  if (typeof m.profile_url !== 'string') errors.push('"moltbook.profile_url" must be a string');
  if (!Array.isArray(m.recent_activity)) errors.push('"moltbook.recent_activity" must be an array');
  if (typeof m.posts !== 'number') {
    if (typeof m.total_posts === 'number') warnings.push('using legacy "moltbook.total_posts"; prefer "moltbook.posts"');
    else errors.push('"moltbook.posts" must be a number');
  }
  if (typeof m.comments !== 'number') {
    if (typeof m.total_comments === 'number') warnings.push('using legacy "moltbook.total_comments"; prefer "moltbook.comments"');
    else errors.push('"moltbook.comments" must be a number');
  }
}

if (!isObject(data.learning_progress) && !Array.isArray(data.learning_progress)) {
  errors.push('"learning_progress" must be an object (preferred) or legacy array');
}

if (!Array.isArray(data.insights)) {
  errors.push('"insights" must be an array');
} else {
  for (let i = 0; i < data.insights.length; i += 1) {
    const item = data.insights[i];
    if (!isObject(item)) {
      errors.push(`"insights[${i}]" must be an object`);
      continue;
    }
    if (typeof item.date !== 'string') errors.push(`"insights[${i}].date" must be a string`);
    if (!Array.isArray(item.items)) {
      if (Array.isArray(item.bullets)) warnings.push(`using legacy "insights[${i}].bullets"; prefer "items"`);
      else errors.push(`"insights[${i}].items" must be an array`);
    }
  }
}

if (!isObject(data.challenge_status)) {
  errors.push('"challenge_status" must be an object');
} else {
  const c = data.challenge_status;
  if (typeof c.phase !== 'string') {
    if (typeof c.current_phase === 'string') warnings.push('using legacy "challenge_status.current_phase"; prefer "phase"');
    else errors.push('"challenge_status.phase" must be a string');
  }
  if (typeof c.target !== 'string') {
    if (typeof c.target_label === 'string') warnings.push('using legacy "challenge_status.target_label"; prefer "target"');
    else errors.push('"challenge_status.target" must be a string');
  }
  if (typeof c.timeline !== 'string') errors.push('"challenge_status.timeline" must be a string');
  if (!isObject(c.progress)) errors.push('"challenge_status.progress" must be an object');
  if (!Array.isArray(c.milestones)) {
    if (Array.isArray(c.next_milestones)) warnings.push('using legacy "challenge_status.next_milestones"; prefer "milestones"');
    else errors.push('"challenge_status.milestones" must be an array');
  }
}

if (!Array.isArray(data.network)) {
  errors.push('"network" must be an array');
}

if (!Array.isArray(data.strategies)) {
  errors.push('"strategies" must be an array');
}

if (!(isObject(data.daily_log) || Array.isArray(data.daily_log))) {
  errors.push('"daily_log" must be an object (preferred) or legacy array');
}

if (errors.length) fail(errors);
warn(warnings);
console.log(`andy-updates validation passed: ${targetPath}`);
